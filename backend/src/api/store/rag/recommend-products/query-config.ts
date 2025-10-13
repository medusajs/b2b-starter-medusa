import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreRecommend-productsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listRecommend-productsQueryConfig = defineQueryConfig({
  defaults: defaultStoreRecommend-productsFields,
  allowed: defaultStoreRecommend-productsFields,
  defaultLimit: 50,
});
