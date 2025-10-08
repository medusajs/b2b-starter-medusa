/**
 * 🛠️ Solar Module - Utilities
 */

import type { SolarCalculationOutput } from '@/types/solar-calculator';

/**
 * Formata valores monetários
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata anos em formato legível
 */
export function formatYears(years: number): string {
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  if (m === 0) return `${y} anos`;
  if (y === 0) return `${m} meses`;
  return `${y} anos e ${m} meses`;
}

/**
 * Formata kWp
 */
export function formatKwp(kwp: number): string {
  return `${kwp.toFixed(2)} kWp`;
}

/**
 * Formata kWh
 */
export function formatKwh(kwh: number): string {
  return `${Math.round(kwh).toLocaleString('pt-BR')} kWh`;
}

/**
 * Calcula economia percentual em relação ao investimento
 */
export function calculateROIPercentage(calculation: SolarCalculationOutput): number {
  const { capex, economia } = calculation.financeiro;
  return (economia.total_25anos_brl / capex.total_brl) * 100;
}

/**
 * Verifica se investimento é viável (TIR > SELIC)
 */
export function isInvestmentViable(calculation: SolarCalculationOutput): boolean {
  const SELIC_REFERENCE = 11.75; // %
  return calculation.financeiro.retorno.tir_percentual > SELIC_REFERENCE;
}

/**
 * Gera resumo textual do cálculo
 */
export function getCalculationSummary(calculation: SolarCalculationOutput): string {
  const { dimensionamento, financeiro, dados_localizacao } = calculation;
  
  return `Sistema solar de ${formatKwp(dimensionamento.kwp_proposto)} para ${dados_localizacao.estado}. ` +
    `Investimento: ${formatCurrency(financeiro.capex.total_brl)}. ` +
    `Economia mensal: ${formatCurrency(financeiro.economia.mensal_brl)}. ` +
    `Payback: ${formatYears(financeiro.retorno.payback_simples_anos)}.`;
}

/**
 * Gera hash único para um cálculo (para cache)
 */
export function getCalculationHash(input: any): string {
  const hashInput = {
    consumo: input.consumo_kwh_mes || input.consumo_mensal_kwh,
    uf: input.uf,
    oversizing: input.oversizing_target || 130,
    tipo: input.tipo_sistema || 'on-grid',
  };
  return btoa(JSON.stringify(hashInput));
}

/**
 * Verifica se cálculo está dentro dos limites MMGD
 */
export function isMMGDCompliant(calculation: SolarCalculationOutput): boolean {
  return calculation.conformidade.conforme;
}

/**
 * Extrai tags/keywords do cálculo para busca
 */
export function getCalculationTags(calculation: SolarCalculationOutput): string[] {
  const tags: string[] = [
    'solar',
    'fotovoltaico',
    calculation.dados_localizacao.estado.toLowerCase(),
    `${Math.round(calculation.dimensionamento.kwp_proposto)}kwp`,
  ];

  if (calculation.financeiro.retorno.payback_simples_anos < 5) {
    tags.push('payback-rapido');
  }

  if (isInvestmentViable(calculation)) {
    tags.push('investimento-viavel');
  }

  return tags;
}

/**
 * Compara dois cálculos e retorna diferenças percentuais
 */
export interface CalculationComparison {
  kwp_diff_percent: number;
  investimento_diff_percent: number;
  economia_diff_percent: number;
  payback_diff_years: number;
}

export function compareCalculations(
  calc1: SolarCalculationOutput,
  calc2: SolarCalculationOutput
): CalculationComparison {
  return {
    kwp_diff_percent:
      ((calc2.dimensionamento.kwp_proposto - calc1.dimensionamento.kwp_proposto) /
        calc1.dimensionamento.kwp_proposto) *
      100,
    investimento_diff_percent:
      ((calc2.financeiro.capex.total_brl - calc1.financeiro.capex.total_brl) /
        calc1.financeiro.capex.total_brl) *
      100,
    economia_diff_percent:
      ((calc2.financeiro.economia.anual_brl - calc1.financeiro.economia.anual_brl) /
        calc1.financeiro.economia.anual_brl) *
      100,
    payback_diff_years:
      calc2.financeiro.retorno.payback_simples_anos -
      calc1.financeiro.retorno.payback_simples_anos,
  };
}

/**
 * Valida se dados de input são suficientes
 */
export function hasMinimumInputData(input: any): boolean {
  return !!(
    (input.consumo_kwh_mes || input.consumo_mensal_kwh) &&
    input.uf &&
    input.uf.length === 2
  );
}

/**
 * Extrai estado de uma URL
 */
export function extractStateFromUrl(url: string): string | null {
  const match = url.match(/[?&]uf=([A-Z]{2})/i);
  return match ? match[1].toUpperCase() : null;
}
