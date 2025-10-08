/**
 * useAddresses Hook
 * 
 * Hook para gerenciamento de endereços do cliente
 */

import { useState, useCallback } from 'react'
import { useAccount } from '../context/AccountContext'
import type { Address } from '../types'

interface CreateAddressInput {
    first_name: string
    last_name: string
    phone?: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    province: string
    postal_code: string
    country_code: string
    is_default_shipping?: boolean
    is_default_billing?: boolean
}

export function useAddresses() {
    const { addresses, refreshAddresses, customer } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Create address
    const createAddress = useCallback(async (
        input: CreateAddressInput
    ): Promise<Address | null> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/customers/${customer.id}/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(input)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create address')
            }

            const data = await response.json()
            await refreshAddresses()

            return data.address
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshAddresses])

    // Update address
    const updateAddress = useCallback(async (
        addressId: string,
        updates: Partial<CreateAddressInput>
    ): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/addresses/${addressId}`,
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
                throw new Error('Failed to update address')
            }

            await refreshAddresses()
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshAddresses])

    // Delete address
    const deleteAddress = useCallback(async (addressId: string): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(
                `/api/customers/${customer.id}/addresses/${addressId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete address')
            }

            await refreshAddresses()
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshAddresses])

    // Set default shipping address
    const setDefaultShipping = useCallback(async (addressId: string): Promise<boolean> => {
        return updateAddress(addressId, { is_default_shipping: true })
    }, [updateAddress])

    // Set default billing address
    const setDefaultBilling = useCallback(async (addressId: string): Promise<boolean> => {
        return updateAddress(addressId, { is_default_billing: true })
    }, [updateAddress])

    // Get default shipping address
    const getDefaultShipping = useCallback((): Address | undefined => {
        return addresses.find(addr => addr.is_default_shipping)
    }, [addresses])

    // Get default billing address
    const getDefaultBilling = useCallback((): Address | undefined => {
        return addresses.find(addr => addr.is_default_billing)
    }, [addresses])

    return {
        addresses,
        isLoading,
        error,
        createAddress,
        updateAddress,
        deleteAddress,
        setDefaultShipping,
        setDefaultBilling,
        getDefaultShipping,
        getDefaultBilling,
        refresh: refreshAddresses
    }
}
