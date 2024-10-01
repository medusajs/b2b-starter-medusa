import { Button, usePrompt } from "@medusajs/ui";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useOrderPreview } from "../../../hooks";
import { useQuote } from "../../../hooks/api/quotes";

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const [showSendQuote, setShowSendQuote] = useState(true);
  const prompt = usePrompt();
  const { t } = useTranslation();
  const { data, loading, refetch } = useQuote(quoteId!, {
    fields: [
      "+draft_order.customer.*",
      "+draft_order.customer.employee.*",
      "+draft_order.customer.employee.company.*",
    ],
  });

  const quote = data?.quote;

  const { order: preview, isLoading: isPreviewLoading } = useOrderPreview(
    quote?.draft_order_id!,
    {},
    { enabled: !!quote?.draft_order_id }
  );

  if (loading) {
    return <></>;
  }

  if (!quote) {
    throw "quote not found";
  }

  if (isPreviewLoading) {
    return <></>;
  }

  if (!isPreviewLoading && !preview) {
    throw "preview not found";
  }

  const handleSendQuote = async () => {
    const res = await prompt({
      title: "Send quote?",
      description:
        "You are about to send this quote to the customer. Do you want to continue?",
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
      variant: "confirmation",
    });

    if (!res) {
      return;
    }

    // await cancelOrder(order.id);
  };

  return (
    showSendQuote && (
      <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
        <Button
          size="small"
          variant="secondary"
          onClick={() => handleSendQuote()}
        >
          Send Quote
        </Button>
      </div>
    )
  );
};

export default QuoteDetails;
