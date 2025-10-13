import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listIdQueryConfig = defineQueryConfig({
  defaults: defaultStoreIdFields,
  allowed: defaultStoreIdFields,
  defaultLimit: 50,
});
