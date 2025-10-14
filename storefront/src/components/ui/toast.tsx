/**
 * Toast Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Toast'
 * This file maintained for backward compatibility during migration
 */

import { Toast as DesignSystemToast, Toaster as DesignSystemToaster, toast as designSystemToast } from '@/lib/design-system/components/Toast'

// Re-export with named exports for backward compatibility
export const Toast = DesignSystemToast
export const Toaster = DesignSystemToaster
export const toast = designSystemToast