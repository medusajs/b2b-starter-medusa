import { createSelectParams } from "@medusajs/medusa/api/utils/validators";
import { z } from "zod";
import { ApprovalStatusType } from "../../../types/approval";

/* Company Validators */
export type StoreGetCompanyParamsType = z.infer<typeof StoreGetCompanyParams>;
export const StoreGetCompanyParams = createSelectParams();

export type StoreCreateCompanyType = z.infer<typeof StoreCreateCompany>;
export const StoreCreateCompany = z
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
    spending_limit_reset_frequency: z
      .enum(["never", "daily", "weekly", "monthly", "yearly"])
      .optional()
      .nullable(),
  })
  .strict();

export type StoreUpdateCompanyType = z.infer<typeof StoreUpdateCompany>;
export const StoreUpdateCompany = z
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
    spending_limit_reset_frequency: z
      .enum(["never", "daily", "weekly", "monthly", "yearly"])
      .optional()
      .nullable(),
  })
  .strict();

/* Employee Validators */
export type StoreGetEmployeeParamsType = z.infer<typeof StoreGetEmployeeParams>;
export const StoreGetEmployeeParams = createSelectParams();

export type StoreCreateEmployeeType = z.infer<typeof StoreCreateEmployee>;
export const StoreCreateEmployee = z
  .object({
    spending_limit: z.number().optional().nullable(),
    is_admin: z.boolean().optional().nullable().default(false),
    customer_id: z.string(),
  })
  .strict();

export type StoreUpdateEmployeeType = z.infer<typeof StoreUpdateEmployee>;
export const StoreUpdateEmployee = z
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

/* Approval Settings Validators */
export type StoreGetApprovalSettingsParamsType = z.infer<
  typeof StoreGetApprovalSettingsParams
>;
export const StoreGetApprovalSettingsParams = createSelectParams();

export type StoreUpdateApprovalSettingsType = z.infer<
  typeof StoreUpdateApprovalSettings
>;
export const StoreUpdateApprovalSettings = z
  .object({
    requires_admin_approval: z.boolean(),
  })
  .strict();

/* Approval Validators */
export type StoreGetApprovalParamsType = z.infer<typeof StoreGetApprovalParams>;
export const StoreGetApprovalParams = createSelectParams();

export type StoreUpdateApprovalType = z.infer<typeof StoreUpdateApproval>;
export const StoreUpdateApproval = z.object({
  status: z.nativeEnum(ApprovalStatusType),
  handled_by: z.string(),
});

export type StoreDeleteApprovalType = z.infer<typeof StoreDeleteApproval>;
export const StoreDeleteApproval = z.object({
  id: z.string(),
});

/* CompanyAddress Validators */
export type StoreGetCompanyAddressParamsType = z.infer<
  typeof StoreGetCompanyAddressParams
>;
export const StoreGetCompanyAddressParams = createSelectParams();

export type StoreCreateCompanyAddressType = z.infer<
  typeof StoreCreateCompanyAddress
>;
export const StoreCreateCompanyAddress = z
  .object({
    label: z.string(),
    address_1: z.string(),
    address_2: z.string().optional().nullable(),
    city: z.string(),
    province: z.string().optional().nullable(),
    postal_code: z.string(),
    country_code: z.string(),
    phone: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    is_default: z.boolean().optional().default(false),
  })
  .strict();

export type StoreUpdateCompanyAddressType = z.infer<
  typeof StoreUpdateCompanyAddress
>;
export const StoreUpdateCompanyAddress = z
  .object({
    label: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional().nullable(),
    city: z.string().optional(),
    province: z.string().optional().nullable(),
    postal_code: z.string().optional(),
    country_code: z.string().optional(),
    phone: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    companyName: z.string().optional().nullable(),
    is_default: z.boolean().optional(),
  })
  .strict();
