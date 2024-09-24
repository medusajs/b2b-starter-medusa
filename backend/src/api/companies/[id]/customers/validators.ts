import { createSelectParams } from "@medusajs/medusa/dist/api/utils/validators";
import { z } from "zod";

export type GetCompanyCustomerParamsType = z.infer<
  typeof GetCompanyCustomerParams
>;
export const GetCompanyCustomerParams = createSelectParams();

export type CreateCompanyCustomerType = z.infer<typeof CreateCompanyCustomer>;
export const CreateCompanyCustomer = z
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

export type UpdateCompanyCustomerType = z.infer<typeof UpdateCompanyCustomer>;
export const UpdateCompanyCustomer = z
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
