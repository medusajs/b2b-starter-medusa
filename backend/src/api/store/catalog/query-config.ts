
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

export const listCatalogQueryConfig = {
  defaults: defaultStoreCatalogFields,
  allowed: [
    ...defaultStoreCatalogFields,
    "description",
    "specifications",
    "metadata",
  ],
  defaultLimit: 50,
};
