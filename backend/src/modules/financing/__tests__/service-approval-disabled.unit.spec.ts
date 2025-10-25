/**
 * Financing Service - Approval Module Disabled Tests
 * 
 * Tests behavior when APPROVAL_MODULE is not registered (modules_disabled/)
 * Ensures graceful degradation without breaking financing operations
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import FinancingModuleService from "../service";
import { CreateFinancingProposalDTO } from "../types/mutations";
import { COMPANY_MODULE } from "../../empresa";

describe("FinancingModuleService - Approval Module Disabled", () => {
  let service: FinancingModuleService;
  let mockContainer: any;

  beforeEach(() => {
    // Create mock container WITHOUT approval module
    mockContainer = {
      resolve: jest.fn((moduleName: string) => {
        if (moduleName === COMPANY_MODULE) {
          return {
            retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
              id: "emp_test",
              company_id: "comp_test",
              customer_id: "cust_test",
            }),
            checkSpendingLimit: jest.fn().mockResolvedValue({
              allowed: true,
              remaining: 500000,
            }),
          };
        }
        
        // Simulate approval module not registered
        if (moduleName === "approval") {
          throw new Error(`Module ${moduleName} is not registered`);
        }
        
        return {};
      }),
    };

    service = new FinancingModuleService(mockContainer);
  });

  describe("Constructor Initialization", () => {
    it("should initialize without approval module", () => {
      expect(service).toBeDefined();
      // Service should log that approval module is disabled but continue
    });

    it("should detect approval module is disabled", () => {
      // @ts-ignore - accessing private property for testing
      expect(service.approvalModuleEnabled).toBe(false);
    });
  });

  describe("createProposal - High Value Without Approval", () => {
    it("should create high-value proposal (>100k) without approval", async () => {
      // Mock the internal MedusaService methods
      const createSpy = jest.spyOn(service as any, "createFinancingProposals").mockResolvedValue([
        {
          id: "fp_test",
          customer_id: "cust_test",
          requested_amount: 150000,
          status: "pending",
          modality: "CDC",
        },
      ]);

      const logSpy = jest.spyOn(service as any, "logAuditEvent").mockResolvedValue(undefined);

      const proposalData: CreateFinancingProposalDTO = {
        customer_id: "cust_test",
        modality: "CDC",
        requested_amount: 150000,
        requested_term_months: 48,
        down_payment_amount: 30000,
      };

      const result = await service.createProposal(proposalData);

      // Proposal should be created successfully
      expect(result).toBeDefined();
      expect(result.id).toBe("fp_test");
      expect(result.requested_amount).toBe(150000);
      expect(result.status).toBe("pending");

      // Should NOT attempt to resolve approval module
      expect(mockContainer.resolve).not.toHaveBeenCalledWith("approval");
      
      // Spending limit check should still happen
      expect(mockContainer.resolve).toHaveBeenCalledWith(COMPANY_MODULE);

      createSpy.mockRestore();
      logSpy.mockRestore();
    });

    it("should create very high-value proposal (>500k) without approval", async () => {
      const createSpy = jest.spyOn(service as any, "createFinancingProposals").mockResolvedValue([
        {
          id: "fp_large",
          customer_id: "cust_test",
          requested_amount: 600000,
          status: "pending",
          modality: "LEASING",
        },
      ]);

      const logSpy = jest.spyOn(service as any, "logAuditEvent").mockResolvedValue(undefined);

      const proposalData: CreateFinancingProposalDTO = {
        customer_id: "cust_test",
        modality: "LEASING",
        requested_amount: 600000,
        requested_term_months: 60,
        down_payment_amount: 100000,
      };

      const result = await service.createProposal(proposalData);

      // Should succeed without approval
      expect(result).toBeDefined();
      expect(result.requested_amount).toBe(600000);

      // Log should indicate approval module disabled
      // (This would be captured via console.info in real scenario)

      createSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe("createProposal - Normal Flow", () => {
    it("should create low-value proposal (<100k) normally", async () => {
      const createSpy = jest.spyOn(service as any, "createFinancingProposals").mockResolvedValue([
        {
          id: "fp_small",
          customer_id: "cust_test",
          requested_amount: 50000,
          status: "pending",
          modality: "CDC",
        },
      ]);

      const logSpy = jest.spyOn(service as any, "logAuditEvent").mockResolvedValue(undefined);

      const proposalData: CreateFinancingProposalDTO = {
        customer_id: "cust_test",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 36,
      };

      const result = await service.createProposal(proposalData);

      expect(result).toBeDefined();
      expect(result.requested_amount).toBe(50000);

      // Should not even check for approval module (amount too low)
      expect(mockContainer.resolve).toHaveBeenCalledWith(COMPANY_MODULE);
      expect(mockContainer.resolve).not.toHaveBeenCalledWith("approval");

      createSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe("Spending Limit Checks Still Enforced", () => {
    it("should reject proposal if spending limit exceeded (even without approval)", async () => {
      // Mock spending limit failure
      mockContainer.resolve = jest.fn((moduleName: string) => {
        if (moduleName === COMPANY_MODULE) {
          return {
            retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
              id: "emp_test",
              company_id: "comp_test",
            }),
            checkSpendingLimit: jest.fn().mockResolvedValue({
              allowed: false,
              reason: "Monthly limit exceeded",
            }),
          };
        }
        if (moduleName === "approval") {
          throw new Error(`Module ${moduleName} is not registered`);
        }
        return {};
      });

      service = new FinancingModuleService(mockContainer);

      const proposalData: CreateFinancingProposalDTO = {
        customer_id: "cust_test",
        modality: "CDC",
        requested_amount: 200000,
        requested_term_months: 48,
      };

      await expect(service.createProposal(proposalData)).rejects.toThrow(
        "Spending limit exceeded: Monthly limit exceeded"
      );

      // Should still perform spending check
      expect(mockContainer.resolve).toHaveBeenCalledWith(COMPANY_MODULE);
    });
  });

  describe("Other Operations Unaffected", () => {
    it("should calculate financing without approval module", async () => {
      const calculation = await service.calculateFinancing({
        amount: 100000,
        down_payment: 20000,
        term_months: 48,
        interest_rate_annual: 12,
        system: "PRICE",
      });

      expect(calculation).toBeDefined();
      expect(calculation.financed_amount).toBe(80000);
      expect(calculation.installments).toHaveLength(48);
      expect(calculation.cet_rate).toBeGreaterThan(0);
    });

    it("should approve proposal without approval module interaction", async () => {
      // Mock retrieve and update methods
      const retrieveSpy = jest.spyOn(service as any, "retrieveFinancingProposal").mockResolvedValue({
        id: "fp_test",
        status: "pending",
        requested_amount: 100000,
        down_payment_amount: 20000,
      });

      const updateSpy = jest.spyOn(service as any, "updateFinancingProposals").mockResolvedValue({
        id: "fp_test",
        status: "approved",
        approved_amount: 100000,
        approved_term_months: 48,
      });

      const generateScheduleSpy = jest.spyOn(service as any, "generatePaymentSchedule").mockResolvedValue(undefined);

      const result = await service.approveProposal({
        id: "fp_test",
        approved_amount: 100000,
        approved_term_months: 48,
        interest_rate_annual: 12,
      });

      expect(result.status).toBe("approved");

      retrieveSpy.mockRestore();
      updateSpy.mockRestore();
      generateScheduleSpy.mockRestore();
    });
  });

  describe("Graceful Degradation Documentation", () => {
    it("should log info message when high-value proposal created without approval", async () => {
      const consoleSpy = jest.spyOn(console, "info").mockImplementation(() => {});

      const createSpy = jest.spyOn(service as any, "createFinancingProposals").mockResolvedValue([
        {
          id: "fp_test",
          customer_id: "cust_test",
          requested_amount: 150000,
          status: "pending",
        },
      ]);

      const logSpy = jest.spyOn(service as any, "logAuditEvent").mockResolvedValue(undefined);

      await service.createProposal({
        customer_id: "cust_test",
        modality: "CDC",
        requested_amount: 150000,
        requested_term_months: 48,
      });

      // Should log that high-value proposal created without approval
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("High-value proposal")
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("module disabled")
      );

      consoleSpy.mockRestore();
      createSpy.mockRestore();
      logSpy.mockRestore();
    });
  });
});
