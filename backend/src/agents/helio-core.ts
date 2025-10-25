/**
 * Hélio Copiloto Solar - Sistema de Agentes YSH
 * Agente Orquestrador: helio.core
 *
 * Missão: transformar o pedido do usuário em um plano executável,
 * decompor intents, rotear tarefas, consolidar evidências.
 */

import { v4 as uuidv4 } from 'uuid';

// Tipos base do sistema de agentes
export interface AgentMessage {
    task_id: string;
    actor_id: string;
    intent: string;
    locale: string;
    currency: string;
    inputs: Record<string, any>;
    targets?: string[];
    constraints?: Record<string, any>;
    artifacts?: any[];
    telemetry: {
        ts: string;
        latency_ms?: number;
        errors?: string[];
    };
}

export interface AgentPlan {
    plan: Array<{
        agent: string;
        inputs: Record<string, any>;
        dependencies?: string[];
    }>;
    success_criteria: string[];
    handoff_options: string[];
    estimated_duration_min: number;
}

export interface AgentResult {
    task_id: string;
    agent_id: string;
    success: boolean;
    outputs: Record<string, any>;
    evidence: Array<{
        type: 'calculation' | 'source' | 'validation';
        description: string;
        data: any;
    }>;
    telemetry: {
        latency_ms: number;
        confidence_score: number;
    };
}

// Intents suportados
export enum IntentType {
    PROPOSTA_RESIDENCIAL = 'proposta_residencial',
    PROPOSTA_COMERCIAL = 'proposta_comercial',
    VIABILIDADE_FV = 'viabilidade_fv',
    TARIFAS_ANALISE = 'tarifas_analise',
    CATALOGO_CONSULTA = 'catalogo_consulta',
    FINANCEIRO_SIMULACAO = 'financeiro_simulacao',
    DETECCAO_PAINEL = 'deteccao_painel',
    ANALISE_TERMICA = 'analise_termica',
    FOTOGRAMETRIA = 'fotogrametria'
}

// Agentes disponíveis no sistema
export const AVAILABLE_AGENTS = {
    'viability.pv': 'Engenharia Fotovoltaica Remota',
    'tariffs.aneel': 'Tarifas e MMGD',
    'catalog.curator': 'Curador de Catálogo',
    'finance.credit': 'Crédito e ROI',
    'legal.compliance': 'Compliance Legal',
    'logistics.fulfillment': 'Logística',
    'om.monitor': 'O&M Monitor',
    'insurance.risk': 'Seguros',
    'solar.panel_detection': 'Detecção FV',
    'solar.thermal_analysis': 'Análise Térmica',
    'solar.photogrammetry': 'Fotogrametria 3D',
    'ux.copy': 'UX Writing',
    'seo.sem': 'SEO/SEM',
    'analytics.bizops': 'BizOps'
} as const;

/**
 * Agente Orquestrador - Hélio Core
 * Decompõe intents e cria planos executáveis
 */
export class HelioCoreAgent {
    private readonly agentId = 'helio.core';

    /**
     * Processa uma mensagem do usuário e cria um plano de execução
     */
    async processMessage(message: Omit<AgentMessage, 'task_id' | 'actor_id' | 'telemetry'>): Promise<AgentPlan> {
        const startTime = Date.now();
        const taskId = uuidv4();

        try {
            const plan = await this.createPlan(message);
            return plan;
        } catch (error) {
            console.error(`Helio Core - Erro no processamento:`, error);
            throw new Error(`Falha ao criar plano para intent: ${message.intent}`);
        }
    }

    /**
     * Cria plano baseado no intent identificado
     */
    private async createPlan(message: Omit<AgentMessage, 'task_id' | 'actor_id' | 'telemetry'>): Promise<AgentPlan> {
        switch (message.intent) {
            case IntentType.PROPOSTA_RESIDENCIAL:
                return this.createResidentialProposalPlan(message);

            case IntentType.VIABILIDADE_FV:
                return this.createViabilityPlan(message);

            case IntentType.TARIFAS_ANALISE:
                return this.createTariffAnalysisPlan(message);

            case IntentType.CATALOGO_CONSULTA:
                return this.createCatalogQueryPlan(message);

            case IntentType.FINANCEIRO_SIMULACAO:
                return this.createFinancialSimulationPlan(message);

            case IntentType.DETECCAO_PAINEL:
                return this.createPanelDetectionPlan(message);

            default:
                throw new Error(`Intent não suportado: ${message.intent}`);
        }
    }

    /**
     * Plano para proposta residencial B1 (~15 min)
     */
    private createResidentialProposalPlan(message: any): AgentPlan {
        const { cep, consumo_kwh_m, telhado, fase } = message.inputs;

        return {
            plan: [
                {
                    agent: 'viability.pv',
                    inputs: {
                        consumo_kwh_m,
                        cep,
                        telhado: telhado || 'laje',
                        fase: fase || 'monofásica',
                        classe: 'B1'
                    }
                },
                {
                    agent: 'tariffs.aneel',
                    inputs: {
                        cep,
                        classe: 'B1',
                        modalidade: 'convencional'
                    },
                    dependencies: ['viability.pv']
                },
                {
                    agent: 'catalog.curator',
                    inputs: {
                        kWp_alvo: 'FROM_PREVIOUS', // Será preenchido pelo resultado do viability.pv
                        restricoes: ['mono', '220V'],
                        classe: 'B1'
                    },
                    dependencies: ['viability.pv']
                },
                {
                    agent: 'finance.credit',
                    inputs: {
                        capex: 'FROM_PREVIOUS', // Será preenchido pelos resultados anteriores
                        tarifa: 'FROM_PREVIOUS',
                        geracao: 'FROM_PREVIOUS',
                        classe: 'B1'
                    },
                    dependencies: ['viability.pv', 'tariffs.aneel', 'catalog.curator']
                },
                {
                    agent: 'legal.compliance',
                    inputs: {
                        dados_projeto: 'FROM_ALL_PREVIOUS',
                        classe: 'B1'
                    },
                    dependencies: ['viability.pv', 'tariffs.aneel', 'catalog.curator', 'finance.credit']
                }
            ],
            success_criteria: [
                'erro_tarifa=0',
                'payback<=5.5a',
                'oversizing_114_160',
                'itens_certificados_inmetro'
            ],
            handoff_options: [
                'especialista_engenharia',
                'financeiro',
                'compliance_legal'
            ],
            estimated_duration_min: 15
        };
    }

    /**
     * Plano para análise de viabilidade FV
     */
    private createViabilityPlan(message: any): AgentPlan {
        const { consumo_kwh_m, cep, telhado } = message.inputs;

        return {
            plan: [
                {
                    agent: 'viability.pv',
                    inputs: {
                        consumo_kwh_m,
                        cep,
                        telhado: telhado || 'laje'
                    }
                }
            ],
            success_criteria: [
                'mape_geracao<8',
                'oversizing_valido'
            ],
            handoff_options: ['engenheiro_fv'],
            estimated_duration_min: 2
        };
    }

    /**
     * Plano para análise tarifária
     */
    private createTariffAnalysisPlan(message: any): AgentPlan {
        const { uc, distribuidora, classe } = message.inputs;

        return {
            plan: [
                {
                    agent: 'tariffs.aneel',
                    inputs: {
                        uc,
                        distribuidora,
                        classe
                    }
                }
            ],
            success_criteria: ['tarifa_valida', 'limites_mmgd_respeitados'],
            handoff_options: ['especialista_tarifas'],
            estimated_duration_min: 1
        };
    }

    /**
     * Plano para consulta de catálogo
     */
    private createCatalogQueryPlan(message: any): AgentPlan {
        const { kWp_alvo, restricoes, certificacoes } = message.inputs;

        return {
            plan: [
                {
                    agent: 'catalog.curator',
                    inputs: {
                        kWp_alvo,
                        restricoes: restricoes || [],
                        certificacoes: certificacoes || ['inmetro']
                    }
                }
            ],
            success_criteria: ['itens_normalizados', 'certificacoes_validas'],
            handoff_options: ['curador_catalogo'],
            estimated_duration_min: 1
        };
    }

    /**
     * Plano para simulação financeira
     */
    private createFinancialSimulationPlan(message: any): AgentPlan {
        const { capex, tarifa, geracao, classe } = message.inputs;

        return {
            plan: [
                {
                    agent: 'finance.credit',
                    inputs: {
                        capex,
                        tarifa,
                        geracao,
                        classe: classe || 'B1'
                    }
                }
            ],
            success_criteria: ['roi_calculado', 'payback_valido'],
            handoff_options: ['analista_financeiro'],
            estimated_duration_min: 2
        };
    }

    /**
     * Plano para detecção de painéis solares
     */
    private createPanelDetectionPlan(message: any): AgentPlan {
        const { image, bbox_coords, resolution } = message.inputs;

        return {
            plan: [
                {
                    agent: 'solar.panel_detection',
                    inputs: {
                        image,
                        bbox_coords,
                        resolution: resolution || 0.5
                    }
                }
            ],
            success_criteria: ['precisao>85', 'latencia<2s'],
            handoff_options: ['especialista_cv'],
            estimated_duration_min: 1
        };
    }

    /**
     * Valida se um plano pode ser executado
     */
    validatePlan(plan: AgentPlan): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Verificar se todos os agentes existem
        for (const step of plan.plan) {
            if (!AVAILABLE_AGENTS[step.agent as keyof typeof AVAILABLE_AGENTS]) {
                errors.push(`Agente não encontrado: ${step.agent}`);
            }
        }

        // Verificar dependências
        const executedAgents = new Set<string>();
        for (const step of plan.plan) {
            if (step.dependencies) {
                for (const dep of step.dependencies) {
                    if (!executedAgents.has(dep)) {
                        errors.push(`Dependência não satisfeita: ${step.agent} depende de ${dep}`);
                    }
                }
            }
            executedAgents.add(step.agent);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

// Instância singleton do agente orquestrador
export const helioCore = new HelioCoreAgent();