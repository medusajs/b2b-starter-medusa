import { createWorkflow } from "@medusajs/workflows-sdk";
import { ModuleDeleteCompany } from "@starter/types";
import { deleteCompaniesStep } from "../steps";

export const deleteCompaniesWorkflow = createWorkflow(
  "delete-companies",
  function (input: ModuleDeleteCompany) {
    deleteCompaniesStep([input.id]);
  }
);
