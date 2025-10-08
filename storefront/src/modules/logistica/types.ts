/**
 * Logistics Module Types
 * Sistema de cálculo de frete e gestão de entregas
 */

import { CustomerGroup } from '@/lib/context/sales-channel-context'

export type ModalFrete = 'rodoviario' | 'aereo' | 'maritimo'

export type TipoFrete =
    | 'pac' // Correios PAC
    | 'sedex' // Correios SEDEX
    | 'transportadora' // Transportadora convencional
    | 'fob' // Free On Board (cliente retira)
    | 'cif' // Cost, Insurance and Freight (entrega inclusa)
    | 'dedicado' // Transporte dedicado
    | 'expresso' // Entrega expressa

export type StatusEntrega =
    | 'pendente'
    | 'coletado'
    | 'em_transito'
    | 'saiu_para_entrega'
    | 'entregue'
    | 'tentativa_falha'
    | 'devolvido'
    | 'extraviado'

export interface FreteInput {
    // Origem
    cep_origem: string
    uf_origem: string
    cidade_origem: string

    // Destino
    cep_destino: string
    uf_destino: string
    cidade_destino: string
    area_rural?: boolean

    // Carga
    peso_kg: number
    volume_m3: number
    valor_declarado: number
    itens_descricao: string[]

    // Cliente
    customer_group: CustomerGroup

    // Preferências
    prazo_maximo_dias?: number
    seguro_carga?: boolean
    agendamento_entrega?: boolean
}

export interface TransportadoraInfo {
    codigo: string
    nome: string
    razao_social: string

    // Capacidades
    atende_area_rural: boolean
    atende_regiao_remota: boolean
    peso_maximo_kg: number
    volume_maximo_m3: number

    // Modais
    modais: ModalFrete[]

    // Contato
    telefone: string
    email: string
    portal_url: string
    rastreio_url: string

    // Qualidade
    nota_avaliacao: number // 0-10
    percentual_no_prazo: number // 0-100
    percentual_avarias: number // 0-100
    tempo_medio_entrega_dias: number
}

export interface CotacaoFrete {
    transportadora: TransportadoraInfo
    tipo_frete: TipoFrete
    modal: ModalFrete

    // Valores
    valor_frete: number
    valor_seguro: number
    valor_pedagio?: number
    valor_gris?: number // Gerenciamento de Risco
    valor_taxa_entrega?: number
    valor_total: number

    // Prazo
    prazo_entrega_dias: number
    prazo_coleta_dias: number
    data_entrega_estimada: string

    // Condições
    entrega_agendada: boolean
    rastreamento_online: boolean
    nota_fiscal_obrigatoria: boolean

    // Desconto
    desconto_percent?: number
    motivo_desconto?: string[]

    // Score
    score_recomendacao: number // 0-100
    destaque?: 'mais_rapido' | 'mais_barato' | 'mais_confiavel'
}

export interface ComparacaoFrete {
    input: FreteInput
    cotacoes: CotacaoFrete[]
    recomendacao: CotacaoFrete
    economia_maxima: number
    prazo_minimo_dias: number
}

export interface Rastreamento {
    codigo_rastreio: string
    transportadora: string
    status: StatusEntrega

    // Origem/Destino
    origem: string
    destino: string

    // Datas
    data_postagem: string
    data_entrega_prevista: string
    data_entrega_real?: string

    // Timeline
    eventos: EventoRastreamento[]
}

export interface EventoRastreamento {
    data: string
    hora: string
    local: string
    status: string
    descricao: string
    cidade_uf?: string
}

export interface RMA {
    id: string
    numero_rma: string
    numero_pedido: string

    // Motivo
    motivo: 'defeito' | 'avaria_transporte' | 'produto_errado' | 'nao_conforme' | 'desistencia'
    descricao: string

    // Produtos
    itens: {
        produto_id: string
        produto_nome: string
        quantidade: number
        valor_unitario: number
        numero_serie?: string[]
    }[]

    // Logística Reversa
    transportadora?: string
    codigo_rastreio_devolucao?: string
    etiqueta_devolucao_url?: string

    // Status
    status: 'solicitado' | 'aprovado' | 'em_transito' | 'recebido' | 'analisado' | 'concluido' | 'negado'
    data_solicitacao: string
    data_aprovacao?: string
    data_recebimento?: string
    data_conclusao?: string

    // Resolução
    tipo_resolucao?: 'troca' | 'reembolso' | 'credito' | 'reparo'
    valor_reembolso?: number
}

export interface AgendamentoEntrega {
    id: string
    codigo_rastreio: string
    transportadora: string

    // Agendamento
    data_preferencial: string
    periodo: 'manha' | 'tarde' | 'noite' | 'comercial'
    horario_inicio?: string
    horario_fim?: string

    // Local
    endereco_completo: string
    ponto_referencia?: string
    instrucoes_entrega?: string

    // Contato
    nome_recebedor: string
    telefone: string
    telefone_alternativo?: string

    // Status
    status: 'pendente' | 'confirmado' | 'em_rota' | 'concluido' | 'cancelado'
    tentativas: number
}

export interface TabelaFrete {
    transportadora: string
    tipo_frete: TipoFrete

    // Faixas de Peso (kg)
    faixas: {
        peso_min: number
        peso_max: number
        valor_base: number
        valor_adicional_por_kg: number
    }[]

    // Faixas de Distância (km)
    faixas_distancia?: {
        km_min: number
        km_max: number
        multiplicador: number
    }[]

    // Taxas Adicionais
    taxa_area_rural: number
    taxa_regiao_remota: number
    taxa_seguro_percent: number
    taxa_gris_percent: number
}
