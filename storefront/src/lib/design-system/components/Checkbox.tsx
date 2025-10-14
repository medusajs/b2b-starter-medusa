import { Checkbox as MedusaCheckbox, type CheckboxCheckedState } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Checkbox Component
 * Wrapper around Medusa UI Checkbox component
 *
 * @example
 * <Checkbox id="terms" />
 * <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
 */

export interface CheckboxProps extends React.ComponentProps<typeof MedusaCheckbox> { }

const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ ...props }, ref) => {
        return (
            <MedusaCheckbox
                ref={ref}
                {...props}
            />
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox, type CheckboxCheckedState }