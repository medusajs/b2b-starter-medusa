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
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    logo_url: z.string().optional().nullable(),
  })
  .strict();

export type UpdateCompanyType = z.infer<typeof UpdateCompany>;
export const UpdateCompany = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    currency_code: z.string().optional(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    zip: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    logo_url: z.string().optional().nullable(),
  })
  .strict();
