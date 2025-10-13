import { CustomerDTO, CustomerGroupDTO } from "@medusajs/framework/types";

export interface CompanyDTO {
  id: string;
  name: string;
  email: string;
  cnpj: string;
  email_domain: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  logo_url: string | null;
  currency_code: string;
  spending_limit_reset_frequency: "never" | "daily" | "weekly" | "monthly" | "yearly";
  customer_group_id: string | null;
  is_active: boolean;
  employees?: EmployeeDTO[];
  customer_group?: CustomerGroupDTO;
  created_at: Date;
  updated_at: Date;
}

export interface EmployeeDTO {
  id: string;
  customer_id: string;
  spending_limit: number;
  is_admin: boolean;
  role: "admin" | "manager" | "buyer" | "viewer";
  is_active: boolean;
  company_id: string;
  company?: CompanyDTO;
  customer?: CustomerDTO;
  created_at: Date;
  updated_at: Date;
}
