import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type GetEmployeeParamsType = z.infer<typeof GetEmployeeParams>;
export const GetEmployeeParams = createSelectParams();

export type CreateEmployeeType = z.infer<typeof CreateEmployee>;
export const CreateEmployee = z
  .object({
    spending_limit: z.number().optional(),
    raw_spending_limit: z
      .object({
        value: z.number().optional(),
        precision: z.number().optional(),
      })
      .optional(),
    company_name: z.string().optional(),
    is_admin: z.boolean().optional(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    company_id: z.string(),
  })
  .strict();

export type UpdateEmployeeType = z.infer<typeof UpdateEmployee>;
export const UpdateEmployee = z
  .object({
    id: z.string(),
    spending_limit: z.number().optional(),
    raw_spending_limit: z
      .object({
        value: z.number().optional(),
        precision: z.number().optional(),
      })
      .optional(),
    is_admin: z.boolean().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .strict();
