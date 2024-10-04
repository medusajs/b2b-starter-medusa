import { AdminOrder, AdminOrderPreview } from "@medusajs/framework/types";
import { useMemo } from "react";
import { QuoteItem } from "./quote-item";

export const QuoteItems = ({
  order,
  preview,
}: {
  order: AdminOrder;
  preview: AdminOrderPreview;
}) => {
  const originalItemsMap = useMemo(() => {
    return new Map(order.items.map((item) => [item.id, item]));
  }, [order]);

  return (
    <div>
      {preview.items?.map((item) => {
        return (
          <QuoteItem
            key={item.id}
            item={item}
            originalItem={originalItemsMap.get(item.id)}
            currencyCode={order.currency_code}
          />
        );
      })}
    </div>
  );
};
