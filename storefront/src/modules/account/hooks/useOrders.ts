/**
 * useOrders Hook
 * 
 * Hook para gerenciamento de pedidos do cliente
 */

import { useState, useCallback } from 'react'
import { useAccount } from '../context/AccountContext'
import type { Order } from '../types'

export function useOrders() {
    const { orders, refreshOrders, customer } = useAccount()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Get order by ID
    const getOrder = useCallback(async (orderId: string): Promise<Order | null> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to load order')
            }

            const data = await response.json()
            return data.order
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id])

    // Cancel order
    const cancelOrder = useCallback(async (orderId: string, reason?: string): Promise<boolean> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return false
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ reason })
            })

            if (!response.ok) {
                throw new Error('Failed to cancel order')
            }

            await refreshOrders()
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return false
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id, refreshOrders])

    // Request invoice
    const requestInvoice = useCallback(async (orderId: string): Promise<string | null> => {
        if (!customer?.id) {
            setError('Customer not authenticated')
            return null
        }

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/orders/${orderId}/invoice`, {
                method: 'POST',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to request invoice')
            }

            const data = await response.json()
            return data.invoice_url
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [customer?.id])

    // Track order
    const trackOrder = useCallback(async (orderId: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/orders/${orderId}/tracking`, {
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to get tracking info')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            return null
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Filter orders by status
    const getOrdersByStatus = useCallback((status: string): Order[] => {
        return orders.filter(order => order.status === status)
    }, [orders])

    // Get recent orders
    const getRecentOrders = useCallback((limit: number = 5): Order[] => {
        return orders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit)
    }, [orders])

    // Calculate total spent
    const getTotalSpent = useCallback((): number => {
        return orders.reduce((sum, order) => sum + (order.total || 0), 0) / 100
    }, [orders])

    return {
        orders,
        isLoading,
        error,
        getOrder,
        cancelOrder,
        requestInvoice,
        trackOrder,
        getOrdersByStatus,
        getRecentOrders,
        getTotalSpent,
        refresh: refreshOrders
    }
}
