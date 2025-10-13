import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[customerGroupId]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[customerGroupId]QueryConfig = defineQueryConfig({
  defaults: defaultStore[customerGroupId]Fields,
  allowed: defaultStore[customerGroupId]Fields,
  defaultLimit: 50,
});
