import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type GetImportCatalogParamsType = z.infer<typeof GetImportCatalogParams>;
export const GetImportCatalogParams = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
