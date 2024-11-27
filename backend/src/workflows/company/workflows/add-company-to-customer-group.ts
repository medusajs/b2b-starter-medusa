import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createRemoteLinkStep } from "@medusajs/core-flows";
import { COMPANY_MODULE } from "../../../modules/company";
import { Modules } from "@medusajs/framework/utils";
import { addCompanyEmployeesToCustomerGroupStep } from "../steps/add-company-employees-to-customer-group";

export const addCompanyToCustomerGroupWorkflow = createWorkflow(
  "add-company-to-customer-group",
  function (input: { company_id: string; group_id: string }) {
    createRemoteLinkStep([
      {
        [COMPANY_MODULE]: {
          company_id: input.company_id,
        },
        [Modules.CUSTOMER]: {
          customer_group_id: input.group_id,
        },
      },
    ]);

    addCompanyEmployeesToCustomerGroupStep({
      company_id: input.company_id,
    });

    return new WorkflowResponse(input);
  }
);
