import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetSolarDetectionParamsType = z.infer<typeof GetSolarDetectionParams>;
export const GetSolarDetectionParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
