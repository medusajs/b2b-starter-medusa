import { Switch as MedusaSwitch } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Switch Component
 * Wrapper around Medusa UI Switch component
 *
 * @example
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * <Switch />
 */

export interface SwitchProps extends React.ComponentProps<typeof MedusaSwitch> { }

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
    ({ ...props }, ref) => {
        return (
            <MedusaSwitch
                ref={ref}
                {...props}
            />
        )
    }
)
Switch.displayName = "Switch"

export { Switch }