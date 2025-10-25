import { clx } from "@medusajs/ui"

import { getPercentageDiff } from "@/lib/util/get-precentage-diff"
import { convertToLocale } from "@/lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ItemTotalPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const ItemTotalPrice = ({ item, currencyCode }: ItemTotalPriceProps) => {
  const originalPrice = item.original_total
  const currentPrice = item.total
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col gap-x-2 text-ui-fg-subtle items-end">
      <div className="text-left">
        {hasReducedPrice && (
          <div>
            <p>
              <span className="line-through">
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </p>

            <span className="text-ui-fg-interactive">
              -{getPercentageDiff(originalPrice, currentPrice || 0)}%
            </span>
          </div>
        )}
        <span
          className={clx("text-base-regular", {
            "text-ui-fg-interactive": hasReducedPrice,
          })}
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default ItemTotalPrice
