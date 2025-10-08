/**
 * Insurance Module Types
 * Sistema de comparação de seguros para sistemas fotovoltaicos
 */

import { CustomerGroup } from '@/lib/context/sales-channel-context'

export type TipoCobertura =
    | 'equipamento' // Roubo, incêndio, danos elétricos
    | 'performance' // Garantia de performance/geração
    | 'rc' // Responsabilidade civil
    | 'perda_producao' // Perda de produção/interrupção negócio
    | 'fenomenos_naturais' // Tempestades, raios, granizo
    | 'transporte' // Seguro durante transporte
    | 'obras' // Seguro durante instalação

export type TipoSeguro = 'residencial' | 'comercial' | 'industrial' | 'rural'

export interface SeguroInput {
    // Sistema
    potencia_kwp: number
    valor_equipamento: number // CAPEX total do sistema
    tipo_instalacao: 'telhado' | 'solo' | 'fachada' | 'estacionamento'

    // Cliente
    customer_group: CustomerGroup
    cep: string
    uf: string

    // Coberturas Desejadas
    coberturas_desejadas: TipoCobertura[]

    // Dados Adicionais
    possui_monitoramento?: boolean
    possui_manutencao_preventiva?: boolean
    sistema_off_grid?: boolean // Tem baterias?
}

export interface CoberturaDetalhes {
    tipo: TipoCobertura
    incluida: boolean
    valor_segurado: number
    franquia: number
    descricao: string
    limitações?: string[]
}

export interface SeguradoraInfo {
    codigo: string
    nome: string
    razao_social: string
    nota_rating: number // 0-10 (Moody's, S&P, etc)
    tempo_mercado_anos: number
    portfolio_solar_gwp?: number // GWp segurados
    sinistros_pagos_12m?: number
    tempo_medio_sinistro_dias: number
    telefone: string
    email: string
    portal_url: string
}

export interface CotacaoSeguro {
    seguradora: SeguradoraInfo
    tipo_seguro: TipoSeguro

    // Prêmio
    premio_anual: number
    premio_mensal: number
    forma_pagamento: string[]

    // Coberturas
    coberturas: CoberturaDetalhes[]
    valor_total_segurado: number

    // Condições
    vigencia_anos: number
    renovacao_automatica: boolean
    carencia_dias: number

    // Desconto
    desconto_percent?: number
    motivo_desconto?: string[]

    // Score
    score_recomendacao: number // 0-100
    destaque?: 'melhor_preco' | 'maior_cobertura' | 'mais_vendido'
}

export interface ComparacaoSeguros {
    input: SeguroInput
    cotacoes: CotacaoSeguro[]
    recomendacao: CotacaoSeguro
    economia_maxima: number // Diferença entre mais caro e mais barato
}

export interface ContratoSeguro {
    id: string
    cotacao_id: string
    seguradora: SeguradoraInfo

    // Dados do Segurado
    nome_segurado: string
    cpf_cnpj: string
    endereco: string
    cep: string

    // Dados do Sistema
    potencia_kwp: number
    numero_serie_inversores: string[]
    numero_serie_paineis?: string[]
    data_instalacao: string

    // Vigência
    data_inicio: string
    data_fim: string
    numero_apolice: string

    // Prêmio
    premio_anual: number
    forma_pagamento: 'anual' | 'semestral' | 'mensal'

    // Coberturas
    coberturas: CoberturaDetalhes[]

    // Status
    status: 'ativo' | 'cancelado' | 'expirado' | 'em_analise'
}

export interface Sinistro {
    id: string
    contrato_id: string
    numero_sinistro: string

    // Dados do Sinistro
    data_ocorrencia: string
    data_abertura: string
    tipo_cobertura: TipoCobertura
    descricao: string
    valor_estimado: number

    // Documentos
    fotos: string[]
    boletim_ocorrencia?: string
    laudo_tecnico?: string
    notas_fiscais: string[]

    // Status
    status: 'aberto' | 'em_analise' | 'aprovado' | 'reprovado' | 'pago'
    valor_aprovado?: number
    valor_pago?: number
    data_pagamento?: string
    motivo_reprovacao?: string

    // Timeline
    previsao_conclusao: string
}
