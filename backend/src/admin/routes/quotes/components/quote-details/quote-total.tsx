import { AdminOrder, AdminOrderPreview } from "@medusajs/framework/types";
import { Text } from "@medusajs/ui";
import { useTranslation } from "react-i18next";
import { formatAmount } from "../../../../utils";

export const QuoteTotal = ({
  order,
  preview,
}: {
  order: AdminOrder;
  preview: AdminOrderPreview;
}) => {
  const { t } = useTranslation();

  return (
    <div className=" flex flex-col gap-y-2 px-6 py-4">
      <div className="text-ui-fg-base flex items-center justify-between">
        <Text
          weight="plus"
          className="text-ui-fg-subtle"
          size="small"
          leading="compact"
        >
          Original Total
        </Text>
        <Text
          weight="plus"
          className="text-ui-fg-subtle"
          size="small"
          leading="compact"
        >
          {formatAmount(order.total, order.currency_code)}
        </Text>
      </div>

      <div className="text-ui-fg-base flex items-center justify-between">
        <Text
          className="text-ui-fg-subtle text-semibold"
          size="small"
          leading="compact"
          weight="plus"
        >
          Quote Total
        </Text>
        <Text
          className="text-ui-fg-subtle text-bold"
          size="small"
          leading="compact"
          weight="plus"
        >
          {formatAmount(preview.summary.current_order_total, order.currency_code)}
        </Text>
      </div>
    </div>
  );
};
