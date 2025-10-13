import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetValidate-mpptParamsType = z.infer<typeof GetValidate-mpptParams>;
export const GetValidate-mpptParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
