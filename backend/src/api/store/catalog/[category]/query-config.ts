import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[category]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[category]QueryConfig = defineQueryConfig({
  defaults: defaultStore[category]Fields,
  allowed: defaultStore[category]Fields,
  defaultLimit: 50,
});
