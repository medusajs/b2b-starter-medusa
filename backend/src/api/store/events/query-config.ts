
export const defaultStoreEventsFields = [
  "id",
  "created_at",
  "updated_at",
];

export const listEventsQueryConfig = {
  defaults: defaultStoreEventsFields,
  allowed: defaultStoreEventsFields,
  defaultLimit: 50,
};
