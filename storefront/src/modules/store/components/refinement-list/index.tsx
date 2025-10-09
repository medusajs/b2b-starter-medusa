"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import { Container } from "@medusajs/ui"
import SearchInResults from "./search-in-results"
import { HttpTypes } from "@medusajs/types"
import CategoryList from "./category-list"

type RefinementListProps = {
  sortBy: SortOptions
  listName?: string
  "data-testid"?: string
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}

const RefinementList = ({
  sortBy,
  listName,
  "data-testid": dataTestId,
  categories,
  currentCategory,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    // Avoid polluting history when changing sort/search filters
    router.replace(`${pathname}?${query}`)
  }

  const hasActiveFilters = Array.from(searchParams.keys()).length > 0

  return (
    <div
      className="flex flex-col divide-neutral-200 small:w-1/5 w-full gap-3 small:sticky small:top-24"
      aria-label="Filtros e ordenação"
    >
      <Container className="flex flex-col divide-y divide-neutral-200 p-0 w-full">
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="sr-only">Busca e ordenação</span>
          <button
            type="button"
            className="text-xs text-neutral-600 hover:text-neutral-800 disabled:opacity-40"
            onClick={() => router.replace(pathname)}
            disabled={!hasActiveFilters}
            aria-disabled={!hasActiveFilters}
          >
            Limpar filtros
          </button>
        </div>
        <SearchInResults listName={listName} />
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />
      </Container>
      {categories && (
        <CategoryList
          categories={categories}
          currentCategory={currentCategory}
        />
      )}
    </div>
  )
}

export default RefinementList
