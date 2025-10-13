import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreAsk-helioFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listAsk-helioQueryConfig = defineQueryConfig({
  defaults: defaultStoreAsk-helioFields,
  allowed: defaultStoreAsk-helioFields,
  defaultLimit: 50,
});
