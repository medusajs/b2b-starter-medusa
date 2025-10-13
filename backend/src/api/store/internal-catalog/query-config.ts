import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreInternal-catalogFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listInternal-catalogQueryConfig = defineQueryConfig({
  defaults: defaultStoreInternal-catalogFields,
  allowed: defaultStoreInternal-catalogFields,
  defaultLimit: 50,
});
