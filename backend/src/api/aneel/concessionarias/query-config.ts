import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreConcessionariasFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listConcessionariasQueryConfig = defineQueryConfig({
  defaults: defaultStoreConcessionariasFields,
  allowed: defaultStoreConcessionariasFields,
  defaultLimit: 50,
});
