"use client"

/**
 * Toast Notification System for Resilient Operations
 *
 * Provides user feedback for:
 * - Cart sync operations
 * - Error recoveries
 * - Offline/online transitions
 * - Retry attempts
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

export type ToastType = "success" | "error" | "warning" | "info"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000, // Default 5 seconds
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      // Keep only maxToasts
      return updated.slice(0, maxToasts)
    })

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }, [maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Listen for cart sync events to show toasts
  useEffect(() => {
    const handleCartSyncSuccess = () => {
      addToast({
        type: "success",
        title: "Carrinho sincronizado",
        message: "Todas as alterações foram salvas com sucesso.",
        duration: 3000,
      })
    }

    const handleCartSyncFailed = (event: CustomEvent) => {
      addToast({
        type: "warning",
        title: "Sincronização pendente",
        message: "Suas alterações serão sincronizadas automaticamente.",
        duration: 5000,
        action: {
          label: "Tentar agora",
          onClick: () => {
            // Trigger manual sync
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("manualCartSync"))
            }
          },
        },
      })
    }

    const handleOffline = () => {
      addToast({
        type: "warning",
        title: "Modo offline",
        message: "Você está offline. As alterações serão sincronizadas quando voltar online.",
        duration: 0, // Don't auto-dismiss
      })
    }

    const handleOnline = () => {
      addToast({
        type: "info",
        title: "Conexão restaurada",
        message: "Sincronizando alterações pendentes...",
        duration: 3000,
      })
    }

    // Cart-specific events
    const handleCartAddSuccess = (event: CustomEvent) => {
      const { itemName, quantity } = event.detail
      addToast({
        type: "success",
        title: "Item adicionado",
        message: `${quantity}x ${itemName} foi adicionado ao carrinho.`,
        duration: 2000,
      })
    }

    const handleCartAddBulkSuccess = (event: CustomEvent) => {
      const { itemCount } = event.detail
      addToast({
        type: "success",
        title: "Itens adicionados",
        message: `${itemCount} itens foram adicionados ao carrinho.`,
        duration: 2000,
      })
    }

    const handleCartRemoveSuccess = (event: CustomEvent) => {
      const { itemName } = event.detail
      addToast({
        type: "info",
        title: "Item removido",
        message: `${itemName} foi removido do carrinho.`,
        duration: 2000,
      })
    }

    const handleCartUpdateSuccess = (event: CustomEvent) => {
      const { itemName } = event.detail
      addToast({
        type: "success",
        title: "Item atualizado",
        message: `${itemName} foi atualizado no carrinho.`,
        duration: 2000,
      })
    }

    const handleCartApprovalCreated = () => {
      addToast({
        type: "info",
        title: "Aprovação solicitada",
        message: "O carrinho foi enviado para aprovação.",
        duration: 4000,
      })
    }

    const handleCartOrderPlaced = () => {
      addToast({
        type: "success",
        title: "Pedido realizado",
        message: "Seu pedido foi enviado com sucesso!",
        duration: 5000,
      })
    }

    const handleCartPromotionApplied = (event: CustomEvent) => {
      const { code } = event.detail
      addToast({
        type: "success",
        title: "Promoção aplicada",
        message: `Código ${code} aplicado com sucesso.`,
        duration: 3000,
      })
    }

    const handleCartError = (event: CustomEvent) => {
      const { message, action } = event.detail
      addToast({
        type: "error",
        title: "Erro na operação",
        message,
        duration: 5000,
        action,
      })
    }

    // Add event listeners
    window.addEventListener("cartSyncSuccess", handleCartSyncSuccess)
    window.addEventListener("cartSyncFailed", handleCartSyncFailed as EventListener)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)
    window.addEventListener("cart-add-success", handleCartAddSuccess as EventListener)
    window.addEventListener("cart-add-bulk-success", handleCartAddBulkSuccess as EventListener)
    window.addEventListener("cart-remove-success", handleCartRemoveSuccess as EventListener)
    window.addEventListener("cart-update-success", handleCartUpdateSuccess as EventListener)
    window.addEventListener("cart-approval-created", handleCartApprovalCreated)
    window.addEventListener("cart-order-placed", handleCartOrderPlaced)
    window.addEventListener("cart-promotion-applied", handleCartPromotionApplied as EventListener)
    window.addEventListener("cart-error", handleCartError as EventListener)

    return () => {
      window.removeEventListener("cartSyncSuccess", handleCartSyncSuccess)
      window.removeEventListener("cartSyncFailed", handleCartSyncFailed as EventListener)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("cart-add-success", handleCartAddSuccess as EventListener)
      window.removeEventListener("cart-add-bulk-success", handleCartAddBulkSuccess as EventListener)
      window.removeEventListener("cart-remove-success", handleCartRemoveSuccess as EventListener)
      window.removeEventListener("cart-update-success", handleCartUpdateSuccess as EventListener)
      window.removeEventListener("cart-approval-created", handleCartApprovalCreated)
      window.removeEventListener("cart-order-placed", handleCartOrderPlaced)
      window.removeEventListener("cart-promotion-applied", handleCartPromotionApplied as EventListener)
      window.removeEventListener("cart-error", handleCartError as EventListener)
    }
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className={`p-4 border rounded-lg shadow-lg transition-all duration-300 ease-in-out ${getToastStyles(toast.type)}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(toast.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm opacity-90 mt-1">{toast.message}</p>
          )}

          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                onRemove(toast.id)
              }}
              className="text-sm font-medium underline hover:no-underline mt-2 block"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fechar notificação"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && (
        <div className="mt-3 bg-current bg-opacity-20 rounded-full h-1 overflow-hidden">
          <div
            className="bg-current bg-opacity-60 h-full rounded-full animate-toast-progress"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Convenience functions for common toast types
 */
export const toast = {
  success: (title: string, message?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>) => {
    const { addToast } = useToast()
    addToast({ type: "success", title, message, ...options })
  },

  error: (title: string, message?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>) => {
    const { addToast } = useToast()
    addToast({ type: "error", title, message, ...options })
  },

  warning: (title: string, message?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>) => {
    const { addToast } = useToast()
    addToast({ type: "warning", title, message, ...options })
  },

  info: (title: string, message?: string, options?: Partial<Omit<Toast, "id" | "type" | "title" | "message">>) => {
    const { addToast } = useToast()
    addToast({ type: "info", title, message, ...options })
  },
}

/**
 * Hook to show cart-specific toasts
 */
export function useCartToasts() {
  const { addToast } = useToast()

  return {
    showSyncSuccess: () => {
      addToast({
        type: "success",
        title: "Carrinho sincronizado",
        message: "Todas as alterações foram salvas.",
        duration: 3000,
      })
    },

    showSyncFailed: (retryAction?: () => void) => {
      addToast({
        type: "warning",
        title: "Sincronização pendente",
        message: "Suas alterações serão sincronizadas automaticamente.",
        duration: 5000,
        action: retryAction ? {
          label: "Tentar agora",
          onClick: retryAction,
        } : undefined,
      })
    },

    showOfflineMode: () => {
      addToast({
        type: "warning",
        title: "Modo offline",
        message: "Você está offline. As alterações serão sincronizadas quando voltar online.",
        duration: 0,
      })
    },

    showOnlineRestored: () => {
      addToast({
        type: "info",
        title: "Conexão restaurada",
        message: "Sincronizando alterações pendentes...",
        duration: 3000,
      })
    },

    showItemAdded: (itemName: string) => {
      addToast({
        type: "success",
        title: "Item adicionado",
        message: `${itemName} foi adicionado ao carrinho.`,
        duration: 2000,
      })
    },

    showItemRemoved: (itemName: string) => {
      addToast({
        type: "info",
        title: "Item removido",
        message: `${itemName} foi removido do carrinho.`,
        duration: 2000,
      })
    },
  }
}
