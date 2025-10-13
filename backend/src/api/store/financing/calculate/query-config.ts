import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCalculateFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCalculateQueryConfig = defineQueryConfig({
  defaults: defaultStoreCalculateFields,
  allowed: defaultStoreCalculateFields,
  defaultLimit: 50,
});
