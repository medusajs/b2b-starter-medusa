/**
 * Tabs Component - RE-EXPORT
 * This file now re-exports from the unified design system
 *
 * DEPRECATED: Import directly from '@/lib/design-system/components/Tabs'
 * This file maintained for backward compatibility during migration
 */

import {
    Tabs as DesignSystemTabs,
    TabsList as DesignSystemTabsList,
    TabsTrigger as DesignSystemTabsTrigger,
    TabsContent as DesignSystemTabsContent,
} from '@/lib/design-system/components/Tabs'

// Re-export with named exports for backward compatibility
export const Tabs = DesignSystemTabs
export const TabsList = DesignSystemTabsList
export const TabsTrigger = DesignSystemTabsTrigger
export const TabsContent = DesignSystemTabsContent