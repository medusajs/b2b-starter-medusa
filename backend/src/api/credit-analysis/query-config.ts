import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCredit-analysisFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCredit-analysisQueryConfig = defineQueryConfig({
  defaults: defaultStoreCredit-analysisFields,
  allowed: defaultStoreCredit-analysisFields,
  defaultLimit: 50,
});
