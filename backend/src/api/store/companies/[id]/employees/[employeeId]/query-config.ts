import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[employeeId]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[employeeId]QueryConfig = defineQueryConfig({
  defaults: defaultStore[employeeId]Fields,
  allowed: defaultStore[employeeId]Fields,
  defaultLimit: 50,
});
