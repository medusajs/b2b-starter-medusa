import { VariantPrice } from "@/lib/util/get-product-price"
import { Text, clx } from "@medusajs/ui"
import { MinimalCustomerInfo } from "@/types"

// TODO: Price needs to access price list type
export default async function PreviewPrice({ 
  price,
  customer 
}: { 
  price: VariantPrice
  customer: MinimalCustomerInfo | null
}) {
  if (!price) {
    return null
  }

  const isLoggedIn = customer?.isLoggedIn ?? false
  const isApproved = customer?.isApproved ?? false

  if (!isLoggedIn || !isApproved) {
    return (
      <Text className="text-neutral-600 text-sm">
        {!isLoggedIn ? "Please log in to view pricing" : "Contact us for pricing"}
      </Text>
    )
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}

      <Text
        className={clx("text-neutral-950 font-medium text-lg", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  )
}
