import { getProductPrice } from "@/lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Text, clx } from "@medusajs/ui"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewAddToCart from "./preview-add-to-cart"
import PreviewPrice from "./price"
import { MinimalCustomerInfo } from "@/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
  customer,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  customer: MinimalCustomerInfo | null
}) {
  if (!product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  const inventoryQuantity = product.variants?.reduce((acc, variant) => {
    return acc + (variant.inventory_quantity || 0)
  }, 0) || 0

  const isLoggedIn = customer?.isLoggedIn ?? false
  const isApproved = customer?.isApproved ?? false

  return (
    <LocalizedClientLink href={`/products/${product.handle}`} className="group">
      <div
        data-testid="product-wrapper"
        className="flex flex-col gap-4 relative aspect-[3/5] w-full overflow-hidden p-4 bg-white shadow-borders-base rounded-lg group-hover:shadow-[0_0_0_4px_rgba(0,0,0,0.1)] transition-shadow ease-in-out duration-150"
      >
        <div className="w-full h-full p-10">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
          />
        </div>
        <div className="flex flex-col txt-compact-medium">
          <Text className="text-neutral-600 text-xs">SKU: {product.handle}</Text>
          <Text className="text-ui-fg-base font-medium" data-testid="product-title">
            {product.title}
          </Text>
        </div>
        <div className="flex flex-col gap-0">
          {cheapestPrice && <PreviewPrice price={cheapestPrice} customer={customer} />}
        </div>
        <div className="flex justify-between">
          {isLoggedIn && isApproved ? (
            <div className="flex flex-row gap-1 items-center">
              <Text className="text-neutral-600 text-xs">
                {inventoryQuantity < 100 ? `< 100` : `100+`} in stock
              </Text>
            </div>
          ) : (
            <div className="flex flex-row gap-1 items-center">
              <Text className="text-neutral-400 text-xs">
                {!isLoggedIn ? "Please log in to view stock" : "Contact us for stock"}
              </Text>
            </div>
          )}
          <PreviewAddToCart product={product} region={region} customer={customer} />
        </div>
      </div>
    </LocalizedClientLink>
  )
}
