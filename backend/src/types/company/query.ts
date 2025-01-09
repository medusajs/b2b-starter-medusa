import { CustomerDTO } from "@medusajs/types";
import { ModuleCompany, ModuleEmployee } from "./module";
import { QueryApprovalSettings } from "../approval/query";

export type QueryCompany = ModuleCompany & {
  employees: QueryEmployee[];
  approval_settings: QueryApprovalSettings;
};

export type QueryEmployee = ModuleEmployee & {
  company: QueryCompany;
  customer: CustomerDTO;
};
