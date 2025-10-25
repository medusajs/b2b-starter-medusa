/**
 * Alert Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Alert'
 * This file maintained for backward compatibility during migration
 */

import { Alert as DesignSystemAlert, type AlertProps as DesignSystemAlertProps } from '@/lib/design-system/components/Alert'

// Re-export with named export for backward compatibility
export const Alert = DesignSystemAlert
export type AlertProps = DesignSystemAlertProps