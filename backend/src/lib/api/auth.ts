import { MedusaRequest, MedusaResponse, AuthenticatedMedusaRequest } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { AuthContext, AuthenticatedRequest } from "./types";

/**
 * Extract authentication context from request
 */
export const getAuthContext = async (req: AuthenticatedMedusaRequest): Promise<AuthContext | null> => {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
    const customerId = req.auth_context?.actor_id;

    if (!customerId) {
        return null;
    }

    // Check if user is admin
    const { data: [user] } = await query.graph({
        entity: "customer",
        fields: ["role"],
        filters: { id: customerId }
    });

    const isAdmin = user?.role === "admin";

    if (isAdmin) {
        return {
            customerId,
            isAdmin: true,
            companyId: undefined,
            employeeId: undefined
        };
    }

    // Get employee info for company member
    const { data: [employee] } = await query.graph({
        entity: "employee",
        fields: ["id", "company_id", "is_admin"],
        filters: { customer_id: customerId, is_active: true }
    });

    return {
        customerId,
        isAdmin: false,
        companyId: employee?.company_id,
        employeeId: employee?.id
    };
};

/**
 * Check if user has access to a company
 */
export const checkCompanyAccess = (auth: AuthContext, companyId?: string): boolean => {
    if (auth.isAdmin) return true;
    return auth.companyId === companyId;
};

/**
 * Check if user owns a resource or is admin
 */
export const checkOwnership = (auth: AuthContext, ownerId: string): boolean => {
    if (auth.isAdmin) return true;
    return auth.customerId === ownerId;
};

/**
 * Middleware to require authentication
 */
export const requireAuth = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: () => void
) => {
    const auth = await getAuthContext(req as AuthenticatedMedusaRequest);
    if (!auth) {
        return res.status(401).json({ message: "Authentication required" });
    }

    (req as AuthenticatedRequest).auth = auth;
    return next();
};

/**
 * Middleware to require admin access
 */
export const requireAdmin = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: () => void
) => {
    const auth = await getAuthContext(req as AuthenticatedMedusaRequest);
    if (!auth?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }

    (req as AuthenticatedRequest).auth = auth;
    return next();
};

/**
 * Middleware to require company access
 */
export const requireCompanyAccess = async (
    req: MedusaRequest,
    res: MedusaResponse,
    next: () => void
) => {
    const auth = await getAuthContext(req as AuthenticatedMedusaRequest);
    if (!auth) {
        return res.status(401).json({ message: "Authentication required" });
    }

    (req as AuthenticatedRequest).auth = auth;
    return next();
};