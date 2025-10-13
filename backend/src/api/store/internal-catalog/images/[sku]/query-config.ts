import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[sku]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[sku]QueryConfig = defineQueryConfig({
  defaults: defaultStore[sku]Fields,
  allowed: defaultStore[sku]Fields,
  defaultLimit: 50,
});
