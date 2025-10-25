import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreAcceptFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listAcceptQueryConfig = defineQueryConfig({
  defaults: defaultStoreAcceptFields,
  allowed: defaultStoreAcceptFields,
  defaultLimit: 50,
});
