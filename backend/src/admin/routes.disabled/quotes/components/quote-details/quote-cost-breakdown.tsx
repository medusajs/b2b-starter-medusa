import { AdminOrder } from "@medusajs/framework/types";
import { Text } from "@medusajs/ui";
import { ReactNode } from "react";
import { formatAmount } from "../../../../utils";

export const CostBreakdown = ({ order }: { order: AdminOrder }) => {
  return (
    <div className="text-ui-fg-subtle flex flex-col gap-y-2 px-6 py-4">
      <Cost
        label="Discounts"
        secondaryValue=""
        value={
          order.discount_total > 0
            ? `- ${formatAmount(order.discount_total, order.currency_code)}`
            : "-"
        }
      />
      {(order.shipping_methods || [])
        .sort((m1, m2) =>
          (m1.created_at as string).localeCompare(m2.created_at as string)
        )
        .map((sm, i) => {
          return (
            <div>
              <Cost
                key={sm.id}
                label={"Shipping"}
                secondaryValue={sm.name}
                value={formatAmount(sm.total, order.currency_code)}
              />
            </div>
          );
        })}
    </div>
  );
};

export const Cost = ({
  label,
  value,
  secondaryValue,
  tooltip,
}: {
  label: string;
  value: string | number;
  secondaryValue: string;
  tooltip?: ReactNode;
}) => (
  <div className="grid grid-cols-3 items-center">
    <Text size="small" leading="compact">
      {label} {tooltip}
    </Text>
    <div className="text-right">
      <Text size="small" leading="compact">
        {secondaryValue}
      </Text>
    </div>

    <div className="text-right">
      <Text size="small" leading="compact">
        {value}
      </Text>
    </div>
  </div>
);
