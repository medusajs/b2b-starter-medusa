"use client"

import { useSort } from "@lib/context/sort-context"
import { listProductsWithSort } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { useCallback, useEffect, useState } from "react"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

const PaginatedProducts = ({
  products,
  categoryId,
  collectionId,
  countryCode,
  region,
}: {
  products: HttpTypes.StoreProduct[]
  categoryId?: string
  collectionId?: string
  countryCode: string
  region: HttpTypes.StoreRegion
}) => {
  const { sortBy } = useSort()
  const [page, setPage] = useState(1)
  const [productsState, setProductsState] =
    useState<HttpTypes.StoreProduct[]>(products)
  const [count, setCount] = useState(products.length)

  let queryParams: PaginatedProductsParams = {
    limit: PRODUCT_LIMIT,
  }

  if (categoryId) {
    queryParams.category_id = [categoryId]
  } else if (collectionId) {
    queryParams.id = [collectionId]
  }

  const getProducts = useCallback(async () => {
    const {
      response: { products, count },
    } = await listProductsWithSort({
      page,
      sortBy,
      countryCode,
      queryParams,
    })

    return { products, count }
  }, [page, sortBy, countryCode, queryParams])

  useEffect(() => {
    getProducts().then(({ products, count }) => {
      setProductsState(products)
      setCount(count)
    })
  }, [sortBy, page])

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <>
      <ul
        className="grid grid-cols-1 w-full small:grid-cols-3 medium:grid-cols-4 gap-3"
        data-testid="products-list"
      >
        {productsState.length > 0 ? (
          productsState.map((p) => {
            return (
              <li key={p.id}>
                <ProductPreview product={p} region={region} />
              </li>
            )
          })
        ) : (
          <Container className="text-center text-sm text-neutral-500">
            No products found for this category.
          </Container>
        )}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

export default PaginatedProducts
