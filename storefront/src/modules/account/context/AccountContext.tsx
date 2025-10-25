'use client'

/**
 * Account Context
 * 
 * Context API para gerenciamento de estado global da conta do usuário
 * Integra com Medusa.js para dados do cliente e pedidos
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type {
    Customer,
    User,
    Address,
    Order,
    Company,
    Notification,
    AccountSettings
} from '../types'

interface AccountContextState {
    // User & Customer
    customer: Customer | null
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean

    // Collections
    addresses: Address[]
    orders: Order[]
    companies: Company[]
    notifications: Notification[]

    // Settings
    settings: AccountSettings | null

    // Stats
    stats: {
        totalOrders: number
        totalSpent: number
        activeProjects: number
        pendingApprovals: number
        unreadNotifications: number
    }

    // Actions
    refreshCustomer: () => Promise<void>
    refreshOrders: () => Promise<void>
    refreshAddresses: () => Promise<void>
    refreshCompanies: () => Promise<void>
    refreshNotifications: () => Promise<void>
    updateSettings: (settings: Partial<AccountSettings>) => Promise<void>
    logout: () => Promise<void>
}

const AccountContext = createContext<AccountContextState | undefined>(undefined)

interface AccountProviderProps {
    children: ReactNode
    initialCustomer?: Customer | null
}

export function AccountProvider({ children, initialCustomer }: AccountProviderProps) {
    const [customer, setCustomer] = useState<Customer | null>(initialCustomer || null)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [companies, setCompanies] = useState<Company[]>([])
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [settings, setSettings] = useState<AccountSettings | null>(null)

    // Derived state
    const isAuthenticated = !!customer

    // Stats calculation
    const stats = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + (order.total || 0), 0) / 100, // Convert from cents
        activeProjects: 0, // TODO: Implement when solar projects are available
        pendingApprovals: 0, // TODO: Implement when approvals are available
        unreadNotifications: notifications.filter(n => !n.is_read).length
    }

    // Refresh customer data
    const refreshCustomer = useCallback(async () => {
        if (!customer?.id) return

        try {
            const response = await fetch(`/api/customers/${customer.id}`, {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setCustomer(data.customer)

                // Update user info
                if (data.customer) {
                    setUser({
                        id: data.customer.id,
                        email: data.customer.email,
                        first_name: data.customer.first_name,
                        last_name: data.customer.last_name,
                        phone: data.customer.phone,
                        customer_id: data.customer.id,
                        created_at: data.customer.created_at,
                        updated_at: data.customer.updated_at
                    })
                }
            }
        } catch (error) {
            console.error('Error refreshing customer:', error)
        }
    }, [customer?.id])

    // Refresh orders
    const refreshOrders = useCallback(async () => {
        if (!customer?.id) return

        try {
            const response = await fetch(`/api/customers/${customer.id}/orders`, {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setOrders(data.orders || [])
            }
        } catch (error) {
            console.error('Error refreshing orders:', error)
        }
    }, [customer?.id])

    // Refresh addresses
    const refreshAddresses = useCallback(async () => {
        if (!customer?.id) return

        try {
            // Medusa stores addresses in customer.shipping_addresses
            if (customer.shipping_addresses) {
                setAddresses(customer.shipping_addresses as Address[])
            }
        } catch (error) {
            console.error('Error refreshing addresses:', error)
        }
    }, [customer])

    // Refresh companies (B2B extension)
    const refreshCompanies = useCallback(async () => {
        if (!customer?.id) return

        try {
            const response = await fetch(`/api/customers/${customer.id}/companies`, {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setCompanies(data.companies || [])
            }
        } catch (error) {
            console.error('Error refreshing companies:', error)
            // Set empty array if endpoint doesn't exist yet
            setCompanies([])
        }
    }, [customer?.id])

    // Refresh notifications
    const refreshNotifications = useCallback(async () => {
        if (!customer?.id) return

        try {
            const response = await fetch(`/api/customers/${customer.id}/notifications`, {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Error refreshing notifications:', error)
            setNotifications([])
        }
    }, [customer?.id])

    // Update settings
    const updateSettings = useCallback(async (newSettings: Partial<AccountSettings>) => {
        if (!customer?.id) return

        try {
            const response = await fetch(`/api/customers/${customer.id}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(newSettings)
            })

            if (response.ok) {
                const data = await response.json()
                setSettings(data.settings)
            }
        } catch (error) {
            console.error('Error updating settings:', error)
        }
    }, [customer?.id])

    // Logout
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })

            // Clear state
            setCustomer(null)
            setUser(null)
            setAddresses([])
            setOrders([])
            setCompanies([])
            setNotifications([])
            setSettings(null)

            // Redirect to home
            window.location.href = '/'
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }, [])

    // Initial load
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true)

            try {
                if (customer) {
                    // Load all data in parallel
                    await Promise.all([
                        refreshCustomer(),
                        refreshOrders(),
                        refreshAddresses(),
                        refreshCompanies(),
                        refreshNotifications()
                    ])
                }
            } catch (error) {
                console.error('Error loading initial data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadInitialData()
    }, []) // Run once on mount

    // Refresh customer when initialCustomer changes
    useEffect(() => {
        if (initialCustomer) {
            setCustomer(initialCustomer)
        }
    }, [initialCustomer])

    const value: AccountContextState = {
        customer,
        user,
        isLoading,
        isAuthenticated,
        addresses,
        orders,
        companies,
        notifications,
        settings,
        stats,
        refreshCustomer,
        refreshOrders,
        refreshAddresses,
        refreshCompanies,
        refreshNotifications,
        updateSettings,
        logout
    }

    return (
        <AccountContext.Provider value={value}>
            {children}
        </AccountContext.Provider>
    )
}

// Hook to use account context
export function useAccount() {
    const context = useContext(AccountContext)

    if (context === undefined) {
        throw new Error('useAccount must be used within an AccountProvider')
    }

    return context
}

// Export context for testing
export { AccountContext }
