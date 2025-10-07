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

  // Tenta recuperar produto para enriquecer OG/Twitter
  try {
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL as string
    const res = await fetch(`${backend}/store/catalog/${category}/${id}`, { next: { revalidate: 600 } })
    if (res.ok) {
      const json = await res.json()
      const p = json.product || {}
      const title = p.name || `Produto | ${category} | ${id}`
      const descParts: string[] = []
      if (p.manufacturer) descParts.push(String(p.manufacturer))
      if (p.potencia_kwp) descParts.push(`${p.potencia_kwp} kWp`)
      if (p.type) descParts.push(String(p.type))
      const description = descParts.join(" • ") || undefined
      const img = p?.processed_images?.large || p?.processed_images?.medium || p?.image_url

      return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
          title,
          description: description || undefined,
          url: canonical,
          siteName: "Yello Solar Hub",
          type: "website",
          images: img ? [{ url: img } as any] : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title,
          description: description || undefined,
          images: img ? [img] : undefined,
        },
      }
    }
  } catch { }

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

        {/* Resumo técnico com ícones */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {product.potencia_kwp && (
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
              {/* icon placeholder: unicode bolt to avoid extra imports */}
              <span className="w-5 h-5 inline-flex items-center justify-center text-yellow-600">⚡</span>
              <div>
                <div className="text-xs text-neutral-500">Potência</div>
                <div className="text-sm font-semibold">{product.potencia_kwp} kWp</div>
              </div>
            </div>
          )}
          {product.efficiency_pct && (
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
              <span className="w-5 h-5 inline-flex items-center justify-center text-blue-600">⎍</span>
              <div>
                <div className="text-xs text-neutral-500">Eficiência</div>
                <div className="text-sm font-semibold">{product.efficiency_pct}%</div>
              </div>
            </div>
          )}
          {(product as any).voltage_v && (
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
              <span className="w-5 h-5 inline-flex items-center justify-center text-green-600">∿</span>
              <div>
                <div className="text-xs text-neutral-500">Tensão</div>
                <div className="text-sm font-semibold">{(product as any).voltage_v} V</div>
              </div>
            </div>
          )}
          {product.warranty && (
            <div className="bg-white rounded-lg border p-4 flex items-center gap-3">
              <span className="w-5 h-5 inline-flex items-center justify-center text-emerald-600">✓</span>
              <div>
                <div className="text-xs text-neutral-500">Garantia</div>
                <div className="text-sm font-semibold">{typeof product.warranty === 'string' ? product.warranty : 'Disponível'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Seções enriquecidas */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {(product.specs || product.warranty || product.installation || product.compatibility) && (
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold mb-3">Especificações</h2>
              {/* specs podem vir como objeto ou array */}
              {product.specs && (
                Array.isArray(product.specs) ? (
                  <ul className="list-disc pl-5 text-sm text-neutral-700">
                    {(product.specs as any[]).map((s: any, idx: number) => (
                      <li key={idx}>{typeof s === 'string' ? s : JSON.stringify(s)}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-neutral-700">
                      <tbody>
                        {Object.entries(product.specs as Record<string, any>).map(([k, v]) => (
                          <tr key={k} className="border-b last:border-0">
                            <th className="py-2 pr-4 font-medium text-neutral-500 whitespace-nowrap">{k}</th>
                            <td className="py-2 text-neutral-900">{typeof v === 'string' ? v : JSON.stringify(v)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {product.warranty && (
                <div className="mt-4">
                  <h3 className="font-medium mb-1">Garantia</h3>
                  <pre className="whitespace-pre-wrap text-sm text-neutral-700">{typeof product.warranty === 'string' ? product.warranty : JSON.stringify(product.warranty, null, 2)}</pre>
                </div>
              )}
              {product.installation && (
                <div className="mt-4">
                  <h3 className="font-medium mb-1">Instalação</h3>
                  <pre className="whitespace-pre-wrap text-sm text-neutral-700">{typeof product.installation === 'string' ? product.installation : JSON.stringify(product.installation, null, 2)}</pre>
                </div>
              )}
              {product.compatibility && (
                <div className="mt-4">
                  <h3 className="font-medium mb-1">Compatibilidade</h3>
                  {Array.isArray(product.compatibility) ? (
                    <ul className="list-disc pl-5 text-sm text-neutral-700">
                      {(product.compatibility as any[]).map((c: any, idx: number) => (
                        <li key={idx}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                      ))}
                    </ul>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm text-neutral-700">{JSON.stringify(product.compatibility, null, 2)}</pre>
                  )}
                </div>
              )}
            </div>
          )}
          {product.datasheet_url && (
            <div className="bg-white rounded-lg border p-4 h-fit">
              <h2 className="text-lg font-semibold mb-3">Documentos</h2>
              {String(product.datasheet_url).toLowerCase().endsWith('.pdf') ? (
                <div className="aspect-[16/9] w-full">
                  <iframe
                    src={`${product.datasheet_url}#toolbar=0`}
                    className="w-full h-full rounded-md border"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <a href={product.datasheet_url as string} target="_blank" rel="noopener noreferrer" className="ysh-btn-outline mt-3 inline-block">
                Abrir ficha técnica
              </a>
            </div>
          )}
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
