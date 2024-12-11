import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createEmployeesWorkflow } from "../../../../../workflows/employee/workflows";
import {
  AdminCreateEmployeeType,
  AdminGetEmployeeParamsType,
} from "../../validators";

export const GET = async (
  req: MedusaRequest<AdminGetEmployeeParamsType>,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: employees, metadata } = await query.graph(
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

  res.json({
    employees,
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take,
  });
};

export const POST = async (
  req: MedusaRequest<AdminCreateEmployeeType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { id } = req.params;

  const { result: createdEmployee } = await createEmployeesWorkflow.run({
    input: {
      employeeData: { ...req.validatedBody, company_id: id },
      customerId: req.validatedBody.customer_id,
    },
    container: req.scope,
  });

  const {
    data: [employee],
  } = await query.graph(
    {
      entity: "employee",
      fields: req.remoteQueryConfig.fields,
      filters: { id: createdEmployee.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ employee });
};
