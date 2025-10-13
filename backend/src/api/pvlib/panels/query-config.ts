
export const defaultStorePanelsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listPanelsQueryConfig = {
  defaults: defaultStorePanelsFields,
  allowed: defaultStorePanelsFields,
  defaultLimit: 50,
};
