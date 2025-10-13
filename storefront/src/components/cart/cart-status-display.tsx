"use client"

/**
 * Cart Status Display - Combines sync indicator with toast notifications
 *
 * Shows real-time cart sync status and provides user feedback through toasts
 */

import React, { useEffect, useState } from "react"
import { CartSyncIndicator } from "@/components/cart/cart-sync-indicator"
import { useCartToastNotifications } from "@/lib/toasts/cart-toasts"

interface CartStatusDisplayProps {
    className?: string
}

export function CartStatusDisplay({ className }: CartStatusDisplayProps) {
    const [isOnline, setIsOnline] = useState(true)
    const [syncStatus, setSyncStatus] = useState<{
        isSyncing: boolean
        queueSize: number
        lastSyncTime?: Date
        hasErrors: boolean
    }>({
        isSyncing: false,
        queueSize: 0,
        hasErrors: false,
    })

    const toastNotifications = useCartToastNotifications()

    // Listen for cart sync events
    useEffect(() => {
        const handleSyncStart = () => {
            setSyncStatus(prev => ({ ...prev, isSyncing: true }))
        }

        const handleSyncSuccess = () => {
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
                hasErrors: false,
            }))
            toastNotifications.showCartSyncSuccess()
        }

        const handleSyncFailed = (event: CustomEvent) => {
            setSyncStatus(prev => ({
                ...prev,
                isSyncing: false,
                hasErrors: true,
            }))
            toastNotifications.showCartSyncFailed(() => {
                // Trigger manual sync
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("manualCartSync"))
                }
            })
        }

        const handleQueueUpdate = (event: CustomEvent) => {
            const { queueSize } = event.detail
            setSyncStatus(prev => ({ ...prev, queueSize }))
        }

        const handleOnline = () => {
            setIsOnline(true)
            toastNotifications.showOnlineRestored()
        }

        const handleOffline = () => {
            setIsOnline(false)
            toastNotifications.showOfflineMode()
        }

        // Add event listeners
        window.addEventListener("cartSyncStart", handleSyncStart)
        window.addEventListener("cartSyncSuccess", handleSyncSuccess)
        window.addEventListener("cartSyncFailed", handleSyncFailed as EventListener)
        window.addEventListener("cartQueueUpdate", handleQueueUpdate as EventListener)
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // Check initial online status
        setIsOnline(navigator.onLine)

        return () => {
            window.removeEventListener("cartSyncStart", handleSyncStart)
            window.removeEventListener("cartSyncSuccess", handleSyncSuccess)
            window.removeEventListener("cartSyncFailed", handleSyncFailed as EventListener)
            window.removeEventListener("cartQueueUpdate", handleQueueUpdate as EventListener)
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [toastNotifications])

    return (
        <div className={className}>
            <CartSyncIndicator />
        </div>
    )
}

/**
 * Hook to get cart status for programmatic access
 */
export function useCartStatus() {
    const [status, setStatus] = useState({
        isOnline: true,
        isSyncing: false,
        queueSize: 0,
        lastSyncTime: undefined as Date | undefined,
        hasErrors: false,
    })

    useEffect(() => {
        const handleSyncStart = () => {
            setStatus(prev => ({ ...prev, isSyncing: true }))
        }

        const handleSyncSuccess = () => {
            setStatus(prev => ({
                ...prev,
                isSyncing: false,
                lastSyncTime: new Date(),
                hasErrors: false,
            }))
        }

        const handleSyncFailed = () => {
            setStatus(prev => ({
                ...prev,
                isSyncing: false,
                hasErrors: true,
            }))
        }

        const handleQueueUpdate = (event: CustomEvent) => {
            const { queueSize } = event.detail
            setStatus(prev => ({ ...prev, queueSize }))
        }

        const handleOnline = () => {
            setStatus(prev => ({ ...prev, isOnline: true }))
        }

        const handleOffline = () => {
            setStatus(prev => ({ ...prev, isOnline: false }))
        }

        // Add event listeners
        window.addEventListener("cartSyncStart", handleSyncStart)
        window.addEventListener("cartSyncSuccess", handleSyncSuccess)
        window.addEventListener("cartSyncFailed", handleSyncFailed)
        window.addEventListener("cartQueueUpdate", handleQueueUpdate as EventListener)
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        // Set initial online status
        setStatus(prev => ({ ...prev, isOnline: navigator.onLine }))

        return () => {
            window.removeEventListener("cartSyncStart", handleSyncStart)
            window.removeEventListener("cartSyncSuccess", handleSyncSuccess)
            window.removeEventListener("cartSyncFailed", handleSyncFailed)
            window.removeEventListener("cartQueueUpdate", handleQueueUpdate as EventListener)
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const triggerManualSync = () => {
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("manualCartSync"))
        }
    }

    return {
        ...status,
        triggerManualSync,
    }
}
