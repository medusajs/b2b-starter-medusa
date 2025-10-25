import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetApprovalSettingsParamsType = z.infer<typeof GetApprovalSettingsParams>;
export const GetApprovalSettingsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
