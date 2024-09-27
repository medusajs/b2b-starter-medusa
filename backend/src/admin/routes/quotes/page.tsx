import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { Badge, Container, Heading, Table, Text, Toaster } from "@medusajs/ui";
import { QuoteDTO } from "../../../modules/quote/types/common";
import { CompanyCreateDrawer, QuoteActionsMenu } from "../../components";
import { useQuotes } from "../../hooks/quotes";

const Quotes = () => {
  const { data, loading, refetch } = useQuotes({
    fields: [
      "+draft_order.customer.email",
      "+draft_order.customer.employee.company.*",
    ],
  });

  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <div className="p-6 flex justify-between">
          <Heading className="font-sans font-medium h1-core">Quotes</Heading>
          <CompanyCreateDrawer refetch={refetch} />
        </div>
        {loading && <Text>Loading...</Text>}
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
          {data?.quotes && (
            <Table.Body>
              {data.quotes.map((quote: QuoteDTO) => (
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
                    {quote.draft_order?.customer?.employee?.company?.name ||
                      "-"}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="green">
                      {quote.draft_order?.status || "-"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {quote.draft_order?.summary.pending_difference || 0}{" "}
                    {quote.draft_order?.customer?.employee?.company?.currency_code?.toUpperCase()}
                  </Table.Cell>

                  <Table.Cell
                    onClick={(e) => e.stopPropagation()}
                    className="text-right"
                  >
                    <QuoteActionsMenu quote={quote} refetch={refetch} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          )}
        </Table>
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
