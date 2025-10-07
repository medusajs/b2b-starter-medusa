import { cva, type VariantProps } from "class-variance-authority"
import { clx, Button as MedusaButton } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Button Component
 * Built on top of Medusa UI Button with Yello theming
 */

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yello-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-gradient-to-r from-yello-yellow-400 to-yello-yellow-500 text-gray-900 hover:from-yello-yellow-500 hover:to-yello-yellow-600 shadow-md hover:shadow-lg",
                secondary: "bg-yello-orange-500 text-white hover:bg-yello-orange-600 shadow-md hover:shadow-lg",
                outline: "border-2 border-yello-yellow-400 text-yello-yellow-600 hover:bg-yello-yellow-400 hover:text-gray-900",
                ghost: "text-yello-yellow-600 hover:bg-yello-yellow-50",
                link: "text-yello-yellow-600 underline-offset-4 hover:underline",
            },
            size: {
                sm: "h-9 px-3 text-sm",
                md: "h-10 px-4 py-2",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
)

export interface ButtonProps
    extends Omit<React.ComponentProps<typeof MedusaButton>, 'variant' | 'size'>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <MedusaButton
                className={clx(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }