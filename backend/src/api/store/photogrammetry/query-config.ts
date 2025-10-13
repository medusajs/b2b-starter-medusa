import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStorePhotogrammetryFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPhotogrammetryQueryConfig = defineQueryConfig({
  defaults: defaultStorePhotogrammetryFields,
  allowed: defaultStorePhotogrammetryFields,
  defaultLimit: 50,
});
