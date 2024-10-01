import { createSelectParams } from "@medusajs/medusa/dist/api/utils/validators";
import { z } from "zod";

export type AdminGetQuoteParamsType = z.infer<typeof AdminGetQuoteParams>;
export const AdminGetQuoteParams = createSelectParams();
