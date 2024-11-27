import { Modules } from "@medusajs/framework/utils";
import { removeRemoteLinkStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { COMPANY_MODULE } from "../../../modules/company";
import { removeCompanyEmployeesFromCustomerGroupStep } from "../steps/remove-company-employees-from-customer-group";

export const removeCompanyFromCustomerGroupWorkflow = createWorkflow(
  "remove-company-from-customer-group",
  function (input: { company_id: string; group_id: string }) {
    removeCompanyEmployeesFromCustomerGroupStep({
      company_id: input.company_id,
    });

    removeRemoteLinkStep([
      {
        [COMPANY_MODULE]: {
          company_id: input.company_id,
        },
        [Modules.CUSTOMER]: {
          customer_group_id: input.group_id,
        },
      },
    ]);

    return new WorkflowResponse(input);
  }
);
