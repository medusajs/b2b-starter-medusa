export const approvalFields = [
  "*",
  "cart.*",
  "cart.items.*",
  "cart.customer.*",
  "cart.company.*",
  "cart.region.*",
];

export const approvalTransformQueryConfig = {
  defaults: approvalFields,
  isList: true,
};
