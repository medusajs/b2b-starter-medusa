import { cva, type VariantProps } from "class-variance-authority"
import { clx, Label as MedusaLabel } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Label Component
 * Unified label component with Yello theming
 *
 * Features:
 * - 3 sizes (sm, md, lg)
 * - Optional asterisk for required fields
 * - Consistent typography with design system
 *
 * @example
 * <Label>Nome</Label>
 * <Label size="lg" required>Email</Label>
 */

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    {
        variants: {
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
)

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
    required?: boolean
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, size, required, children, ...props }, ref) => {
        return (
            <MedusaLabel
                className={clx(labelVariants({ size }), className)}
                ref={ref}
                {...props}
            >
                {children}
                {required && <span className="text-red-500 ml-1">*</span>}
            </MedusaLabel>
        )
    }
)
Label.displayName = "Label"

export { Label, labelVariants }