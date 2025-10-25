/**
 * 🌞 YSH Solar Calculator API Client
 * Cliente HTTP tipado para comunicação com o backend
 */

import type {
    SolarCalculationInput,
    SolarCalculatorAPIResponse,
    SolarCalculatorAPIError,
    CalculatorInfoResponse,
    SolarCalculationOutput
} from '@/types/solar-calculator';

const API_BASE_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const CALCULATOR_ENDPOINT = '/store/solar/calculator';
const API_VERSION = 'v1';

// ============================================================================
// HTTP Client Configuration
// ============================================================================

interface FetchOptions extends RequestInit {
    timeout?: number;
}

async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// ============================================================================
// Solar Calculator API Client
// ============================================================================

export class SolarCalculatorClient {
    private baseUrl: string;
    private apiVersion: string;

    constructor(baseUrl: string = API_BASE_URL, apiVersion: string = API_VERSION) {
        this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        this.apiVersion = apiVersion;
    }

    /**
     * Calcula sistema solar completo
     */
    async calculate(
        input: SolarCalculationInput
    ): Promise<SolarCalculationOutput> {
        try {
            const response = await fetchWithTimeout(
                `${this.baseUrl}${CALCULATOR_ENDPOINT}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Version': this.apiVersion,
                    },
                    body: JSON.stringify(input),
                    timeout: 30000, // 30 segundos
                }
            );

            if (!response.ok) {
                const errorData: SolarCalculatorAPIError = await response.json();
                throw new Error(errorData.error?.message || 'Erro ao calcular sistema solar');
            }

            const data: SolarCalculatorAPIResponse = await response.json();
            return data.calculation;
        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Tempo limite excedido. Tente novamente.');
                }
                throw error;
            }
            throw new Error('Erro desconhecido ao calcular sistema solar');
        }
    }

    /**
     * Obtém informações sobre o serviço de cálculo
     */
    async getInfo(): Promise<CalculatorInfoResponse> {
        try {
            const response = await fetchWithTimeout(
                `${this.baseUrl}${CALCULATOR_ENDPOINT}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Version': this.apiVersion,
                    },
                    timeout: 10000,
                }
            );

            if (!response.ok) {
                throw new Error('Erro ao obter informações do serviço');
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro desconhecido ao obter informações do serviço');
        }
    }

    /**
     * Verifica se o serviço está disponível
     */
    async healthCheck(): Promise<boolean> {
        try {
            const info = await this.getInfo();
            return info.status === 'operational';
        } catch {
            return false;
        }
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const solarCalculatorClient = new SolarCalculatorClient();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Calcula sistema solar (função de conveniência)
 */
export async function calculateSolarSystem(
    input: SolarCalculationInput
): Promise<SolarCalculationOutput> {
    return solarCalculatorClient.calculate(input);
}

/**
 * Obtém informações do serviço (função de conveniência)
 */
export async function getCalculatorInfo(): Promise<CalculatorInfoResponse> {
    return solarCalculatorClient.getInfo();
}

/**
 * Verifica saúde do serviço (função de conveniência)
 */
export async function checkCalculatorHealth(): Promise<boolean> {
    return solarCalculatorClient.healthCheck();
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Valida entrada antes de enviar para API
 */
export function validateCalculationInput(
    input: Partial<SolarCalculationInput>
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar consumo
    if (!input.consumo_kwh_mes && !input.consumo_mensal_kwh) {
        errors.push('Consumo mensal é obrigatório');
    }

    if (input.consumo_kwh_mes && input.consumo_kwh_mes <= 0) {
        errors.push('Consumo mensal deve ser maior que zero');
    }

    if (input.consumo_mensal_kwh && input.consumo_mensal_kwh.length !== 12) {
        errors.push('Array de consumo mensal deve ter 12 valores');
    }

    // Validar UF
    if (!input.uf) {
        errors.push('Estado (UF) é obrigatório');
    } else if (input.uf.length !== 2) {
        errors.push('UF deve ter 2 caracteres');
    }

    // Validar oversizing
    if (input.oversizing_target) {
        const validOversizing = [100, 114, 130, 145, 160];
        if (!validOversizing.includes(input.oversizing_target)) {
            errors.push(`Oversizing deve ser: ${validOversizing.join(', ')}`);
        }
    }

    // Validar tipo de sistema
    if (input.tipo_sistema) {
        const validTipos = ['on-grid', 'off-grid', 'hibrido'];
        if (!validTipos.includes(input.tipo_sistema)) {
            errors.push(`Tipo de sistema deve ser: ${validTipos.join(', ')}`);
        }
    }

    // Validar fase
    if (input.fase) {
        const validFases = ['monofasico', 'bifasico', 'trifasico'];
        if (!validFases.includes(input.fase)) {
            errors.push(`Fase deve ser: ${validFases.join(', ')}`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Formata entrada removendo campos undefined/null
 */
export function sanitizeCalculationInput(
    input: Partial<SolarCalculationInput>
): SolarCalculationInput {
    const sanitized: any = {};

    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            sanitized[key] = value;
        }
    });

    return sanitized as SolarCalculationInput;
}
