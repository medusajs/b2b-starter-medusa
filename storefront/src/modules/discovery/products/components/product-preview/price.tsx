import { VariantPrice } from "@/lib/util/get-product-price"
import { Text, clx } from "@medusajs/ui"

type PreviewPriceProps = {
  price: VariantPrice
  priceListType?: "b2b" | "b2c" | "default"
  showPriceListBadge?: boolean
}

export default async function PreviewPrice({
  price,
  priceListType = "default",
  showPriceListBadge = false
}: PreviewPriceProps) {
  if (!price) {
    return null
  }

  const isPriceListPrice = priceListType !== "default"

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

      <div className="flex items-center gap-2">
        <Text
          className={clx("text-neutral-950 font-medium text-lg", {
            "text-ui-fg-interactive": price.price_type === "sale",
            "text-blue-600": isPriceListPrice && priceListType === "b2b",
          })}
          data-testid="price"
        >
          {price.calculated_price}
        </Text>

        {showPriceListBadge && isPriceListPrice && (
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {priceListType === "b2b" ? "Preço B2B" : "Oferta"}
          </span>
        )}
      </div>
    </>
  )
}
