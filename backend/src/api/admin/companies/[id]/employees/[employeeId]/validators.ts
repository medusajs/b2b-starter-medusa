import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetEmployeeIdParamsType = z.infer<typeof GetEmployeeIdParams>;
export const GetEmployeeIdParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
