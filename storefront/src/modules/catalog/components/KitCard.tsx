import { Badge } from "@medusajs/ui"
import { useCatalogCustomization } from "@/modules/catalog/context/customization"
import { Package, Sun, Battery, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLeadQuote } from "@/modules/lead-quote/context"

interface KitCardProps {
    kit: {
        id: string
        name: string
        potencia_kwp: number
        price_brl: number
        price: string
        estrutura: string
        centro_distribuicao: string
        panels: Array<{
            brand: string
            power_w: number
            quantity: number
        }>
        inverters: Array<{
            brand: string
            power_kw: number
            quantity: number
        }>
        batteries: Array<any>
        total_panels: number
        total_inverters: number
        total_power_w: number
        distributor: string
        processed_images?: {
            thumb: string
            medium: string
            large: string
        }
        image_url?: string
    }
}

const KitCard = ({ kit }: KitCardProps) => {
    let addToQuote: undefined | ((...args: any[]) => void)
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        addToQuote = useLeadQuote().add
    } catch {}
    const custom = useCatalogCustomization()
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const imageUrl = kit.processed_images?.medium ||
        kit.processed_images?.thumb ||
        kit.image_url ||
        '/placeholder-kit.jpg'

    const totalPowerKw = kit.total_power_w / 1000

    const extraBadges = custom.extraBadges?.(kit) || []

    const primaryCta = custom.primaryCta?.(kit)
    const secondaryCta = custom.secondaryCta?.(kit)

    return (
        <div className="ysh-product-card group">
            {/* Kit Image */}
            <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={kit.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Visualizar kit"
                        >
                            <Package className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                            className="p-2 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
                            aria-label="Adicionar kit à cotação"
                            onClick={(e) => {
                                e.preventDefault()
                                addToQuote?.({ id: kit.id, category: 'kits', name: kit.name, manufacturer: kit.distributor, image_url: imageUrl, price_brl: kit.price_brl })
                            }}
                        >
                            <span className="text-sm font-bold text-gray-900">+</span>
                        </button>
                    </div>
                </div>

                {/* Kit Badge + Extra Badges */}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    <Badge className="ysh-badge-tier-xpp">KIT COMPLETO</Badge>
                    {extraBadges.map((b, i) => (
                        <Badge key={i} className="bg-white/90 text-gray-800 border border-gray-200">
                            {b}
                        </Badge>
                    ))}
                </div>

                {/* Distributor */}
                <div className="absolute top-2 right-2">
                    <Badge className="bg-white text-gray-700 border border-gray-300">
                        {kit.distributor}
                    </Badge>
                </div>
            </div>

            {/* Kit Info */}
            <div className="p-4">
                {/* Kit Name */}
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link href={`/produtos/kits/${kit.id}`} className="hover:text-blue-600 transition-colors">
                        {kit.name}
                    </Link>
                </h3>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-900">{kit.potencia_kwp}kWp</div>
                            <div className="text-xs text-gray-500">Potência</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <div>
                            <div className="text-sm font-medium text-gray-900">{totalPowerKw}kW</div>
                            <div className="text-xs text-gray-500">Inversor</div>
                        </div>
                    </div>
                </div>

                {/* Components Summary */}
                <div className="text-xs text-gray-600 mb-4 space-y-1">
                    <div className="flex justify-between">
                        <span>Painéis:</span>
                        <span className="font-medium">{kit.total_panels}x {kit.panels[0]?.power_w}W</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Inversor:</span>
                        <span className="font-medium">{kit.inverters[0]?.brand} {kit.inverters[0]?.power_kw}kW</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Estrutura:</span>
                        <span className="font-medium">{kit.estrutura}</span>
                    </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="ysh-price text-xl">
                            {formatPrice(kit.price_brl)}
                        </div>
                        <div className="text-xs text-gray-500">
                            {kit.centro_distribuicao}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {secondaryCta && (
                            secondaryCta.href ? (
                                <Link href={secondaryCta.href}>
                                    <button className="ysh-btn-outline text-sm px-3 py-2">
                                        {secondaryCta.label}
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    className="ysh-btn-outline text-sm px-3 py-2"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        secondaryCta.onClick?.(kit)
                                    }}
                                >
                                    {secondaryCta.label}
                                </button>
                            )
                        )}
                        {!secondaryCta && (
                            <button
                                className="ysh-btn-outline text-sm px-3 py-2"
                                onClick={(e) => {
                                    e.preventDefault()
                                    addToQuote?.({ id: kit.id, category: 'kits', name: kit.name, manufacturer: kit.distributor, image_url: imageUrl, price_brl: kit.price_brl })
                                }}
                            >
                                Adicionar à cotação
                            </button>
                        )}
                        {primaryCta ? (
                            primaryCta.href ? (
                                <Link href={primaryCta.href}>
                                    <button className="ysh-btn-primary text-sm px-4 py-2">
                                        {primaryCta.label}
                                    </button>
                                </Link>
                            ) : (
                                <button
                                    className="ysh-btn-primary text-sm px-4 py-2"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        primaryCta.onClick?.(kit)
                                    }}
                                >
                                    {primaryCta.label}
                                </button>
                            )
                        ) : (
                            <Link href={`/produtos/kits/${kit.id}`}>
                                <button className="ysh-btn-primary text-sm px-4 py-2">Ver Kit</button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KitCard
