import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreFilenameFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listFilenameQueryConfig = defineQueryConfig({
  defaults: defaultStoreFilenameFields,
  allowed: defaultStoreFilenameFields,
  defaultLimit: 50,
});
