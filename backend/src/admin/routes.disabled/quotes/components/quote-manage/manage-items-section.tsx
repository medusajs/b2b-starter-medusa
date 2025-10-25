import {
  AdminOrder,
  AdminOrderLineItem,
  AdminOrderPreview,
} from "@medusajs/framework/types";
import { Button, Heading, Input, toast } from "@medusajs/ui";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RouteFocusModal,
  StackedFocusModal,
  useStackedModal,
} from "../../../../components/common/modals/route-focus-modal";
import { useAddItemsToQuote } from "../../../../hooks/api";
import { ManageItem } from "./manage-item";
import { ManageItemsTable } from "./manage-items-table";

type ManageItemsSectionProps = {
  order: AdminOrder;
  preview: AdminOrderPreview;
};

let addedVariants: string[] = [];

export const ManageItemsSection = ({
  order,
  preview,
}: ManageItemsSectionProps) => {
  const { t } = useTranslation();
  /**
   * STATE
   */
  const { setIsOpen } = useStackedModal();
  const [filterTerm, setFilterTerm] = useState("");

  /*
   * MUTATIONS
   */
  const { mutateAsync: addItems, isPending } = useAddItemsToQuote(preview.id);

  /**
   * CALLBACKS
   */
  const onItemsSelected = async () => {
    try {
      await addItems({
        items: addedVariants.map((i) => ({
          variant_id: i,
          quantity: 1,
        })),
      });
    } catch (e) {
      toast.error(e.message);
    }

    setIsOpen("inbound-items", false);
  };

  const filteredItems = useMemo(() => {
    return preview.items.filter(
      (i) =>
        i.title.toLowerCase().includes(filterTerm) ||
        i.product_title?.toLowerCase().includes(filterTerm)
    ) as AdminOrderLineItem[];
  }, [preview, filterTerm]);

  const originalItemsMap = useMemo(() => {
    return new Map(order.items.map((item) => [item.id, item]));
  }, [order, filterTerm]);

  return (
    <div>
      <div className="mb-3 mt-8 flex items-center justify-between">
        <Heading level="h2">{t("fields.items")}</Heading>

        <div className="flex gap-2">
          <Input
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            placeholder={t("fields.search")}
            autoComplete="off"
            type="search"
          />

          <StackedFocusModal id="inbound-items">
            <StackedFocusModal.Trigger asChild>
              <Button variant="secondary" size="small">
                {t("actions.addItems")}
              </Button>
            </StackedFocusModal.Trigger>

            <StackedFocusModal.Content>
              <StackedFocusModal.Header />

              <ManageItemsTable
                currencyCode={order.currency_code}
                onSelectionChange={(finalSelection) => {
                  addedVariants = finalSelection;
                }}
              />

              <StackedFocusModal.Footer>
                <div className="flex w-full items-center justify-end gap-x-4">
                  <div className="flex items-center justify-end gap-x-2">
                    <RouteFocusModal.Close asChild>
                      <Button type="button" variant="secondary" size="small">
                        {t("actions.cancel")}
                      </Button>
                    </RouteFocusModal.Close>
                    <Button
                      key="submit-button"
                      type="submit"
                      variant="primary"
                      size="small"
                      role="button"
                      disabled={isPending}
                      onClick={async () => await onItemsSelected()}
                    >
                      {t("actions.save")}
                    </Button>
                  </div>
                </div>
              </StackedFocusModal.Footer>
            </StackedFocusModal.Content>
          </StackedFocusModal>
        </div>
      </div>

      {filteredItems.map((item) => (
        <ManageItem
          key={item.id}
          originalItem={originalItemsMap.get(item.id)!}
          item={item}
          orderId={order.id}
          currencyCode={order.currency_code}
        />
      ))}

      {filterTerm && !filteredItems.length && (
        <div
          style={{
            background:
              "repeating-linear-gradient(-45deg, rgb(212, 212, 216, 0.15), rgb(212, 212, 216,.15) 10px, transparent 10px, transparent 20px)",
          }}
          className="bg-ui-bg-field mt-4 block h-[56px] w-full rounded-lg border border-dashed"
        />
      )}
    </div>
  );
};
