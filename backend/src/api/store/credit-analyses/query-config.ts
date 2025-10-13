import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCredit-analysesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCredit-analysesQueryConfig = defineQueryConfig({
  defaults: defaultStoreCredit-analysesFields,
  allowed: defaultStoreCredit-analysesFields,
  defaultLimit: 50,
});
