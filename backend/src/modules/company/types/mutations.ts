import { CompanyDTO } from "./common";
import { EmployeeDTO } from "./common";

export interface CreateCompanyDTO
  extends Omit<Partial<CompanyDTO>, "id" | "createdAt" | "updatedAt"> {}

export interface UpdateCompanyDTO extends Partial<CompanyDTO> {
  id: string;
}

export interface DeleteCompanyDTO {
  id: string;
}

export interface CreateEmployeeDTO
  extends Omit<Partial<EmployeeDTO>, "id" | "createdAt" | "updatedAt"> {
  customer_id: string;
}

export interface UpdateEmployeeDTO extends Partial<EmployeeDTO> {
  id: string;
}

export interface DeleteEmployeeDTO {
  id: string;
}
