import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetSolar-detectionParamsType = z.infer<typeof GetSolar-detectionParams>;
export const GetSolar-detectionParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
