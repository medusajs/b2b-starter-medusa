import { CompanyDTO } from "./common";

export interface CreateCompanyDTO
  extends Omit<Partial<CompanyDTO>, "id" | "createdAt" | "updatedAt"> {}

export interface UpdateCompanyDTO extends Partial<CompanyDTO> {
  id: string;
}

export interface DeleteCompanyDTO {
  id: string;
}
