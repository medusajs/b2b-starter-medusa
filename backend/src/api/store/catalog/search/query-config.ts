import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSearchFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSearchQueryConfig = defineQueryConfig({
  defaults: defaultStoreSearchFields,
  allowed: defaultStoreSearchFields,
  defaultLimit: 50,
});
