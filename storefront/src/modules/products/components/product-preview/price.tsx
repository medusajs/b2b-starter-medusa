import { VariantPrice } from "@/lib/util/get-product-price"
import { Text, clx } from "@medusajs/ui"

// TODO: Price needs to access price list type
export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
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
