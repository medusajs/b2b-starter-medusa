import { FindParams, PaginatedResponse } from "@medusajs/types";
import { ModuleCompanySpendingLimitResetFrequency } from "./module";
import { QueryCompany, QueryEmployee } from "./query";
import { ModuleCompanyFilters, ModuleEmployeeFilters } from "./service";

/* Filters */

export interface CompanyFilterParams extends FindParams, ModuleCompanyFilters {}

export interface EmployeeFilterParams
  extends FindParams,
    ModuleEmployeeFilters {}

/* Admin */

/* Company */
export type AdminCompanyResponse = {
  company: QueryCompany;
};

export type AdminCompaniesResponse = PaginatedResponse<{
  companies: QueryCompany[];
}>;

export type AdminCreateCompany = {
  name: string;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  logo_url: string | null;
  currency_code: string;
};

/* Employee */

export type AdminEmployeeResponse = {
  employee: QueryEmployee;
};

export type AdminEmployeesResponse = PaginatedResponse<{
  employees: QueryEmployee[];
}>;

export type AdminCreateEmployee = {
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
};

/* Store */

/* Company */

export type StoreCompanyResponse = {
  company: QueryCompany;
};

export type StoreCompaniesResponse = PaginatedResponse<{
  companies: QueryCompany[];
}>;

export type StoreCompanyPreviewResponse = {
  company: QueryCompany;
};

export type StoreCreateCompany = {
  name: string;
  phone?: string | null;
  email: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  logo_url?: string | null;
  currency_code: string;
};

export type StoreUpdateCompany = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  logo_url: string | null;
  currency_code: string;
  spending_limit_reset_frequency?: ModuleCompanySpendingLimitResetFrequency;
};

/* Employee */

export type StoreEmployeeResponse = {
  employee: QueryEmployee;
};

export type StoreEmployeesResponse = PaginatedResponse<{
  employees: QueryEmployee[];
}>;

export type StoreCreateEmployee = {
  customer_id: string;
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
};

export type StoreUpdateEmployee = {
  id: string;
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
};

/* Company Address */

export type CompanyAddress = {
  id: string;
  label: string;
  address_1: string;
  address_2: string | null;
  city: string;
  province: string | null;
  postal_code: string;
  country_code: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  is_default: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
};

export type StoreCompanyAddressesResponse = PaginatedResponse<{
  addresses: CompanyAddress[];
}>;

export type StoreCompanyAddressResponse = {
  address: CompanyAddress;
};

export type StoreCreateCompanyAddress = {
  label: string;
  address_1: string;
  address_2?: string | null;
  city: string;
  province?: string | null;
  postal_code: string;
  country_code: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  is_default?: boolean;
};

export type StoreUpdateCompanyAddress = {
  id: string;
  label?: string;
  address_1?: string;
  address_2?: string | null;
  city?: string;
  province?: string | null;
  postal_code?: string;
  country_code?: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  is_default?: boolean;
};
