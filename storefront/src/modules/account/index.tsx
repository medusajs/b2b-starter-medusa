/**
 * Account Module - Main Entry Point
 * 
 * Exporta todos os componentes, hooks e tipos do módulo de conta
 */

// Components
export { default as AccountLayout } from './templates/account-layout'
export { default as Overview } from './components/overview'
export { default as ProfileEdit } from './components/profile/edit-profile-form'
export { default as AddressesTemplate } from './components/addresses'
export { default as AddressCard } from './components/addresses/address-card'
export { default as EditAddressModal } from './components/addresses/edit-address-modal'
export { default as OrdersTemplate } from './components/orders'
export { default as OrderCard } from './components/orders/order-card'
export { default as OrderDetails } from './components/orders/order-details'
export { default as CompaniesTemplate } from './components/companies'
export { default as CompanyCard } from './components/companies/company-card'
export { default as CompanyForm } from './components/companies/company-form'
export { default as ApprovalsTemplate } from './components/approvals'
export { default as ApprovalCard } from './components/approvals/approval-card'
export { default as ReturnsTemplate } from './components/returns'
export { default as ReturnCard } from './components/returns/return-card'
export { default as ReturnForm } from './components/returns/return-form'
export { default as FinancingTemplate } from './components/financing'
export { default as FinancingCard } from './components/financing/financing-card'
export { default as NotificationsTemplate } from './components/notifications'
export { default as NotificationCard } from './components/notifications/notification-card'
export { default as SecurityTemplate } from './components/security'
export { default as TwoFactorAuth } from './components/security/two-factor-auth'
export { default as ActiveSessions } from './components/security/active-sessions'
export { default as PreferencesTemplate } from './components/preferences'
export { default as NotificationPreferences } from './components/preferences/notification-preferences'
export { default as PrivacySettings } from './components/preferences/privacy-settings'

// Solar Integration Components
export { default as SolarIntegration } from './components/solar-integration'
export { default as SolarProjects } from './components/solar-projects'
export { default as SolarProjectCard } from './components/solar-projects/project-card'
export { default as EnergyBills } from './components/energy-bills'
export { default as EnergyBillCard } from './components/energy-bills/bill-card'
export { default as SolarCalculations } from './components/solar-calculations'
export { default as CalculationCard } from './components/solar-calculations/calculation-card'

// Context & Hooks
export { AccountProvider, useAccount } from './context/AccountContext'
export { useCalculations } from './hooks/useCalculations'
export { useAddresses } from './hooks/useAddresses'
export { useOrders } from './hooks/useOrders'
export { useCompanies } from './hooks/useCompanies'
export { useApprovals } from './hooks/useApprovals'
export { useReturns } from './hooks/useReturns'
export { useFinancing } from './hooks/useFinancing'
export { useNotifications } from './hooks/useNotifications'
export { useSolarProjects } from './hooks/useSolarProjects'
export { useEnergyBills } from './hooks/useEnergyBills'

// Types
export type {
    User,
    Customer,
    Address,
    Order,
    Company,
    Approval,
    Return,
    Financing,
    Notification,
    SolarProject,
    EnergyBill,
    SolarCalculation,
    AccountSettings,
    SecuritySettings,
    NotificationPreferences as NotificationPrefs,
    PrivacySettings as Privacy
} from './types'

// Re-export layout as default
export { default } from './templates/account-layout'
