/**
 * 🌞 YSH Solar Calculator - Shared TypeScript Types
 * Tipos compartilhados entre frontend e backend para garantir type safety
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface SolarCalculationInput {
    // Dados de consumo (obrigatórios)
    consumo_kwh_mes?: number;
    consumo_mensal_kwh?: number[]; // Array de 12 meses (alternativa)

    // Localização (obrigatório)
    uf: string; // Estado brasileiro (2 letras)
    cep?: string;
    municipio?: string;
    latitude?: number;
    longitude?: number;

    // Características do local
    tipo_telhado?: 'ceramico' | 'metalico' | 'laje' | 'fibrocimento';
    area_disponivel_m2?: number;
    orientacao?: 'norte' | 'sul' | 'leste' | 'oeste' | 'nordeste' | 'noroeste' | 'sudeste' | 'sudoeste';
    inclinacao_graus?: number;
    fase?: 'monofasico' | 'bifasico' | 'trifasico';

    // Preferências de dimensionamento
    oversizing_target?: 100 | 114 | 130 | 145 | 160;
    tipo_sistema?: 'on-grid' | 'off-grid' | 'hibrido';

    // Preferências de produtos
    marca_preferida?: string;
    marca_preferida_painel?: string[];
    marca_preferida_inversor?: string[];

    // Financeiro
    tarifa_energia_kwh?: number;
    budget_max?: number;
    prazo_financiamento_meses?: number;
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface SolarCalculationOutput {
    dimensionamento: Dimensionamento;
    kits_recomendados: KitRecomendado[];
    financeiro: AnaliseFinanceira;
    analise_financeira?: AnaliseFinanceira; // Alias para compatibilidade com testes
    impacto_ambiental: ImpactoAmbiental;
    conformidade: ConformidadeMMGD;
    dados_localizacao: DadosLocalizacao;
}

export interface Dimensionamento {
    kwp_necessario: number;
    kwp_proposto: number;
    numero_paineis: number;
    potencia_inversor_kw: number;
    area_necessaria_m2: number;
    geracao_mensal_kwh: number[];
    geracao_anual_kwh: number;
    performance_ratio: number;
    oversizing_ratio: number;
}

export interface KitRecomendado {
    product_id?: string;
    kit_id: string;
    nome: string;
    potencia_kwp: number;
    match_score: number;
    match_reasons?: string[];
    componentes: ComponentesKit;
    preco_brl: number;
    disponibilidade: DisponibilidadeKit;
    metadata?: any;
}

export interface ComponentesKit {
    paineis: ComponentePainel[];
    inversores: ComponenteInversor[];
    baterias?: ComponenteBateria[];
    estrutura?: EstruturaKit;
}

export interface ComponentePainel {
    marca: string;
    modelo?: string;
    potencia_w: number;
    quantidade: number;
    eficiencia?: number;
}

export interface ComponenteInversor {
    marca: string;
    modelo?: string;
    potencia_kw: number;
    quantidade: number;
    mppt?: number;
    tipo?: string;
}

export interface ComponenteBateria {
    marca: string;
    modelo?: string;
    capacidade_kwh: number;
    quantidade: number;
}

export interface EstruturaKit {
    tipo: string;
    material?: string;
}

export interface DisponibilidadeKit {
    em_estoque: boolean;
    centro_distribuicao?: string;
    prazo_entrega_dias?: number;
}

export interface AnaliseFinanceira {
    capex: Capex;
    economia: Economia;
    retorno: Retorno;
    financiamento?: Financiamento;
}

export interface Capex {
    equipamentos_brl: number;
    instalacao_brl: number;
    projeto_brl: number;
    homologacao_brl: number;
    total_brl: number;
}

export interface Economia {
    mensal_brl: number;
    anual_brl: number;
    total_25anos_brl: number;
    economia_percentual: number;
}

export interface Retorno {
    payback_simples_anos: number;
    payback_descontado_anos: number;
    tir_percentual: number;
    vpl_brl: number;
}

export interface Financiamento {
    parcela_mensal_brl: number;
    total_financiado_brl: number;
    taxa_juros_mensal: number;
    economia_liquida_mensal_brl: number;
    total_pago_brl: number; // Adicionado para testes
}

export interface ImpactoAmbiental {
    co2_evitado_kg: number;
    co2_evitado_toneladas: number;
    arvores_equivalentes: number;
    carros_equivalentes: number;
}

export interface ConformidadeMMGD {
    conforme: boolean;
    alertas: string[];
    oversizing_permitido: boolean;
    potencia_dentro_limite: boolean;
    observacoes: string[];
}

export interface DadosLocalizacao {
    estado: string;
    hsp: number;
    tarifa_kwh: number;
    latitude?: number;
    longitude?: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SolarCalculatorAPIResponse {
    success: boolean;
    calculation: SolarCalculationOutput;
    metadata: {
        calculated_at: string;
        api_version: string;
        input_parameters: Partial<SolarCalculationInput>;
    };
}

export interface SolarCalculatorAPIError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: any;
        timestamp: string;
    };
}

export interface CalculatorInfoResponse {
    service: string;
    version: string;
    status: 'operational' | 'degraded' | 'down';
    capabilities: string[];
    supported_states: string[];
    parameters: {
        required: string[];
        optional: string[];
    };
    oversizing_options: number[];
    default_oversizing: number;
    api_info: {
        current_version: string;
        supported_versions: string[];
    };
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseSolarCalculatorOptions {
    autoCalculate?: boolean;
    onSuccess?: (result: SolarCalculationOutput) => void;
    onError?: (error: Error) => void;
}

export interface UseSolarCalculatorReturn {
    calculate: (input: SolarCalculationInput) => Promise<void>;
    result: SolarCalculationOutput | null;
    loading: boolean;
    error: Error | null;
    reset: () => void;
}

export interface UseSolarKitsOptions {
    kwp_alvo: number;
    kwp_tolerance?: number;
    tipo_sistema?: 'on-grid' | 'off-grid' | 'hibrido';
    autoFetch?: boolean;
}

export interface UseSolarKitsReturn {
    kits: KitRecomendado[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type OversizingOption = 100 | 114 | 130 | 145 | 160;
export type TipoSistema = 'on-grid' | 'off-grid' | 'hibrido';
export type TipoTelhado = 'ceramico' | 'metalico' | 'laje' | 'fibrocimento';
export type Fase = 'monofasico' | 'bifasico' | 'trifasico';
export type Orientacao = 'norte' | 'sul' | 'leste' | 'oeste' | 'nordeste' | 'noroeste' | 'sudeste' | 'sudoeste';

// Estados brasileiros
export const ESTADOS_BRASIL = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const;

export type EstadoBrasil = typeof ESTADOS_BRASIL[number];