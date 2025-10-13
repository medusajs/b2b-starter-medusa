import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreImport-catalogFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listImport-catalogQueryConfig = defineQueryConfig({
  defaults: defaultStoreImport-catalogFields,
  allowed: defaultStoreImport-catalogFields,
  defaultLimit: 50,
});
