import { ArrowUturnLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Text } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import CategoryBreadcrumb from "../category-breadcrumb"
import { Pagination } from "@modules/store/components/pagination"

const PRODUCT_LIMIT = 12

export default function CategoryTemplate({
  categories,
  currentCategory,
  sortBy,
  page,
  countryCode,
  products,
  count,
  region,
}: {
  categories: HttpTypes.StoreProductCategory[]
  currentCategory: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  products: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!currentCategory || !countryCode) notFound()

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  return (
    <div className="bg-neutral-100">
      <div
        className="flex flex-col py-6 content-container gap-4"
        data-testid="category-container"
      >
        <CategoryBreadcrumb
          categories={categories}
          category={currentCategory}
        />
        <div className="flex flex-col small:flex-row small:items-start gap-3">
          <RefinementList
            sortBy={sort}
            categories={categories}
            currentCategory={currentCategory}
            listName={currentCategory.name}
            data-testid="sort-by-container"
          />
          <div className="w-full">
            {currentCategory.products?.length === 0 ? (
              <Container className="flex flex-col gap-2 justify-center text-center items-center text-sm text-neutral-500">
                <Text className="font-medium">
                  No products found for this category.
                </Text>
                <LocalizedClientLink
                  href="/store"
                  className="flex gap-2 items-center"
                >
                  <Button variant="secondary">
                    Back to all products
                    <ArrowUturnLeft className="w-4 h-4" />
                  </Button>
                </LocalizedClientLink>
              </Container>
            ) : (
              <Suspense
                fallback={
                  <SkeletonProductGrid
                    count={currentCategory.products?.length}
                  />
                }
              >
                <ul
                  className="grid grid-cols-1 w-full small:grid-cols-3 medium:grid-cols-4 gap-3"
                  data-testid="products-list"
                >
                  {products.length > 0 ? (
                    products.map((p) => {
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
                    page={pageNumber}
                    totalPages={totalPages}
                  />
                )}
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
