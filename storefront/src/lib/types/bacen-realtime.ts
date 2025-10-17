/**
 * 🏦 Tipos para APIs BACEN em Tempo Real
 * Sistema completo de análise financeira por persona com leaderboards técnico-financeiros
 */

// ============================================================================
// PERSONAS E SEGMENTOS
// ============================================================================

export enum PersonaID {
  RESIDENCIAL_B1_PADRAO = 'residencial_b1_padrao',
  RESIDENCIAL_B1_TARIFA_SOCIAL = 'residencial_b1_tarifa_social',
  COMERCIAL_B3_PME = 'comercial_b3_pme',
  INDUSTRIAL_A4_A3_MEDIA_TENSAO = 'industrial_a4_a3_media_tensao',
  RURAL_B2_AGRO = 'rural_b2_agro',
  MULTISITES_CONDOMINIO_GC = 'multisites_condominio_gc',
}

export enum ClasseANEEL {
  B1 = 'B1', // Residencial
  B2 = 'B2', // Rural
  B3 = 'B3', // Comercial/Serviços
  A4 = 'A4', // Industrial 2,3-25 kV
  A3 = 'A3', // Industrial 30-44 kV
}

export enum RegimeGD {
  GD_I = 'GD I', // Sistema de Compensação (até 2023)
  GD_II = 'GD II', // Lei 14.300/2022 (pós 2023)
  GD_III = 'GD III', // Futuras regras
  GC = 'Geração Compartilhada',
  ASSINATURA = 'Assinatura/PPA',
  ACL = 'Ambiente de Contratação Livre',
}

// ============================================================================
// TAXAS BACEN EM TEMPO REAL
// ============================================================================

export interface BCBRealtimeRate {
  readonly modalidade: string // CDC, Consignado INSS, etc
  readonly segmento: 'PF' | 'PJ'
  readonly taxaMensal: number // % a.m.
  readonly taxaAnual: number // % a.a.
  readonly spread: number // Diferença vs SELIC
  readonly numeroOperacoes: number
  readonly valorMedio: number // R$
  readonly timestamp: string // ISO 8601
  readonly fonte: 'BCB_SGS' | 'BCB_API' | 'CACHE'
}

export interface BCBMarketSnapshot {
  readonly timestamp: string
  readonly selic: number // Taxa SELIC atual
  readonly ipca: number // IPCA acumulado 12m
  readonly igpm: number // IGP-M acumulado 12m
  readonly taxasPF: readonly BCBRealtimeRate[]
  readonly taxasPJ: readonly BCBRealtimeRate[]
  readonly validUntil: string // Cache expiry
}

// ============================================================================
// KPIs FINANCEIROS POR PERSONA
// ============================================================================

export interface PersonaFinancialKPIs {
  readonly personaId: PersonaID
  readonly classe: ClasseANEEL
  readonly regimeGD: RegimeGD

  // Parâmetros de entrada
  readonly investimentoTotal: number // R$
  readonly consumoMensalKWh: number
  readonly tarifaKWh: number // R$/kWh
  readonly oversizing: number // 1.14, 1.30, 1.45

  // KPIs calculados
  readonly roi: {
    readonly paybackSimples: number // anos
    readonly paybackDescontado: number // anos (com TMA)
    readonly tir: number // % a.a.
    readonly vpl: number // R$ (Valor Presente Líquido)
    readonly lcoe: number // R$/kWh (Levelized Cost of Energy)
  }

  // Financiamento (se aplicável)
  readonly financiamento?: {
    readonly modalidade: string
    readonly taxaMensal: number
    readonly prazoMeses: number
    readonly parcelaMensal: number
    readonly jurosTotais: number
    readonly economiaLiquida: number // economia - parcela
  }

  // Economia projetada
  readonly economia: {
    readonly mensal: number // R$
    readonly anual: number // R$
    readonly total25anos: number // R$
    readonly economiaVsTarifa: number // %
  }

  // Riscos regulatórios
  readonly riscos: {
    readonly escalonamentoTUSD: readonly number[] // [2023, 2024, ..., 2028]
    readonly impactoEscalonamento: number // R$ acumulado
    readonly sensibilidadeTarifa: {
      readonly cenarioOtimista: number // VPL com tarifa +5%
      readonly cenarioPessimista: number // VPL com tarifa -5%
    }
  }

  readonly timestamp: string
}

// ============================================================================
// LEADERBOARDS TÉCNICO-FINANCEIROS
// ============================================================================

export interface EquipmentFinancialScore {
  // Identificação
  readonly fabricante: string
  readonly modelo: string
  readonly tecnologia: 'Mono PERC' | 'N-Type TOPCon' | 'Bifacial' | 'HJT' | 'IBC'
  readonly potenciaWp: number
  readonly tier: 1 | 2 | 3

  // Preço e disponibilidade
  readonly precoUnitario: number // R$
  readonly precoWp: number // R$/Wp
  readonly disponibilidade: 'estoque' | 'sob_encomenda' | 'importacao'
  readonly distribuidores: readonly string[]

  // Performance técnica
  readonly eficiencia: number // %
  readonly degradacaoAnual: number // %
  readonly garantiaPotencia: number // anos
  readonly garantiaFabricacao: number // anos

  // KPIs financeiros (calculados para persona padrão)
  readonly kpis: {
    readonly lcoeNormalizado: number // R$/kWh (25 anos)
    readonly custoInstalado: number // R$/Wp instalado
    readonly paybackEquipamento: number // anos
    readonly roi25anos: number // %
  }

  // Pontuação composta
  readonly scores: {
    readonly tecnico: number // 0-100 (eficiência + garantia + tier)
    readonly financeiro: number // 0-100 (LCOE + ROI)
    readonly disponibilidade: number // 0-100 (estoque + distrib)
    readonly geral: number // média ponderada
  }

  readonly timestamp: string
}

export interface LeaderboardByPersona {
  readonly personaId: PersonaID
  readonly classe: ClasseANEEL
  readonly filtros: {
    readonly tecnologias?: readonly string[]
    readonly fabricantes?: readonly string[]
    readonly faixaPotencia?: { readonly min: number; readonly max: number }
    readonly orcamentoMax?: number
  }

  // Rankings
  readonly topPorLCOE: readonly EquipmentFinancialScore[] // Menor LCOE
  readonly topPorROI: readonly EquipmentFinancialScore[] // Maior ROI
  readonly topPorPayback: readonly EquipmentFinancialScore[] // Menor payback
  readonly topPorScore: readonly EquipmentFinancialScore[] // Maior score geral

  // Análise comparativa
  readonly estatisticas: {
    readonly lcoeMedia: number
    readonly lcoeMenor: number
    readonly lcoeMaior: number
    readonly roiMedio: number
    readonly paybackMedio: number
  }

  readonly timestamp: string
}

// ============================================================================
// ANÁLISE REGIONAL COM PVGIS/NREL
// ============================================================================

export interface RegionalFinancialAnalysis {
  readonly localidade: string
  readonly latitude: number
  readonly longitude: number
  readonly distribuidora: string

  // Radiação solar
  readonly radiacaoMedia: {
    readonly hspDiario: number // kWh/m²/dia
    readonly fonte: 'PVGIS' | 'NREL' | 'NASA_POWER'
    readonly resolucao: string // "3km", "10km", etc
  }

  // Tarifas locais
  readonly tarifas: {
    readonly energiaTE: number // R$/kWh
    readonly tusdFioB: number // R$/kWh
    readonly tarifaTotal: number // R$/kWh
    readonly classe: ClasseANEEL
  }

  // KPIs por cenário de oversizing
  readonly cenarios: readonly {
    readonly oversizing: number
    readonly potenciaKWp: number
    readonly geracaoAnualKWh: number
    readonly investimento: number
    readonly kpis: PersonaFinancialKPIs['roi']
  }[]

  readonly recomendacao: {
    readonly oversizingOtimo: number
    readonly motivacao: string
    readonly alertas: readonly string[]
  }

  readonly timestamp: string
}

// ============================================================================
// COMPARAÇÃO MODALIDADES DE FINANCIAMENTO
// ============================================================================

export interface FinancingModalityComparison {
  readonly personaId: PersonaID
  readonly investimentoTotal: number
  readonly economiaEsperada: number // R$/mês

  readonly modalidades: readonly {
    readonly nome: string // CDC, Consignado INSS, etc
    readonly taxaMensal: number
    readonly taxaAnual: number
    readonly prazoMeses: number
    readonly parcelaMensal: number
    readonly jurosTotais: number
    readonly custoEfetivoTotal: number // CET % a.a.
    readonly economiaLiquida: number // economia - parcela
    readonly viabilidade: 'alta' | 'media' | 'baixa'
    readonly recomendado: boolean
  }[]

  readonly melhorOpcao: {
    readonly modalidade: string
    readonly motivacao: string
    readonly economia25anos: number
  }

  readonly timestamp: string
}

// ============================================================================
// WEBSOCKET & STREAMING
// ============================================================================

export interface BCBRealtimeEvent {
  readonly type:
    | 'RATE_UPDATE'
    | 'MARKET_SNAPSHOT'
    | 'KPI_RECALCULATED'
    | 'LEADERBOARD_UPDATE'
    | 'CONNECTION_STATUS'
  readonly timestamp: string
  readonly payload: unknown
}

export interface BCBStreamConfig {
  readonly autoReconnect: boolean
  readonly reconnectDelay: number // ms
  readonly heartbeatInterval: number // ms
  readonly updateFrequency: 'realtime' | 'hourly' | 'daily'
}

// ============================================================================
// CONFIGURAÇÃO E CACHE
// ============================================================================

export interface BCBRealtimeConfig {
  readonly apiUrl: string
  readonly websocketUrl?: string
  readonly apiKey?: string
  readonly cache: {
    readonly enabled: boolean
    readonly ttl: number // ms
    readonly maxSize: number
    readonly strategy: 'lru' | 'fifo' | 'lfu'
  }
  readonly fallback: {
    readonly useStaleOnError: boolean
    readonly maxStaleTime: number // ms
  }
  readonly rateLimit: {
    readonly maxRequests: number
    readonly windowMs: number
  }
}

export interface BCBCacheEntry<T> {
  readonly data: T
  readonly timestamp: number
  readonly ttl: number
  readonly source: 'api' | 'cache' | 'fallback'
  readonly etag?: string
}

// ============================================================================
// ANÁLISE MULTIDIMENSIONAL
// ============================================================================

export interface MultidimensionalAnalysis {
  readonly persona: PersonaID
  readonly localidade: string
  readonly equipamento: EquipmentFinancialScore
  readonly financiamento: FinancingModalityComparison['modalidades'][0]

  // Matriz de decisão
  readonly scores: {
    readonly tecnico: number // 0-100
    readonly financeiro: number // 0-100
    readonly regulatorio: number // 0-100 (conformidade)
    readonly sustentabilidade: number // 0-100 (CO2 evitado)
    readonly geral: number // média ponderada
  }

  // Recomendação final
  readonly recomendacao: {
    readonly nivel: 'excelente' | 'muito_boa' | 'boa' | 'regular' | 'nao_recomendada'
    readonly motivacao: string
    readonly acoes: readonly string[]
    readonly alertas: readonly string[]
  }

  readonly timestamp: string
}

// ============================================================================
// EXPORTS DE UTILIDADE
// ============================================================================

export const OVERSIZING_SCENARIOS = [1.14, 1.3, 1.45] as const
export type OversizingScenario = (typeof OVERSIZING_SCENARIOS)[number]

export const ESCALONAMENTO_TUSD_FIO_B = {
  2023: 0.151, // 15,1%
  2024: 0.307, // 30,7%
  2025: 0.477, // 47,7%
  2026: 0.631, // 63,1%
  2027: 0.787, // 78,7%
  2028: 1.0, // 100%
} as const

export const VIDA_UTIL_PROJETO = 25 // anos (padrão indústria)
export const TAXA_DEGRADACAO_PADRAO = 0.005 // 0,5% a.a.
export const TMA_PADRAO = 0.1 // 10% a.a. (Taxa Mínima de Atratividade)
