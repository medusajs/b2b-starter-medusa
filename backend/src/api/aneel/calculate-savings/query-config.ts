import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCalculate-savingsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCalculate-savingsQueryConfig = defineQueryConfig({
  defaults: defaultStoreCalculate-savingsFields,
  allowed: defaultStoreCalculate-savingsFields,
  defaultLimit: 50,
});
