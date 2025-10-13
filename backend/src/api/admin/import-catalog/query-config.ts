
export const defaultStoreImportCatalogFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listImportCatalogQueryConfig = {
  defaults: defaultStoreImportCatalogFields,
  allowed: defaultStoreImportCatalogFields,
  defaultLimit: 50,
};
