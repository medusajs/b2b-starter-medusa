import { listProductsWithSort } from "@/lib/data/products"
import { getRegion } from "@/lib/data/regions"
import ProductPreview from "@/modules/products/components/product-preview"
import { Pagination } from "@/modules/store/components/pagination"
import { SortOptions } from "@/modules/store/components/refinement-list/sort-products"
import { B2BCustomer } from "@/types"
import { Container } from "@medusajs/ui"
import { t } from "@/lib/i18n/copy"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  customer_group_id?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  customer,
  searchQuery,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  customer?: B2BCustomer | null
  searchQuery?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  } else if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  if (searchQuery && searchQuery.trim().length > 0) {
    // Medusa Store API supports `q` for free text search
    ;(queryParams as any).q = searchQuery.trim()
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    countryCode,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)
  const start = count === 0 ? 0 : (page - 1) * PRODUCT_LIMIT + 1
  const end = Math.min(page * PRODUCT_LIMIT, count)

  return (
    <section aria-label="Lista de produtos">
      <div className="flex items-center justify-between mb-2 text-sm text-neutral-600">
        <span aria-live="polite">
          {count === 0 ? (
            <>0 resultados</>
          ) : (
            <>Mostrando {start}–{end} de {count}</>
          )}
        </span>
      </div>
      <ul
        className="grid grid-cols-1 w-full small:grid-cols-3 medium:grid-cols-4 gap-3"
        data-testid="products-list"
        role="list"
      >
        {products.length > 0 ? (
          products.map((p) => {
            return (
              <li key={p.id} role="listitem">
                <ProductPreview product={p} region={region} />
              </li>
            )
          })
        ) : (
          <Container className="text-center text-sm text-neutral-500">
            {t("plp.empty_state")}
          </Container>
        )}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </section>
  )
}
