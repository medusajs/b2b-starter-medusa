import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStorePreloadFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPreloadQueryConfig = defineQueryConfig({
  defaults: defaultStorePreloadFields,
  allowed: defaultStorePreloadFields,
  defaultLimit: 50,
});
