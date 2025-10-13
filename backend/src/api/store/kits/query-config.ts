
export const defaultStoreKitsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listKitsQueryConfig = {
  defaults: defaultStoreKitsFields,
  allowed: defaultStoreKitsFields,
  defaultLimit: 50,
};
