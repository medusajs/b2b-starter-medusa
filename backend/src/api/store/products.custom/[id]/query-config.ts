import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[id]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[id]QueryConfig = defineQueryConfig({
  defaults: defaultStore[id]Fields,
  allowed: defaultStore[id]Fields,
  defaultLimit: 50,
});
