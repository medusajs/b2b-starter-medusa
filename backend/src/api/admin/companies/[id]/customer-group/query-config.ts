import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCustomerGroupFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCustomerGroupQueryConfig = defineQueryConfig({
  defaults: defaultStoreCustomerGroupFields,
  allowed: defaultStoreCustomerGroupFields,
  defaultLimit: 50,
});
