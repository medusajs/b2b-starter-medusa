import { CustomerDTO } from "@medusajs/types";
import { ModuleCompany, ModuleEmployee } from "./module";

export type QueryCompany = ModuleCompany & {
  employees: QueryEmployee[];
};

export type QueryEmployee = ModuleEmployee & {
  company: QueryCompany;
  customer: CustomerDTO;
};
