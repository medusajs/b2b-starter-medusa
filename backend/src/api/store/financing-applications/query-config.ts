import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreFinancing-applicationsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listFinancing-applicationsQueryConfig = defineQueryConfig({
  defaults: defaultStoreFinancing-applicationsFields,
  allowed: defaultStoreFinancing-applicationsFields,
  defaultLimit: 50,
});
