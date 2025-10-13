"use client"

/**
 * Cart Toast Notifications
 *
 * Client-side toast notifications for cart operations
 */

import { useCartToasts, useToast } from "@/components/toasts/toast-provider"

// Hook for cart-specific toasts
export function useCartToastNotifications() {
  const cartToasts = useCartToasts()
  const { addToast } = useToast()

  return {
    showAddToCartSuccess: (itemName: string, quantity: number) => {
      cartToasts.showItemAdded(`${quantity}x ${itemName}`)
    },

    showAddToCartBulkSuccess: (itemCount: number) => {
      cartToasts.showItemAdded(`${itemCount} itens`)
    },

    showRemoveItemSuccess: (itemName: string) => {
      cartToasts.showItemRemoved(itemName)
    },

    showUpdateItemSuccess: (itemName: string) => {
      cartToasts.showSyncSuccess()
    },

    showCartSyncSuccess: () => {
      cartToasts.showSyncSuccess()
    },

    showCartSyncFailed: (retryAction?: () => void) => {
      cartToasts.showSyncFailed(retryAction)
    },

    showOfflineMode: () => {
      cartToasts.showOfflineMode()
    },

    showOnlineRestored: () => {
      cartToasts.showOnlineRestored()
    },

    showApprovalCreated: () => {
      addToast({
        type: "info",
        title: "Aprovação solicitada",
        message: "O carrinho foi enviado para aprovação.",
        duration: 4000,
      })
    },

    showOrderPlaced: () => {
      addToast({
        type: "success",
        title: "Pedido realizado",
        message: "Seu pedido foi enviado com sucesso!",
        duration: 5000,
      })
    },

    showPromotionApplied: (code: string) => {
      addToast({
        type: "success",
        title: "Promoção aplicada",
        message: `Código ${code} aplicado com sucesso.`,
        duration: 3000,
      })
    },

    showError: (message: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: "error",
        title: "Erro na operação",
        message,
        duration: 5000,
        action,
      })
    },
  }
}

// Global cart toast dispatcher for server actions
export const cartToastDispatcher = {
  addToCartSuccess: (itemName: string, quantity: number) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-add-success", {
        detail: { itemName, quantity }
      }))
    }
  },

  addToCartBulkSuccess: (itemCount: number) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-add-bulk-success", {
        detail: { itemCount }
      }))
    }
  },

  removeItemSuccess: (itemName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-remove-success", {
        detail: { itemName }
      }))
    }
  },

  updateItemSuccess: (itemName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-update-success", {
        detail: { itemName }
      }))
    }
  },

  syncSuccess: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartSyncSuccess"))
    }
  },

  syncFailed: (retryAction?: () => void) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cartSyncFailed", {
        detail: { retryAction }
      }))
    }
  },

  offlineMode: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("offline"))
    }
  },

  onlineRestored: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("online"))
    }
  },

  approvalCreated: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-approval-created"))
    }
  },

  orderPlaced: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-order-placed"))
    }
  },

  promotionApplied: (code: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-promotion-applied", {
        detail: { code }
      }))
    }
  },

  error: (message: string, action?: { label: string; onClick: () => void }) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cart-error", {
        detail: { message, action }
      }))
    }
  },
}
