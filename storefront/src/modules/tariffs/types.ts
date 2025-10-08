/**
 * Tariffs Module Types
 * Baseado no schema mmgd_packet.json do AGENTS.md
 */

export type GrupoTarifario = 'A' | 'B'
export type SubgrupoA = 'A1' | 'A2' | 'A3' | 'A3a' | 'A4' | 'AS'
export type SubgrupoB = 'B1' | 'B2' | 'B3' | 'B4'
export type ModalidadeMMGD = 
  | 'microgeracao_junto_a_carga'
  | 'minigeracao_junto_a_carga'
  | 'autoconsumo_remoto'
  | 'geracao_compartilhada'
  | 'multiplas_unidades_consumidoras'
  | 'empreendimento_multiplas_unidades'

export interface TariffInput {
  demanda_contratada_kw?: number
  tensao_fornecimento_kv: number
  tipo_conexao: 'monofasico' | 'bifasico' | 'trifasico'
  distribuidora: string
  cep: string
  consumo_kwh_mes: number
  potencia_instalada_kwp?: number
}

export interface TariffClassification {
  IdcClasse: GrupoTarifario
  IdcSubgrupo: SubgrupoA | SubgrupoB
  tensao_referencia_kv: number
  descricao: string
  demanda_minima_kw?: number
  demanda_maxima_kw?: number
}

export interface MMGDPacket {
  IdcClasse: GrupoTarifario
  IdcSubgrupo: SubgrupoA | SubgrupoB
  IdcModalidade: ModalidadeMMGD
  MdaPotenciaInstalada: number
  CSV?: string // Caminho do arquivo CSV opcional
  eligibility: {
    is_eligible: boolean
    reasons: string[]
    restrictions?: string[]
  }
}

export interface Distribuidora {
  id: string
  nome: string
  sigla: string
  cnpj: string
  estados: string[]
  website: string
  telefone: string
  tarifas_vigentes: {
    grupo_a: Record<SubgrupoA, { tusd: number; te: number }>
    grupo_b: Record<SubgrupoB, { tusd: number; te: number }>
  }
}

export interface TariffRates {
  tusd: number // Tarifa de Uso do Sistema de Distribuição
  te: number // Tarifa de Energia
  total: number
  unidade: 'R$/kWh' | 'R$/kW'
  bandeira: 'verde' | 'amarela' | 'vermelha1' | 'vermelha2'
  adicional_bandeira: number
  vigencia_inicio: string
  vigencia_fim?: string
}
