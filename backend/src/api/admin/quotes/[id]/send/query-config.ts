import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreSendFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSendQueryConfig = defineQueryConfig({
  defaults: defaultStoreSendFields,
  allowed: defaultStoreSendFields,
  defaultLimit: 50,
});
