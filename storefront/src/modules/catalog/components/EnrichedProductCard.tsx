"use client"

import { Badge } from "@medusajs/ui"
import { Heart, ShoppingCart, Eye, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { useState } from "react"

export interface EnrichedProductData {
  id: string
  name: string
  manufacturer: string
  image_url: string
  price_brl?: number
  badges: Array<{
    text: string
    variant: "success" | "warning" | "info" | "premium" | "default"
  }>
  microcopy: {
    short_description: string
    tooltip: string
    cta_text: string
    availability_text: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
    og_title: string
    og_description: string
  }
  specs?: Record<string, any>
}interface EnrichedProductCardProps {
    product: EnrichedProductData
    category: "panels" | "inverters" | "batteries" | "kits" | "structures"
}

export default function EnrichedProductCard({
    product,
    category,
}: EnrichedProductCardProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    let addToQuote: undefined | ((item: any) => void)

    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        addToQuote = useLeadQuote().add
    } catch {
        // Context not available
    }

    const getBadgeStyle = (variant: string) => {
        switch (variant) {
            case "success":
                return "bg-green-500/90 text-white"
            case "warning":
                return "bg-orange-500/90 text-white"
            case "info":
                return "bg-blue-500/90 text-white"
            case "premium":
                return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-semibold"
            default:
                return "bg-gray-500/90 text-white"
        }
    }

  const formatPrice = (price?: number) => {
    if (!price) return "Sob Consulta"
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }    const getCategoryIcon = () => {
        switch (category) {
            case "panels":
                return "☀️"
            case "inverters":
                return "⚡"
            case "kits":
                return "📦"
            case "batteries":
                return "🔋"
            case "structures":
                return "🏗️"
            default:
                return "☀️"
        }
    }

    return (
        <div className="ysh-product-card group">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                <Image
                    src={product.image_url || "/placeholder-product.jpg"}
                    alt={product.seo.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Visualizar produto"
                        >
                            <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Adicionar aos favoritos"
                        >
                            <Heart className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            className="p-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
                            aria-label={product.microcopy.cta_text}
                            onClick={(e) => {
                                e.preventDefault()
                                addToQuote?.({
                                    id: product.id,
                                    category,
                                    name: product.name,
                                    manufacturer: product.manufacturer,
                                    image_url: product.image_url,
                                    price_brl: product.price_brl,
                                })
                            }}
                        >
                            <ShoppingCart className="w-4 h-4 text-gray-900" />
                        </button>
                    </div>
                </div>

                {/* AI-Generated Badges */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
                    {product.badges.map((badge, idx) => (
                        <Badge
                            key={idx}
                            className={`${getBadgeStyle(badge.variant)} text-xs px-2 py-0.5 shadow-md`}
                        >
                            {badge.text}
                        </Badge>
                    ))}
                </div>

                {/* Category Icon */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-sm">{getCategoryIcon()}</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Manufacturer */}
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.manufacturer}
                </p>

                {/* Product Name with Tooltip */}
                <div className="relative mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex items-start gap-1">
                        <LocalizedClientLink
                            href={`/produtos/${category}/${product.id}`}
                            className="hover:text-blue-600 transition-colors flex-1"
                        >
                            {product.name}
                        </LocalizedClientLink>
                        <button
                            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            aria-label="Mais informações"
                        >
                            <Info className="w-4 h-4 text-gray-400" />
                        </button>
                    </h3>

                    {/* Tooltip with AI-generated microcopy */}
                    {showTooltip && (
                        <div className="absolute left-0 top-full mt-2 z-20 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                            <p>{product.microcopy.tooltip}</p>
                            <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45" />
                        </div>
                    )}
                </div>

                {/* AI-generated short description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.microcopy.short_description}
                </p>

                {/* Availability with AI-generated text */}
                <div className="flex items-center gap-2 mb-3">
                    <div
                        className={`w-2 h-2 rounded-full ${product.microcopy.availability_text.includes("Estoque")
                                ? "bg-green-500"
                                : "bg-orange-500"
                            }`}
                    />
                    <span className="text-xs text-gray-600">
                        {product.microcopy.availability_text}
                    </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-end justify-between gap-2">
                    <div className="ysh-price">{formatPrice(product.price_brl)}</div>
                    <LocalizedClientLink href={`/produtos/${category}/${product.id}`}>
                        <button className="ysh-btn-primary text-sm px-4 py-2">
                            {product.microcopy.cta_text}
                        </button>
                    </LocalizedClientLink>
                </div>
            </div>
        </div>
    )
}
