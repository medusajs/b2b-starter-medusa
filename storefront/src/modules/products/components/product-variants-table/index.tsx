import { addToCartBulk } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import { ShoppingCartSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Button, clx, Table } from "@medusajs/ui"
import { useState } from "react"
import BulkTableQuantity from "../bulk-table-quantity"

const ProductVariantsTable = ({
  product,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  countryCode: string
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [lineItemsMap, setLineItemsMap] = useState<Map<string, number>>(
    new Map()
  )

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: product.variants?.[0]?.id,
  })

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setLineItemsMap((prev) => {
      const newLineItems = new Map(prev)
      newLineItems.set(variantId, quantity)
      return newLineItems
    })
  }

  const handleAddToCart = async () => {
    setIsAdding(true)

    const lineItems = Array.from(lineItemsMap.entries()).map(
      ([variantId, quantity]) => ({
        variant_id: variantId,
        quantity,
      })
    )

    await addToCartBulk({
      lineItems,
      countryCode,
    })

    setIsAdding(false)
  }

  return (
    <>
      <Table className="w-full rounded-xl overflow-hidden shadow-borders-base border-none">
        <Table.Header className="border-t-0">
          <Table.Row className="bg-neutral-100 border-none">
            {product.options?.map((option) => (
              <Table.HeaderCell key={option.id} className="px-4 border-x">
                {option.title}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell className="px-4 border-x">Price</Table.HeaderCell>
            <Table.HeaderCell className="px-4 border-x">
              Quantity
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body className="border-none">
          {product.variants?.map((variant, index) => (
            <Table.Row
              key={variant.id}
              className={clx({
                "border-b-0": index === product.variants?.length! - 1,
              })}
            >
              {variant.options?.map((option) => (
                <Table.Cell key={option.id} className="px-4 border-x">
                  {option.value}
                </Table.Cell>
              ))}
              <Table.Cell className="px-4 border-x">
                {variantPrice?.calculated_price}
              </Table.Cell>
              <Table.Cell className="px-4 border-x">
                <BulkTableQuantity
                  variantId={variant.id}
                  onChange={handleQuantityChange}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button
        onClick={handleAddToCart}
        variant="primary"
        className="w-full h-10 rounded-full shadow-none"
        isLoading={isAdding}
        data-testid="add-product-button"
      >
        <ShoppingCartSolid />
        Add to cart
      </Button>
    </>
  )
}

export default ProductVariantsTable
