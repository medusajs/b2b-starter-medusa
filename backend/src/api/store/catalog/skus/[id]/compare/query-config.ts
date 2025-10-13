import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCompareFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCompareQueryConfig = defineQueryConfig({
  defaults: defaultStoreCompareFields,
  allowed: defaultStoreCompareFields,
  defaultLimit: 50,
});
