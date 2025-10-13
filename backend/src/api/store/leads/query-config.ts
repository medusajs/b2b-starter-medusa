import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreLeadsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listLeadsQueryConfig = defineQueryConfig({
  defaults: defaultStoreLeadsFields,
  allowed: defaultStoreLeadsFields,
  defaultLimit: 50,
});
