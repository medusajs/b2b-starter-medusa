import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { Container, Heading, Table, Toaster } from "@medusajs/ui";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { NoRecords, QuoteActionsMenu } from "../../components";
import { useQuotes } from "../../hooks/api/quotes";
import QuoteStatusBadge from "./components/quote-status-badge";

const Quotes = () => {
  const { quotes = [] } = useQuotes({
    fields:
      "+draft_order.customer.email, +draft_order.customer.employee.company.*",
  });

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex justify-between">
          <Heading className="font-sans font-medium h1-core">Quotes</Heading>
        </div>

        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>ID</Table.HeaderCell>
              <Table.HeaderCell>Customer</Table.HeaderCell>
              <Table.HeaderCell>Company</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Total</Table.HeaderCell>
              <Table.HeaderCell className="text-right">
                Actions
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {quotes.map((quote: QuoteDTO) => (
              <Table.Row
                key={quote.id}
                className="cursor-pointer "
                onClick={() =>
                  (window.location.href = `/app/quotes/${quote.id}`)
                }
              >
                <Table.Cell className="w-6 h-6 items-center justify-center">
                  {quote.draft_order.display_id}
                </Table.Cell>
                <Table.Cell>
                  {quote.draft_order?.customer?.email || "-"}
                </Table.Cell>
                <Table.Cell>
                  {quote.draft_order?.customer?.employee?.company?.name || "-"}
                </Table.Cell>
                <Table.Cell>
                  <QuoteStatusBadge status={quote.status} />
                </Table.Cell>
                <Table.Cell>
                  {quote.draft_order?.summary.pending_difference || 0}{" "}
                  {quote.draft_order?.customer?.employee?.company?.currency_code?.toUpperCase()}
                </Table.Cell>

                <Table.Cell
                  onClick={(e) => e.stopPropagation()}
                  className="text-right"
                >
                  <QuoteActionsMenu quote={quote} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {quotes?.length === 0 && (
          <div className="flex items-center justify-center self-center">
            <NoRecords />
          </div>
        )}
      </Container>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Quotes",
  icon: DocumentText,
});

export default Quotes;
