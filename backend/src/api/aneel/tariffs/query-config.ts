
export const defaultStoreTariffsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listTariffsQueryConfig = {
  defaults: defaultStoreTariffsFields,
  allowed: defaultStoreTariffsFields,
  defaultLimit: 50,
};
