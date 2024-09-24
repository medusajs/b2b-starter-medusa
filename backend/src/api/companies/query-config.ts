export const companyFields = [
  "id",
  "name",
  "logo_url",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "zip",
  "country",
  "currency_code",
  "customers.*",
];

export const retrieveCompanyTransformQueryConfig = {
  defaults: companyFields,
  isList: false,
};
