import { HttpTypes } from "@medusajs/framework/types";
import { CustomerDTO } from "@medusajs/types";
import { QueryApprovalSettings } from "../approval/query";
import { ModuleCompany, ModuleEmployee } from "./module";

export type QueryCompany = ModuleCompany & {
  employees: QueryEmployee[];
  approval_settings: QueryApprovalSettings;
  carts: HttpTypes.StoreCart[];
  products: HttpTypes.AdminProduct[];
};

export type QueryEmployee = ModuleEmployee & {
  company: QueryCompany;
  customer: CustomerDTO;
};
