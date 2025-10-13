import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreThermal-analysisFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listThermal-analysisQueryConfig = defineQueryConfig({
  defaults: defaultStoreThermal-analysisFields,
  allowed: defaultStoreThermal-analysisFields,
  defaultLimit: 50,
});
