import { cva, type VariantProps } from "class-variance-authority"
import { clx, Button as MedusaButton } from "@medusajs/ui"
import { forwardRef } from "react"
import { buttonVariants } from "../tokens"

export interface ButtonProps
    extends Omit<React.ComponentProps<typeof MedusaButton>, 'variant' | 'size'>,
    Omit<VariantProps<typeof buttonVariants>, 'size'> {
    asChild?: boolean
    // Accept both Medusa UI sizes (small, base, large, xlarge) and our sizes (sm, md, lg, xl, icon)
    size?: 'small' | 'base' | 'large' | 'xlarge' | 'sm' | 'md' | 'lg' | 'xl' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
        // Map custom variants to Medusa variants for compatibility
        const medusaVariant =
            variant === 'primary' ? 'primary' :
                variant === 'secondary' ? 'secondary' :
                    variant === 'danger' ? 'danger' :
                        'transparent'

        // Map Medusa UI sizes (small, base, large, xlarge) to our sizes (sm, md, lg, xl)
        const mappedSize =
            size === 'small' ? 'sm' :
                size === 'base' ? 'md' :
                    size === 'large' ? 'lg' :
                        size === 'xlarge' ? 'xl' :
                            size

        return (
            <MedusaButton
                variant={medusaVariant}
                className={clx(buttonVariants({ variant, size: mappedSize as any, rounded }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
