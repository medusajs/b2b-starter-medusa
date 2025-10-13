import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreFinancingFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listFinancingQueryConfig = defineQueryConfig({
  defaults: defaultStoreFinancingFields,
  allowed: defaultStoreFinancingFields,
  defaultLimit: 50,
});
