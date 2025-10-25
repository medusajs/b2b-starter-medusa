
export const defaultStorePreloadFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPreloadQueryConfig = {
  defaults: defaultStorePreloadFields,
  allowed: defaultStorePreloadFields,
  defaultLimit: 50,
};
