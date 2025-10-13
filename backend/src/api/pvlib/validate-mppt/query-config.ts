import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreValidate-mpptFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listValidate-mpptQueryConfig = defineQueryConfig({
  defaults: defaultStoreValidate-mpptFields,
  allowed: defaultStoreValidate-mpptFields,
  defaultLimit: 50,
});
