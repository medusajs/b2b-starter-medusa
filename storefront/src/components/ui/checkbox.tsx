/**
 * Checkbox Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Checkbox'
 * This file maintained for backward compatibility during migration
 */

import { Checkbox as DesignSystemCheckbox, type CheckboxProps as DesignSystemCheckboxProps, type CheckboxCheckedState } from '@/lib/design-system/components/Checkbox'

// Re-export with named export for backward compatibility
export const Checkbox = DesignSystemCheckbox
export type CheckboxProps = DesignSystemCheckboxProps
export type { CheckboxCheckedState }