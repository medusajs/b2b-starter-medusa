import { requireCompanyAccess } from "../companies/route";

export const middlewares = [requireCompanyAccess];