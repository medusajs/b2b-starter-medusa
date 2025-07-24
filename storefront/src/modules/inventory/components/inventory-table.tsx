"use client"

import { listProducts } from "@/lib/data/products"
import Thumbnail from "@/modules/products/components/thumbnail"
import { HttpTypes } from "@medusajs/types"
import { Badge, Table } from "@medusajs/ui"
import { useCallback, useState } from "react"
import { SearchProducts } from "./search"

export function InventoryTable({
  initialProducts,
  countryCode,
}: {
  initialProducts: HttpTypes.StoreProduct[]
  countryCode: string
}) {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(
    async (term: string) => {
      setError(null)
      setIsLoading(true)

      try {
        const {
          response: { products: searchResults },
        } = await listProducts({
          countryCode,
          queryParams: term ? { q: term } : undefined,
        })
        setProducts(searchResults)
      } catch (error) {
        setError("Failed to search products. Please try again.")
      } finally {
        setIsLoading(false)
      }
    },
    [countryCode]
  )

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          {error && <Badge className="bg-red-100 text-red-600">{error}</Badge>}
        </div>
        <SearchProducts onSearch={handleSearch} />
      </div>
      <div className="overflow-x-auto shadow-borders-base border-none rounded-xl">
        <div className="min-w-[800px]">
          <Table className="w-full  overflow-hidden">
            <Table.Header className="border-t-0">
              <Table.Row className="bg-neutral-100 border-none hover:!bg-neutral-100">
                <Table.HeaderCell className="px-4" colSpan={2}>
                  Product
                </Table.HeaderCell>
                <Table.HeaderCell className="px-4">SKUs</Table.HeaderCell>
                <Table.HeaderCell className="px-4 text-center">
                  Quantity
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body className="border-none">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-neutral-500">
                    <div className="flex items-center justify-center gap-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  return (
                    <Table.Row key={product.id}>
                      <Table.Cell className="px-0">
                        <Thumbnail
                          thumbnail={product.thumbnail}
                          size="square"
                          className="w-12"
                        />
                      </Table.Cell>
                      <Table.Cell className="pr-4">{product.title}</Table.Cell>
                      <Table.Cell className="px-4 whitespace-pre">
                        {product.variants?.map(({ sku }) => sku).join("\n")}
                      </Table.Cell>
                      <Table.Cell className="px-4 text-center whitespace-pre">
                        {product.variants
                          ?.map(
                            ({ inventory_quantity }) => inventory_quantity || 0
                          )
                          .join("\n")}
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  )
}
