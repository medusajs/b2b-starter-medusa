
export const defaultStoreRecommendProductsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listRecommendProductsQueryConfig = {
  defaults: defaultStoreRecommendProductsFields,
  allowed: defaultStoreRecommendProductsFields,
  defaultLimit: 50,
};
