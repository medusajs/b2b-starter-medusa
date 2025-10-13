import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreInvertersFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listInvertersQueryConfig = defineQueryConfig({
  defaults: defaultStoreInvertersFields,
  allowed: defaultStoreInvertersFields,
  defaultLimit: 50,
});
