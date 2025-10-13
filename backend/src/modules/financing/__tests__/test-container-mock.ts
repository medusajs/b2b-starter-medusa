/**
 * Mock Medusa Container for Workflow Tests
 * Provides complete mock setup for workflow testing without infrastructure dependencies
 */

import { COMPANY_MODULE } from "../../empresa";
import { APPROVAL_MODULE } from "../../../modules_disabled/approval";

export interface MockContainerOptions {
    companyService?: Partial<any>;
    approvalService?: Partial<any>;
    queryService?: Partial<any>;
    customResolvers?: Record<string, any>;
}

/**
 * Create a complete mock container for workflow tests
 * 
 * @example
 * ```typescript
 * const container = createMockContainer({
 *   companyService: {
 *     retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({ id: 'emp_123' })
 *   }
 * });
 * ```
 */
export function createMockContainer(options: MockContainerOptions = {}) {
    const {
        companyService = {},
        approvalService = {},
        queryService = {},
        customResolvers = {},
    } = options;

    // Default mock implementations
    const defaultCompanyService = {
        retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_default",
            company_id: "comp_default",
            customer_id: "cust_default",
            spending_limit: 100000,
        }),
        retrieveCompany: jest.fn().mockResolvedValue({
            id: "comp_default",
            customer_group_id: "cg_default",
            name: "Default Company",
            spending_limit: 500000,
        }),
        checkSpendingLimit: jest.fn().mockResolvedValue({
            allowed: true,
            remaining: 50000,
        }),
        getActiveEmployeesByCompany: jest.fn().mockResolvedValue([]),
        ...companyService,
    };

    const defaultApprovalService = {
        createApproval: jest.fn().mockResolvedValue({
            id: "appr_default",
            status: "pending",
            type: "admin",
            cart_id: "cart_default",
            created_by: "cust_default",
        }),
        updateApproval: jest.fn().mockResolvedValue({
            id: "appr_default",
            status: "approved",
        }),
        retrieveApproval: jest.fn().mockResolvedValue({
            id: "appr_default",
            status: "pending",
        }),
        listApprovals: jest.fn().mockResolvedValue([]),
        hasPendingApprovals: jest.fn().mockResolvedValue(false),
        ...approvalService,
    };

    const defaultQueryService = {
        graph: jest.fn().mockResolvedValue({ data: [] }),
        ...queryService,
    };

    // Resolver map
    const resolvers: Record<string, any> = {
        [COMPANY_MODULE]: defaultCompanyService,
        [APPROVAL_MODULE]: defaultApprovalService,
        query: defaultQueryService,
        ...customResolvers,
    };

    // Container mock with resolve method
    return {
        resolve: jest.fn((serviceName: string) => {
            if (resolvers[serviceName]) {
                return resolvers[serviceName];
            }

            // Default fallback for unknown services
            console.warn(`[MockContainer] Resolving unknown service: ${serviceName}`);
            return {};
        }),
        // Expose services for easy access in tests
        services: {
            company: defaultCompanyService,
            approval: defaultApprovalService,
            query: defaultQueryService,
        },
    };
}

/**
 * Create a mock container that throws errors (for failure testing)
 */
export function createFailingMockContainer(errorMessage: string = "Service unavailable") {
    return {
        resolve: jest.fn(() => {
            throw new Error(errorMessage);
        }),
    };
}

/**
 * Create a mock container with specific service unavailable
 */
export function createPartialMockContainer(unavailableServices: string[]) {
    const container = createMockContainer();

    unavailableServices.forEach(serviceName => {
        const originalResolve = container.resolve;
        container.resolve = jest.fn((name: string) => {
            if (name === serviceName) {
                throw new Error(`Service ${serviceName} is not registered`);
            }
            return originalResolve(name);
        });
    });

    return container;
}

/**
 * Helper to verify service calls in tests
 */
export function verifyServiceCalls(container: any, serviceName: string, methodName: string, expectedCalls: number) {
    const service = container.services[serviceName];
    if (!service || !service[methodName]) {
        throw new Error(`Service ${serviceName}.${methodName} not found in mock container`);
    }

    expect(service[methodName]).toHaveBeenCalledTimes(expectedCalls);
}

/**
 * Helper to get call arguments from mocked service method
 */
export function getCallArgs(container: any, serviceName: string, methodName: string, callIndex: number = 0) {
    const service = container.services[serviceName];
    if (!service || !service[methodName]) {
        throw new Error(`Service ${serviceName}.${methodName} not found in mock container`);
    }

    const calls = service[methodName].mock.calls;
    if (callIndex >= calls.length) {
        throw new Error(`Call index ${callIndex} out of range (${calls.length} calls)`);
    }

    return calls[callIndex];
}

/**
 * Helper to reset all mocks in container
 */
export function resetMockContainer(container: any) {
    jest.clearAllMocks();
    Object.values(container.services).forEach((service: any) => {
        Object.values(service).forEach((method: any) => {
            if (typeof method?.mockClear === 'function') {
                method.mockClear();
            }
        });
    });
}
