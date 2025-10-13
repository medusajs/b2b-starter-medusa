export const defaultStoreSearchFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listSearchQueryConfig = {
  defaults: defaultStoreSearchFields,
  allowed: defaultStoreSearchFields,
  defaultLimit: 50,
};
