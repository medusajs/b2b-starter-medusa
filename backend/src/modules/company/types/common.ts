import { CustomerDTO } from "@medusajs/types";

export interface CompanyDTO {
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
  customers?: CompanyCustomerDTO[];
  currency_code: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CompanyCustomerDTO extends CustomerDTO {
  id: string;
  spending_limit: number;
  is_admin: boolean;
  company_id: string;
  company?: CompanyDTO;
  customer?: CustomerDTO;
  created_at: Date;
  updated_at: Date;
}
