import Link from "next/link"
import { clx } from "@medusajs/ui"
import { trackModelLinkClick } from "@/lib/sku-analytics"

interface ProductModelProps {
    manufacturer: string
    model: string
    series?: string
    link?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
}

export const ProductModel = ({
    manufacturer,
    model,
    series,
    link = false,
    size = "md",
    className
}: ProductModelProps) => {
    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    }

    const content = (
        <div className={clx(
            "flex items-center gap-1.5 font-medium",
            sizeClasses[size],
            className
        )}>
            <span className="text-gray-700">{manufacturer}</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-semibold">{model}</span>
            {series && (
                <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 text-xs">{series}</span>
                </>
            )}
        </div>
    )

    if (link) {
        return (
            <Link
                href={`/produtos?manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`}
                className="hover:text-blue-600 transition-colors"
                onClick={() => trackModelLinkClick(manufacturer, model)}
            >
                {content}
            </Link>
        )
    }

    return content
}

export default ProductModel
