import { defineRouteConfig } from "@medusajs/admin-sdk";
import { DocumentText } from "@medusajs/icons";
import { Container, Heading, Toaster } from "@medusajs/ui";
import { QuotesTable } from "./components/quotes-table";

const Quotes = () => {
  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <Heading className="p-6 pb-0 font-sans font-medium h1-core">
          Quotes
        </Heading>

        <QuotesTable />
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
