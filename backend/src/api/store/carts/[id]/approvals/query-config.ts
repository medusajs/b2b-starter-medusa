import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreApprovalsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listApprovalsQueryConfig = defineQueryConfig({
  defaults: defaultStoreApprovalsFields,
  allowed: defaultStoreApprovalsFields,
  defaultLimit: 50,
});
