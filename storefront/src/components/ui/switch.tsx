/**
 * Switch Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Switch'
 * This file maintained for backward compatibility during migration
 */

import { Switch as DesignSystemSwitch, type SwitchProps as DesignSystemSwitchProps } from '@/lib/design-system/components/Switch'

// Re-export with named export for backward compatibility
export const Switch = DesignSystemSwitch
export type SwitchProps = DesignSystemSwitchProps