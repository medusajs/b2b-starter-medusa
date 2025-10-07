import { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Suspense } from "react"

const ProductCard = dynamic(() => import("@/modules/catalog/components/ProductCard"))
const KitCard = dynamic(() => import("@/modules/catalog/components/KitCard"))

type SearchParams = { [k: string]: string }

export const revalidate = 300

export const metadata: Metadata = {
  title: "Buscar produtos - Yello Solar Hub",
}

async function searchCatalog(sp: SearchParams) {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const qs = new URLSearchParams()
  if (sp.q) qs.set("q", sp.q)
  if (sp.category) qs.set("category", sp.category)
  qs.set("page", sp.page || "1")
  qs.set("limit", sp.limit || "24")
  if (sp.manufacturer) qs.set("manufacturer", sp.manufacturer)
  if (sp.minPrice) qs.set("minPrice", sp.minPrice)
  if (sp.maxPrice) qs.set("maxPrice", sp.maxPrice)
  if (sp.availability) qs.set("availability", sp.availability)
  if (sp.sort) qs.set("sort", sp.sort)

  const res = await fetch(`${backend}/store/catalog/search?${qs.toString()}`, { next: { revalidate: 300 } })
  if (!res.ok) return { products: [], total: 0, page: 1, limit: Number(sp.limit || 24) }
  return res.json()
}

async function listManufacturers() {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const res = await fetch(`${backend}/store/catalog/manufacturers`, { next: { revalidate: 3600 } })
  if (!res.ok) return [] as string[]
  const json = await res.json()
  return (json.manufacturers || []) as string[]
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const data = await searchCatalog(searchParams)
  const manufacturers = await listManufacturers()
  const currentPage = Number(searchParams.page || data.page || 1)
  const pageSize = Number(searchParams.limit || data.limit || 24)
  const total = data.total || data.results || 0

  return (
    <div className="content-container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-neutral-950">Resultados da busca</h1>
        <p className="text-neutral-600">{total} itens encontrados</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border">
        <form className="grid grid-cols-1 md:grid-cols-7 gap-3" action="" method="get">
          <div className="md:col-span-2">
            <label className="block text-xs text-neutral-600 mb-1">Termo</label>
            <input type="text" name="q" defaultValue={searchParams.q || ""} className="w-full border rounded-md h-9 px-2" placeholder="Buscar produtos" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Categoria</label>
            <select name="category" defaultValue={searchParams.category || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Todas</option>
              <option value="kits">Kits</option>
              <option value="panels">Painéis</option>
              <option value="inverters">Inversores</option>
              <option value="batteries">Baterias</option>
              <option value="structures">Estruturas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Fabricante</label>
            <select name="manufacturer" defaultValue={searchParams.manufacturer || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Todos</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Ordenar por</label>
            <select name="sort" defaultValue={searchParams.sort || ""} className="w-full border rounded-md h-9 px-2">
              <option value="">Padrão</option>
              <option value="price_asc">Preço: menor → maior</option>
              <option value="price_desc">Preço: maior → menor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Itens/página</label>
            <select name="limit" defaultValue={String(pageSize)} className="w-full border rounded-md h-9 px-2">
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="ysh-btn-primary h-9 px-4">Buscar</button>
            <Link href={`./search`} className="ysh-btn-outline h-9 px-4">Limpar</Link>
          </div>
          {searchParams.page && <input type="hidden" name="page" value={searchParams.page} />}
        </form>
      </div>

      <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}>
        {data.products?.map((item: any) => (
          <Suspense key={item.id}>
            {item.category === 'kits' ? (
              <KitCard kit={item} />
            ) : (
              <ProductCard product={item} category={item.category || 'panels'} />
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
          if (searchParams.q) sp.set("q", searchParams.q)
          if (searchParams.category) sp.set("category", searchParams.category)
          if (searchParams.manufacturer) sp.set("manufacturer", searchParams.manufacturer)
          if (searchParams.sort) sp.set("sort", searchParams.sort)
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

