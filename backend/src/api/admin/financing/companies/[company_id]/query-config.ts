import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore[company_id]Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list[company_id]QueryConfig = defineQueryConfig({
  defaults: defaultStore[company_id]Fields,
  allowed: defaultStore[company_id]Fields,
  defaultLimit: 50,
});
