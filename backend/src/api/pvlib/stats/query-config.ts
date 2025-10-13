
export const defaultStoreStatsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listStatsQueryConfig = {
  defaults: defaultStoreStatsFields,
  allowed: defaultStoreStatsFields,
  defaultLimit: 50,
};
