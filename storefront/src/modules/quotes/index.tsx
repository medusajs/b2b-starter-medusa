/**
 * Quotes Module
 * 
 * Módulo de cotações para geração fotovoltaica
 * Gerenciamento de cotações, propostas comerciais e aprovações
 */

// Components
export { default as QuotesList } from './components/QuotesList'
export { default as QuoteForm } from './components/QuoteForm'
export { default as QuoteDetails } from './components/QuoteDetails'
export { default as QuoteApproval } from './components/QuoteApproval'
export { default as QuoteComparison } from './components/QuoteComparison'

// Context
export { QuotesProvider, useQuotes } from './context/QuotesContext'

// Hooks
export { default as useQuotesList } from './hooks/useQuotesList'
export { default as useQuoteOperations } from './hooks/useQuoteOperations'
export { default as useQuoteApprovals } from './hooks/useQuoteApprovals'

// Types
export * from './types'
