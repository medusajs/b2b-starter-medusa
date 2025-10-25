import type {
    AuthenticatedMedusaRequest as BaseAuthenticatedMedusaRequest,
    MedusaNextFunction as BaseMedusaNextFunction,
    MedusaRequest as BaseMedusaRequest,
    MedusaResponse as BaseMedusaResponse,
    MedusaStoreRequest as BaseMedusaStoreRequest,
} from "@medusajs/framework/http";

declare global {
    type MedusaRequest<Body = unknown, Query = Record<string, unknown>> = BaseMedusaRequest<Body, Query>;
    type AuthenticatedMedusaRequest<Body = unknown, Query = Record<string, unknown>> = BaseAuthenticatedMedusaRequest<Body, Query>;
    type MedusaStoreRequest<Body = unknown, Query = Record<string, unknown>> = BaseMedusaStoreRequest<Body, Query>;
    type MedusaResponse<Body = unknown> = BaseMedusaResponse<Body>;
    type MedusaNextFunction = BaseMedusaNextFunction;
}

export { };
