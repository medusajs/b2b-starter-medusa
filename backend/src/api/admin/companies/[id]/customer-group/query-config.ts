import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCustomer-groupFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCustomer-groupQueryConfig = defineQueryConfig({
  defaults: defaultStoreCustomer-groupFields,
  allowed: defaultStoreCustomer-groupFields,
  defaultLimit: 50,
});
