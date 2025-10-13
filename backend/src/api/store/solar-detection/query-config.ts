import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSolar-detectionFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSolar-detectionQueryConfig = defineQueryConfig({
  defaults: defaultStoreSolar-detectionFields,
  allowed: defaultStoreSolar-detectionFields,
  defaultLimit: 50,
});
