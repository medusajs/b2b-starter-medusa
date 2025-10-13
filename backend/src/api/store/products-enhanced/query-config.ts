import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreProducts-enhancedFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listProducts-enhancedQueryConfig = defineQueryConfig({
  defaults: defaultStoreProducts-enhancedFields,
  allowed: defaultStoreProducts-enhancedFields,
  defaultLimit: 50,
});
