import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreKitsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listKitsQueryConfig = defineQueryConfig({
  defaults: defaultStoreKitsFields,
  allowed: defaultStoreKitsFields,
  defaultLimit: 50,
});
