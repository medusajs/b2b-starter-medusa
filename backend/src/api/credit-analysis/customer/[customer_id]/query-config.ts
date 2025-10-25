import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCustomerIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCustomerIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreCustomerIdFields,
  allowed: defaultStoreCustomerIdFields,
  defaultLimit: 50,
});
