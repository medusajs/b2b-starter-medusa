
export const defaultStoreHealthFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listHealthQueryConfig = {
  defaults: defaultStoreHealthFields,
  allowed: defaultStoreHealthFields,
  defaultLimit: 50,
};
