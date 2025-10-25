import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreEmployeesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listEmployeesQueryConfig = defineQueryConfig({
  defaults: defaultStoreEmployeesFields,
  allowed: defaultStoreEmployeesFields,
  defaultLimit: 50,
});
