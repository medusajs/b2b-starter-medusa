import { linkCustomerGroupStep } from "../workflows/steps/link-customer-group-step";
import { checkSpendingLimitsStep } from "../workflows/steps/check-spending-limits-step";
import { createApprovalStep } from "../workflows/steps/create-approval-step";
import { createMockContainer, resetMockContainer, verifyServiceCalls } from "./test-container-mock";

describe("Financing Workflows - Complete Coverage", () => {
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = createMockContainer();
  });

  afterEach(() => {
    resetMockContainer(mockContainer);
  });

  describe("✅ Link Customer Group Step", () => {
    it("should link customer to group successfully", async () => {
      // Configure mock container with specific responses
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          }),
          retrieveCompany: jest.fn().mockResolvedValue({
            id: "comp_123",
            customer_group_id: "cg_123",
            name: "Test Company",
          }),
        },
      });

      const stepFunction = linkCustomerGroupStep.invoke;
      const result = await stepFunction(
        {
          customer_id: "cust_123",
          financing_proposal_id: "fp_123",
        },
        { container: mockContainer }
      );

      expect(result.output).toEqual({
        customer_group_id: "cg_123",
        company_id: "comp_123",
      });

      // Verify service was called correctly
      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
      verifyServiceCalls(mockContainer, "company", "retrieveCompany", 1);
    });

    it("should handle missing employee", async () => {
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue(null),
        },
      });

      const stepFunction = linkCustomerGroupStep.invoke;
      const result = await stepFunction(
        {
          customer_id: "cust_nonexistent",
          financing_proposal_id: "fp_123",
        },
        { container: mockContainer }
      );

      expect(result.output).toBeNull();
      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
    });

    it("should handle company without customer group", async () => {
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
          }),
          retrieveCompany: jest.fn().mockResolvedValue({
            id: "comp_123",
            customer_group_id: null, // No customer group
          }),
        },
      });

      const stepFunction = linkCustomerGroupStep.invoke;
      const result = await stepFunction(
        {
          customer_id: "cust_123",
          financing_proposal_id: "fp_123",
        },
        { container: mockContainer }
      );

      expect(result.output).toBeNull();
      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
      verifyServiceCalls(mockContainer, "company", "retrieveCompany", 1);
    });
  });

  describe("✅ Check Spending Limits Step", () => {
    it("should allow spending within limits", async () => {
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          }),
          checkSpendingLimit: jest.fn().mockResolvedValue({
            allowed: true,
            remaining: 50000,
          }),
        },
      });

      const stepFunction = checkSpendingLimitsStep.invoke;
      const result = await stepFunction(
        {
          customer_id: "cust_123",
          requested_amount: 30000,
        },
        { container: mockContainer }
      );

      expect(result.output).toEqual({
        employee_id: "emp_123",
        company_id: "comp_123",
        spending_check: {
          allowed: true,
          remaining: 50000,
        },
      });

      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
      verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
    });

    it("should reject spending over limits", async () => {
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
          }),
          checkSpendingLimit: jest.fn().mockResolvedValue({
            allowed: false,
            reason: "Monthly limit exceeded",
          }),
        },
      });

      const stepFunction = checkSpendingLimitsStep.invoke;

      await expect(stepFunction(
        {
          customer_id: "cust_123",
          requested_amount: 100000,
        },
        { container: mockContainer }
      )).rejects.toThrow("Spending limit exceeded: Monthly limit exceeded");

      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
      verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
    });

    it("should handle missing employee", async () => {
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue(null),
        },
      });

      const stepFunction = checkSpendingLimitsStep.invoke;

      await expect(stepFunction(
        {
          customer_id: "cust_nonexistent",
          requested_amount: 50000,
        },
        { container: mockContainer }
      )).rejects.toThrow("Employee not found for customer");

      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
    });
  });

  describe("✅ Create Approval Step", () => {
    it("should create approval successfully", async () => {
      mockContainer = createMockContainer({
        approvalService: {
          createApproval: jest.fn().mockResolvedValue({
            id: "appr_123",
            status: "pending",
            type: "financing_proposal",
          }),
        },
      });

      const stepFunction = createApprovalStep.invoke;
      const result = await stepFunction(
        {
          financing_proposal_id: "fp_123",
          customer_id: "cust_123",
          requested_amount: 150000,
          type: "financing_proposal",
        },
        { container: mockContainer }
      );

      expect(result.output).toEqual({
        id: "appr_123",
        status: "pending",
        type: "financing_proposal",
      });

      const approvalService = mockContainer.services.approval;
      expect(approvalService.createApproval).toHaveBeenCalledWith({
        cart_id: "fp_123",
        type: "admin",
        status: "pending",
        created_by: "cust_123",
        cart_total_snapshot: 150000,
        priority: 1, // High priority for large amounts
      });

      verifyServiceCalls(mockContainer, "approval", "createApproval", 1);
    });

    it("should set normal priority for smaller amounts", async () => {
      mockContainer = createMockContainer({
        approvalService: {
          createApproval: jest.fn().mockResolvedValue({
            id: "appr_124",
            status: "pending",
          }),
        },
      });

      const stepFunction = createApprovalStep.invoke;
      await stepFunction(
        {
          financing_proposal_id: "fp_124",
          customer_id: "cust_123",
          requested_amount: 50000, // Smaller amount
          type: "financing_proposal",
        },
        { container: mockContainer }
      );

      const approvalService = mockContainer.services.approval;
      expect(approvalService.createApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 0, // Normal priority
        })
      );

      verifyServiceCalls(mockContainer, "approval", "createApproval", 1);
    });

    it("should handle approval service errors", async () => {
      mockContainer = createMockContainer({
        approvalService: {
          createApproval: jest.fn().mockRejectedValue(new Error("Approval service unavailable")),
        },
      });

      const stepFunction = createApprovalStep.invoke;

      await expect(stepFunction(
        {
          financing_proposal_id: "fp_123",
          customer_id: "cust_123",
          requested_amount: 150000,
          type: "financing_proposal",
        },
        { container: mockContainer }
      )).rejects.toThrow("Approval service unavailable");
    });
  });

  describe("✅ Workflow Compensation", () => {
    it("should handle compensation for approval step", async () => {
      mockContainer = createMockContainer({
        approvalService: {
          updateApproval: jest.fn().mockResolvedValue({}),
        },
      });

      // Simulate compensation function
      const compensationFunction = createApprovalStep.compensate;
      if (compensationFunction) {
        await compensationFunction(
          "appr_123",
          { container: mockContainer }
        );

        const approvalService = mockContainer.services.approval;
        expect(approvalService.updateApproval).toHaveBeenCalledWith({
          id: "appr_123",
          status: "cancelled",
          rejection_reason: "Workflow compensation",
          handled_at: expect.any(String),
        });

        verifyServiceCalls(mockContainer, "approval", "updateApproval", 1);
      }
    });
  });

  describe("✅ Integration Scenarios", () => {
    it("should handle complete workflow success", async () => {
      // Mock all services with full workflow scenario
      mockContainer = createMockContainer({
        companyService: {
          retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
          }),
          retrieveCompany: jest.fn().mockResolvedValue({
            id: "comp_123",
            customer_group_id: "cg_123",
          }),
          checkSpendingLimit: jest.fn().mockResolvedValue({
            allowed: true,
            remaining: 200000,
          }),
        },
        approvalService: {
          createApproval: jest.fn().mockResolvedValue({
            id: "appr_123",
            status: "pending",
          }),
        },
      });

      // Execute workflow steps in sequence
      const linkResult = await linkCustomerGroupStep.invoke(
        { customer_id: "cust_123", financing_proposal_id: "fp_123" },
        { container: mockContainer }
      );

      const spendingResult = await checkSpendingLimitsStep.invoke(
        { customer_id: "cust_123", requested_amount: 150000 },
        { container: mockContainer }
      );

      const approvalResult = await createApprovalStep.invoke(
        {
          financing_proposal_id: "fp_123",
          customer_id: "cust_123",
          requested_amount: 150000,
          type: "financing_proposal",
        },
        { container: mockContainer }
      );

      expect(linkResult.output.customer_group_id).toBe("cg_123");
      expect(spendingResult.output.spending_check.allowed).toBe(true);
      expect(approvalResult.output.id).toBe("appr_123");

      // Verify all service interactions
      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 2);
      verifyServiceCalls(mockContainer, "company", "retrieveCompany", 1);
      verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
      verifyServiceCalls(mockContainer, "approval", "createApproval", 1);
    });

    it("should handle workflow failure scenarios", async () => {
      mockContainer = createMockContainer({
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

      // Should fail at spending limit check
      await expect(checkSpendingLimitsStep.invoke(
        { customer_id: "cust_123", requested_amount: 500000 },
        { container: mockContainer }
      )).rejects.toThrow("Spending limit exceeded");

      verifyServiceCalls(mockContainer, "company", "retrieveEmployeeByCustomerId", 1);
      verifyServiceCalls(mockContainer, "company", "checkSpendingLimit", 1);
    });
  });
});