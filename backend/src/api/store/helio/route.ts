/**
 * API Routes para o Sistema de Agentes YSH
 * Endpoints para interagir com os agentes via REST API
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { helioCore } from "../../agents/helio-core";
import { viabilityPVAgent } from "../../agents/viability-pv";

// Tipos para as requisições
interface HelioCoreRequest {
    intent: string;
    inputs: Record<string, any>;
    locale?: string;
    currency?: string;
}

interface ViabilityRequest {
    consumo_kwh_m: number;
    cep: string;
    telhado?: 'laje' | 'ceramica' | 'metalico' | 'solo';
    fase?: 'monofasica' | 'bifasica' | 'trifasica';
    classe?: string;
    oversizing_max?: number;
}

/**
 * POST /store/helio
 * Endpoint principal do Hélio Copiloto Solar
 * Recebe intents e cria planos executáveis
 */
export async function POST(
    req: MedusaRequest<HelioCoreRequest>,
    res: MedusaResponse
) {
    try {
        const { intent, inputs, locale = 'pt-BR', currency = 'BRL' } = req.validatedBody;

        // Criar mensagem para o orquestrador
        const message = {
            intent,
            locale,
            currency,
            inputs
        };

        // Processar com Hélio Core
        const plan = await helioCore.processMessage(message);

        // Validar plano
        const validation = helioCore.validatePlan(plan);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors,
                message: 'Plano inválido gerado'
            });
        }

        res.json({
            success: true,
            plan,
            message: `Plano criado com sucesso. Duração estimada: ${plan.estimated_duration_min} minutos`,
            next_steps: [
                'Execute o plano passo a passo',
                'Monitore o progresso de cada agente',
                'Consolide os resultados finais'
            ]
        });

    } catch (error) {
        console.error('[Helio API] Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erro interno do servidor'
        });
    }
}

/**
 * POST /store/helio/viability
 * Endpoint direto para dimensionamento FV
 * Para testes rápidos do agente viability.pv
 */
export async function viabilityPOST(
    req: MedusaRequest<ViabilityRequest>,
    res: MedusaResponse
) {
    try {
        const inputs = req.validatedBody;

        // Executar agente de viabilidade
        const result = await viabilityPVAgent.process(inputs);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'Falha no dimensionamento',
                message: 'Não foi possível dimensionar o sistema FV'
            });
        }

        res.json({
            success: true,
            data: result.outputs,
            evidence: result.evidence,
            telemetry: result.telemetry,
            message: `Sistema dimensionado: ${result.outputs.proposal_kwp}kWp, geração anual: ${result.outputs.expected_gen_mwh_y.toFixed(1)} MWh`
        });

    } catch (error) {
        console.error('[Viability API] Erro:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erro no dimensionamento FV'
        });
    }
}

/**
 * GET /store/helio/agents
 * Lista todos os agentes disponíveis
 */
export async function agentsGET(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const agents = {
        'helio.core': {
            name: 'Hélio Copiloto Solar',
            description: 'Orquestrador principal - cria planos executáveis',
            capabilities: ['orquestração', 'planejamento', 'roteamento']
        },
        'viability.pv': {
            name: 'Engenharia FV Remota',
            description: 'Dimensiona sistemas fotovoltaicos',
            capabilities: ['dimensionamento', 'PVGIS', 'NASA POWER', 'visão computacional']
        },
        'tariffs.aneel': {
            name: 'Tarifas & MMGD',
            description: 'Análise tarifária e validação PRODIST',
            capabilities: ['tarifas', 'MMGD', 'PRODIST', 'ANEEL']
        },
        'catalog.curator': {
            name: 'Curador de Catálogo',
            description: 'Normalização e certificação de produtos',
            capabilities: ['catálogo', 'INMETRO', 'normalização', 'ES']
        },
        'finance.credit': {
            name: 'Crédito & ROI',
            description: 'Simulações financeiras e payback',
            capabilities: ['ROI', 'payback', 'crédito', 'sensibilidade']
        },
        'solar.panel_detection': {
            name: 'Detecção FV',
            description: 'Detecta painéis em imagens de satélite',
            capabilities: ['visão computacional', 'NREL', 'segmentação']
        },
        'solar.thermal_analysis': {
            name: 'Análise Térmica',
            description: 'Diagnóstico térmico de sistemas FV',
            capabilities: ['termografia', 'anomalias', 'PV-Hawk']
        },
        'solar.photogrammetry': {
            name: 'Fotogrametria 3D',
            description: 'Modelagem 3D de telhados',
            capabilities: ['ODM', 'SfM', 'modelagem 3D']
        }
    };

    res.json({
        success: true,
        agents,
        total: Object.keys(agents).length,
        version: '1.0.0'
    });
}