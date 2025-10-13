import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreBulkFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listBulkQueryConfig = defineQueryConfig({
  defaults: defaultStoreBulkFields,
  allowed: defaultStoreBulkFields,
  defaultLimit: 50,
});
