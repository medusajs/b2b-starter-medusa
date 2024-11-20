"use client"

import { SortProvider } from "@lib/context/sort-context"
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import CategoryList from "./category-list"
import SearchInResults from "./search-in-results"
import SortProducts from "./sort-products"

type RefinementListProps = {
  listName?: string
  "data-testid"?: string
  categories?: HttpTypes.StoreProductCategory[]
  currentCategory?: HttpTypes.StoreProductCategory
}

const RefinementList = ({
  listName,
  "data-testid": dataTestId,
  categories,
  currentCategory,
}: RefinementListProps) => {
  return (
    <div className="flex flex-col divide-neutral-200 small:w-1/5 w-full gap-3">
      <Container className="flex flex-col divide-y divide-neutral-200 p-0 w-full">
        <SearchInResults listName={listName} />
        <SortProvider>
          <SortProducts data-testid={dataTestId} />
        </SortProvider>
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
