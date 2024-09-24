export const employeeFields = [
  "id",
  "spending_limit",
  "is_admin",
  "customer_id",
  "customer.*",
  "company_id",
  "company.*",
];

export const retrieveEmployeeTransformQueryConfig = {
  defaults: employeeFields,
  isList: false,
};
