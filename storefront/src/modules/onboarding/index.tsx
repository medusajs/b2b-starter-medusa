/**
 * Onboarding Module
 * 
 * Módulo de onboarding para novos clientes
 * Inclui fluxo guiado com Hélio (mascote) em vídeo animado
 */

// Main Flow
export { default as OnboardingFlow } from './components/OnboardingFlow'

// Steps
export { default as WelcomeStep } from './components/steps/WelcomeStep'
export { default as LocationStep } from './components/steps/LocationStep'
export { default as ConsumptionStep } from './components/steps/ConsumptionStep'
export { default as RoofStep } from './components/steps/RoofStep'
export { default as ResultsStep } from './components/steps/ResultsStep'

// Components
export { default as HelioVideo } from './components/HelioVideo'
export { default as ProgressIndicator } from './components/ProgressIndicator'

// Context
export { OnboardingProvider, useOnboarding } from './context/OnboardingContext'

// Types
export * from './types'
