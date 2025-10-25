import { Tabs as MedusaTabs } from "@medusajs/ui"

/**
 * Yello Solar Hub Tabs Component
 * Wrapper around Medusa UI Tabs component
 *
 * @example
 * <Tabs defaultValue="tab1">
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
 *     <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab1">Conteúdo da Tab 1</Tabs.Content>
 *   <Tabs.Content value="tab2">Conteúdo da Tab 2</Tabs.Content>
 * </Tabs>
 */

const Tabs = MedusaTabs
const TabsList = MedusaTabs.List
const TabsTrigger = MedusaTabs.Trigger
const TabsContent = MedusaTabs.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }