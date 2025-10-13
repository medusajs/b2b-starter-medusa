import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreApprovalSettingsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listApprovalSettingsQueryConfig = defineQueryConfig({
  defaults: defaultStoreApproval-settingsFields,
  allowed: defaultStoreApproval-settingsFields,
  defaultLimit: 50,
});
