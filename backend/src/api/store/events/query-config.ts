import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreEventsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listEventsQueryConfig = defineQueryConfig({
  defaults: defaultStoreEventsFields,
  allowed: defaultStoreEventsFields,
  defaultLimit: 50,
});
