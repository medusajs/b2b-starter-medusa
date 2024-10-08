import { AdminOrder, AdminOrderPreview } from "@medusajs/framework/types";
import {
  ArrowUturnLeft,
  DocumentSeries,
  PencilSquare,
  XCircle,
  XMark,
} from "@medusajs/icons";
import {
  Badge,
  CurrencyInput,
  IconButton,
  Input,
  Text,
  toast,
} from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActionMenu,
  AmountCell,
  Thumbnail,
} from "../../../../components/common";
import { Form } from "../../../../components/common/form";
import {
  useAddItemsToQuote,
  useRemoveQuoteItem,
  useUpdateAddedQuoteItem,
  useUpdateQuoteItem,
} from "../../../../hooks/api";
import { currencySymbolMap } from "../../../../utils";

type ManageItemProps = {
  originalItem: AdminOrder["items"][0];
  item: AdminOrderPreview["items"][0];
  currencyCode: string;
  orderId: string;
};

function ManageItem({
  originalItem,
  item,
  currencyCode,
  orderId,
}: ManageItemProps) {
  const { t } = useTranslation();
  const [showPriceForm, setShowPriceForm] = useState(false);

  const { mutateAsync: addItems } = useAddItemsToQuote(orderId);
  const { mutateAsync: updateAddedItem } = useUpdateAddedQuoteItem(orderId);
  const { mutateAsync: updateOriginalItem } = useUpdateQuoteItem(orderId);
  const { mutateAsync: undoAction } = useRemoveQuoteItem(orderId);

  const isAddedItem = useMemo(
    () => !!item.actions?.find((a) => a.action === "ITEM_ADD"),
    [item]
  );

  const isItemUpdated = useMemo(
    () => !!item.actions?.find((a) => a.action === "ITEM_UPDATE"),
    [item]
  );

  const isItemRemoved = useMemo(() => {
    // To be removed item needs to have updated quantity
    const updateAction = item.actions?.find((a) => a.action === "ITEM_UPDATE");
    return !!updateAction && item.quantity === item.detail.fulfilled_quantity;
  }, [item]);

  /**
   * HANDLERS
   */
  const onUpdate = async ({
    quantity,
    unit_price,
  }: {
    quantity?: number;
    unit_price?: number;
  }) => {
    if (
      typeof quantity === "number" &&
      quantity <= item.detail.fulfilled_quantity
    ) {
      toast.error(t("orders.edits.validation.quantityLowerThanFulfillment"));
      return;
    }

    const addItemAction = item.actions?.find((a) => a.action === "ITEM_ADD");

    try {
      if (addItemAction) {
        await updateAddedItem({
          quantity,
          unit_price,
          actionId: addItemAction.id,
        });
      } else {
        await updateOriginalItem({
          quantity,
          unit_price,
          itemId: item.id,
        });
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onRemove = async () => {
    const addItemAction = item.actions?.find((a) => a.action === "ITEM_ADD");

    try {
      if (addItemAction) {
        await undoAction(addItemAction.id);
      } else {
        await updateOriginalItem({
          quantity: item.detail.fulfilled_quantity,
          itemId: item.id,
        });
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onRemoveUndo = async () => {
    const updateItemAction = item.actions?.find(
      (a) => a.action === "ITEM_UPDATE"
    );

    try {
      if (updateItemAction) {
        await undoAction(updateItemAction.id);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const onDuplicate = async () => {
    try {
      await addItems({
        items: [
          {
            variant_id: item.variant_id,
            quantity: item.quantity,
          },
        ],
      });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div
      key={item.quantity}
      className="bg-ui-bg-subtle shadow-elevation-card-rest my-2 rounded-xl "
    >
      <div className="flex flex-col items-center gap-x-2 gap-y-2 p-3 text-sm md:flex-row">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex flex-row items-center gap-x-3">
            <Thumbnail src={item.thumbnail} />

            <div className="flex flex-col">
              <div>
                <Text className="txt-small" as="span" weight="plus">
                  {item.title}{" "}
                </Text>

                {item.variant_sku && <span>({item.variant_sku})</span>}
              </div>
              <Text as="div" className="text-ui-fg-subtle txt-small">
                {item.product_title}
              </Text>
            </div>
          </div>

          {isAddedItem && (
            <Badge size="2xsmall" rounded="full" color="blue" className="mr-1">
              {t("general.new")}
            </Badge>
          )}

          {isItemRemoved ? (
            <Badge size="2xsmall" rounded="full" color="red" className="mr-1">
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

        <div className="flex flex-1 justify-between">
          <div className="flex flex-grow items-center gap-2">
            <Input
              className="bg-ui-bg-base txt-small w-[67px] rounded-lg [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              type="number"
              disabled={item.detail.fulfilled_quantity === item.quantity}
              min={item.detail.fulfilled_quantity}
              defaultValue={item.quantity}
              onBlur={(e) => {
                const val = e.target.value;
                const quantity = val === "" ? null : Number(val);

                if (quantity) {
                  onUpdate({ quantity });
                }
              }}
            />
            <Text className="txt-small text-ui-fg-subtle">
              {t("fields.qty")}
            </Text>
          </div>

          <div className="text-ui-fg-subtle txt-small mr-2 flex flex-shrink-0">
            <AmountCell
              currencyCode={currencyCode}
              amount={item.total}
              originalAmount={originalItem?.total}
            />
          </div>

          <ActionMenu
            groups={[
              {
                actions: [
                  {
                    label: "Update Price",
                    onClick: () => setShowPriceForm(!showPriceForm),
                    icon: <PencilSquare />,
                  },
                  {
                    label: t("actions.duplicate"),
                    onClick: onDuplicate,
                    icon: <DocumentSeries />,
                  },
                ],
              },
              {
                actions: [
                  !isItemRemoved
                    ? {
                        label: t("actions.remove"),
                        onClick: onRemove,
                        icon: <XCircle />,
                        disabled:
                          item.detail.fulfilled_quantity === item.quantity,
                      }
                    : {
                        label: t("actions.undo"),
                        onClick: onRemoveUndo,
                        icon: <ArrowUturnLeft />,
                      },
                ].filter(Boolean),
              },
            ]}
          />
        </div>
      </div>

      {showPriceForm && (
        <div className="grid grid-cols-1 gap-2 p-3 md:grid-cols-2">
          <div>
            <Form.Label>{t("fields.price")}</Form.Label>
            <Form.Hint className="!mt-1">
              Override the unit price of this product
            </Form.Hint>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex-grow">
              <Form.Field
                name={`inbound_items.${item.id}.unit_price`}
                render={({ field: { ref, ...field } }) => {
                  return (
                    <Form.Item>
                      <Form.Control>
                        <CurrencyInput
                          {...field}
                          symbol={currencyCode}
                          code={currencySymbolMap[currencyCode]}
                          defaultValue={item.unit_price}
                          type="numeric"
                          min={0}
                          onBlur={() => {
                            field.onChange(field.value);

                            onUpdate({
                              unit_price: parseFloat(field.value),
                              quantity: item.quantity,
                            });
                          }}
                          className="bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />
            </div>

            <IconButton
              type="button"
              className="flex-shrink"
              variant="transparent"
              onClick={() => {
                setShowPriceForm(false);
              }}
            >
              <XMark className="text-ui-fg-muted" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}

export { ManageItem };
