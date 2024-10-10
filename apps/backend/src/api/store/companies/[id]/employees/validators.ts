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
    is_admin: z.boolean().optional(),
    customer_id: z.string(),
  })
  .strict();

export type UpdateEmployeeType = z.infer<typeof UpdateEmployee>;
export const UpdateEmployee = z
  .object({
    spending_limit: z.number().optional(),
    raw_spending_limit: z
      .object({
        value: z.number().optional(),
        precision: z.number().optional(),
      })
      .optional(),
    is_admin: z.boolean().optional(),
  })
  .strict();
