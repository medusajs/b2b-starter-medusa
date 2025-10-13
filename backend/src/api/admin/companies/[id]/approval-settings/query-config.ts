import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreApproval-settingsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listApproval-settingsQueryConfig = defineQueryConfig({
  defaults: defaultStoreApproval-settingsFields,
  allowed: defaultStoreApproval-settingsFields,
  defaultLimit: 50,
});
