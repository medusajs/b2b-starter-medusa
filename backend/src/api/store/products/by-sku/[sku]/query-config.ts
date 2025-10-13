import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSkuFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSkuQueryConfig = defineQueryConfig({
  defaults: defaultStoreSkuFields,
  allowed: defaultStoreSkuFields,
  defaultLimit: 50,
});
