/* Entity: Company */

import { CustomerGroupDTO } from "@medusajs/framework/types";
import { CustomerDTO } from "@medusajs/types/dist/customer/common";
import { ModuleApprovalSettings } from "../approval/module";

export enum ModuleCompanySpendingLimitResetFrequency {
  NEVER = "never",
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export type ModuleCompany = {
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
  currency_code: string | null;
  spending_limit_reset_frequency: ModuleCompanySpendingLimitResetFrequency;
  created_at: Date;
  updated_at: Date;
  customer_group: CustomerGroupDTO;
  approval_settings: ModuleApprovalSettings;
};

export type ModuleCreateCompany = {
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
  spending_limit_reset_frequency: ModuleCompanySpendingLimitResetFrequency | null;
};

export interface ModuleUpdateCompany extends Partial<ModuleCompany> {
  id: string;
}

export type ModuleDeleteCompany = {
  id: string;
};

/* Entity: Employee */

export interface ModuleEmployee {
  id: string;
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
  created_at: Date;
  updated_at: Date;
  customer: CustomerDTO;
  company: ModuleCompany;
}

export type ModuleCreateEmployee = {
  customer_id: string;
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
};

export interface ModuleUpdateEmployee extends Partial<ModuleEmployee> {
  id: string;
}

export type ModuleDeleteEmployee = {
  id: string;
};

/* Entity: CompanyAddress */

export interface ModuleCompanyAddress {
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
  created_at: Date;
  updated_at: Date;
  company: ModuleCompany;
}

export type ModuleCreateCompanyAddress = {
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
  company_id: string;
};

export interface ModuleUpdateCompanyAddress
  extends Partial<ModuleCompanyAddress> {
  id: string;
}

export type ModuleDeleteCompanyAddress = {
  id: string;
};
