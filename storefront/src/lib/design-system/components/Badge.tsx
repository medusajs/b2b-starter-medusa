import { cva, type VariantProps } from "class-variance-authority"
import { clx } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Badge Component
 * Unified badge component with Yello theming
 *
 * Features:
 * - 6 variants (default, primary, secondary, success, warning, danger)
 * - 3 sizes (sm, md, lg)
 * - Rounded variants (default, full)
 *
 * @example
 * <Badge variant="primary">Novo</Badge>
 * <Badge variant="success" size="sm">Aprovado</Badge>
 */

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80",
                primary: "border-transparent bg-gradient-to-r from-yello-yellow-400 to-yello-yellow-500 text-gray-900",
                secondary: "border-transparent bg-yello-orange-500 text-white",
                success: "border-transparent bg-green-500 text-white",
                warning: "border-transparent bg-yellow-500 text-gray-900",
                danger: "border-transparent bg-red-500 text-white",
                outline: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
            },
            size: {
                sm: "px-2 py-0.5 text-xs",
                md: "px-2.5 py-0.5 text-xs",
                lg: "px-3 py-1 text-sm",
            },
            rounded: {
                default: "",
                full: "!rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            rounded: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, size, rounded, ...props }, ref) => {
        return (
            <div
                className={clx(badgeVariants({ variant, size, rounded }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }