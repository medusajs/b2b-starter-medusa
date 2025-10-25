/**
 * Database de Transportadoras
 */

import { TransportadoraInfo } from '../types'

export const TRANSPORTADORAS: Record<string, TransportadoraInfo> = {
    'CORREIOS': {
        codigo: 'CORREIOS',
        nome: 'Correios',
        razao_social: 'Empresa Brasileira de Correios e Telégrafos',
        atende_area_rural: true,
        atende_regiao_remota: true,
        peso_maximo_kg: 30,
        volume_maximo_m3: 0.1,
        modais: ['rodoviario', 'aereo'],
        telefone: '3003-0100',
        email: 'faleconosco@correios.com.br',
        portal_url: 'https://www.correios.com.br',
        rastreio_url: 'https://rastreamento.correios.com.br/app/index.php',
        nota_avaliacao: 7.2,
        percentual_no_prazo: 75,
        percentual_avarias: 3.5,
        tempo_medio_entrega_dias: 8
    },

    'BRASPRESS': {
        codigo: 'BRASPRESS',
        nome: 'Braspress',
        razao_social: 'Braspress Transportes Urgentes Ltda',
        atende_area_rural: false,
        atende_regiao_remota: false,
        peso_maximo_kg: 1000,
        volume_maximo_m3: 5.0,
        modais: ['rodoviario'],
        telefone: '0800 970 6277',
        email: 'comercial@braspress.com.br',
        portal_url: 'https://www.braspress.com.br',
        rastreio_url: 'https://www.braspress.com.br/rastreamento',
        nota_avaliacao: 8.5,
        percentual_no_prazo: 88,
        percentual_avarias: 1.8,
        tempo_medio_entrega_dias: 4
    },

    'JAMEF': {
        codigo: 'JAMEF',
        nome: 'Jamef',
        razao_social: 'Jamef Transportes Ltda',
        atende_area_rural: false,
        atende_regiao_remota: false,
        peso_maximo_kg: 2000,
        volume_maximo_m3: 10.0,
        modais: ['rodoviario'],
        telefone: '0800 707 8000',
        email: 'sac@jamef.com.br',
        portal_url: 'https://www.jamef.com.br',
        rastreio_url: 'https://www.jamef.com.br/rastreamento',
        nota_avaliacao: 8.8,
        percentual_no_prazo: 90,
        percentual_avarias: 1.5,
        tempo_medio_entrega_dias: 3
    },

    'PATRUS': {
        codigo: 'PATRUS',
        nome: 'Patrus Transportes',
        razao_social: 'Patrus Transportes Urgentes Ltda',
        atende_area_rural: true,
        atende_regiao_remota: true,
        peso_maximo_kg: 5000,
        volume_maximo_m3: 25.0,
        modais: ['rodoviario'],
        telefone: '3003-7283',
        email: 'relacionamento@patrus.com.br',
        portal_url: 'https://www.patrus.com.br',
        rastreio_url: 'https://www.patrus.com.br/rastreamento',
        nota_avaliacao: 8.3,
        percentual_no_prazo: 85,
        percentual_avarias: 2.0,
        tempo_medio_entrega_dias: 5
    },

    'TNT': {
        codigo: 'TNT',
        nome: 'TNT Mercúrio',
        razao_social: 'TNT Mercúrio Cargas e Encomendas Expressas S.A.',
        atende_area_rural: false,
        atende_regiao_remota: false,
        peso_maximo_kg: 500,
        volume_maximo_m3: 3.0,
        modais: ['rodoviario', 'aereo'],
        telefone: '3003-0300',
        email: 'atendimento@tnt.com.br',
        portal_url: 'https://www.tnt.com.br',
        rastreio_url: 'https://www.tnt.com.br/rastreamento',
        nota_avaliacao: 8.7,
        percentual_no_prazo: 92,
        percentual_avarias: 1.2,
        tempo_medio_entrega_dias: 3
    },

    'JADLOG': {
        codigo: 'JADLOG',
        nome: 'Jadlog',
        razao_social: 'Jadlog Logística S.A.',
        atende_area_rural: false,
        atende_regiao_remota: false,
        peso_maximo_kg: 300,
        volume_maximo_m3: 2.0,
        modais: ['rodoviario', 'aereo'],
        telefone: '3003-5588',
        email: 'sac@jadlog.com.br',
        portal_url: 'https://www.jadlog.com.br',
        rastreio_url: 'https://www.jadlog.com.br/rastreamento',
        nota_avaliacao: 8.0,
        percentual_no_prazo: 82,
        percentual_avarias: 2.5,
        tempo_medio_entrega_dias: 5
    },

    'TOTAL_EXPRESS': {
        codigo: 'TOTAL_EXPRESS',
        nome: 'Total Express',
        razao_social: 'Total Express Transportes de Encomendas Ltda',
        atende_area_rural: false,
        atende_regiao_remota: false,
        peso_maximo_kg: 150,
        volume_maximo_m3: 1.0,
        modais: ['rodoviario', 'aereo'],
        telefone: '0300 770 7000',
        email: 'sac@totalexpress.com.br',
        portal_url: 'https://www.totalexpress.com.br',
        rastreio_url: 'https://www.totalexpress.com.br/rastreamento',
        nota_avaliacao: 7.8,
        percentual_no_prazo: 80,
        percentual_avarias: 2.8,
        tempo_medio_entrega_dias: 6
    },

    'RODONAVES': {
        codigo: 'RODONAVES',
        nome: 'Rodonaves',
        razao_social: 'Rodonaves Transportes e Encomendas Ltda',
        atende_area_rural: true,
        atende_regiao_remota: true,
        peso_maximo_kg: 3000,
        volume_maximo_m3: 15.0,
        modais: ['rodoviario'],
        telefone: '0800 725 3000',
        email: 'sac@rodonaves.com.br',
        portal_url: 'https://www.rodonaves.com.br',
        rastreio_url: 'https://www.rodonaves.com.br/rastreamento',
        nota_avaliacao: 8.4,
        percentual_no_prazo: 87,
        percentual_avarias: 1.9,
        tempo_medio_entrega_dias: 4
    },
}

export function getAllTransportadoras(): TransportadoraInfo[] {
    return Object.values(TRANSPORTADORAS)
}

export function getTransportadora(codigo: string): TransportadoraInfo | undefined {
    return TRANSPORTADORAS[codigo]
}

export function getTransportadorasByCapacidade(
    peso_kg: number,
    volume_m3: number,
    area_rural: boolean = false
): TransportadoraInfo[] {
    return Object.values(TRANSPORTADORAS).filter(transp => {
        const capacidade_ok = peso_kg <= transp.peso_maximo_kg && volume_m3 <= transp.volume_maximo_m3
        const area_ok = !area_rural || transp.atende_area_rural
        return capacidade_ok && area_ok
    })
}

export function getTransportadorasByRating(minRating: number = 8.0): TransportadoraInfo[] {
    return Object.values(TRANSPORTADORAS)
        .filter(transp => transp.nota_avaliacao >= minRating)
        .sort((a, b) => b.nota_avaliacao - a.nota_avaliacao)
}
