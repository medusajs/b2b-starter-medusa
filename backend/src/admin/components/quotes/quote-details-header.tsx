import { AdminOrder } from "@medusajs/framework/types";
import { Heading } from "@medusajs/ui";
import { QuoteDTO } from "../../../modules/quote/types/common";
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
      <QuoteDetailsActionsMenu quote={quote} refetch={() => {}} />
    </div>
  );
};
