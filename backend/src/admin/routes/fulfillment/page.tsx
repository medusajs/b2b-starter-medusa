import React, { useEffect, useState } from "react";
import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Toaster } from "@medusajs/ui";
import { ApprovalsTable } from "../approvals/components/approvals-table";
import { FulfillmentsTable } from "./components/fulfillment-table";
import { ArrowUpRightMini } from '@medusajs/icons';

const FulfillmentPage = () => {

  return (
    <>
    <Container className="flex flex-col p-0 overflow-hidden">
    <Heading className="p-6 pb-0 font-sans font-medium h1-core">
      Fulfillment
    </Heading>
    <FulfillmentsTable />
  </Container>
  <Toaster />
    </>
  );
};

export const config = defineRouteConfig({
  label: "Fulfillment",
  icon: ArrowUpRightMini,
});

export default FulfillmentPage;
