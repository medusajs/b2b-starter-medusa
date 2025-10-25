import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCustomerGroupIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCustomerGroupIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreCustomerGroupIdFields,
  allowed: defaultStoreCustomerGroupIdFields,
  defaultLimit: 50,
});
