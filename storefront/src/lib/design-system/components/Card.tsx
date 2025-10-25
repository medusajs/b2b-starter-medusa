import { cva, type VariantProps } from "class-variance-authority"
import { clx } from "@medusajs/ui"
import { forwardRef } from "react"
import { cardVariants } from "../tokens"

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
