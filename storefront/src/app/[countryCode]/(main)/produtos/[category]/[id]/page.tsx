import { Metadata } from "next"
import { getBaseURL } from "@/lib/util/env"
import Image from "next/image"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { LeadQuoteProvider, useLeadQuote } from "@/modules/lead-quote/context"
import Button from "@/modules/common/components/button"
import Link from "next/link"

type Params = { countryCode: string; category: string; id: string }

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { countryCode, category, id } = (await params) as any
  const canonical = `${getBaseURL()}/${countryCode}/produtos/${category}/${id}`
  return {
    title: `Produto | ${category} | ${id}`,
    alternates: { canonical },
  }
}

async function getProduct(category: string, id: string) {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const res = await fetch(`${backend}/store/catalog/${category}/${id}`, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  const json = await res.json()
  return json.product
}

function AddToQuoteButton({ product }: { product: any }) {
  "use client"
  const { add } = useLeadQuote()
  return (
    <Button onClick={() => add({ id: product.id, category: product.category, name: product.name, manufacturer: product.manufacturer, image_url: product.image_url, price_brl: product.price_brl })}>
      Adicionar à cotação
    </Button>
  )
}

export default async function CatalogProductPage({ params }: { params: Promise<Params> }) {
  const { category, id } = await params
  const product = await getProduct(category, id)

  if (!product) {
    return (
      <div className="content-container py-12">
        <h1 className="text-2xl font-semibold">Produto não encontrado</h1>
        <p className="text-neutral-600 mt-2">Verifique o endereço ou navegue pelo catálogo.</p>
        <div className="mt-6">
          <Link href="/produtos" className="ysh-btn-outline">Voltar ao catálogo</Link>
        </div>
      </div>
    )
  }

  return (
    <LeadQuoteProvider>
    <div className="content-container py-8">
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [product.processed_images?.large || product.processed_images?.medium || product.image_url].filter(Boolean),
            brand: product.manufacturer ? { "@type": "Brand", name: product.manufacturer } : undefined,
            sku: product.sku,
            offers: typeof product.price_brl === 'number' ? {
              "@type": "Offer",
              priceCurrency: "BRL",
              price: product.price_brl,
              availability: product.availability?.toLowerCase()?.includes('dispon') ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            } : undefined,
          }),
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="relative w-full aspect-square bg-neutral-100 rounded-lg overflow-hidden">
          <Image
            src={product.processed_images?.large || product.processed_images?.medium || product.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950 mb-2">{product.name}</h1>
          {product.manufacturer && (
            <p className="text-neutral-600 mb-4">Fabricante: <span className="font-medium">{product.manufacturer}</span></p>
          )}
          {product.model && (
            <p className="text-neutral-600 mb-4">Modelo: <span className="font-medium">{product.model}</span></p>
          )}

          <div className="text-xl font-semibold ysh-price mb-6">
            {typeof product.price_brl === "number"
              ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price_brl)
              : (product.price || "Sob consulta")}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-neutral-700 mb-8">
            {product.potencia_kwp && (
              <div>
                <div className="text-neutral-500">Potência</div>
                <div className="font-medium">{product.potencia_kwp} kWp</div>
              </div>
            )}
            {product.efficiency_pct && (
              <div>
                <div className="text-neutral-500">Eficiência</div>
                <div className="font-medium">{product.efficiency_pct}%</div>
              </div>
            )}
            {product.type && (
              <div>
                <div className="text-neutral-500">Tipo</div>
                <div className="font-medium">{product.type}</div>
              </div>
            )}
            {product.distributor && (
              <div>
                <div className="text-neutral-500">Distribuidor</div>
                <div className="font-medium">{product.distributor}</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <LocalizedClientLink href="/contato" className="ysh-btn-primary">Solicitar Cotação</LocalizedClientLink>
            <LocalizedClientLink href="/produtos" className="ysh-btn-outline">Voltar ao Catálogo</LocalizedClientLink>
            <AddToQuoteButton product={product} />
          </div>
        </div>
      </div>

      {category === "kits" && product.panels && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Componentes do Kit</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Painéis</h3>
              {product.panels?.map((p: any, idx: number) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span>{p.brand} {p.power_w}W</span>
                  <span className="font-medium">{p.quantity}x</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h3 className="font-medium mb-2">Inversores</h3>
              {product.inverters?.map((inv: any, idx: number) => (
                <div key={idx} className="flex justify-between text-neutral-700">
                  <span>{inv.brand} {inv.power_kw}kW</span>
                  <span className="font-medium">{inv.quantity}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </LeadQuoteProvider>
  )
}
