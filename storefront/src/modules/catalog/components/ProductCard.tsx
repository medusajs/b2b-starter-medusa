import { Badge } from "@medusajs/ui"
import { useCatalogCustomization } from "@/modules/catalog/context/customization"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
    product: {
        id: string
        name: string
        sku?: string
        price_brl?: number
        manufacturer?: string
        model?: string
        kwp?: number
        efficiency_pct?: number
        tier_recommendation?: string[]
        processed_images?: {
            thumb: string
            medium: string
            large: string
        }
        image_url?: string
        type?: string
        potencia_kwp?: number
        price?: string
    }
    category?: 'panels' | 'inverters' | 'kits' | 'batteries' | 'structures'
}

const ProductCard = ({ product, category = 'panels' }: ProductCardProps) => {
    const custom = useCatalogCustomization()
    const getTierBadge = (tier?: string) => {
        switch (tier) {
            case 'XPP':
                return 'ysh-badge-tier-xpp'
            case 'PP':
                return 'ysh-badge-tier-pp'
            case 'P':
                return 'ysh-badge-tier-p'
            case 'M':
                return 'ysh-badge-tier-m'
            case 'G':
                return 'ysh-badge-tier-g'
            default:
                return 'ysh-badge-tier-p'
        }
    }

    const getCategoryIcon = () => {
        switch (category) {
            case 'panels':
                return '☀️'
            case 'inverters':
                return '⚡'
            case 'kits':
                return '📦'
            case 'batteries':
                return '🔋'
            case 'structures':
                return '🏗️'
            default:
                return '☀️'
        }
    }

    const formatPrice = (price: number | undefined) => {
        if (!price) return 'Sob Consulta'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const imageUrl = product.processed_images?.medium ||
        product.processed_images?.thumb ||
        product.image_url ||
        '/placeholder-product.jpg'

    const displayPrice = product.price_brl || (product.price ? parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.')) : undefined)
    const power = product.kwp || product.potencia_kwp

    const extraBadges = custom.extraBadges?.(product) || []
    const primaryCta = custom.primaryCta?.(product)
    const secondaryCta = custom.secondaryCta?.(product)

    const highlight = custom.highlightSpecs?.(product as any)

    return (
        <div className="ysh-product-card group">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={product.name}
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
                            aria-label="Adicionar ao carrinho"
                        >
                            <ShoppingCart className="w-4 h-4 text-gray-900" />
                        </button>
                    </div>
                </div>

                {/* Tier Badge + Extra Badges */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    {product.tier_recommendation && product.tier_recommendation.length > 0 && (
                        <Badge className={getTierBadge(product.tier_recommendation[0])}>
                            {product.tier_recommendation[0]}
                        </Badge>
                    )}
                    {extraBadges.map((b, i) => (
                        <Badge key={i} className="bg-white/90 text-gray-800 border border-gray-200">
                            {b}
                        </Badge>
                    ))}
                </div>

                {/* Category Icon / Manufacturer Logo */}
                <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    {(() => {
                        const logo = custom.logoFor?.(product.manufacturer)
                        if (logo) {
                            return (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={logo} alt={product.manufacturer || 'brand'} className="w-full h-full object-contain p-1" />
                            )
                        }
                        return <span className="text-sm">{getCategoryIcon()}</span>
                    })()}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Manufacturer & Model */}
                <div className="mb-2">
                    {product.manufacturer && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.manufacturer}
                        </p>
                    )}
                    {product.model && (
                        <p className="text-sm text-gray-600 font-medium">
                            {product.model}
                        </p>
                    )}
                </div>

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/produtos/${product.id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                    </Link>
                </h3>

                {/* Specifications */}
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    {power && (
                        <div className="flex items-center gap-1">
                            <span className="font-medium">{power}kWp</span>
                        </div>
                    )}
                    {product.efficiency_pct && (
                        <div className="flex items-center gap-1">
                            <span>{product.efficiency_pct}% η</span>
                        </div>
                    )}
                    {highlight?.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                            <span className="text-gray-500">{s.label}:</span>
                            <span className="font-medium">{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="ysh-price">
                        {formatPrice(displayPrice)}
                    </div>
                    <div className="flex gap-2">
                        {secondaryCta && (
                            secondaryCta.href ? (
                                <Link href={secondaryCta.href}>
                                    <button className="ysh-btn-outline text-sm px-3 py-1">
                                        {secondaryCta.label}
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    className="ysh-btn-outline text-sm px-3 py-1"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        secondaryCta.onClick?.(product)
                                    }}
                                >
                                    {secondaryCta.label}
                                </button>
                            )
                        )}
                        {primaryCta ? (
                            primaryCta.href ? (
                                <Link href={primaryCta.href}>
                                    <button className="ysh-btn-primary text-sm px-3 py-1">
                                        {primaryCta.label}
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    className="ysh-btn-primary text-sm px-3 py-1"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        primaryCta.onClick?.(product)
                                    }}
                                >
                                    {primaryCta.label}
                                </button>
                            )
                        ) : (
                            <Link href={`/produtos/${product.id}`}>
                                <button className="ysh-btn-primary text-sm px-3 py-1">Ver Detalhes</button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
