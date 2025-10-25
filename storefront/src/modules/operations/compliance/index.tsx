/**
 * Compliance Module
 * 
 * Módulo de conformidade PRODIST para validação de sistemas fotovoltaicos
 * conforme PRODIST Módulo 3 - Revisão 11/2023
 */

// Components
export { default as ComplianceWizard } from './components/ComplianceWizard'
export { default as ValidationResults } from './components/ValidationResults'
export { default as DossiePreview } from './components/DossiePreview'

// Validators
export { validarCompleto, ProdistValidator } from './validators/prodist-validator'

// Data
export { default as distribuidoras } from './data/distribuidoras.json'
export { default as limitesProdist } from './data/limites-prodist.json'

// Types
export * from './types'
