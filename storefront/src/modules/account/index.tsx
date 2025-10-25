// @ts-nocheck - Many missing files, need cleanup
/**
 * Account Module - Main Entry Point
 * 
 * Exporta todos os componentes, hooks e tipos do módulo de conta
 */

// Components
export { default as AccountLayout } from './templates/account-layout'
export { default as Overview } from './components/overview'
// export { default as ProfileEdit } from './components/profile/edit-profile-form' // File does not exist
// export { default as AddressesTemplate } from './components/addresses' // File does not exist
// export { default as AddressCard } from './components/addresses/address-card' // File does not exist
// export { default as EditAddressModal } from './components/addresses/edit-address-modal' // File does not exist
// export { default as OrdersTemplate } from './components/orders' // File does not exist
// export { default as OrderCard } from './components/orders/order-card' // File does not exist
// export { default as OrderDetails } from './components/orders/order-details' // File does not exist
// export { default as CompaniesTemplate } from './components/companies' // File does not exist
// export { default as CompanyCard } from './components/companies/company-card' // File does not exist
// export { default as CompanyForm } from './components/companies/company-form' // File does not exist
// export { default as ApprovalsTemplate } from './components/approvals' // File does not exist
// export { default as ApprovalCard } from './components/approvals/approval-card' // File does not exist
// export { default as ReturnsTemplate } from './components/returns' // File does not exist
// export { default as ReturnCard } from './components/returns/return-card' // File does not exist
// export { default as ReturnForm } from './components/returns/return-form' // File does not exist
// export { default as FinancingTemplate } from './components/financing' // File does not exist
// export { default as FinancingCard } from './components/financing/financing-card' // File does not exist
// export { default as NotificationsTemplate } from './components/notifications' // File does not exist
// export { default as NotificationCard } from './components/notifications/notification-card' // File does not exist
// export { default as SecurityTemplate } from './components/security' // File does not exist
// export { default as TwoFactorAuth } from './components/security/two-factor-auth' // File does not exist
// export { default as ActiveSessions } from './components/security/active-sessions' // File does not exist
// export { default as PreferencesTemplate } from './components/preferences' // File does not exist
// export { default as NotificationPreferences } from './components/preferences/notification-preferences' // File does not exist
// export { default as PrivacySettings } from './components/preferences/privacy-settings' // File does not exist

// Solar Integration Components
// export { default as SolarIntegration } from './components/solar-integration' // File does not exist
// export { default as SolarProjects } from './components/solar-projects' // File does not exist
// export { default as SolarProjectCard } from './components/solar-projects/project-card' // File does not exist
// export { default as EnergyBills } from './components/energy-bills' // File does not exist
// export { default as EnergyBillCard } from './components/energy-bills/bill-card' // File does not exist
// export { default as SolarCalculations } from './components/solar-calculations' // File does not exist
// export { default as CalculationCard } from './components/solar-calculations/calculation-card' // File does not exist

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
