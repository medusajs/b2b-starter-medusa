export const approvalFields = [
  "cart.*",
  "cart.items.*",
  "cart.customer.*",
  "cart.company.*",
  "cart.region.*",
  "cart.approvals.*",
];

export const approvalTransformQueryConfig = {
  defaults: approvalFields,
  isList: true,
};
