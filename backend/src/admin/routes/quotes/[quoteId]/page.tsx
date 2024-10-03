import {
  Button,
  Container,
  Heading,
  Text,
  toast,
  Toaster,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { JsonViewSection } from "../../../components/common/json-view-section";
import {
  CostBreakdown,
  ItemBreakdown,
  QuoteDetailsHeader,
  QuoteTotal,
} from "../../../components/quotes";
import { useOrderPreview } from "../../../hooks";
import { useQuote, useSendQuote } from "../../../hooks/api/quotes";
import { formatAmount } from "../../../utils";

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const [showSendQuote, setShowSendQuote] = useState(false);
  const prompt = usePrompt();
  const { t } = useTranslation();
  const { quote, isLoading } = useQuote(quoteId!, {
    fields:
      "+draft_order.customer.*,+draft_order.customer.employee.*, +draft_order.customer.employee.company.*",
  });

  const { order: preview, isLoading: isPreviewLoading } = useOrderPreview(
    quote?.draft_order_id!,
    {},
    { enabled: !!quote?.draft_order_id }
  );

  const { mutateAsync: sendQuote, isPending: isSendingQuote } = useSendQuote(
    quoteId!
  );

  useEffect(() => {
    if (quote?.status === "pending_merchant") {
      setShowSendQuote(true);
    } else {
      setShowSendQuote(false);
    }
  }, [quote]);

  const handleSendQuote = async () => {
    const res = await prompt({
      title: "Send quote?",
      description:
        "You are about to send this quote to the customer. Do you want to continue?",
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
      variant: "confirmation",
    });

    if (res) {
      await sendQuote(
        {},
        {
          onSuccess: () => toast.success("Successfully sent quote to customer"),
          onError: (e) => toast.error(e.message),
        }
      );
    }
  };

  if (isLoading || !quote) {
    return <></>;
  }

  if (isPreviewLoading) {
    return <></>;
  }

  if (!isPreviewLoading && !preview) {
    throw "preview not found";
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-x-4 lg:flex-row xl:items-start">
        <div className="flex w-full flex-col gap-y-3">
          <Container className="divide-y divide-dashed p-0">
            <QuoteDetailsHeader quote={quote} order={quote.draft_order} />
            <ItemBreakdown order={quote.draft_order} preview={preview!} />
            <CostBreakdown order={quote.draft_order} />
            <QuoteTotal order={quote.draft_order} preview={preview!} />

            {showSendQuote && (
              <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => handleSendQuote()}
                  disabled={isSendingQuote}
                >
                  Send Quote
                </Button>
              </div>
            )}
          </Container>

          <JsonViewSection data={quote} />
        </div>

        <div className="mt-2 flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[400px]">
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Description</Heading>
            </div>

            <div className="text-ui-fg-subtle px-6 py-4 text-sm flex flex-col gap-y-3">
              <p>Hey team,</p>
              <p>
                We are requesting a custom quote for a bulk order of the
                specified products with our company logo printed on each item.
              </p>
              <p>
                While we are flexible on the delivery date, we would prefer to
                receive the order within the next four months if possible.
              </p>
            </div>
          </Container>

          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Customer</Heading>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Email
              </Text>

              <Link
                className="text-sm text-pretty text-blue-500"
                to={`/customers/${quote.draft_order?.customer?.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {quote.draft_order?.customer?.email}
              </Link>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Phone
              </Text>

              <Text size="small" leading="compact" className="text-pretty">
                {quote.draft_order?.customer?.phone}
              </Text>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Spending Limit
              </Text>

              <Text size="small" leading="compact" className="text-pretty">
                {formatAmount(
                  quote.draft_order?.customer?.employee.spending_limit,
                  quote.draft_order?.customer?.employee?.company?.currency_code
                )}
              </Text>
            </div>
          </Container>

          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Company</Heading>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Name
              </Text>

              <Link
                className="text-sm text-pretty text-blue-500"
                to={`/companies/${quote.draft_order?.customer?.employee?.company.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {quote.draft_order?.customer?.employee?.company?.name}
              </Link>
            </div>
          </Container>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default QuoteDetails;
