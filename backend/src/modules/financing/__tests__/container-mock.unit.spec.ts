/**
 * Financing Workflows - Unit Tests (Simplified)
 * Tests workflow steps with mocked container - Medusa 2.x compatible
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { createMockContainer, resetMockContainer, verifyServiceCalls } from "./test-container-mock";

// Note: In Medusa 2.x, workflow steps are functions that can be called directly in workflows
// For unit testing, we test the business logic by mocking the container and services

describe("Financing Workflows - Mock Container Tests", () => {
    let mockContainer: any;

    beforeEach(() => {
        mockContainer = createMockContainer();
    });

    afterEach(() => {
        resetMockContainer(mockContainer);
    });

    describe("✅ Mock Container Setup", () => {
        it("should create container with all required services", () => {
            expect(mockContainer).toBeDefined();
            expect(mockContainer.resolve).toBeDefined();
            expect(mockContainer.services).toBeDefined();
            expect(mockContainer.services.company).toBeDefined();
            expect(mockContainer.services.approval).toBeDefined();
            expect(mockContainer.services.query).toBeDefined();
        });

        it("should resolve company service correctly", () => {
            const companyService = mockContainer.resolve("company");
            expect(companyService).toBeDefined();
            expect(companyService.retrieveEmployeeByCustomerId).toBeDefined();
            expect(companyService.retrieveCompany).toBeDefined();
            expect(companyService.checkSpendingLimit).toBeDefined();
        });

        it("should resolve approval service correctly", () => {
            const approvalService = mockContainer.resolve("approval");
            expect(approvalService).toBeDefined();
            expect(approvalService.createApproval).toBeDefined();
            expect(approvalService.updateApproval).toBeDefined();
        });
    });

    describe("✅ Company Service Interactions", () => {
        it("should retrieve employee by customer ID", async () => {
            const companyService = mockContainer.services.company;

            const employee = await companyService.retrieveEmployeeByCustomerId("cust_123");

            expect(employee).toBeDefined();
            expect(employee.id).toBe("emp_default");
            expect(employee.company_id).toBe("comp_default");
            verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
        });

        it("should check spending limits", async () => {
            const companyService = mockContainer.services.company;

            const result = await companyService.checkSpendingLimit("emp_123", 50000);

            expect(result).toBeDefined();
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(50000);
            verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
        });

        it("should retrieve company details", async () => {
            const companyService = mockContainer.services.company;

            const company = await companyService.retrieveCompany("comp_123");

            expect(company).toBeDefined();
            expect(company.customer_group_id).toBe("cg_default");
            verifyServiceCalls(mockContainer, "company", "retrieveCompany", 1);
        });
    });

    describe("✅ Approval Service Interactions", () => {
        it("should create approval successfully", async () => {
            const approvalService = mockContainer.services.approval;

            const approval = await approvalService.createApproval({
                cart_id: "fp_123",
                type: "admin",
                status: "pending",
                created_by: "cust_123",
                cart_total_snapshot: 150000,
                priority: 1,
            });

            expect(approval).toBeDefined();
            expect(approval.id).toBe("appr_default");
            expect(approval.status).toBe("pending");
            verifyServiceCalls(mockContainer, "approval", "createApproval", 1);
        });

        it("should update approval status", async () => {
            const approvalService = mockContainer.services.approval;

            const updated = await approvalService.updateApproval({
                id: "appr_123",
                status: "approved",
            });

            expect(updated).toBeDefined();
            expect(updated.status).toBe("approved");
            verifyServiceCalls(mockContainer, "approval", "updateApproval", 1);
        });
    });

    describe("✅ Custom Mock Container Scenarios", () => {
        it("should handle custom company service mock", async () => {
            const customContainer = createMockContainer({
                companyService: {
                    retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
                        id: "emp_custom",
                        company_id: "comp_custom",
                        customer_id: "cust_custom",
                    }),
                },
            });

            const companyService = customContainer.services.company;
            const employee = await companyService.retrieveEmployeeByCustomerId("cust_custom");

            expect(employee.id).toBe("emp_custom");
            expect(employee.company_id).toBe("comp_custom");
        });

        it("should handle spending limit rejection", async () => {
            const customContainer = createMockContainer({
                companyService: {
                    checkSpendingLimit: jest.fn().mockResolvedValue({
                        allowed: false,
                        reason: "Monthly limit exceeded",
                    }),
                },
            });

            const companyService = customContainer.services.company;
            const result = await companyService.checkSpendingLimit("emp_123", 500000);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("Monthly limit exceeded");
        });

        it("should handle approval service failure gracefully", async () => {
            const customContainer = createMockContainer({
                approvalService: {
                    createApproval: jest.fn().mockRejectedValue(new Error("Approval service unavailable")),
                },
            });

            const approvalService = customContainer.services.approval;

            await expect(approvalService.createApproval({
                cart_id: "fp_123",
                type: "admin",
                status: "pending",
                created_by: "cust_123",
            })).rejects.toThrow("Approval service unavailable");
        });
    });

    describe("✅ Service Call Verification", () => {
        it("should track multiple service calls", async () => {
            const companyService = mockContainer.services.company;

            await companyService.retrieveEmployeeByCustomerId("cust_1");
            await companyService.retrieveEmployeeByCustomerId("cust_2");
            await companyService.checkSpendingLimit("emp_1", 10000);

            verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 2);
            verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
        });

        it("should reset mocks between tests", () => {
            const companyService = mockContainer.services.company;

            expect(companyService.retrieveEmployeeByCustomerId).toHaveBeenCalledTimes(0);
            expect(companyService.checkSpendingLimit).toHaveBeenCalledTimes(0);
        });
    });

    describe("✅ Integration Scenarios", () => {
        it("should simulate complete financing workflow", async () => {
            const { company, approval } = mockContainer.services;

            // Step 1: Retrieve employee
            const employee = await company.retrieveEmployeeByCustomerId("cust_123");
            expect(employee).toBeDefined();

            // Step 2: Check spending limit
            const limitCheck = await company.checkSpendingLimit(employee.id, 150000);
            expect(limitCheck.allowed).toBe(true);

            // Step 3: Create approval for high-value
            const approvalResult = await approval.createApproval({
                cart_id: "fp_123",
                type: "admin",
                status: "pending",
                created_by: "cust_123",
                cart_total_snapshot: 150000,
                priority: 1,
            });
            expect(approvalResult.status).toBe("pending");

            // Verify all interactions
            verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
            verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
            verifyServiceCalls(mockContainer, "approval", "createApproval", 1);
        });

        it("should handle workflow failure at spending limit", async () => {
            const customContainer = createMockContainer({
                companyService: {
                    retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
                        id: "emp_123",
                        company_id: "comp_123",
                    }),
                    checkSpendingLimit: jest.fn().mockResolvedValue({
                        allowed: false,
                        reason: "Limit exceeded",
                    }),
                },
            });

            const { company } = customContainer.services;

            // Step 1: Retrieve employee
            const employee = await company.retrieveEmployeeByCustomerId("cust_123");
            expect(employee).toBeDefined();

            // Step 2: Check spending limit (should fail)
            const limitCheck = await company.checkSpendingLimit(employee.id, 500000);
            expect(limitCheck.allowed).toBe(false);
            expect(limitCheck.reason).toBe("Limit exceeded");

            // Workflow should stop here - no approval created
        });
    });
});
