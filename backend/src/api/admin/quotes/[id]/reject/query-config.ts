import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreRejectFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listRejectQueryConfig = defineQueryConfig({
  defaults: defaultStoreRejectFields,
  allowed: defaultStoreRejectFields,
  defaultLimit: 50,
});
