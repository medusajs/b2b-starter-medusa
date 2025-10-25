import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreMessagesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listMessagesQueryConfig = defineQueryConfig({
  defaults: defaultStoreMessagesFields,
  allowed: defaultStoreMessagesFields,
  defaultLimit: 50,
});
