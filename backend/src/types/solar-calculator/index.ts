/**
 * Solar Calculator Module - Type Definitions
 * 
 * API de cálculo de geração solar fotovoltaica
 * 
 * Features:
 * - Validação Zod com sanitização
 * - Rate limiting (Redis)
 * - Metadata em respostas (versão, tempo, fonte)
 */

import { z } from "zod";

/**
 * Input Schema - Cálculo de Geração Solar
 */
export const SolarCalculationInputSchema = z.object({
    // Localização
    latitude: z
        .number()
        .min(-90, "Latitude deve estar entre -90 e 90")
        .max(90, "Latitude deve estar entre -90 e 90"),

    longitude: z
        .number()
        .min(-180, "Longitude deve estar entre -180 e 180")
        .max(180, "Longitude deve estar entre -180 e 180"),

    // Sistema
    system_capacity_kwp: z
        .number()
        .positive("Capacidade do sistema deve ser positiva")
        .max(10000, "Capacidade máxima: 10 MWp")
        .describe("Capacidade do sistema em kWp"),

    module_efficiency: z
        .number()
        .min(0.05, "Eficiência mínima: 5%")
        .max(0.30, "Eficiência máxima: 30%")
        .default(0.20)
        .describe("Eficiência do módulo (0-1, ex: 0.20 = 20%)"),

    system_losses: z
        .number()
        .min(0, "Perdas não podem ser negativas")
        .max(0.50, "Perdas máximas: 50%")
        .default(0.14)
        .describe("Perdas do sistema (0-1, ex: 0.14 = 14%)"),

    // Orientação
    azimuth: z
        .number()
        .min(0, "Azimute deve estar entre 0 e 360")
        .max(360, "Azimute deve estar entre 0 e 360")
        .default(180)
        .optional()
        .describe("Azimute em graus (0=Norte, 90=Leste, 180=Sul, 270=Oeste)"),

    tilt: z
        .number()
        .min(0, "Inclinação deve estar entre 0 e 90")
        .max(90, "Inclinação deve estar entre 0 e 90")
        .optional()
        .describe("Inclinação dos módulos em graus"),

    // Opcional: período de análise
    analysis_period_years: z
        .number()
        .int("Período deve ser inteiro")
        .min(1, "Período mínimo: 1 ano")
        .max(30, "Período máximo: 30 anos")
        .default(25)
        .optional(),

    // Tarifa para cálculo de economia
    electricity_tariff_kwh: z
        .number()
        .positive("Tarifa deve ser positiva")
        .max(10, "Tarifa muito alta, verifique unidade (R$/kWh)")
        .optional()
        .describe("Tarifa de energia em R$/kWh"),
});

export type SolarCalculationInput = z.infer<typeof SolarCalculationInputSchema>;

/**
 * Output Schema - Resultado do Cálculo
 */
export interface SolarCalculationResult {
    // Geração
    generation: {
        daily_kwh: number;
        monthly_kwh: number;
        annual_kwh: number;
        lifetime_kwh: number; // Considerando degradação
    };

    // Performance
    performance: {
        capacity_factor: number; // %
        specific_yield: number; // kWh/kWp/year
        performance_ratio: number; // % (PR)
    };

    // Economia (se tarifa fornecida)
    savings?: {
        monthly_brl: number;
        annual_brl: number;
        lifetime_brl: number;
        payback_years: number;
    };

    // Irradiância média
    irradiance: {
        ghi_kwh_m2_day: number; // Global Horizontal Irradiance
        poa_kwh_m2_day: number; // Plane of Array (considerando tilt/azimuth)
    };

    // Metadata
    metadata: CalculationMetadata;
}

/**
 * Metadata do Cálculo
 */
export interface CalculationMetadata {
    version: string; // Versão da API
    calculated_at: string; // ISO 8601
    calculation_time_ms: number;
    data_sources: {
        irradiance_provider: string; // e.g., "PVGIS", "NREL"
        weather_data_year: number; // Ano dos dados meteorológicos
    };
    assumptions: {
        module_degradation_year: number; // % ao ano (ex: 0.5)
        inverter_efficiency: number; // %
    };
    location: {
        latitude: number;
        longitude: number;
        timezone: string;
        elevation_m?: number;
    };
}

/**
 * Rate Limit Info
 */
export interface RateLimitInfo {
    limit: number; // Máximo de requests
    remaining: number; // Requests restantes
    reset: number; // Timestamp Unix de reset
    retry_after?: number; // Segundos até poder tentar novamente (se excedido)
}

/**
 * Error Response
 */
export interface SolarCalculatorErrorResponse {
    error: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata: {
        timestamp: string;
        path: string;
        rate_limit?: RateLimitInfo;
    };
}/**
 * Success Response
 */
export interface SolarCalculatorSuccessResponse {
    result: SolarCalculationResult;
    rate_limit: RateLimitInfo;
}

/**
 * Histórico de Cálculo (para auditoria)
 */
export interface CalculationHistory {
    id: string;
    customer_id?: string;
    ip_address_hash: string; // SHA-256
    input: SolarCalculationInput;
    result: SolarCalculationResult;
    created_at: Date;
    user_agent_hash?: string;
}

/**
 * Rate Limit Config
 */
export interface RateLimitConfig {
    window_seconds: number;
    max_requests: number;
    identifier_type: "ip" | "customer_id" | "hybrid";
    redis_key_prefix: string;
}

/**
 * Constantes
 */
export const SOLAR_CALCULATOR_CONSTANTS = {
    API_VERSION: "1.0.0",
    DEFAULT_MODULE_DEGRADATION: 0.005, // 0.5% ao ano
    DEFAULT_INVERTER_EFFICIENCY: 0.96, // 96%
    RATE_LIMIT: {
        ANONYMOUS_WINDOW_SECONDS: 3600, // 1 hora
        ANONYMOUS_MAX_REQUESTS: 10,
        AUTHENTICATED_WINDOW_SECONDS: 3600,
        AUTHENTICATED_MAX_REQUESTS: 100,
    },
} as const;

/**
 * Validation Errors
 */
export class SolarCalculationValidationError extends Error {
    constructor(
        message: string,
        public fieldErrors: Record<string, string[]>
    ) {
        super(message);
        this.name = "SolarCalculationValidationError";
    }
}

/**
 * Rate Limit Exceeded Error
 */
export class RateLimitExceededError extends Error {
    constructor(
        message: string,
        public rateLimitInfo: RateLimitInfo
    ) {
        super(message);
        this.name = "RateLimitExceededError";
    }
}
