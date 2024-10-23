import { useParams } from "react-router-dom";
import { RouteFocusModal } from "../../../../components/common/modals/route-focus-modal/route-focus-modal";
import { useQuote } from "../../../../hooks/api/quotes";
import { ManageQuoteForm } from "../../components";

const QuoteManage = () => {
  const { quoteId } = useParams();
  const { quote, isLoading } = useQuote(quoteId!, {
    fields:
      "*draft_order.customer,*draft_order.customer.employee,*draft_order.customer.employee.company",
  });

  if (isLoading) {
    return <></>;
  }

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
