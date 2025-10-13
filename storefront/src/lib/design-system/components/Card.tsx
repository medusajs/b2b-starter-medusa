import { cva, type VariantProps } from "class-variance-authority"
import { clx } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Card Component
 * Custom card component with Yello theming
 */

const cardVariants = cva(
    "rounded-xl border bg-card text-card-foreground shadow-sm",
    {
        variants: {
            variant: {
                default: "border-gray-200 bg-white",
                solar: "border-yello-yellow-200 bg-gradient-to-br from-yello-yellow-50 to-yello-blue-50",
                elevated: "border-gray-200 bg-white shadow-lg",
                outlined: "border-2 border-yello-yellow-400 bg-transparent",
            },
            elevation: {
                none: "shadow-none",
                sm: "shadow-sm",
                md: "shadow-md",
                lg: "shadow-lg",
                xl: "shadow-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            elevation: "sm",
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, elevation, ...props }, ref) => {
        return (
            <div
                className={clx(cardVariants({ variant, elevation, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Card.displayName = "Card"

export { Card, cardVariants }
