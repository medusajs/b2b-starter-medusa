import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreAnalyzeFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listAnalyzeQueryConfig = defineQueryConfig({
  defaults: defaultStoreAnalyzeFields,
  allowed: defaultStoreAnalyzeFields,
  defaultLimit: 50,
});
