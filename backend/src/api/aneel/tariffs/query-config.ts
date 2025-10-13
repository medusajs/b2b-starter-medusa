import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreTariffsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listTariffsQueryConfig = defineQueryConfig({
  defaults: defaultStoreTariffsFields,
  allowed: defaultStoreTariffsFields,
  defaultLimit: 50,
});
