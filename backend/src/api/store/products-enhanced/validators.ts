import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetProducts-enhancedParamsType = z.infer<typeof GetProducts-enhancedParams>;
export const GetProducts-enhancedParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
