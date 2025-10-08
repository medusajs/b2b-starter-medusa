/**
 * Compliance Module Types
 * Sistema de validação PRODIST e geração de dossiê técnico
 */

export type ClasseTarifaria = 'B1' | 'B2' | 'B3' | 'A4' | 'A3' | 'A3a' | 'A2' | 'A1'

export type ModalidadeMMGD =
    | 'microgeracao_junto_a_carga'
    | 'minigeracao_junto_a_carga'
    | 'autoconsumo_remoto'
    | 'geracao_compartilhada'
    | 'multiplas_unidades_consumidoras'
    | 'empreendimento_multiplas_unidades'

export interface ComplianceInput {
    // Dados do Sistema
    potencia_instalada_kwp: number
    tensao_conexao_kv: number
    tipo_conexao: 'monofasico' | 'bifasico' | 'trifasico'

    // Localização
    distribuidora: string
    uf: string
    cep?: string

    // Consumo
    consumo_anual_kwh: number
    classe_tarifaria: ClasseTarifaria

    // Modalidade
    modalidade_mmgd: ModalidadeMMGD

    // Dados do Cliente (opcional para dossiê)
    nome_cliente?: string
    cpf_cnpj?: string
    endereco_instalacao?: string
}

export interface ProdistValidation {
    is_compliant: boolean
    nivel_tensao_correto: boolean
    potencia_dentro_limites: boolean
    oversizing_valido: boolean
    modalidade_permitida: boolean

    // Warnings e Erros
    warnings: string[]
    errors: string[]

    // Limites Aplicáveis
    limites: {
        potencia_maxima_kwp: number
        oversizing_maximo_percent: number
        tensao_minima_kv: number
        tensao_maxima_kv: number
    }
}

export interface ChecklistItem {
    id: string
    categoria: 'documentacao' | 'tecnico' | 'eletrico' | 'seguranca' | 'ambiental'
    titulo: string
    descricao: string
    obrigatorio: boolean
    aplicavel: boolean
    concluido: boolean
    observacoes?: string
    arquivo_anexo?: string
}

export interface ChecklistANEEL {
    distribuidora: string
    classe: ClasseTarifaria
    potencia_kwp: number
    modalidade: ModalidadeMMGD

    itens: ChecklistItem[]

    progresso: {
        total: number
        concluidos: number
        obrigatorios_pendentes: number
        percent_completo: number
    }
}

export interface DossieComponente {
    tipo: 'painel' | 'inversor' | 'estrutura' | 'transformador' | 'protecao'
    fabricante: string
    modelo: string
    quantidade: number
    potencia_unitaria?: number
    certificacoes: string[] // Ex: ["Inmetro Classe A", "IEC 61215"]
    datasheet_url?: string
}

export interface DossieTecnico {
    // Identificação
    numero_dossie: string
    data_geracao: string
    status: 'rascunho' | 'completo' | 'aprovado' | 'reprovado'

    // Dados do Cliente
    cliente: {
        nome: string
        cpf_cnpj: string
        tipo_pessoa: 'fisica' | 'juridica'
        endereco_completo: string
        cep: string
        cidade: string
        uf: string
        telefone?: string
        email?: string
    }

    // Dados do Sistema
    sistema: {
        potencia_instalada_kwp: number
        potencia_inversores_kw: number
        numero_paineis: number
        numero_inversores: number
        geracao_estimada_kwh_ano: number
        area_ocupada_m2: number
        tipo_instalacao: 'telhado' | 'solo' | 'fachada' | 'estacionamento'
    }

    // Dados Elétricos
    eletrico: {
        tensao_conexao_kv: number
        tipo_conexao: 'monofasico' | 'bifasico' | 'trifasico'
        classe_tarifaria: ClasseTarifaria
        distribuidora: string
        numero_medidor?: string
        consumo_anual_kwh: number
        modalidade_mmgd: ModalidadeMMGD
    }

    // Componentes
    componentes: DossieComponente[]

    // Diagramas e Desenhos
    documentos: {
        diagrama_unifilar?: string // URL ou base64
        layout_paineis?: string
        memorial_descritivo?: string
        art_anotacao_responsabilidade?: string
    }

    // Responsável Técnico
    responsavel_tecnico: {
        nome: string
        registro_profissional: string // CREA, CAU, etc
        cpf: string
        email: string
        telefone: string
    }

    // Validações
    validacoes: {
        prodist: ProdistValidation
        checklist: ChecklistANEEL
    }
}

export interface DistribuidoraInfo {
    codigo: string
    nome: string
    razao_social: string
    uf: string[]

    // Contatos
    portal_acesso_url: string
    email_solar?: string
    telefone_solar?: string

    // Prazos (dias úteis)
    prazo_analise_micro_du: number
    prazo_analise_mini_du: number
    prazo_vistoria_du: number

    // Requisitos Específicos
    requisitos_especiais: string[]
    documentos_adicionais: string[]

    // Limites
    limite_microgeracao_kwp: number
    limite_minigeracao_kwp: number
    oversizing_permitido_percent: number

    // Tensões Disponíveis
    tensoes_fornecimento_kv: number[]
}

export interface ComplianceReport {
    input: ComplianceInput
    validacao: ProdistValidation
    checklist: ChecklistANEEL
    distribuidora_info: DistribuidoraInfo
    dossie?: DossieTecnico

    resumo: {
        status_geral: 'aprovado' | 'pendente' | 'reprovado'
        pode_prosseguir: boolean
        proximos_passos: string[]
    }
}
