import { CompanyDTO } from "./common";
import { CompanyCustomerDTO } from "./common";

export interface CreateCompanyDTO
  extends Omit<Partial<CompanyDTO>, "id" | "createdAt" | "updatedAt"> {}

export interface UpdateCompanyDTO extends Partial<CompanyDTO> {
  id: string;
}

export interface DeleteCompanyDTO {
  id: string;
}

export interface CreateCompanyCustomerDTO
  extends Omit<Partial<CompanyCustomerDTO>, "id" | "createdAt" | "updatedAt"> {
  company_id: string;
}

export interface UpdateCompanyCustomerDTO extends Partial<CompanyCustomerDTO> {
  id: string;
}

export interface DeleteCompanyCustomerDTO {
  id: string;
}
