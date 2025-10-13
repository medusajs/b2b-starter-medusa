import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreThermalAnalysisFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listThermalAnalysisQueryConfig = defineQueryConfig({
  defaults: defaultStoreThermalAnalysisFields,
  allowed: defaultStoreThermalAnalysisFields,
  defaultLimit: 50,
});
