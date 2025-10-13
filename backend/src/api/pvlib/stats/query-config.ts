import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreStatsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listStatsQueryConfig = defineQueryConfig({
  defaults: defaultStoreStatsFields,
  allowed: defaultStoreStatsFields,
  defaultLimit: 50,
});
