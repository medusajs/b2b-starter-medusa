import {
  AdminOrder,
  AdminOrderLineItem,
  AdminOrderPreview,
} from "@medusajs/framework/types";
import { Badge, Copy, Text } from "@medusajs/ui";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AmountCell, Thumbnail } from "../../../../components/common";

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

export const QuoteItem = ({
  item,
  originalItem,
  currencyCode,
}: {
  item: AdminOrderPreview["items"][0];
  originalItem?: AdminOrderLineItem;
  currencyCode: string;
}) => {
  const { t } = useTranslation();

  const isAddedItem = useMemo(
    () => !!item.actions?.find((a) => a.action === "ITEM_ADD"),
    [item]
  );

  const isItemUpdated = useMemo(
    () => !!item.actions?.find((a) => a.action === "ITEM_UPDATE"),
    [item]
  );

  const isItemRemoved = useMemo(() => {
    const updateAction = item.actions?.find((a) => a.action === "ITEM_UPDATE");

    return !!updateAction && item.quantity === item.detail.fulfilled_quantity;
  }, [item]);

  return (
    <>
      <div
        key={item.id}
        className="text-ui-fg-subtle grid grid-cols-2 items-center gap-x-4 px-6 py-4 text-left"
      >
        <div className="flex items-start gap-x-4">
          <Thumbnail src={item.thumbnail} />

          <div>
            <Text
              size="small"
              leading="compact"
              weight="plus"
              className="text-ui-fg-base"
            >
              {item.title}
            </Text>

            {item.variant_sku && (
              <div className="flex items-center gap-x-1">
                <Text size="small">{item.variant_sku}</Text>
                <Copy content={item.variant_sku} className="text-ui-fg-muted" />
              </div>
            )}
            <Text size="small">
              {item.variant?.options?.map((o) => o.value).join(" · ")}
            </Text>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center gap-x-4">
          <div className="flex items-center justify-end gap-x-4">
            <AmountCell
              className="text-sm text-right justify-end items-end"
              currencyCode={currencyCode}
              amount={item.unit_price}
              originalAmount={originalItem?.unit_price}
            />
          </div>

          <div className="flex items-center gap-x-2">
            <div className="w-fit min-w-[27px]">
              <Badge size="xsmall" color="grey">
                <span className="tabular-nums text-xs">{item.quantity}</span>x
              </Badge>
            </div>

            <div>
              {isAddedItem && (
                <Badge
                  size="2xsmall"
                  rounded="full"
                  color="blue"
                  className="mr-1"
                >
                  {t("general.new")}
                </Badge>
              )}

              {isItemRemoved ? (
                <Badge
                  size="2xsmall"
                  rounded="full"
                  color="red"
                  className="mr-1"
                >
                  {t("general.removed")}
                </Badge>
              ) : (
                isItemUpdated && (
                  <Badge
                    size="2xsmall"
                    rounded="full"
                    color="orange"
                    className="mr-1"
                  >
                    {t("general.modified")}
                  </Badge>
                )
              )}
            </div>

            <div className="overflow-visible"></div>
          </div>

          <AmountCell
            className="text-sm text-right justify-end items-end"
            currencyCode={currencyCode}
            amount={item.total}
            originalAmount={originalItem?.total}
          />
        </div>
      </div>
    </>
  );
};
