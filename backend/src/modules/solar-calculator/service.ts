import { MedusaService } from "@medusajs/framework/utils";
import crypto from "crypto";
import {
    SolarCalculationInput,
    SolarCalculationResult,
    CalculationMetadata,
    SOLAR_CALCULATOR_CONSTANTS,
} from "../../types/solar-calculator";

/**
 * Solar Calculator Service
 * 
 * Lógica de cálculo de geração solar fotovoltaica
 * 
 * Fórmulas baseadas em:
 * - PVWatts (NREL)
 * - IEC 61724 (Performance Ratio)
 * - Estudo de degradação NREL (0.5%/ano)
 */
export default class SolarCalculatorService extends MedusaService({}) {
    /**
     * Calcular geração solar
     */
    async calculateGeneration(
        input: SolarCalculationInput
    ): Promise<SolarCalculationResult> {
        const startTime = Date.now();

        // 1. Obter dados de irradiância (mockado por ora)
        const irradiance = await this.getIrradianceData(
            input.latitude,
            input.longitude,
            input.azimuth,
            input.tilt
        );

        // 2. Calcular geração diária
        const daily_kwh = this.calculateDailyGeneration(
            irradiance.poa_kwh_m2_day,
            input.system_capacity_kwp,
            input.module_efficiency,
            input.system_losses
        );

        // 3. Calcular métricas anuais
        const annual_kwh = daily_kwh * 365;
        const monthly_kwh = annual_kwh / 12;

        // 4. Calcular geração lifetime (com degradação)
        const lifetime_kwh = this.calculateLifetimeGeneration(
            annual_kwh,
            input.analysis_period_years || 25
        );

        // 5. Performance metrics
        const performance = this.calculatePerformance(
            annual_kwh,
            input.system_capacity_kwp,
            irradiance.poa_kwh_m2_day
        );

        // 6. Economia (se tarifa fornecida)
        let savings;
        if (input.electricity_tariff_kwh) {
            savings = this.calculateSavings(
                monthly_kwh,
                annual_kwh,
                lifetime_kwh,
                input.electricity_tariff_kwh,
                input.system_capacity_kwp
            );
        }

        // 7. Metadata
        const metadata = this.buildMetadata(
            input,
            Date.now() - startTime,
            irradiance
        );

        return {
            generation: {
                daily_kwh: this.round(daily_kwh, 2),
                monthly_kwh: this.round(monthly_kwh, 2),
                annual_kwh: this.round(annual_kwh, 2),
                lifetime_kwh: this.round(lifetime_kwh, 2),
            },
            performance,
            savings,
            irradiance: {
                ghi_kwh_m2_day: this.round(irradiance.ghi_kwh_m2_day, 2),
                poa_kwh_m2_day: this.round(irradiance.poa_kwh_m2_day, 2),
            },
            metadata,
        };
    }

    /**
     * Obter dados de irradiância (mock - integrar com pvlib-integration futuramente)
     */
    private async getIrradianceData(
        latitude: number,
        longitude: number,
        azimuth?: number,
        tilt?: number
    ): Promise<{
        ghi_kwh_m2_day: number;
        poa_kwh_m2_day: number;
        timezone: string;
    }> {
        // Mock baseado em latitude (aproximação grosseira)
        // GHI típico Brasil: 4.5-6.5 kWh/m²/dia
        const baseGHI = 5.5; // Média Brasil
        const latitudeFactor = 1 - Math.abs(latitude) * 0.005; // Reduz próximo aos polos
        const ghi_kwh_m2_day = baseGHI * latitudeFactor;

        // POA (Plane of Array) - ajustado por tilt
        // Tilt otimizado geralmente = latitude
        const optimalTilt = Math.abs(latitude);
        const actualTilt = tilt !== undefined ? tilt : optimalTilt;
        const tiltFactor = 1 + (optimalTilt - Math.abs(actualTilt - optimalTilt)) * 0.01;
        const poa_kwh_m2_day = ghi_kwh_m2_day * tiltFactor;

        // Timezone (aproximação por longitude)
        const timezone = this.getTimezoneFromLongitude(longitude);

        return {
            ghi_kwh_m2_day,
            poa_kwh_m2_day,
            timezone,
        };
    }

    /**
     * Calcular geração diária
     * Formula: E = A * r * H * PR
     * E = Energia (kWh)
     * A = Área total dos módulos (m²) = P / (r * 1000)
     * r = Eficiência do módulo
     * H = Irradiância média diária (kWh/m²/dia)
     * PR = Performance Ratio (1 - perdas)
     */
    private calculateDailyGeneration(
        poa_kwh_m2_day: number,
        system_capacity_kwp: number,
        module_efficiency: number,
        system_losses: number
    ): number {
        const performance_ratio = 1 - system_losses;

        // Geração simplificada: kWp * irradiância * PR
        // (assumindo STC = 1 kW/m²)
        const daily_kwh = system_capacity_kwp * poa_kwh_m2_day * performance_ratio;

        return daily_kwh;
    }

    /**
     * Calcular geração lifetime considerando degradação
     */
    private calculateLifetimeGeneration(
        annual_kwh_year1: number,
        period_years: number
    ): number {
        const degradation = SOLAR_CALCULATOR_CONSTANTS.DEFAULT_MODULE_DEGRADATION;

        let total = 0;
        for (let year = 1; year <= period_years; year++) {
            const yearlyGeneration = annual_kwh_year1 * Math.pow(1 - degradation, year - 1);
            total += yearlyGeneration;
        }

        return total;
    }

    /**
     * Calcular métricas de performance
     */
    private calculatePerformance(
        annual_kwh: number,
        system_capacity_kwp: number,
        poa_kwh_m2_day: number
    ): {
        capacity_factor: number;
        specific_yield: number;
        performance_ratio: number;
    } {
        // Capacity Factor = Geração Real / Geração Teórica Máxima
        const max_annual_kwh = system_capacity_kwp * 8760; // 24h * 365 dias
        const capacity_factor = (annual_kwh / max_annual_kwh) * 100;

        // Specific Yield = kWh gerado / kWp instalado / ano
        const specific_yield = annual_kwh / system_capacity_kwp;

        // Performance Ratio (PR) = Yield Real / Yield Teórico
        const theoretical_yield = poa_kwh_m2_day * 365;
        const performance_ratio = (specific_yield / theoretical_yield) * 100;

        return {
            capacity_factor: this.round(capacity_factor, 2),
            specific_yield: this.round(specific_yield, 2),
            performance_ratio: this.round(performance_ratio, 2),
        };
    }

    /**
     * Calcular economia financeira
     */
    private calculateSavings(
        monthly_kwh: number,
        annual_kwh: number,
        lifetime_kwh: number,
        tariff_kwh: number,
        system_capacity_kwp: number
    ): {
        monthly_brl: number;
        annual_brl: number;
        lifetime_brl: number;
        payback_years: number;
    } {
        const monthly_brl = monthly_kwh * tariff_kwh;
        const annual_brl = annual_kwh * tariff_kwh;
        const lifetime_brl = lifetime_kwh * tariff_kwh;

        // Payback simplificado (sem considerar inflação/juros)
        // Custo médio instalação: R$ 4.000/kWp (Brasil 2024)
        const installation_cost = system_capacity_kwp * 4000;
        const payback_years = installation_cost / annual_brl;

        return {
            monthly_brl: this.round(monthly_brl, 2),
            annual_brl: this.round(annual_brl, 2),
            lifetime_brl: this.round(lifetime_brl, 2),
            payback_years: this.round(payback_years, 1),
        };
    }

    /**
     * Construir metadata
     */
    private buildMetadata(
        input: SolarCalculationInput,
        calculation_time_ms: number,
        irradiance: { timezone: string }
    ): CalculationMetadata {
        return {
            version: SOLAR_CALCULATOR_CONSTANTS.API_VERSION,
            calculated_at: new Date().toISOString(),
            calculation_time_ms,
            data_sources: {
                irradiance_provider: "Mock", // Trocar para "PVGIS" quando integrado
                weather_data_year: 2024,
            },
            assumptions: {
                module_degradation_year: SOLAR_CALCULATOR_CONSTANTS.DEFAULT_MODULE_DEGRADATION,
                inverter_efficiency: SOLAR_CALCULATOR_CONSTANTS.DEFAULT_INVERTER_EFFICIENCY,
            },
            location: {
                latitude: input.latitude,
                longitude: input.longitude,
                timezone: irradiance.timezone,
            },
        };
    }

    /**
     * Utils
     */
    private getTimezoneFromLongitude(longitude: number): string {
        // Aproximação: cada 15° = 1 hora de diferença de UTC
        const offset = Math.round(longitude / 15);

        // Brasil: UTC-2 a UTC-5
        if (longitude >= -75 && longitude <= -30) {
            if (longitude >= -45) return "America/Sao_Paulo"; // UTC-3
            if (longitude >= -60) return "America/Manaus"; // UTC-4
            return "America/Rio_Branco"; // UTC-5
        }

        return `UTC${offset >= 0 ? "+" : ""}${offset}`;
    }

    private round(value: number, decimals: number): number {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    /**
     * Sanitizar input (remover caracteres perigosos)
     */
    sanitizeInput(input: SolarCalculationInput): SolarCalculationInput {
        // Números já são validados pelo Zod, mas garantir que são finitos
        return {
            ...input,
            latitude: this.sanitizeNumber(input.latitude),
            longitude: this.sanitizeNumber(input.longitude),
            system_capacity_kwp: this.sanitizeNumber(input.system_capacity_kwp),
            module_efficiency: this.sanitizeNumber(input.module_efficiency),
            system_losses: this.sanitizeNumber(input.system_losses),
            azimuth: input.azimuth !== undefined ? this.sanitizeNumber(input.azimuth) : undefined,
            tilt: input.tilt !== undefined ? this.sanitizeNumber(input.tilt) : undefined,
            analysis_period_years: input.analysis_period_years,
            electricity_tariff_kwh: input.electricity_tariff_kwh !== undefined
                ? this.sanitizeNumber(input.electricity_tariff_kwh)
                : undefined,
        };
    }

    private sanitizeNumber(value: number): number {
        if (!Number.isFinite(value)) {
            throw new Error(`Invalid number: ${value}`);
        }
        return value;
    }

    /**
     * Hash de IP para auditoria (LGPD compliant)
     */
    hashIP(ip: string): string {
        return crypto.createHash("sha256").update(ip).digest("hex");
    }
}
