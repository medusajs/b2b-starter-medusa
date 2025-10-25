/**
 * Button Component - RE-EXPORT
 * This file now re-exports from the unified design system
 * 
 * DEPRECATED: Import directly from '@/lib/design-system/components/Button'
 * This file maintained for backward compatibility during migration
 */

import { Button as DesignSystemButton, type ButtonProps as DesignSystemButtonProps } from '@/lib/design-system/components/Button'

// Re-export with named export for backward compatibility
export const Button = DesignSystemButton
export type ButtonProps = DesignSystemButtonProps
