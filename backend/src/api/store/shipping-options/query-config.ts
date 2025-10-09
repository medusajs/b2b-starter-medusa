export const shippingOptionFields = [
  "id",
  "name",
  "amount",
  "service_zone.id",
  "service_zone.fulfillment_set_id",
];

export const retrieveShippingOptionTransformQueryConfig = {
  defaults: shippingOptionFields,
  isList: false,
};

export const listShippingOptionsTransformQueryConfig = {
  defaults: shippingOptionFields,
  isList: true,
};
