import FinancingModuleService from "../service";

describe("Financing Module - Complete Integration", () => {
  let financingService: FinancingModuleService;
  let mockContainer: any;

  beforeEach(() => {
    // Mock container with all dependencies
    mockContainer = {
      resolve: jest.fn((name: string) => {
        switch (name) {
          case "companyModuleService":
            return {
              retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue({
                id: "emp_123",
                company_id: "comp_123",
                customer_id: "cust_123",
              }),
              checkSpendingLimit: jest.fn().mockResolvedValue({
                allowed: true,
                remaining: 100000,
              }),
              listEmployees: jest.fn().mockResolvedValue([
                { id: "emp_1", customer_id: "cust_1", company_id: "comp_123" },
              ]),
            };
          case "approvalModuleService":
            return {
              createApproval: jest.fn().mockResolvedValue({
                id: "appr_123",
                status: "pending",
              }),
            };
          default:
            return null;
        }
      }),
    };

    financingService = new FinancingModuleService(mockContainer);
    
    // Mock database operations
    financingService.create = jest.fn().mockImplementation((entity, data) => {
      return Promise.resolve({
        id: `${entity.toLowerCase()}_${Date.now()}`,
        ...data,
      });
    });
    
    financingService.update = jest.fn().mockImplementation((entity, id, data) => {
      return Promise.resolve({ id, ...data });
    });
    
    financingService.retrieve = jest.fn().mockImplementation((entity, id) => {
      return Promise.resolve({
        id,
        status: "pending",
        requested_amount: 50000,
        down_payment_amount: 0,
      });
    });
    
    financingService.list = jest.fn().mockResolvedValue([]);
  });

  describe("✅ Customer Group Integration", () => {
    it("should link financing proposal to customer group", async () => {
      const proposal = await financingService.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      });

      expect(proposal).toBeDefined();
      expect(proposal.customer_id).toBe("cust_123");
      expect(mockContainer.resolve).toHaveBeenCalledWith("companyModuleService");
    });
  });

  describe("✅ Spending Limits Enforcement", () => {
    it("should enforce spending limits", async () => {
      const companyService = mockContainer.resolve("companyModuleService");
      companyService.checkSpendingLimit.mockResolvedValueOnce({
        allowed: false,
        reason: "Monthly limit exceeded",
      });

      await expect(
        financingService.createProposal({
          customer_id: "cust_123",
          modality: "CDC",
          requested_amount: 200000,
          requested_term_months: 48,
        })
      ).rejects.toThrow("Spending limit exceeded");
    });

    it("should allow proposal within limits", async () => {
      const proposal = await financingService.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 30000,
        requested_term_months: 48,
      });

      expect(proposal.requested_amount).toBe(30000);
    });
  });

  describe("✅ Approval Workflow Integration", () => {
    it("should create approval for high-value proposals", async () => {
      const proposal = await financingService.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 150000, // High value
        requested_term_months: 48,
      });

      const approvalService = mockContainer.resolve("approvalModuleService");
      expect(approvalService.createApproval).toHaveBeenCalled();
    });

    it("should skip approval for low-value proposals", async () => {
      const proposal = await financingService.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000, // Low value
        requested_term_months: 48,
      });

      const approvalService = mockContainer.resolve("approvalModuleService");
      expect(approvalService.createApproval).not.toHaveBeenCalled();
    });
  });

  describe("✅ Complete Lifecycle", () => {
    it("should handle complete proposal lifecycle", async () => {
      // 1. Create
      const proposal = await financingService.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      });
      expect(proposal.status).toBe("pending");

      // 2. Approve
      const approved = await financingService.approveProposal({
        id: proposal.id,
        approved_amount: 45000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      });
      expect(approved.status).toBe("approved");

      // 3. Contract
      const contracted = await financingService.contractProposal({
        id: proposal.id,
      });
      expect(contracted.status).toBe("contracted");
    });
  });

  describe("✅ Admin Dashboard", () => {
    it("should provide statistics", async () => {
      financingService.list = jest.fn().mockResolvedValue([
        { status: "pending", modality: "CDC", requested_amount: 30000 },
        { status: "approved", modality: "LEASING", requested_amount: 70000 },
      ]);

      const stats = await financingService.getProposalStats();
      
      expect(stats.total).toBe(2);
      expect(stats.by_status.pending).toBe(1);
      expect(stats.by_modality.CDC).toBe(1);
      expect(stats.total_amount).toBe(100000);
    });
  });

  describe("✅ Error Handling", () => {
    it("should handle service failures gracefully", async () => {
      mockContainer.resolve = jest.fn().mockImplementation(() => {
        throw new Error("Service unavailable");
      });

      await expect(
        financingService.createProposal({
          customer_id: "cust_123",
          modality: "CDC",
          requested_amount: 50000,
          requested_term_months: 48,
        })
      ).rejects.toThrow("Service unavailable");
    });
  });
});