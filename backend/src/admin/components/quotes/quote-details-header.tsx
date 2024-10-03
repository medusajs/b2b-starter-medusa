import { AdminOrder } from "@medusajs/framework/types";
import { Heading } from "@medusajs/ui";
import { QuoteDTO } from "../../../modules/quote/types/common";
import QuoteStatusBadge from "../../routes/quotes/components/quote-status-badge";
import { QuoteDetailsActionsMenu } from "./quote-details-actions-menu";

export const QuoteDetailsHeader = ({
  quote,
  order,
}: {
  quote: QuoteDTO;
  order: AdminOrder;
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <Heading level="h2">Quote Summary</Heading>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-1.5">
          <QuoteStatusBadge status={quote.status} />
        </div>

        <QuoteDetailsActionsMenu quote={quote} refetch={() => {}} />
      </div>
    </div>
  );
};
