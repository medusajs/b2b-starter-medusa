import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCategoryFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listCategoryQueryConfig = defineQueryConfig({
  defaults: defaultStoreCategoryFields,
  allowed: defaultStoreCategoryFields,
  defaultLimit: 50,
});
