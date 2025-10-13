import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[customer_id]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[customer_id]QueryConfig = defineQueryConfig({
  defaults: defaultStore[customer_id]Fields,
  allowed: defaultStore[customer_id]Fields,
  defaultLimit: 50,
});
