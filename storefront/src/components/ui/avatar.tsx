/**
 * Avatar Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Avatar'
 * This file maintained for backward compatibility during migration
 */

import { Avatar as DesignSystemAvatar, type AvatarProps as DesignSystemAvatarProps } from '@/lib/design-system/components/Avatar'

// Re-export with named export for backward compatibility
export const Avatar = DesignSystemAvatar
export type AvatarProps = DesignSystemAvatarProps