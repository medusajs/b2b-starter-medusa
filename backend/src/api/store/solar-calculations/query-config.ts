import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSolar-calculationsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSolar-calculationsQueryConfig = defineQueryConfig({
  defaults: defaultStoreSolar-calculationsFields,
  allowed: defaultStoreSolar-calculationsFields,
  defaultLimit: 50,
});
