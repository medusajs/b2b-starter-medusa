import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[quote_id]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[quote_id]QueryConfig = defineQueryConfig({
  defaults: defaultStore[quote_id]Fields,
  allowed: defaultStore[quote_id]Fields,
  defaultLimit: 50,
});
