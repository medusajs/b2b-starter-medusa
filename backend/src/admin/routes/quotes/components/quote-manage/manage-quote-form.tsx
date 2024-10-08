import { zodResolver } from "@hookform/resolvers/zod";
import { AdminOrder } from "@medusajs/framework/types";
import { Button, Heading, toast } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../components/common/modals/route-focus-modal";
import { useOrderPreview } from "../../../../hooks";
import { useConfirmQuote } from "../../../../hooks/api";
import { formatAmount } from "../../../../utils";
import { ManageItemsSection } from "./manage-items-section";

export const ManageQuoteFormSchema = z.object({});

export type ManageQuoteFormSchemaType = z.infer<typeof ManageQuoteFormSchema>;

type ReturnCreateFormProps = {
  order: AdminOrder;
};

export const ManageQuoteForm = ({ order }: ReturnCreateFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const { order: preview } = useOrderPreview(order.id);

  /**
   * MUTATIONS
   */
  const { mutateAsync: confirmQuote, isPending: isRequesting } =
    useConfirmQuote(order.id);

  /**
   * FORM
   */
  const form = useForm<ManageQuoteFormSchemaType>({
    defaultValues: () => Promise.resolve({}),
    resolver: zodResolver(ManageQuoteFormSchema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await confirmQuote({});

      toast.success("Successfully updated quote");
      handleSuccess();
    } catch (e) {
      toast.error(t("general.error"), {
        description: e.message,
      });
    }
  });

  if (!preview) {
    return <></>;
  }

  return (
    <RouteFocusModal.Form form={form}>
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <RouteFocusModal.Header />

        <RouteFocusModal.Body className="flex size-full justify-center overflow-y-auto">
          <div className="mt-16 w-[720px] max-w-[100%] px-4 md:p-0">
            <Heading level="h1">Manage Quote</Heading>

            <ManageItemsSection preview={preview} order={order} />

            {/*TOTALS SECTION*/}
            <div className="mt-8 border-y border-dotted py-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="txt-small text-ui-fg-subtle">
                  {t("orders.edits.currentTotal")}
                </span>

                <span className="txt-small text-ui-fg-subtle">
                  {formatAmount(order.total, order.currency_code)}
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="txt-small text-ui-fg-subtle">
                  {t("orders.edits.newTotal")}
                </span>

                <span className="txt-small text-ui-fg-subtle">
                  {formatAmount(preview.total, order.currency_code)}
                </span>
              </div>
            </div>

            <div className="p-8" />
          </div>
        </RouteFocusModal.Body>

        <RouteFocusModal.Footer>
          <div className="flex w-full items-center justify-end gap-x-4">
            <div className="flex items-center justify-end gap-x-2">
              <Button
                key="submit-button"
                type="submit"
                variant="primary"
                size="small"
              >
                {t("actions.continue")}
              </Button>
            </div>
          </div>
        </RouteFocusModal.Footer>
      </form>
    </RouteFocusModal.Form>
  );
};
