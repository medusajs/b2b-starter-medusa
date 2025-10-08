/**
 * Database de Seguradoras especializadas em Solar
 */

import { SeguradoraInfo } from '../types'

export const SEGURADORAS: Record<string, SeguradoraInfo> = {
    'PORTO_SEGURO': {
        codigo: 'PORTO_SEGURO',
        nome: 'Porto Seguro',
        razao_social: 'Porto Seguro Companhia de Seguros Gerais',
        nota_rating: 9.2,
        tempo_mercado_anos: 75,
        portfolio_solar_gwp: 1.5,
        sinistros_pagos_12m: 2847,
        tempo_medio_sinistro_dias: 15,
        telefone: '0800 727 8118',
        email: 'solar@portoseguro.com.br',
        portal_url: 'https://www.portoseguro.com.br/energia-solar'
    },

    'TOKIO_MARINE': {
        codigo: 'TOKIO_MARINE',
        nome: 'Tokio Marine',
        razao_social: 'Tokio Marine Seguradora S.A.',
        nota_rating: 9.5,
        tempo_mercado_anos: 120,
        portfolio_solar_gwp: 2.1,
        sinistros_pagos_12m: 3421,
        tempo_medio_sinistro_dias: 12,
        telefone: '0800 013 4000',
        email: 'energia.renovavel@tokiomarine.com.br',
        portal_url: 'https://www.tokiomarine.com.br/energia-solar'
    },

    'BRADESCO_SEGUROS': {
        codigo: 'BRADESCO_SEGUROS',
        nome: 'Bradesco Seguros',
        razao_social: 'Bradesco Auto/RE Companhia de Seguros',
        nota_rating: 9.0,
        tempo_mercado_anos: 85,
        portfolio_solar_gwp: 1.8,
        sinistros_pagos_12m: 4125,
        tempo_medio_sinistro_dias: 18,
        telefone: '0800 701 7777',
        email: 'solar@bradescoseguros.com.br',
        portal_url: 'https://www.bradescoseguros.com.br/solar'
    },

    'SURA': {
        codigo: 'SURA',
        nome: 'Sura Seguros',
        razao_social: 'Sura Seguros Brasil S.A.',
        nota_rating: 8.8,
        tempo_mercado_anos: 75,
        portfolio_solar_gwp: 0.9,
        sinistros_pagos_12m: 1856,
        tempo_medio_sinistro_dias: 20,
        telefone: '0800 0800 456',
        email: 'renovaveis@sura.com.br',
        portal_url: 'https://www.sura.com.br/energia-renovavel'
    },

    'LIBERTY_SEGUROS': {
        codigo: 'LIBERTY_SEGUROS',
        nome: 'Liberty Seguros',
        razao_social: 'Liberty Seguros S.A.',
        nota_rating: 8.5,
        tempo_mercado_anos: 100,
        portfolio_solar_gwp: 0.7,
        sinistros_pagos_12m: 1245,
        tempo_medio_sinistro_dias: 22,
        telefone: '0800 024 4030',
        email: 'solar@libertyseguros.com.br',
        portal_url: 'https://www.libertyseguros.com.br/solar'
    },

    'MAPFRE': {
        codigo: 'MAPFRE',
        nome: 'Mapfre Seguros',
        razao_social: 'Mapfre Seguros Gerais S.A.',
        nota_rating: 8.7,
        tempo_mercado_anos: 95,
        portfolio_solar_gwp: 1.2,
        sinistros_pagos_12m: 2134,
        tempo_medio_sinistro_dias: 16,
        telefone: '0800 775 4545',
        email: 'energialimpa@mapfre.com.br',
        portal_url: 'https://www.mapfre.com.br/energia-solar'
    },

    'ZURICH': {
        codigo: 'ZURICH',
        nome: 'Zurich Seguros',
        razao_social: 'Zurich Minas Brasil Seguros S.A.',
        nota_rating: 9.3,
        tempo_mercado_anos: 110,
        portfolio_solar_gwp: 1.4,
        sinistros_pagos_12m: 1987,
        tempo_medio_sinistro_dias: 14,
        telefone: '0800 284 4848',
        email: 'sustentabilidade@zurich.com.br',
        portal_url: 'https://www.zurich.com.br/solar'
    },

    'HDI_SEGUROS': {
        codigo: 'HDI_SEGUROS',
        nome: 'HDI Seguros',
        razao_social: 'HDI Seguros S.A.',
        nota_rating: 8.9,
        tempo_mercado_anos: 120,
        portfolio_solar_gwp: 1.1,
        sinistros_pagos_12m: 1723,
        tempo_medio_sinistro_dias: 17,
        telefone: '0800 736 1212',
        email: 'renovaveis@hdi.com.br',
        portal_url: 'https://www.hdi.com.br/energia-solar'
    },
}

export function getAllSeguradoras(): SeguradoraInfo[] {
    return Object.values(SEGURADORAS)
}

export function getSeguradora(codigo: string): SeguradoraInfo | undefined {
    return SEGURADORAS[codigo]
}

export function getSeguradorasByRating(minRating: number = 8.0): SeguradoraInfo[] {
    return Object.values(SEGURADORAS)
        .filter(seg => seg.nota_rating >= minRating)
        .sort((a, b) => b.nota_rating - a.nota_rating)
}
