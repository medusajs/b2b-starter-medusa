import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreQuoteIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listQuoteIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreQuoteIdFields,
  allowed: defaultStoreQuoteIdFields,
  defaultLimit: 50,
});
