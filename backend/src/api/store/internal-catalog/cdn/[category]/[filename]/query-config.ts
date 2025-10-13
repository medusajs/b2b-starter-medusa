import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[filename]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[filename]QueryConfig = defineQueryConfig({
  defaults: defaultStore[filename]Fields,
  allowed: defaultStore[filename]Fields,
  defaultLimit: 50,
});
