import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { ContainerRegistrationKeys } from "@medusajs/utils";
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
      entity: "employee",
      fields: req.remoteQueryConfig.fields,
      filters: {
        company_id: id,
        ...req.filterableFields,
      },
    },
    { throwIfKeyNotFound: true }
  );

  return res.json({
    employees: data,
    metadata,
  });
};

export const POST = async (
  req: MedusaRequest<CreateEmployeeType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  let { is_admin, spending_limit, customer_id } = req.body;

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

  return res.json({ employee: result });
};
