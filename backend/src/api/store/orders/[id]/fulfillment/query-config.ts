import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreFulfillmentFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listFulfillmentQueryConfig = defineQueryConfig({
  defaults: defaultStoreFulfillmentFields,
  allowed: defaultStoreFulfillmentFields,
  defaultLimit: 50,
});
