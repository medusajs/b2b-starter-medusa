import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetFinancingApplicationsParamsType = z.infer<typeof GetFinancingApplicationsParams>;
export const GetFinancingApplicationsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
