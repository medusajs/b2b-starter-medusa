import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreProducts.customFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listProducts.customQueryConfig = defineQueryConfig({
  defaults: defaultStoreProducts.customFields,
  allowed: defaultStoreProducts.customFields,
  defaultLimit: 50,
});
