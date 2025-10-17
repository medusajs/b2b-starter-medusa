/**
 * 📊 Calculadora de KPIs Financeiros por Persona
 * Motor de cálculo completo: ROI, Payback, LCOE, TIR, VPL
 * Segmentação por classe ANEEL e regime GD
 */

'use server'
import 'server-only'

import {
  type PersonaID,
  ClasseANEEL,
  type RegimeGD,
  type PersonaFinancialKPIs,
  type BCBRealtimeRate,
  OVERSIZING_SCENARIOS,
  ESCALONAMENTO_TUSD_FIO_B,
  VIDA_UTIL_PROJETO,
  TAXA_DEGRADACAO_PADRAO,
  TMA_PADRAO,
} from '@/lib/types/bacen-realtime'

import { bcbRealtimeService } from './bacen-realtime-service'

// ============================================================================
// PARÂMETROS DE ENTRADA
// ============================================================================

export interface PersonaFinancialInput {
  readonly personaId: PersonaID
  readonly classe: ClasseANEEL
  readonly regimeGD: RegimeGD

  // Sistema fotovoltaico
  readonly potenciaKWp: number
  readonly investimentoTotal: number // R$
  readonly oversizing: number // 1.14, 1.30, 1.45

  // Perfil energético
  readonly consumoMensalKWh: number
  readonly tarifaKWh: number // R$/kWh (tarifa total)
  readonly hspDiario: number // horas de sol pleno/dia

  // Financiamento (opcional)
  readonly financiamento?: {
    readonly modalidade: string
    readonly taxaMensal: number
    readonly prazoMeses: number
    readonly percentualFinanciado: number // 0-100
  }

  // Parâmetros avançados (opcionais)
  readonly tma?: number // Taxa Mínima de Atratividade (padrão: 10% a.a.)
  readonly taxaDegradacao?: number // % a.a. (padrão: 0.5%)
  readonly om?: number // % a.a. investimento (Operação & Manutenção)
  readonly reajusteTarifario?: number // % a.a. (padrão: IPCA)
}

// ============================================================================
// CALCULADORA PRINCIPAL
// ============================================================================

export class PersonaFinancialAnalyzer {
  /**
   * Calcula KPIs financeiros completos para uma persona
   */
  async calculateKPIs(input: PersonaFinancialInput): Promise<PersonaFinancialKPIs> {
    // Calcular geração anual estimada
    const geracaoAnualKWh = this.calculateAnnualGeneration(
      input.potenciaKWp,
      input.hspDiario,
      input.oversizing
    )

    // Calcular economia anual por ano (com degradação e reajuste tarifário)
    const economiasPorAno = this.calculateYearlyEconomies(
      geracaoAnualKWh,
      input.tarifaKWh,
      input.classe,
      input.regimeGD,
      input.taxaDegradacao ?? TAXA_DEGRADACAO_PADRAO,
      input.reajusteTarifario ?? 0.04 // IPCA estimado 4% a.a.
    )

    // Calcular custos de O&M
    const omPorAno = this.calculateOMCosts(
      input.investimentoTotal,
      input.om ?? 0.01 // 1% a.a.
    )

    // Calcular ROI, Payback, TIR, VPL, LCOE
    const roi = this.calculateROI(
      input.investimentoTotal,
      economiasPorAno,
      omPorAno,
      input.tma ?? TMA_PADRAO
    )

    // Calcular financiamento se aplicável
    let financiamento: PersonaFinancialKPIs['financiamento'] | undefined
    if (input.financiamento) {
      financiamento = await this.calculateFinancing(
        input.investimentoTotal,
        input.financiamento,
        economiasPorAno[0] / 12 // economia mensal média
      )
    }

    // Calcular economia agregada
    const economia = {
      mensal: economiasPorAno[0] / 12 - (financiamento?.parcelaMensal ?? 0) - omPorAno[0] / 12,
      anual: economiasPorAno[0] - (financiamento?.parcelaMensal ?? 0) * 12 - omPorAno[0],
      total25anos: economiasPorAno.reduce((sum, eco) => sum + eco, 0),
      economiaVsTarifa:
        ((economiasPorAno[0] / 12) / (input.consumoMensalKWh * input.tarifaKWh)) * 100,
    }

    // Calcular riscos regulatórios
    const riscos = this.calculateRegulatoryRisks(
      input.classe,
      input.regimeGD,
      input.investimentoTotal,
      economiasPorAno,
      input.tma ?? TMA_PADRAO
    )

    return {
      personaId: input.personaId,
      classe: input.classe,
      regimeGD: input.regimeGD,
      investimentoTotal: input.investimentoTotal,
      consumoMensalKWh: input.consumoMensalKWh,
      tarifaKWh: input.tarifaKWh,
      oversizing: input.oversizing,
      roi,
      financiamento,
      economia,
      riscos,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Calcula KPIs para múltiplos cenários de oversizing
   */
  async calculateMultiScenario(
    baseInput: Omit<PersonaFinancialInput, 'oversizing'>
  ): Promise<readonly PersonaFinancialKPIs[]> {
    const scenarios = await Promise.all(
      OVERSIZING_SCENARIOS.map(oversizing =>
        this.calculateKPIs({
          ...baseInput,
          oversizing,
        })
      )
    )

    return scenarios
  }

  // ==========================================================================
  // CÁLCULOS CORE
  // ==========================================================================

  /**
   * Calcula geração anual em kWh
   */
  private calculateAnnualGeneration(
    potenciaKWp: number,
    hspDiario: number,
    oversizing: number
  ): number {
    // Geração = Potência × HSP × 365 × PR (Performance Ratio)
    const PR = 0.8 // Performance Ratio típico (perdas de 20%)
    return potenciaKWp * hspDiario * 365 * PR * (1 / oversizing)
  }

  /**
   * Calcula economias ano a ano considerando degradação e reajuste tarifário
   */
  private calculateYearlyEconomies(
    geracaoInicialKWh: number,
    tarifaInicial: number,
    classe: ClasseANEEL,
    regime: RegimeGD,
    taxaDegradacao: number,
    reajusteTarifario: number
  ): readonly number[] {
    const economias: number[] = []

    for (let ano = 0; ano < VIDA_UTIL_PROJETO; ano++) {
      // Geração degradada
      const geracaoAno = geracaoInicialKWh * Math.pow(1 - taxaDegradacao, ano)

      // Tarifa reajustada
      let tarifaAno = tarifaInicial * Math.pow(1 + reajusteTarifario, ano)

      // Aplicar escalonamento TUSD Fio B (GD II)
      if (regime === 'GD II' && ano >= 0 && ano <= 5) {
        const escalonamento = this.getEscalonamentoTUSDAno(ano)
        // TUSD Fio B representa ~30% da tarifa total
        const tusdFioB = tarifaInicial * 0.3
        tarifaAno = tarifaInicial * 0.7 + tusdFioB * escalonamento
      }

      economias.push(geracaoAno * tarifaAno)
    }

    return economias
  }

  /**
   * Retorna percentual de escalonamento TUSD Fio B por ano
   */
  private getEscalonamentoTUSDAno(ano: number): number {
    const year = 2023 + ano
    return (ESCALONAMENTO_TUSD_FIO_B as Record<number, number>)[year] ?? 1.0
  }

  /**
   * Calcula custos de O&M ano a ano
   */
  private calculateOMCosts(investimento: number, percentualOM: number): readonly number[] {
    return Array(VIDA_UTIL_PROJETO).fill(investimento * percentualOM)
  }

  /**
   * Calcula ROI completo: Payback, TIR, VPL, LCOE
   */
  private calculateROI(
    investimento: number,
    economiasPorAno: readonly number[],
    omPorAno: readonly number[],
    tma: number
  ) {
    // Fluxo de caixa líquido por ano
    const fluxoCaixa = economiasPorAno.map((eco, i) => eco - omPorAno[i])

    // Payback Simples
    let acumulado = -investimento
    let paybackSimples = 0
    for (let i = 0; i < fluxoCaixa.length; i++) {
      acumulado += fluxoCaixa[i]
      if (acumulado >= 0) {
        paybackSimples = i + 1
        break
      }
    }

    // Payback Descontado (com TMA)
    let acumuladoDescontado = -investimento
    let paybackDescontado = 0
    for (let i = 0; i < fluxoCaixa.length; i++) {
      const fluxoDescontado = fluxoCaixa[i] / Math.pow(1 + tma, i + 1)
      acumuladoDescontado += fluxoDescontado
      if (acumuladoDescontado >= 0) {
        paybackDescontado = i + 1
        break
      }
    }

    // VPL (Valor Presente Líquido)
    const vpl =
      -investimento +
      fluxoCaixa.reduce((sum, fc, i) => sum + fc / Math.pow(1 + tma, i + 1), 0)

    // TIR (Taxa Interna de Retorno) via Newton-Raphson
    const tir = this.calculateTIR(investimento, fluxoCaixa)

    // LCOE (Levelized Cost of Energy)
    const geracaoTotal = economiasPorAno.reduce((sum, _, i) => {
      const geracaoAno = economiasPorAno[0] * Math.pow(1 - TAXA_DEGRADACAO_PADRAO, i)
      return sum + geracaoAno / Math.pow(1 + tma, i + 1)
    }, 0)

    const custoTotalAtualizado =
      investimento + omPorAno.reduce((sum, om, i) => sum + om / Math.pow(1 + tma, i + 1), 0)

    const lcoe = custoTotalAtualizado / geracaoTotal

    return {
      paybackSimples,
      paybackDescontado,
      tir: tir * 100, // converter para %
      vpl,
      lcoe,
    }
  }

  /**
   * Calcula TIR usando método de Newton-Raphson
   */
  private calculateTIR(investimento: number, fluxoCaixa: readonly number[]): number {
    let tir = 0.1 // chute inicial 10%
    const maxIterations = 100
    const tolerance = 0.0001

    for (let iter = 0; iter < maxIterations; iter++) {
      let vpn = -investimento
      let dvpn = 0

      for (let i = 0; i < fluxoCaixa.length; i++) {
        const fator = Math.pow(1 + tir, i + 1)
        vpn += fluxoCaixa[i] / fator
        dvpn -= (i + 1) * fluxoCaixa[i] / Math.pow(1 + tir, i + 2)
      }

      const novaTir = tir - vpn / dvpn

      if (Math.abs(novaTir - tir) < tolerance) {
        return novaTir
      }

      tir = novaTir
    }

    return tir
  }

  /**
   * Calcula detalhes de financiamento
   */
  private async calculateFinancing(
    investimentoTotal: number,
    config: PersonaFinancialInput['financiamento'],
    economiaMensal: number
  ): Promise<PersonaFinancialKPIs['financiamento']> {
    if (!config) {
      throw new Error('Financing config is required')
    }

    const valorFinanciado = investimentoTotal * (config.percentualFinanciado / 100)
    const taxaMensal = config.taxaMensal / 100

    // Calcular parcela usando Price (SAC também disponível)
    const parcelaMensal = this.calculateParcela(valorFinanciado, taxaMensal, config.prazoMeses)

    const totalPago = parcelaMensal * config.prazoMeses
    const jurosTotais = totalPago - valorFinanciado

    return {
      modalidade: config.modalidade,
      taxaMensal: config.taxaMensal,
      prazoMeses: config.prazoMeses,
      parcelaMensal,
      jurosTotais,
      economiaLiquida: economiaMensal - parcelaMensal,
    }
  }

  /**
   * Calcula parcela mensal (Tabela Price)
   */
  private calculateParcela(valor: number, taxaMensal: number, meses: number): number {
    if (taxaMensal === 0) return valor / meses

    const fator = Math.pow(1 + taxaMensal, meses)
    return (valor * taxaMensal * fator) / (fator - 1)
  }

  /**
   * Calcula riscos regulatórios
   */
  private calculateRegulatoryRisks(
    classe: ClasseANEEL,
    regime: RegimeGD,
    investimento: number,
    economias: readonly number[],
    tma: number
  ) {
    // Escalonamento TUSD (apenas GD II)
    const escalonamentoTUSD =
      regime === 'GD II'
        ? [
            ESCALONAMENTO_TUSD_FIO_B[2023],
            ESCALONAMENTO_TUSD_FIO_B[2024],
            ESCALONAMENTO_TUSD_FIO_B[2025],
            ESCALONAMENTO_TUSD_FIO_B[2026],
            ESCALONAMENTO_TUSD_FIO_B[2027],
            ESCALONAMENTO_TUSD_FIO_B[2028],
          ]
        : []

    // Impacto acumulado do escalonamento
    const impactoEscalonamento =
      regime === 'GD II'
        ? economias.slice(0, 6).reduce((sum, eco, i) => {
            const perdaPercentual = 1 - escalonamentoTUSD[i]
            return sum + eco * perdaPercentual
          }, 0)
        : 0

    // Sensibilidade à variação tarifária
    const cenarioOtimista = this.calculateVPL(
      investimento,
      economias.map(e => e * 1.05),
      tma
    )

    const cenarioPessimista = this.calculateVPL(
      investimento,
      economias.map(e => e * 0.95),
      tma
    )

    return {
      escalonamentoTUSD,
      impactoEscalonamento,
      sensibilidadeTarifa: {
        cenarioOtimista,
        cenarioPessimista,
      },
    }
  }

  /**
   * Calcula VPL simples
   */
  private calculateVPL(
    investimento: number,
    fluxoCaixa: readonly number[],
    tma: number
  ): number {
    return (
      -investimento + fluxoCaixa.reduce((sum, fc, i) => sum + fc / Math.pow(1 + tma, i + 1), 0)
    )
  }
}

// Singleton instance
export const personaFinancialAnalyzer = new PersonaFinancialAnalyzer()

// ============================================================================
// HELPERS PARA PERSONAS ESPECÍFICAS
// ============================================================================

/**
 * Calcula KPIs para persona Residencial B1 Padrão
 */
export async function calculateResidencialB1KPIs(
  consumoKWh: number,
  tarifaKWh: number,
  hspDiario: number,
  modalidadeFinanciamento?: string
): Promise<readonly PersonaFinancialKPIs[]> {
  const potenciaKWp = (consumoKWh * 12) / (hspDiario * 365 * 0.8) // PR = 0.8
  const investimentoPorWp = 4.5 // R$/Wp médio
  const investimentoTotal = potenciaKWp * 1000 * investimentoPorWp

  let financiamento: PersonaFinancialInput['financiamento'] | undefined

  if (modalidadeFinanciamento) {
    const snapshot = await bcbRealtimeService.getMarketSnapshot()
    const taxa = snapshot.taxasPF.find(t => t.modalidade === modalidadeFinanciamento)

    if (taxa) {
      financiamento = {
        modalidade: modalidadeFinanciamento,
        taxaMensal: taxa.taxaMensal,
        prazoMeses: 120, // 10 anos típico
        percentualFinanciado: 80, // 80% financiado
      }
    }
  }

  return personaFinancialAnalyzer.calculateMultiScenario({
    personaId: 'residencial_b1_padrao' as PersonaID,
    classe: ClasseANEEL.B1,
    regimeGD: 'GD II' as RegimeGD,
    potenciaKWp,
    investimentoTotal,
    consumoMensalKWh: consumoKWh,
    tarifaKWh,
    hspDiario,
    financiamento,
  })
}

/**
 * Calcula KPIs para persona Comercial B3 PME
 */
export async function calculateComercialB3KPIs(
  consumoKWh: number,
  tarifaKWh: number,
  hspDiario: number
): Promise<readonly PersonaFinancialKPIs[]> {
  const potenciaKWp = (consumoKWh * 12) / (hspDiario * 365 * 0.8)
  const investimentoPorWp = 4.2 // R$/Wp (economia de escala)
  const investimentoTotal = potenciaKWp * 1000 * investimentoPorWp

  return personaFinancialAnalyzer.calculateMultiScenario({
    personaId: 'comercial_b3_pme' as PersonaID,
    classe: ClasseANEEL.B3,
    regimeGD: 'GD II' as RegimeGD,
    potenciaKWp,
    investimentoTotal,
    consumoMensalKWh: consumoKWh,
    tarifaKWh,
    hspDiario,
  })
}

/**
 * Calcula KPIs para persona Industrial A4/A3
 */
export async function calculateIndustrialA4KPIs(
  demandaKW: number,
  consumoKWh: number,
  tarifaKWh: number,
  hspDiario: number
): Promise<readonly PersonaFinancialKPIs[]> {
  const potenciaKWp = Math.min(demandaKW * 1.3, (consumoKWh * 12) / (hspDiario * 365 * 0.8))
  const investimentoPorWp = 3.8 // R$/Wp (grande escala)
  const investimentoTotal = potenciaKWp * 1000 * investimentoPorWp

  return personaFinancialAnalyzer.calculateMultiScenario({
    personaId: 'industrial_a4_a3_media_tensao' as PersonaID,
    classe: ClasseANEEL.A4,
    regimeGD: 'GD II' as RegimeGD,
    potenciaKWp,
    investimentoTotal,
    consumoMensalKWh: consumoKWh,
    tarifaKWh,
    hspDiario,
    om: 0.015, // 1.5% a.a. para indústria
  })
}
