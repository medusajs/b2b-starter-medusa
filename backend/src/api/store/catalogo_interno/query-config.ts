
export const defaultStoreInternalCatalogFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listInternalCatalogQueryConfig = {
  defaults: defaultStoreInternalCatalogFields,
  allowed: defaultStoreInternalCatalogFields,
  defaultLimit: 50,
};
