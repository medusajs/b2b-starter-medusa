import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSimulateFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSimulateQueryConfig = defineQueryConfig({
  defaults: defaultStoreSimulateFields,
  allowed: defaultStoreSimulateFields,
  defaultLimit: 50,
});
