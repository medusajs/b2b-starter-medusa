/**
 * 🧮 YSH Solar Calculator API
 * Endpoint para cálculos solares e financeiros
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
    solarCalculatorService,
    type SolarCalculationInput
} from "../../../../modules/solar/services/calculator";
import { APIErrorHandler } from "../../../../utils/api-error-handler";
import { APIVersionManager } from "../../../../utils/api-versioning";

// ============================================================================
// Request Validation
// ============================================================================

function validateCalculatorRequest(body: any): SolarCalculationInput {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!body.consumo_kwh_mes || body.consumo_kwh_mes <= 0) {
        errors.push('consumo_kwh_mes é obrigatório e deve ser maior que zero');
    }

    if (!body.uf || body.uf.length !== 2) {
        errors.push('uf é obrigatório e deve ter 2 caracteres (ex: SP, RJ)');
    }

    // Validação de oversizing
    if (body.oversizing_target) {
        const validOversizing = [100, 114, 130, 145, 160];
        if (!validOversizing.includes(body.oversizing_target)) {
            errors.push(`oversizing_target deve ser um dos valores: ${validOversizing.join(', ')}`);
        }
    }

    // Validação de tipo de sistema
    if (body.tipo_sistema) {
        const validTipos = ['on-grid', 'off-grid', 'hibrido'];
        if (!validTipos.includes(body.tipo_sistema)) {
            errors.push(`tipo_sistema deve ser: ${validTipos.join(', ')}`);
        }
    }

    // Validação de fase
    if (body.fase) {
        const validFases = ['monofasico', 'bifasico', 'trifasico'];
        if (!validFases.includes(body.fase)) {
            errors.push(`fase deve ser: ${validFases.join(', ')}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Validação falhou: ${errors.join('; ')}`);
    }

    return body as SolarCalculationInput;
}

// ============================================================================
// POST Handler - Calculate Solar System
// ============================================================================

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    try {
        // Validar entrada
        const input = validateCalculatorRequest(req.body);

        // Executar cálculo
        const resultado = await solarCalculatorService.calculate(input);

        // Adicionar metadados
        const response = {
            success: true,
            calculation: resultado,
            metadata: {
                calculated_at: new Date().toISOString(),
                api_version: APIVersionManager.formatVersion(
                    APIVersionManager.CURRENT_API_VERSION
                ),
                input_parameters: {
                    consumo_kwh_mes: input.consumo_kwh_mes,
                    uf: input.uf,
                    oversizing_target: input.oversizing_target || 130,
                    tipo_sistema: input.tipo_sistema || 'on-grid'
                }
            }
        };

        res.status(200).json(response);

    } catch (error: any) {
        console.error('[Solar Calculator] Error:', error);

        res.status(error.statusCode || 400).json({
            success: false,
            error: {
                code: 'CALCULATION_ERROR',
                message: error.message || 'Erro ao calcular sistema solar',
                details: error.details || null,
                timestamp: new Date().toISOString()
            }
        });
    }
}

// ============================================================================
// GET Handler - Calculator Info
// ============================================================================

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const clientVersion = (req as any).apiVersion || APIVersionManager.getVersionFromRequest(req);

    res.status(200).json({
        service: 'YSH Solar Calculator API',
        version: APIVersionManager.formatVersion(clientVersion),
        status: 'operational',
        capabilities: [
            'solar_system_sizing',
            'kit_recommendation',
            'financial_analysis',
            'roi_calculation',
            'environmental_impact',
            'mmgd_compliance_validation'
        ],
        supported_states: [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ],
        parameters: {
            required: ['consumo_kwh_mes', 'uf'],
            optional: [
                'consumo_mensal_kwh',
                'cep',
                'municipio',
                'latitude',
                'longitude',
                'tipo_telhado',
                'area_disponivel_m2',
                'orientacao',
                'inclinacao_graus',
                'fase',
                'oversizing_target',
                'tipo_sistema',
                'marca_preferida',
                'tarifa_energia_kwh',
                'budget_max',
                'prazo_financiamento_meses'
            ]
        },
        oversizing_options: [100, 114, 130, 145, 160],
        default_oversizing: 130,
        api_info: {
            current_version: APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION),
            supported_versions: APIVersionManager.SUPPORTED_VERSIONS.map(v =>
                APIVersionManager.formatVersion(v)
            )
        }
    });
}
