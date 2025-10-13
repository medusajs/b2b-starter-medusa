import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSkusFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSkusQueryConfig = defineQueryConfig({
  defaults: defaultStoreSkusFields,
  allowed: defaultStoreSkusFields,
  defaultLimit: 50,
});
