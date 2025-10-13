import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreViabilityFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listViabilityQueryConfig = defineQueryConfig({
  defaults: defaultStoreViabilityFields,
  allowed: defaultStoreViabilityFields,
  defaultLimit: 50,
});
