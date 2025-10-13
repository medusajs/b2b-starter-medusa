import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreManufacturersFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listManufacturersQueryConfig = defineQueryConfig({
  defaults: defaultStoreManufacturersFields,
  allowed: defaultStoreManufacturersFields,
  defaultLimit: 50,
});
