import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStoreCatalogFields = [
  "id",
  "sku",
  "name",
  "category",
  "manufacturer",
  "price",
  "stock",
  "image_url",
];

export const listCatalogQueryConfig = defineQueryConfig({
  defaults: defaultStoreCatalogFields,
  allowed: [
    ...defaultStoreCatalogFields,
    "description",
    "specifications",
    "metadata",
  ],
  defaultLimit: 50,
});
