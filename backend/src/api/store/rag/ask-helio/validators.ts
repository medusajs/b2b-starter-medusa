import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetAsk-helioParamsType = z.infer<typeof GetAsk-helioParams>;
export const GetAsk-helioParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
