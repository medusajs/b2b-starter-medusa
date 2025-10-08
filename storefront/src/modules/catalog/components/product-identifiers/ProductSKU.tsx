import { useState } from "react"
import { clx } from "@medusajs/ui"
import { trackSKUCopy, useSKUHistory } from "@/lib/sku-analytics"
import { SKUQRCodeButton } from "@/components/SKUQRCode"

interface ProductSKUProps {
    sku: string
    internal_sku?: string
    copyable?: boolean
    size?: "sm" | "md" | "lg"
    className?: string
    productId?: string
    productName?: string
    category?: string
    showQRCode?: boolean  // Exibe botão QR Code (mobile)
}

export const ProductSKU = ({
    sku,
    internal_sku,
    copyable = true,
    size = "md",
    className,
    productId,
    productName,
    category,
    showQRCode = true,
}: ProductSKUProps) => {
    const [copied, setCopied] = useState(false)
    const { addToHistory } = useSKUHistory()

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(sku)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)

            // Track analytics
            trackSKUCopy(sku, productId, category)

            // Add to history
            addToHistory({
                sku,
                timestamp: Date.now(),
                product: productId ? {
                    id: productId,
                    name: productName || '',
                    category: category || '',
                } : undefined,
            })
        } catch (err) {
            console.error("Failed to copy SKU:", err)
        }
    }

    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
    }

    return (
        <div className={clx(
            "flex items-center gap-2 font-mono",
            sizeClasses[size],
            className
        )}>
            <span className="text-gray-500">SKU:</span>
            <code className="px-2 py-1 bg-gray-100 rounded text-gray-900">
                {sku}
            </code>
            {copyable && (
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title={copied ? "Copiado!" : "Copiar SKU"}
                    aria-label="Copiar SKU"
                >
                    {copied ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </button>
            )}
            {showQRCode && (
                <SKUQRCodeButton
                    sku={sku}
                    productName={productName}
                />
            )}
            {internal_sku && (
                <span className="text-xs text-gray-400" title="Referência Interna">
                    (Ref: {internal_sku})
                </span>
            )}
        </div>
    )
}

export default ProductSKU
