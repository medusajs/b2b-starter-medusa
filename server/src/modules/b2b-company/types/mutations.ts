import { CompanyDTO } from "./common.ts";
import { EmployeeDTO } from "./common.ts";

export interface CreateCompanyDTO {
  name: string;
  email: string;
  cnpj: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  logo_url?: string;
  currency_code?: string;
  spending_limit_reset_frequency?: "never" | "daily" | "weekly" | "monthly" | "yearly";
}

export interface UpdateCompanyDTO {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  logo_url?: string;
  currency_code?: string;
  spending_limit_reset_frequency?: "never" | "daily" | "weekly" | "monthly" | "yearly";
  is_active?: boolean;
}

export interface CreateEmployeeDTO {
  customer_id: string;
  company_id: string;
  spending_limit?: number;
  is_admin?: boolean;
  role?: "admin" | "manager" | "buyer" | "viewer";
}

export interface UpdateEmployeeDTO {
  id: string;
  spending_limit?: number;
  is_admin?: boolean;
  role?: "admin" | "manager" | "buyer" | "viewer";
  is_active?: boolean;
}

export interface CompanySearchDTO {
  cnpj?: string;
  email_domain?: string;
  name?: string;
  is_active?: boolean;
}

export interface BulkImportCompanyDTO {
  companies: CreateCompanyDTO[];
}

export interface BulkExportCompanyDTO {
  company_ids?: string[];
  filters?: CompanySearchDTO;
}
