"use client"

import React, { useMemo } from "react"

import { AdminOrderLineItem, AdminOrderPreview } from "@medusajs/types"
import OrderSummary from "@modules/order/components/order-summary"
import { QuoteDTO } from "../../../../../../backend/src/modules/quote/types/common"
import { QuoteTableItem } from "../quote-table"

type QuoteDetailsProps = {
  quote: QuoteDTO
  preview: AdminOrderPreview
}

const QuoteDetails: React.FC<QuoteDetailsProps> = ({ quote, preview }) => {
  const order = quote.draft_order

  const originalItemsMap = useMemo(() => {
    return new Map<string, AdminOrderLineItem>(
      order.items?.map((item: AdminOrderLineItem) => [item.id, item])
    )
  }, [order])
  console.log("originalItemsMap -- ", originalItemsMap)
  return (
    <div className="divide-y divide-dashed p-0">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Quote details</h1>
      </div>

      {preview.items?.map((item) => (
        <QuoteTableItem
          key={item.id}
          item={item}
          originalItem={originalItemsMap.get(item.id)}
          currencyCode={order.currency_code}
        />
      ))}

      <div className="p-6">
        <OrderSummary order={order} />
      </div>
    </div>
  )
}

export default QuoteDetails
