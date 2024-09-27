import { createCustomersWorkflow } from "@medusajs/core-flows";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { createEmployeesWorkflow } from "../../../../../workflows/employee/workflows";
import { CreateEmployeeType, GetEmployeeParamsType } from "./validators";

export const GET = async (
  req: MedusaRequest<GetEmployeeParamsType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data, metadata } = await query.graph(
    {
      entity: "company_customers",
      fields: req.remoteQueryConfig.fields,
      filters: {
        company_id: id,
        ...req.filterableFields,
      },
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({
    company_customers: data,
    metadata,
  });
};

export const POST = async (
  req: MedusaRequest<CreateEmployeeType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  let { is_admin, spending_limit, ...customerData } = req.body;

  const { result: customers } = await createCustomersWorkflow.run({
    input: {
      customersData: [customerData],
    },
    container: req.scope,
  });

  const customer_id = customers[0].id;

  const { result } = await createEmployeesWorkflow.run({
    input: [
      {
        employeeData: {
          company_id: id,
          customer_id,
          is_admin,
          spending_limit,
        },
        customerId: customer_id,
      },
    ],
    container: req.scope,
  });

  return res.json({ company_customers: result });
};
