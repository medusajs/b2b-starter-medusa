import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreEmployeeIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listEmployeeIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreEmployeeIdFields,
  allowed: defaultStoreEmployeeIdFields,
  defaultLimit: 50,
});
