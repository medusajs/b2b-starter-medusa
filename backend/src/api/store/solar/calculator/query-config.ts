import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCalculatorFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCalculatorQueryConfig = defineQueryConfig({
  defaults: defaultStoreCalculatorFields,
  allowed: defaultStoreCalculatorFields,
  defaultLimit: 50,
});
