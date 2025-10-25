import { Select as MedusaSelect } from "@medusajs/ui"

/**
 * Yello Solar Hub Select Component
 * Wrapper around Medusa UI Select component
 *
 * @example
 * <Select>
 *   <Select.Trigger>
 *     <Select.Value placeholder="Selecione uma opção" />
 *   </Select.Trigger>
 *   <Select.Content>
 *     <Select.Item value="option1">Opção 1</Select.Item>
 *     <Select.Item value="option2">Opção 2</Select.Item>
 *   </Select.Content>
 * </Select>
 */

const Select = MedusaSelect
const SelectGroup = MedusaSelect.Group
const SelectValue = MedusaSelect.Value
const SelectTrigger = MedusaSelect.Trigger
const SelectContent = MedusaSelect.Content
const SelectLabel = MedusaSelect.Label
const SelectItem = MedusaSelect.Item
const SelectSeparator = MedusaSelect.Separator

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
}