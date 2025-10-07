import { Metadata } from "next"
import dynamic from "next/dynamic"
import { Suspense } from "react"
import Link from "next/link"

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
  const qs = new URLSearchParams({ limit: searchParams?.limit || "24", page: searchParams?.page || "1" })
  if (searchParams?.manufacturer) qs.set("manufacturer", searchParams.manufacturer)
  if (searchParams?.minPrice) qs.set("minPrice", searchParams.minPrice)
  if (searchParams?.maxPrice) qs.set("maxPrice", searchParams.maxPrice)
  if (searchParams?.availability) qs.set("availability", searchParams.availability)
  if (searchParams?.sort) qs.set("sort", searchParams.sort)
  const res = await fetch(`${backend}/store/catalog/${category}?${qs.toString()}`, { next: { revalidate: 600 } })
  if (!res.ok) return { products: [], total: 0, page: 1, limit: Number(qs.get("limit")) || 24 }
  return res.json()
}

async function listManufacturers() {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const res = await fetch(`${backend}/store/catalog/manufacturers`, { next: { revalidate: 3600 } })
  if (!res.ok) return [] as string[]
  const json = await res.json()
  return (json.manufacturers || []) as string[]
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<Params>, searchParams?: { [k: string]: string } }) {
  const p = await params
  const { category } = p
  const data = await listCatalog(category, searchParams)
  const products = data.products
  const total = data.total
  const currentPage = Number(searchParams?.page || data.page || 1)
  const pageSize = Number(searchParams?.limit || data.limit || 24)
  const manufacturers = (data.facets?.manufacturers as string[] | undefined) || (await listManufacturers())

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

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
        <form className="grid grid-cols-1 md:grid-cols-6 gap-3" action="" method="get">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Fabricante</label>
            <select name="manufacturer" defaultValue={searchParams?.manufacturer || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Todos</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Preço mín. (BRL)</label>
            <input type="number" name="minPrice" defaultValue={searchParams?.minPrice || ""} className="w-full border rounded-md h-9 px-2" min="0" step="1" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Preço máx. (BRL)</label>
            <input type="number" name="maxPrice" defaultValue={searchParams?.maxPrice || ""} className="w-full border rounded-md h-9 px-2" min="0" step="1" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Disponibilidade</label>
            <select name="availability" defaultValue={searchParams?.availability || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Todas</option>
              <option value="Disponivel">Disponível</option>
              <option value="Indisponivel">Indisponível</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Ordenar por</label>
            <select name="sort" defaultValue={searchParams?.sort || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Padrão</option>
              <option value="price_asc">Preço: menor → maior</option>
              <option value="price_desc">Preço: maior → menor</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="ysh-btn-primary h-9 px-4">Filtrar</button>
            <Link href={`/${p.countryCode}/produtos/${category}`} className="ysh-btn-outline h-9 px-4">Limpar</Link>
          </div>
          {searchParams?.limit && <input type="hidden" name="limit" value={searchParams.limit} />}
          {searchParams?.page && <input type="hidden" name="page" value={searchParams.page} />}
        </form>
      </div>

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

      {/* Paginação */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 24)))
        if (totalPages <= 1) return null
        const makeHref = (pg: number) => {
          const sp = new URLSearchParams()
          if (searchParams?.manufacturer) sp.set("manufacturer", searchParams.manufacturer)
          if (searchParams?.minPrice) sp.set("minPrice", searchParams.minPrice)
          if (searchParams?.maxPrice) sp.set("maxPrice", searchParams.maxPrice)
          if (searchParams?.availability) sp.set("availability", searchParams.availability)
          if (searchParams?.sort) sp.set("sort", searchParams.sort)
          sp.set("page", String(pg))
          sp.set("limit", String(pageSize))
          return `?${sp.toString()}`
        }
        const current = currentPage
        const pages: number[] = []
        const start = Math.max(1, current - 2)
        const end = Math.min(totalPages, current + 2)
        for (let i = start; i <= end; i++) pages.push(i)
        return (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Link className={`ysh-btn-outline px-3 py-1 ${current <= 1 ? 'pointer-events-none opacity-50' : ''}`} href={current > 1 ? makeHref(current - 1) : "#"}>Anterior</Link>
            {pages.map((pg) => (
              <Link key={pg} className={`px-3 py-1 rounded-md border ${pg === current ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 hover:bg-neutral-100'}`} href={makeHref(pg)}>
                {pg}
              </Link>
            ))}
            <Link className={`ysh-btn-outline px-3 py-1 ${current >= totalPages ? 'pointer-events-none opacity-50' : ''}`} href={current < totalPages ? makeHref(current + 1) : "#"}>Próxima</Link>
          </div>
        )
      })()}
    </div>
  )
}
