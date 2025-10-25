/**
 * Tariffs Module - tariffs.aneel
 * Classificação Tarifária ANEEL + MMGD
 * 
 * Missão: Classificar consumidor (Grupo A/B, subgrupos), identificar modalidade MMGD
 * Entradas: demanda contratada, tensão, tipo de conexão
 * Saídas: IdcClasse, IdcSubgrupo, IdcModalidade, MdaPotenciaInstalada
 */

// Components
export { default as TariffClassifier } from './components/TariffClassifier'
export { default as TariffDisplay } from './components/TariffDisplay'
export { default as MMGDValidator } from './components/MMGDValidator'
export { default as DistributorSelector } from './components/DistributorSelector'

// Context
export { TariffProvider, useTariff } from './context/TariffContext'

// Types
export * from './types'

// Integrations
export * from './integrations'
