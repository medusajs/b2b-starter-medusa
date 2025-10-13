import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetSolar-calculationsParamsType = z.infer<typeof GetSolar-calculationsParams>;
export const GetSolar-calculationsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
