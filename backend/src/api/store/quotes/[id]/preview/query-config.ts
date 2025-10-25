import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStorePreviewFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPreviewQueryConfig = defineQueryConfig({
  defaults: defaultStorePreviewFields,
  allowed: defaultStorePreviewFields,
  defaultLimit: 50,
});
