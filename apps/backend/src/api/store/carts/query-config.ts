export const cartFields = [
  "id",
  "*items",
  "*customer",
  "*company",
  "*region",
  "currency_code",
];

export const retrieveCartTransformQueryConfig = {
  defaults: cartFields,
  isList: false,
};
