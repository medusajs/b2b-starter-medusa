import React from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Toaster } from "@medusajs/ui";
import { PaymentsTable } from "./components/payments-table";

const PaymentsPage = () => {
  return (
    <>
      <Container className="flex flex-col p-0 overflow-hidden">
        <Heading className="p-6 pb-0 font-sans font-medium h1-core">
          Payments
        </Heading>
        <PaymentsTable />
      </Container>
      <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Payments",
});

export default PaymentsPage;
