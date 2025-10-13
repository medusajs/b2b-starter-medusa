import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSolarCalculationsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSolarCalculationsQueryConfig = defineQueryConfig({
  defaults: defaultStoreSolarCalculationsFields,
  allowed: defaultStoreSolarCalculationsFields,
  defaultLimit: 50,
});
