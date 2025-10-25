/**
 * Textarea Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Textarea'
 * This file maintained for backward compatibility during migration
 */

import { Textarea as DesignSystemTextarea, type TextareaProps as DesignSystemTextareaProps } from '@/lib/design-system/components/Textarea'

// Re-export with named export for backward compatibility
export const Textarea = DesignSystemTextarea
export type TextareaProps = DesignSystemTextareaProps