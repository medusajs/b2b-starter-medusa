import { Badge } from "@medusajs/ui"
import { useCatalogCustomization } from "@/modules/catalog/context/customization"
import { Heart, ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { useLeadQuote } from "@/modules/lead-quote/context"
import { ProductSKU, ProductModel } from "@/modules/catalog/components/product-identifiers"
import { CategoryIcon, type ProductCategory } from "@/modules/catalog/components/CategoryIcon"
import { useVariant, trackExperimentEvent } from "@/lib/experiments"
import { STATIC_BLUR_PLACEHOLDER } from "@/lib/blur-placeholder"
import { trackSKUCopy, trackModelLinkClick, trackProductView } from "@/lib/sku-analytics"

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
        modalidade?: string // on-grid, hibrido, off-grid, eaas, ppa
        classe_consumidora?: string[] // residencial-b1, rural-b2, comercial-b3, condominios, industria
        roi_estimado?: number // em anos
        blurDataURL?: string // Blur placeholder for smooth image loading
    }
    category?: ProductCategory
}

const ProductCard = ({ product, category = 'panels' }: ProductCardProps) => {
    const lead = (() => { try { return require("react").useContext(require("@/modules/lead-quote/context").default) } catch { return null } })
    // use hook safely
    let addToQuote: undefined | ((...args: any[]) => void)
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        addToQuote = useLeadQuote().add
    } catch { }
    const custom = useCatalogCustomization()

    // A/B Test: CTA Copy Variants
    const ctaText = useVariant({
        A: 'Ver Detalhes',
        B: 'Explorar Produto'
    })
    const addToQuoteText = useVariant({
        A: 'Adicionar à cotação',
        B: '+ Adicionar ao orçamento'
    })
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

    // Remover getCategoryIcon - agora usamos o componente CategoryIcon

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
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    quality={85}
                    placeholder={product.blurDataURL ? "blur" : undefined}
                    blurDataURL={product.blurDataURL || STATIC_BLUR_PLACEHOLDER}
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100" role="group" aria-label="Ações do produto">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            aria-label={`Visualizar ${product.name}`}
                        >
                            <Eye className="w-4 h-4 text-gray-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                            aria-label={`Adicionar ${product.name} aos favoritos`}
                        >
                            <Heart className="w-4 h-4 text-gray-700" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="p-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2"
                            aria-label={`Adicionar ${product.name} à cotação`}
                            data-tracking-event="add_to_quote_hover"
                            data-product-id={product.id}
                            data-category={category}
                            onClick={(e) => {
                                e.preventDefault()
                                addToQuote?.({ id: product.id, category, name: product.name, manufacturer: product.manufacturer, image_url: imageUrl, price_brl: displayPrice })
                                trackProductView(product.id, category)
                                try { require("@/modules/analytics/events").sendEvent("add_to_quote", { id: product.id, category }) } catch { }
                            }}
                        >
                            <ShoppingCart className="w-4 h-4 text-gray-900" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Tier Badge + Extra Badges + Modalidade + ROI */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap max-w-[70%]">
                    {product.tier_recommendation && product.tier_recommendation.length > 0 && (
                        <Badge className={getTierBadge(product.tier_recommendation[0])}>
                            {product.tier_recommendation[0]}
                        </Badge>
                    )}
                    {product.modalidade && (
                        <Badge className="bg-blue-500/90 text-white text-xs px-2 py-0.5">
                            {product.modalidade}
                        </Badge>
                    )}
                    {product.roi_estimado && (
                        <Badge className="bg-green-500/90 text-white text-xs px-2 py-0.5">
                            ROI {product.roi_estimado}a
                        </Badge>
                    )}
                    {extraBadges.map((b, i) => (
                        <Badge key={i} className="bg-white/90 text-gray-800 border border-gray-200">
                            {b}
                        </Badge>
                    ))}
                </div>

                {/* Category Icon / Manufacturer Logo */}
                <div className="absolute top-2 right-2">
                    {(() => {
                        const logo = custom.logoFor?.(product.manufacturer)
                        if (logo) {
                            return (
                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden relative">
                                    <Image
                                        src={logo}
                                        alt={product.manufacturer || 'brand'}
                                        fill
                                        className="object-contain p-1"
                                        sizes="32px"
                                        loading="lazy"
                                        quality={90}
                                    />
                                </div>
                            )
                        }
                        return <CategoryIcon category={category || 'others'} size="md" />
                    })()}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* Manufacturer & Model - Componente Padronizado */}
                {product.manufacturer && product.model && (
                    <div className="mb-2">
                        <ProductModel
                            manufacturer={product.manufacturer}
                            model={product.model}
                            size="sm"
                            link={false}
                        />
                    </div>
                )}

                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    <LocalizedClientLink href={`/produtos/${category}/${product.id}`} className="hover:text-blue-600 transition-colors">
                        {product.name}
                    </LocalizedClientLink>
                </h3>

                {/* SKU - Componente Padronizado */}
                {product.sku && (
                    <div className="mb-3">
                        <ProductSKU
                            sku={product.sku}
                            size="sm"
                            copyable={true}
                        />
                    </div>
                )}

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

                {/* Classes Consumidoras */}
                {product.classe_consumidora && product.classe_consumidora.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {product.classe_consumidora.map((classe) => (
                            <span key={classe} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {classe}
                            </span>
                        ))}
                    </div>
                )}

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
                        {!secondaryCta && (
                            <button
                                className="ysh-btn-outline text-sm px-3 py-1"
                                onClick={(e) => {
                                    e.preventDefault()
                                    addToQuote?.({ id: product.id, category, name: product.name, manufacturer: product.manufacturer, image_url: imageUrl, price_brl: displayPrice })
                                    trackProductView(product.id, category)
                                    try { require("@/modules/analytics/events").sendEvent("add_to_quote", { id: product.id, category }) } catch { }
                                    trackExperimentEvent('product_card_cta', 'add_to_quote_click', { product_id: product.id, category })
                                }}
                            >
                                {addToQuoteText}
                            </button>
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
                            <LocalizedClientLink href={`/produtos/${category}/${product.id}`}>
                                <button
                                    className="ysh-btn-primary text-sm px-3 py-1"
                                    data-tracking-event="view_product_details"
                                    data-product-id={product.id}
                                    data-category={category}
                                    onClick={() => {
                                        trackProductView(product.id, category)
                                        trackExperimentEvent('product_card_cta', 'view_details_click', { product_id: product.id, category })
                                    }}
                                >
                                    {ctaText}
                                </button>
                            </LocalizedClientLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductCard
