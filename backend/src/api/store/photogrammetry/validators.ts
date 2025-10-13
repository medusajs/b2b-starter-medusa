import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetPhotogrammetryParamsType = z.infer<typeof GetPhotogrammetryParams>;
export const GetPhotogrammetryParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
