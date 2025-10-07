import { Metadata } from "next"
import dynamic from "next/dynamic"
import { Suspense } from "react"

const ProductCard = dynamic(() => import("@/modules/catalog/components/ProductCard"))
const KitCard = dynamic(() => import("@/modules/catalog/components/KitCard"))

type Params = { countryCode: string; category: string }

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  const titleMap: Record<string, string> = {
    kits: "Kits Fotovoltaicos",
    panels: "Painéis Solares",
    inverters: "Inversores Solares",
    batteries: "Baterias",
    structures: "Estruturas",
  }
  return { title: `${titleMap[category] || "Catálogo"} - Yello Solar Hub` }
}

async function listCatalog(category: string, searchParams?: { [k: string]: string }) {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const qs = new URLSearchParams({ limit: "48", ...(searchParams || {}) })
  const res = await fetch(`${backend}/store/catalog/${category}?${qs.toString()}`, { next: { revalidate: 600 } })
  if (!res.ok) return { products: [], total: 0 }
  return res.json()
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<Params>, searchParams?: { [k: string]: string } }) {
  const { category } = await params
  const { products, total } = await listCatalog(category, searchParams)

  const isKits = category === "kits"
  const Title = () => (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold text-neutral-950 capitalize">{category}</h1>
      <p className="text-neutral-600">{total} itens encontrados</p>
    </div>
  )

  return (
    <div className="content-container py-10">
      <Title />
      <div className={`grid gap-6 ${isKits ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}` }>
        {products?.map((item: any) => (
          <Suspense key={item.id}>
            {isKits ? (
              <KitCard kit={item} />
            ) : (
              <ProductCard product={item} category={category as any} />
            )}
          </Suspense>
        ))}
      </div>
    </div>
  )
}

