import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

export type GetCompanyParamsType = z.infer<typeof GetCompanyParams>;
export const GetCompanyParams = createSelectParams();

export type CreateCompanyType = z.infer<typeof CreateCompany>;
export const CreateCompany = z
  .object({
    name: z.string(),
    email: z.string(),
    currency_code: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string().optional(),
    zip: z.string(),
    country: z.string(),
    logo_url: z.string().optional(),
  })
  .strict();

export type UpdateCompanyType = z.infer<typeof UpdateCompany>;
export const UpdateCompany = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    currency_code: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    logo_url: z.string().optional(),
  })
  .strict();
