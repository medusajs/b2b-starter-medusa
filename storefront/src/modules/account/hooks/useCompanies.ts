/**
 * useCompanies Hook
 * 
 * Hook para gerenciamento de empresas B2B
 */

import { useState, useCallback } from 'react'
import { useAccount } from '../context/AccountContext'
import type { Company } from '../types'

interface CreateCompanyInput {
    name: string
    cnpj: string
    state_registration?: string
    municipal_registration?: string
    phone: string
    email: string
    website?: string
    address: {
        street: string
        number: string
        complement?: string
        neighborhood: string
        city: string
        state: string
        postal_code: string
        country: string
    }
    contact_person: {
        name: string
        email: string
        phone: string
        position?: string
    }
    payment_terms?: string
}

export function useCompanies() {
    const { companies, refreshCompanies, customer } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create company
    const createCompany = useCallback(async (
        input: CreateCompanyInput
    ): Promise<Company | null> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/customers/${customer.id}/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(input)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create company')
            }

            const data = await response.json()
            await refreshCompanies()

            return data.company
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshCompanies])

    // Update company
    const updateCompany = useCallback(async (
        companyId: string,
        updates: Partial<CreateCompanyInput>
    ): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/companies/${companyId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(updates)
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update company')
            }

            await refreshCompanies()
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshCompanies])

    // Delete company
    const deleteCompany = useCallback(async (companyId: string): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/companies/${companyId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete company')
            }

            await refreshCompanies()
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshCompanies])

    // Get company by ID
    const getCompany = useCallback(async (companyId: string): Promise<Company | null> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return null
        }

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/companies/${companyId}`,
                {
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                throw new Error('Failed to load company')
            }

            const data = await response.json()
            return data.company
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        }
    }, [customer?.id])

    // Request credit increase
    const requestCreditIncrease = useCallback(async (
        companyId: string,
        requestedAmount: number,
        justification: string
    ): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/companies/${companyId}/credit-request`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        requested_amount: requestedAmount,
                        justification
                    })
                }
            )

            if (!response.ok) {
                throw new Error('Failed to request credit increase')
            }

            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id])

    // Get active company (if user belongs to only one)
    const getActiveCompany = useCallback((): Company | undefined => {
        return companies.find(company => company.is_active)
    }, [companies])

    // Get verified companies
    const getVerifiedCompanies = useCallback((): Company[] => {
        return companies.filter(company => company.verified)
    }, [companies])

    return {
        companies,
        isLoading,
        error,
        createCompany,
        updateCompany,
        deleteCompany,
        getCompany,
        requestCreditIncrease,
        getActiveCompany,
        getVerifiedCompanies,
        refresh: refreshCompanies
    }
}
