import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCompanyIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCompanyIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreCompanyIdFields,
  allowed: defaultStoreCompanyIdFields,
  defaultLimit: 50,
});
