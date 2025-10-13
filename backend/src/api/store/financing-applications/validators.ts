import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetFinancing-applicationsParamsType = z.infer<typeof GetFinancing-applicationsParams>;
export const GetFinancing-applicationsParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
