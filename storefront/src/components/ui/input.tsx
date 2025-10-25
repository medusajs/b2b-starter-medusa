/**
 * Input Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Input'
 * This file maintained for backward compatibility during migration
 */

import { Input as DesignSystemInput, type InputProps as DesignSystemInputProps } from '@/lib/design-system/components/Input'

// Re-export with named export for backward compatibility
export const Input = DesignSystemInput
export type InputProps = DesignSystemInputProps
