/**
 * ☀️ Serviço de Integração PVGIS/NREL/NASA POWER
 * Calcula LCOE real combinando radiação solar + taxas BACEN + custos equipamento
 * Análise regional personalizada por localidade
 */

'use server'
import 'server-only'

import {
  type RegionalFinancialAnalysis,
  type PersonaID,
  type ClasseANEEL,
  RegimeGD,
} from '@/lib/types/bacen-realtime'

import { personaFinancialAnalyzer } from './persona-financial-analyzer'
import { bcbRealtimeService } from './bacen-realtime-service'

// ============================================================================
// APIS DE RADIAÇÃO SOLAR
// ============================================================================

const PVGIS_API = 'https://re.jrc.ec.europa.eu/api/v5_2'
const NASA_POWER_API = 'https://power.larc.nasa.gov/api/temporal/monthly'

interface PVGISResponse {
  readonly outputs: {
    readonly monthly: {
      readonly fixed: readonly {
        readonly month: number
        readonly 'E_d': number // kWh/kWp/day
        readonly 'E_m': number // kWh/kWp/month
        readonly H_sun: number // horas de sol
      }[]
    }
  }
  readonly inputs: {
    readonly location: {
      readonly latitude: number
      readonly longitude: number
      readonly elevation: number
    }
  }
}

interface NASAPowerResponse {
  readonly properties: {
    readonly parameter: {
      readonly ALLSKY_SFC_SW_DWN: Record<string, number> // Radiação média mensal
    }
  }
}

// ============================================================================
// DISTRIBUIDORAS BRASILEIRAS (67 ANEEL)
// ============================================================================

const DISTRIBUIDORAS_PRINCIPAIS = {
  // Sudeste
  CPFL_PAULISTA: { regiao: 'SP', tarifa_media: 0.82 },
  ENEL_SP: { regiao: 'SP', tarifa_media: 0.79 },
  LIGHT: { regiao: 'RJ', tarifa_media: 0.91 },
  CEMIG: { regiao: 'MG', tarifa_media: 0.84 },

  // Sul
  COPEL: { regiao: 'PR', tarifa_media: 0.76 },
  RGE: { regiao: 'RS', tarifa_media: 0.78 },
  CELESC: { regiao: 'SC', tarifa_media: 0.75 },

  // Nordeste
  COELBA: { regiao: 'BA', tarifa_media: 0.88 },
  CELPE: { regiao: 'PE', tarifa_media: 0.86 },
  ENEL_CE: { regiao: 'CE', tarifa_media: 0.85 },

  // Norte
  EQUATORIAL_PA: { regiao: 'PA', tarifa_media: 0.89 },
  ENERGISA_RO: { regiao: 'RO', tarifa_media: 0.87 },

  // Centro-Oeste
  CEB: { regiao: 'DF', tarifa_media: 0.81 },
  ENERGISA_MT: { regiao: 'MT', tarifa_media: 0.83 },
} as const

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

export class SolarRadiationFinanceService {
  /**
   * Busca dados de radiação solar via PVGIS
   */
  async fetchPVGISData(latitude: number, longitude: number): Promise<PVGISResponse> {
    const url = new URL(`${PVGIS_API}/PVcalc`)
    url.searchParams.set('lat', latitude.toString())
    url.searchParams.set('lon', longitude.toString())
    url.searchParams.set('peakpower', '1') // 1 kWp para normalização
    url.searchParams.set('loss', '20') // 20% perdas (PR = 0.8)
    url.searchParams.set('angle', 'optimal') // Ângulo otimizado
    url.searchParams.set('aspect', '0') // Norte (hemisfério sul)
    url.searchParams.set('outputformat', 'json')

    try {
      const response = await fetch(url.toString(), {
        cache: 'default', // Cache browser padrão
      })

      if (!response.ok) {
        throw new Error(`PVGIS API error: ${response.status}`)
      }

      return (await response.json()) as PVGISResponse
    } catch (error) {
      console.error('Error fetching PVGIS data:', error)
      throw error
    }
  }

  /**
   * Busca dados de radiação via NASA POWER (fallback)
   */
  async fetchNASAPowerData(latitude: number, longitude: number): Promise<NASAPowerResponse> {
    const url = new URL(`${NASA_POWER_API}/point`)
    url.searchParams.set('parameters', 'ALLSKY_SFC_SW_DWN')
    url.searchParams.set('community', 'RE')
    url.searchParams.set('latitude', latitude.toString())
    url.searchParams.set('longitude', longitude.toString())
    url.searchParams.set('start', '2020')
    url.searchParams.set('end', '2023')
    url.searchParams.set('format', 'JSON')

    try {
      const response = await fetch(url.toString(), {
        cache: 'default',
      })

      if (!response.ok) {
        throw new Error(`NASA POWER API error: ${response.status}`)
      }

      return (await response.json()) as NASAPowerResponse
    } catch (error) {
      console.error('Error fetching NASA POWER data:', error)
      throw error
    }
  }

  /**
   * Calcula HSP (Horas de Sol Pleno) médio diário
   */
  calculateAverageHSP(pvgisData: PVGISResponse): number {
    const monthly = pvgisData.outputs.monthly.fixed
    const avgHSP = monthly.reduce((sum, month) => sum + month['E_d'], 0) / monthly.length
    return avgHSP
  }

  /**
   * Análise financeira regional completa
   */
  async analyzeRegionalFinancials(
    localidade: string,
    latitude: number,
    longitude: number,
    distribuidora: keyof typeof DISTRIBUIDORAS_PRINCIPAIS,
    personaId: PersonaID,
    classe: ClasseANEEL,
    consumoMensalKWh: number
  ): Promise<RegionalFinancialAnalysis> {
    // Buscar dados de radiação
    const pvgisData = await this.fetchPVGISData(latitude, longitude)
    const hspDiario = this.calculateAverageHSP(pvgisData)

    // Dados da distribuidora
    const distData = DISTRIBUIDORAS_PRINCIPAIS[distribuidora]
    const tarifaTotal = distData.tarifa_media

    // Calcular KPIs para cada cenário de oversizing
    const cenarios = await personaFinancialAnalyzer.calculateMultiScenario({
      personaId,
      classe,
      regimeGD: RegimeGD.GD_II,
      potenciaKWp: (consumoMensalKWh * 12) / (hspDiario * 365 * 0.8), // PR = 0.8
      investimentoTotal: (consumoMensalKWh * 12 * 4.5) / (hspDiario * 365 * 0.8),
      consumoMensalKWh,
      tarifaKWh: tarifaTotal,
      hspDiario,
    })

    // Mapear cenários para o formato de saída
    const cenariosOutput = cenarios.map((kpi, index) => ({
      oversizing: kpi.oversizing,
      potenciaKWp: kpi.investimentoTotal / (4.5 * 1000), // Reverse calc
      geracaoAnualKWh:
        (kpi.investimentoTotal / (4.5 * 1000)) * hspDiario * 365 * 0.8 * (1 / kpi.oversizing),
      investimento: kpi.investimentoTotal,
      kpis: kpi.roi,
    }))

    // Encontrar oversizing ótimo (melhor VPL)
    const melhorCenario = cenariosOutput.reduce((best, current) =>
      current.kpis.vpl > best.kpis.vpl ? current : best
    )

    const recomendacao = {
      oversizingOtimo: melhorCenario.oversizing,
      motivacao: this.generateRecommendationReason(melhorCenario, classe),
      alertas: this.generateRegionalAlerts(distData.regiao, hspDiario),
    }

    return {
      localidade,
      latitude,
      longitude,
      distribuidora,
      radiacaoMedia: {
        hspDiario,
        fonte: 'PVGIS',
        resolucao: '3km',
      },
      tarifas: {
        energiaTE: tarifaTotal * 0.65, // ~65% é energia
        tusdFioB: tarifaTotal * 0.35, // ~35% é TUSD
        tarifaTotal,
        classe,
      },
      cenarios: cenariosOutput,
      recomendacao,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Gera motivação para recomendação
   */
  private generateRecommendationReason(
    cenario: {
      oversizing: number
      kpis: { vpl: number; paybackSimples: number; tir: number }
    },
    classe: ClasseANEEL
  ): string {
    const { oversizing, kpis } = cenario

    if (oversizing === 1.14) {
      return `Dimensionamento conservador (114%) recomendado para ${classe}. VPL de R$ ${kpis.vpl.toFixed(0)} com payback de ${kpis.paybackSimples.toFixed(1)} anos.`
    }

    if (oversizing === 1.3) {
      return `Dimensionamento balanceado (130%) oferece melhor custo-benefício. VPL de R$ ${kpis.vpl.toFixed(0)} com TIR de ${kpis.tir.toFixed(1)}%.`
    }

    return `Dimensionamento agressivo (145%) maximiza economia de longo prazo. VPL de R$ ${kpis.vpl.toFixed(0)}, ideal para ${classe} com espaço disponível.`
  }

  /**
   * Gera alertas regionais
   */
  private generateRegionalAlerts(regiao: string, hspDiario: number): readonly string[] {
    const alertas: string[] = []

    if (hspDiario < 4.0) {
      alertas.push(
        `⚠️ Irradiação abaixo da média nacional (${hspDiario.toFixed(1)} HSP/dia). Considere painéis de alta eficiência.`
      )
    }

    if (regiao === 'RJ' || regiao === 'SP') {
      alertas.push(
        '📋 Região com alta demanda - verifique prazo de conexão com distribuidora (até 90 dias).'
      )
    }

    if (regiao === 'NE') {
      alertas.push(
        '☀️ Excelente irradiação regional! Considere oversizing agressivo (145%) para maximizar ROI.'
      )
    }

    return alertas
  }

  /**
   * Compara múltiplas localidades
   */
  async compareLocations(
    locations: readonly {
      nome: string
      latitude: number
      longitude: number
      distribuidora: keyof typeof DISTRIBUIDORAS_PRINCIPAIS
    }[],
    personaId: PersonaID,
    classe: ClasseANEEL,
    consumoMensalKWh: number
  ): Promise<readonly RegionalFinancialAnalysis[]> {
    return Promise.all(
      locations.map(loc =>
        this.analyzeRegionalFinancials(
          loc.nome,
          loc.latitude,
          loc.longitude,
          loc.distribuidora,
          personaId,
          classe,
          consumoMensalKWh
        )
      )
    )
  }
}

// Singleton instance
export const solarRadiationFinanceService = new SolarRadiationFinanceService()

// ============================================================================
// HELPERS PRÉ-CONFIGURADOS PARA CIDADES PRINCIPAIS
// ============================================================================

const CIDADES_PRINCIPAIS = {
  SAO_PAULO: {
    nome: 'São Paulo - SP',
    latitude: -23.55,
    longitude: -46.63,
    distribuidora: 'ENEL_SP' as const,
  },
  RIO_DE_JANEIRO: {
    nome: 'Rio de Janeiro - RJ',
    latitude: -22.91,
    longitude: -43.17,
    distribuidora: 'LIGHT' as const,
  },
  BRASILIA: {
    nome: 'Brasília - DF',
    latitude: -15.78,
    longitude: -47.93,
    distribuidora: 'CEB' as const,
  },
  FORTALEZA: {
    nome: 'Fortaleza - CE',
    latitude: -3.72,
    longitude: -38.52,
    distribuidora: 'ENEL_CE' as const,
  },
  CURITIBA: {
    nome: 'Curitiba - PR',
    latitude: -25.42,
    longitude: -49.27,
    distribuidora: 'COPEL' as const,
  },
} as const

/**
 * Análise rápida para São Paulo
 */
export async function analyzeSaoPaulo(
  personaId: PersonaID,
  consumoKWh: number
): Promise<RegionalFinancialAnalysis> {
  const sp = CIDADES_PRINCIPAIS.SAO_PAULO
  return solarRadiationFinanceService.analyzeRegionalFinancials(
    sp.nome,
    sp.latitude,
    sp.longitude,
    sp.distribuidora,
    personaId,
    'B1' as ClasseANEEL,
    consumoKWh
  )
}

/**
 * Comparação das 5 principais capitais
 */
export async function compareCapitais(
  personaId: PersonaID,
  consumoKWh: number
): Promise<readonly RegionalFinancialAnalysis[]> {
  return solarRadiationFinanceService.compareLocations(
    Object.values(CIDADES_PRINCIPAIS),
    personaId,
    'B1' as ClasseANEEL,
    consumoKWh
  )
}
