
export const defaultStorePricesFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPricesQueryConfig = {
  defaults: defaultStorePricesFields,
  allowed: defaultStorePricesFields,
  defaultLimit: 50,
};
