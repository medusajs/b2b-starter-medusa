import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultCompanyFields = [
    "id",
    "name",
    "email",
    "phone",
    "address",
    "city",
    "state",
    "zip",
    "country",
    "logo_url",
    "spending_limit_reset_frequency",
    "created_at",
    "updated_at",
];

export const defaultCompanyRelations = [
    "employees",
    "employees.customer",
];

export const listCompaniesQueryConfig = defineQueryConfig({
    defaults: defaultCompanyFields,
    allowed: [
        ...defaultCompanyFields,
        ...defaultCompanyRelations,
    ],
    defaultLimit: 50,
});

export const retrieveCompanyQueryConfig = defineQueryConfig({
    defaults: [...defaultCompanyFields, ...defaultCompanyRelations],
    allowed: [
        ...defaultCompanyFields,
        ...defaultCompanyRelations,
    ],
});