import { listCategories } from "@/lib/data/categories"
import { retrieveCustomer } from "@/lib/data/customer"
import SkeletonProductGrid from "@/modules/common/skeletons/templates/skeleton-product-grid"
import RefinementList from "@/modules/discovery/store/components/refinement-list"
import { classeHandleMap } from "@/lib/mappings"
import { SortOptions } from "@/modules/discovery/store/components/refinement-list/sort-products"
import StoreBreadcrumb from "@/modules/discovery/store/components/store-breadcrumb"
import PaginatedProducts from "@/modules/discovery/store/templates/paginated-products"
import { Metadata } from "next"
import { Suspense } from "react"

export const dynamicParams = true

export const metadata: Metadata = {
  title: "Loja - Yello Solar Hub",
  description:
    "Explore todos os nossos produtos solares: kits completos, painéis, inversores e acessórios com badges de potência, ROI e estoque.",
}

type Params = {
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
    classe?: string
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, classe, q } = searchParams

  const sort = sortBy || "created_at"
  const pageNumber = page ? parseInt(page) : 1

  const categories = await listCategories()
  const customer = await retrieveCustomer()

  let currentCategory: any | undefined
  let selectedCategoryId: string | undefined

  if (classe && Array.isArray(categories)) {
    const needles = classeHandleMap[classe] || []
    const found = categories.find((c) => {
      const h = (c.handle || "").toLowerCase()
      return needles.some((n) => h.includes(n))
    })
    if (found) {
      currentCategory = found
      selectedCategoryId = found.id
    }
  }

  return (
    <div className="bg-neutral-100">
      <div className="flex flex-col py-6 content-container gap-4" data-testid="category-container">
        <StoreBreadcrumb />
        <div className="flex flex-col small:flex-row small:items-start gap-3">
          <RefinementList sortBy={sort} categories={categories} currentCategory={currentCategory} />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                countryCode={params.countryCode}
                customer={customer}
                categoryId={selectedCategoryId}
                searchQuery={q}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
