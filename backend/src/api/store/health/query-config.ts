import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreHealthFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listHealthQueryConfig = defineQueryConfig({
  defaults: defaultStoreHealthFields,
  allowed: defaultStoreHealthFields,
  defaultLimit: 50,
});
