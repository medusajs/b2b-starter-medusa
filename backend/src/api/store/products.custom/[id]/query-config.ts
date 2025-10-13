export const defaultStoreProductsCustomIdFields = [
  "id",
  "created_at",
  "updated_at",
];

export const retrieveProductsCustomQueryConfig = {
  defaults: defaultStoreProductsCustomIdFields,
  allowed: defaultStoreProductsCustomIdFields,
  defaultLimit: 50,
};
