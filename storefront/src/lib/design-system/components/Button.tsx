import { cva, type VariantProps } from "class-variance-authority"
import { clx, Button as MedusaButton } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Button Component - UNIFIED VERSION
 * Single source of truth for all Button usage across the storefront
 * Built on top of Medusa UI Button with Yello theming
 * 
 * Features:
 * - 6 variants (primary, secondary, tertiary, outline, ghost, danger)
 * - 5 sizes (sm, md, lg, xl, icon)
 * - Loading state support (via Medusa UI isLoading prop)
 * - Full accessibility (focus rings, aria support)
 * - Rounded variants (default rounded-lg, optional rounded-full via className)
 * 
 * @example
 * <Button variant="primary" size="lg">Calcular Sistema Solar</Button>
 * <Button variant="outline" isLoading>Carregando...</Button>
 * <Button variant="danger" onClick={handleDelete}>Excluir</Button>
 */

const buttonVariants = cva(
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yello-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // Primary - Gradient amarelo-laranja (CTAs principais)
                primary: "bg-gradient-to-r from-yello-yellow-400 to-yello-yellow-500 text-gray-900 hover:from-yello-yellow-500 hover:to-yello-yellow-600 shadow-md hover:shadow-lg hover:-translate-y-0.5",
                // Secondary - Cinza escuro (ações secundárias neutras)
                secondary: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-borders-base border-none",
                // Tertiary - Laranja sólido (ações de destaque)
                tertiary: "bg-yello-orange-500 text-white hover:bg-yello-orange-600 shadow-md hover:shadow-lg",
                // Outline - Borda amarela (ações não-destrutivas)
                outline: "border-2 border-yello-yellow-400 text-yello-yellow-600 hover:bg-yello-yellow-400 hover:text-gray-900 bg-transparent",
                // Ghost - Transparente (ações sutis)
                ghost: "text-yello-yellow-600 hover:bg-yello-yellow-50 bg-transparent shadow-none",
                // Danger - Vermelho (ações destrutivas)
                danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
                // Transparent - Completamente transparente (navegação)
                transparent: "bg-transparent text-neutral-900 hover:bg-neutral-100 shadow-none",
            },
            size: {
                sm: "h-9 px-3 text-sm rounded-lg",
                md: "h-10 px-4 py-2 text-sm rounded-lg",
                lg: "h-11 px-8 text-base rounded-lg",
                xl: "h-12 px-10 text-base rounded-lg",
                icon: "h-10 w-10 rounded-lg",
            },
            rounded: {
                default: "",
                full: "!rounded-full",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            rounded: "default",
        },
    }
)

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