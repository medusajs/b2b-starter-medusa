import { MedusaRequest } from "@medusajs/framework";

/**
 * Extended request types with authentication context
 */

export interface AuthContext {
    customerId: string;
    isAdmin: boolean;
    companyId?: string;
    employeeId?: string;
}

export interface AuthenticatedRequest extends MedusaRequest {
    auth?: AuthContext;
}