import { RadioGroup as MedusaRadioGroup } from "@medusajs/ui"

/**
 * Yello Solar Hub RadioGroup Component
 * Wrapper around Medusa UI RadioGroup component
 *
 * @example
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroup.Item value="option1" id="option1">Opção 1</RadioGroup.Item>
 *   <RadioGroup.Item value="option2" id="option2">Opção 2</RadioGroup.Item>
 * </RadioGroup>
 */

const RadioGroup = MedusaRadioGroup
const RadioGroupItem = MedusaRadioGroup.Item
const RadioGroupChoiceBox = MedusaRadioGroup.ChoiceBox

export { RadioGroup, RadioGroupItem, RadioGroupChoiceBox }