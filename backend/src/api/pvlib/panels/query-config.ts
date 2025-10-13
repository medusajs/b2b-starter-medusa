import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStorePanelsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPanelsQueryConfig = defineQueryConfig({
  defaults: defaultStorePanelsFields,
  allowed: defaultStorePanelsFields,
  defaultLimit: 50,
});
