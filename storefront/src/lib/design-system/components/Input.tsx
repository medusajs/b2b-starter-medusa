import { cva, type VariantProps } from "class-variance-authority"
import { clx, Input as MedusaInput } from "@medusajs/ui"
import { forwardRef } from "react"
import { inputVariants } from "../tokens"

/**
 * Yello Solar Hub Input Component
 * Unified input component using Medusa UI base component
 *
 * Features:
 * - 3 variants (default, filled, flushed)
 * - 3 sizes (sm, md, lg)
 * - Full accessibility support
 * - Consistent styling with design system
 *
 * @example
 * <Input placeholder="Digite seu nome" />
 * <Input variant="filled" size="lg" />
 * <Input variant="flushed" />
 */

export interface InputProps
    extends Omit<React.ComponentProps<typeof MedusaInput>, 'size'>,
    VariantProps<typeof inputVariants> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <MedusaInput
                className={clx(inputVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input, inputVariants }