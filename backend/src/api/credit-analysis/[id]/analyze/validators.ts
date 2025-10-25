import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetAnalyzeParamsType = z.infer<typeof GetAnalyzeParams>;
export const GetAnalyzeParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
