import { useParams } from "react-router-dom";
import { RouteFocusModal } from "../../../../components/common/modals/route-focus-modal/route-focus-modal";
import { useQuote } from "../../../../hooks/api/quotes";
import { ManageQuoteForm } from "./components/manage-quote-form";

const QuoteManage = () => {
  const { quoteId } = useParams();
  const { data, loading } = useQuote(quoteId!, {
    fields: [
      "+draft_order.customer.*",
      "+draft_order.customer.employee.*",
      "+draft_order.customer.employee.company.*",
    ],
  });

  if (loading) {
    return <></>;
  }

  const quote = data?.quote;

  if (!quote) {
    throw "quote not found";
  }

  return (
    <RouteFocusModal>
      <ManageQuoteForm order={quote.draft_order} />
    </RouteFocusModal>
  );
};

export default QuoteManage;
