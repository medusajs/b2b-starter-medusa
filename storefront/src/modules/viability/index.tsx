/**
 * Viability Module - viability.pv
 * Eng. Fotovoltaica Remota com Visão Computacional
 * 
 * Missão: Dimensionar sistema fotovoltaico remoto
 * Entradas: consumo (kWh/m), fatura média, CEP, telhado, orientação
 * Saídas: kWp proposto, geração anual (MWh), PR, perdas (%), layout
 */

export { default as ViabilityCalculator } from './components/ViabilityCalculator'
export { default as RoofAnalysis } from './components/RoofAnalysis'
export { default as EnergyEstimator } from './components/EnergyEstimator'
export { default as SystemSizing } from './components/SystemSizing'
export { default as ViabilityReport } from './components/ViabilityReport'
export { ViabilityProvider, useViability } from './context/ViabilityContext'
export * from './types'
