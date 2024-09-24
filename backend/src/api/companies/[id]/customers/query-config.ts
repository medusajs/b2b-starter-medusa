export const companyCustomerFields = [
  "id",
  "spending_limit",
  "is_admin",
  "customer_id",
  "customer.*",
  "company_id",
  "company.*",
];

export const retrieveCompanyCustomerTransformQueryConfig = {
  defaults: companyCustomerFields,
  isList: false,
};
