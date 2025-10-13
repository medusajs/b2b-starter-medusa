import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreStatusFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listStatusQueryConfig = defineQueryConfig({
  defaults: defaultStoreStatusFields,
  allowed: defaultStoreStatusFields,
  defaultLimit: 50,
});
