import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSolarDetectionFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSolarDetectionQueryConfig = defineQueryConfig({
  defaults: defaultStoreSolarDetectionFields,
  allowed: defaultStoreSolarDetectionFields,
  defaultLimit: 50,
});
