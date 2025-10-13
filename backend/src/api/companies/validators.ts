import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";

/* Unified Company Validators */
export const GetCompaniesParams = createSelectParams().extend({
    q: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    limit: z.coerce.number().optional().default(50),
    offset: z.coerce.number().optional().default(0),
});

export type GetCompaniesParamsType = z.infer<typeof GetCompaniesParams>;

export type CreateCompanyType = z.infer<typeof CreateCompany>;
export const CreateCompany = z
    .object({
        name: z.string().min(1),
        email: z.string().email(),
        currency_code: z.string().default("BRL"),
        phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        zip: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        logo_url: z.string().optional().nullable(),
        spending_limit_reset_frequency: z
            .enum(["never", "daily", "weekly", "monthly", "yearly"])
            .optional()
            .nullable()
            .default("monthly"),
    })
    .strict();

export type UpdateCompanyType = z.infer<typeof UpdateCompany>;
export const UpdateCompany = CreateCompany.partial();