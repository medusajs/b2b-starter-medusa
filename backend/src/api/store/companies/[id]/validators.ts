import { z } from "zod";

export type GetIdParamsType = z.infer<typeof GetIdParams>;
export const GetIdParams = z.object({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
