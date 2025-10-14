/**
 * Label Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Label'
 * This file maintained for backward compatibility during migration
 */

import { Label as DesignSystemLabel, type LabelProps as DesignSystemLabelProps } from '@/lib/design-system/components/Label'

// Re-export with named export for backward compatibility
export const Label = DesignSystemLabel
export type LabelProps = DesignSystemLabelProps
