/**
 * Database de Distribuidoras de Energia
 * Informações de contato, prazos e requisitos para homologação
 */

import { DistribuidoraInfo } from '../types'

export const DISTRIBUIDORAS: Record<string, DistribuidoraInfo> = {
    'CEMIG': {
        codigo: 'CEMIG',
        nome: 'CEMIG',
        razao_social: 'Companhia Energética de Minas Gerais',
        uf: ['MG'],
        portal_acesso_url: 'https://atende.cemig.com.br',
        email_solar: 'geracaodistribuida@cemig.com.br',
        telefone_solar: '0800 031 0196',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'ART/RRT do projeto elétrico',
            'Diagrama unifilar assinado',
            'Certidão negativa de débitos CEMIG'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.22, 0.38, 13.8, 23, 34.5, 138]
    },

    'CPFL_PAULISTA': {
        codigo: 'CPFL_PAULISTA',
        nome: 'CPFL Paulista',
        razao_social: 'Companhia Paulista de Força e Luz',
        uf: ['SP'],
        portal_acesso_url: 'https://servicosonline.cpfl.com.br',
        email_solar: 'geracaodistribuida@cpfl.com.br',
        telefone_solar: '0800 010 1010',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 5,
        requisitos_especiais: [
            'Projeto elétrico conforme NTC-905600',
            'Memorial descritivo completo',
            'Certificado Inmetro dos equipamentos'
        ],
        documentos_adicionais: ['Laudo de SPDA (para minigeração)'],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 23, 88, 138]
    },

    'ENEL_SP': {
        codigo: 'ENEL_SP',
        nome: 'Enel SP',
        razao_social: 'Enel Distribuição São Paulo',
        uf: ['SP'],
        portal_acesso_url: 'https://www.enel.com.br/pt-saopaulo/pra-voce.html',
        email_solar: 'geracaodistribuida.sp@enel.com',
        telefone_solar: '0800 727 0626',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário Enel GD preenchido',
            'ART do responsável técnico',
            'Diagrama unifilar'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 11.9, 13.8, 88]
    },

    'ENEL_RJ': {
        codigo: 'ENEL_RJ',
        nome: 'Enel RJ',
        razao_social: 'Enel Distribuição Rio',
        uf: ['RJ'],
        portal_acesso_url: 'https://www.enel.com.br/pt-rio/pra-voce.html',
        email_solar: 'geracaodistribuida.rj@enel.com',
        telefone_solar: '0800 028 0120',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário de solicitação Enel RJ',
            'Projeto elétrico completo',
            'Certificados de equipamentos'
        ],
        documentos_adicionais: ['AVCB (para estabelecimentos comerciais)'],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 23]
    },

    'LIGHT': {
        codigo: 'LIGHT',
        nome: 'Light',
        razao_social: 'Light Serviços de Eletricidade S.A.',
        uf: ['RJ'],
        portal_acesso_url: 'https://agenciavirtual.light.com.br',
        email_solar: 'geracaodistribuida@light.com.br',
        telefone_solar: '0800 021 0196',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 10,
        requisitos_especiais: [
            'Formulário Light GD',
            'ART/RRT',
            'Diagrama unifilar e layout'
        ],
        documentos_adicionais: ['Laudo estrutural do telhado (minigeração)'],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 25]
    },

    'COPEL': {
        codigo: 'COPEL',
        nome: 'Copel',
        razao_social: 'Companhia Paranaense de Energia',
        uf: ['PR'],
        portal_acesso_url: 'https://www.copel.com',
        email_solar: 'microgeracao@copel.com',
        telefone_solar: '0800 510 0116',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário de Acesso Copel',
            'Projeto elétrico conforme NTC 905100',
            'Memorial descritivo'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 34.5, 138]
    },

    'CELESC': {
        codigo: 'CELESC',
        nome: 'Celesc',
        razao_social: 'Centrais Elétricas de Santa Catarina',
        uf: ['SC'],
        portal_acesso_url: 'https://agencia.celesc.com.br',
        email_solar: 'geracaodistribuida@celesc.com.br',
        telefone_solar: '0800 048 0120',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário Celesc GD',
            'ART do projeto',
            'Diagrama unifilar'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 23, 34.5]
    },

    'COELBA': {
        codigo: 'COELBA',
        nome: 'Coelba',
        razao_social: 'Companhia de Eletricidade do Estado da Bahia',
        uf: ['BA'],
        portal_acesso_url: 'https://servicos.neoenergiacoelba.com.br',
        email_solar: 'geracaodistribuida.ba@neoenergia.com',
        telefone_solar: '0800 071 0800',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário Neoenergia',
            'Projeto elétrico',
            'Certificados Inmetro'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 34.5, 69]
    },

    'COSERN': {
        codigo: 'COSERN',
        nome: 'Cosern',
        razao_social: 'Companhia Energética do Rio Grande do Norte',
        uf: ['RN'],
        portal_acesso_url: 'https://servicos.neoenergiacosern.com.br',
        email_solar: 'geracaodistribuida.rn@neoenergia.com',
        telefone_solar: '0800 084 0120',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário Neoenergia',
            'ART/RRT',
            'Diagrama unifilar'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8]
    },

    'CELPE': {
        codigo: 'CELPE',
        nome: 'Celpe',
        razao_social: 'Companhia Energética de Pernambuco',
        uf: ['PE'],
        portal_acesso_url: 'https://servicos.neoenergiacelpe.com.br',
        email_solar: 'geracaodistribuida.pe@neoenergia.com',
        telefone_solar: '0800 081 0196',
        prazo_analise_micro_du: 34,
        prazo_analise_mini_du: 49,
        prazo_vistoria_du: 7,
        requisitos_especiais: [
            'Formulário Neoenergia',
            'Projeto elétrico',
            'Memorial de cálculo'
        ],
        documentos_adicionais: [],
        limite_microgeracao_kwp: 75,
        limite_minigeracao_kwp: 5000,
        oversizing_permitido_percent: 145,
        tensoes_fornecimento_kv: [0.127, 0.22, 0.38, 13.8, 69]
    },
}

/**
 * Helper: Buscar distribuidora por UF
 */
export function getDistribuidorasByUF(uf: string): DistribuidoraInfo[] {
    return Object.values(DISTRIBUIDORAS).filter(dist => dist.uf.includes(uf))
}

/**
 * Helper: Buscar distribuidora por código
 */
export function getDistribuidora(codigo: string): DistribuidoraInfo | undefined {
    return DISTRIBUIDORAS[codigo]
}

/**
 * Helper: Listar todas as distribuidoras
 */
export function getAllDistribuidoras(): DistribuidoraInfo[] {
    return Object.values(DISTRIBUIDORAS)
}
