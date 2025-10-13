
export const defaultStoreLeadsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listLeadsQueryConfig = {
  defaults: defaultStoreLeadsFields,
  allowed: defaultStoreLeadsFields,
  defaultLimit: 50,
};
