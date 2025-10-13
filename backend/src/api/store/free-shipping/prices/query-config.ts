import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStorePricesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPricesQueryConfig = defineQueryConfig({
  defaults: defaultStorePricesFields,
  allowed: defaultStorePricesFields,
  defaultLimit: 50,
});
