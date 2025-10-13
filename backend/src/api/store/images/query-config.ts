import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreImagesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listImagesQueryConfig = defineQueryConfig({
  defaults: defaultStoreImagesFields,
  allowed: defaultStoreImagesFields,
  defaultLimit: 50,
});
