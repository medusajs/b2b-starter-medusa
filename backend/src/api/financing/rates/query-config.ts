import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreRatesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listRatesQueryConfig = defineQueryConfig({
  defaults: defaultStoreRatesFields,
  allowed: defaultStoreRatesFields,
  defaultLimit: 50,
});
