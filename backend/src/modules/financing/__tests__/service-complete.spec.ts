import FinancingModuleService from "../service";
import BACENFinancingService from "../bacen-service";

describe("Financing Service - Complete Coverage", () => {
  let service: FinancingModuleService;
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = {
      resolve: jest.fn().mockReturnValue({
        retrieveEmployeeByCustomerId: jest.fn(),
        checkSpendingLimit: jest.fn(),
        createApproval: jest.fn(),
      }),
    };

    service = new FinancingModuleService(mockContainer);
    
    // Mock all database operations
    service.create = jest.fn();
    service.update = jest.fn();
    service.retrieve = jest.fn();
    service.list = jest.fn();
    service.delete = jest.fn();
  });

  describe("✅ CRUD Operations", () => {
    it("should create proposal with defaults", async () => {
      service.create = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "pending",
        down_payment_amount: 0,
        amortization_system: "PRICE",
      });

      const proposal = await service.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      });

      expect(service.create).toHaveBeenCalledWith("FinancingProposal", expect.objectContaining({
        down_payment_amount: 0,
        amortization_system: "PRICE",
        status: "pending",
      }));
    });

    it("should update proposal", async () => {
      service.update = jest.fn().mockResolvedValue({
        id: "fp_123",
        notes: "Updated notes",
      });

      const result = await service.updateProposal({
        id: "fp_123",
        notes: "Updated notes",
      });

      expect(service.update).toHaveBeenCalledWith("FinancingProposal", "fp_123", {
        id: "fp_123",
        notes: "Updated notes",
      });
    });

    it("should retrieve proposal with relations", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        payment_schedules: [],
      });

      await service.getProposal("fp_123");

      expect(service.retrieve).toHaveBeenCalledWith("FinancingProposal", "fp_123", {
        relations: ["payment_schedules"],
      });
    });

    it("should list proposals by customer", async () => {
      service.list = jest.fn().mockResolvedValue([]);

      await service.getProposalsByCustomer("cust_123");

      expect(service.list).toHaveBeenCalledWith("FinancingProposal", {
        where: { customer_id: "cust_123" },
        relations: ["payment_schedules"],
        order: { created_at: "DESC" },
      });
    });
  });

  describe("✅ State Management", () => {
    it("should approve proposal (idempotent)", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "pending",
        down_payment_amount: 10000,
      });
      
      service.update = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "approved",
      });

      const result = await service.approveProposal({
        id: "fp_123",
        approved_amount: 50000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      });

      expect(service.update).toHaveBeenCalledWith("FinancingProposal", "fp_123", expect.objectContaining({
        status: "approved",
        approved_amount: 50000,
        financed_amount: 40000, // 50000 - 10000 down payment
      }));
    });

    it("should handle idempotent approval", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "approved", // Already approved
      });

      const result = await service.approveProposal({
        id: "fp_123",
        approved_amount: 50000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      });

      expect(service.update).not.toHaveBeenCalled();
      expect(result.status).toBe("approved");
    });

    it("should reject invalid state transitions", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "contracted",
      });

      await expect(service.approveProposal({
        id: "fp_123",
        approved_amount: 50000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      })).rejects.toThrow("Cannot approve proposal in status: contracted");
    });

    it("should contract proposal", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "approved",
        expires_at: new Date(Date.now() + 86400000), // Tomorrow
      });

      service.update = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "contracted",
      });

      const result = await service.contractProposal({ id: "fp_123" });

      expect(service.update).toHaveBeenCalledWith("FinancingProposal", "fp_123", expect.objectContaining({
        status: "contracted",
        contract_number: expect.any(String),
        contract_url: expect.any(String),
      }));
    });

    it("should reject expired proposals", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "approved",
        expires_at: new Date(Date.now() - 86400000), // Yesterday
      });

      await expect(service.contractProposal({ id: "fp_123" }))
        .rejects.toThrow("Proposal has expired");
    });

    it("should cancel proposal", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "pending",
      });

      service.update = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "cancelled",
      });

      const result = await service.cancelProposal({
        id: "fp_123",
        cancellation_reason: "Customer request",
      });

      expect(service.update).toHaveBeenCalledWith("FinancingProposal", "fp_123", expect.objectContaining({
        status: "cancelled",
        rejection_reason: "Customer request",
      }));
    });

    it("should prevent cancelling contracted proposals", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "contracted",
      });

      await expect(service.cancelProposal({
        id: "fp_123",
        cancellation_reason: "Customer request",
      })).rejects.toThrow("Cannot cancel contracted proposal");
    });
  });

  describe("✅ Calculations", () => {
    it("should calculate PRICE financing", async () => {
      const result = await service.calculateFinancing({
        amount: 50000,
        down_payment: 10000,
        term_months: 48,
        interest_rate_annual: 12,
        system: "PRICE",
      });

      expect(result.financed_amount).toBe(40000);
      expect(result.system).toBe("PRICE");
      expect(result.installments).toHaveLength(48);
      expect(result.cet_rate).toBeGreaterThan(0);
    });

    it("should calculate SAC financing", async () => {
      const result = await service.calculateFinancing({
        amount: 50000,
        down_payment: 10000,
        term_months: 48,
        interest_rate_annual: 12,
        system: "SAC",
      });

      expect(result.system).toBe("SAC");
      expect(result.installments[0].total).toBeGreaterThan(result.installments[47].total);
    });

    it("should handle zero down payment", async () => {
      const result = await service.calculateFinancing({
        amount: 50000,
        term_months: 48,
        interest_rate_annual: 12,
      });

      expect(result.down_payment).toBe(0);
      expect(result.financed_amount).toBe(50000);
    });

    it("should validate calculation inputs", async () => {
      await expect(service.calculateFinancing({
        amount: 0,
        term_months: 48,
        interest_rate_annual: 12,
      })).rejects.toThrow("Financed amount must be greater than zero");
    });
  });

  describe("✅ Payment Schedule Generation", () => {
    it("should generate payment schedule", async () => {
      const proposal = {
        id: "fp_123",
        approved_amount: 50000,
        down_payment_amount: 10000,
        approved_term_months: 48,
        interest_rate_annual: 12,
        amortization_system: "PRICE",
      };

      service.list = jest.fn().mockResolvedValue([]); // No existing schedules
      service.create = jest.fn().mockResolvedValue({});

      await service["generatePaymentSchedule"](proposal as any);

      expect(service.create).toHaveBeenCalledTimes(48); // 48 installments
    });

    it("should replace existing payment schedules", async () => {
      const proposal = {
        id: "fp_123",
        approved_amount: 50000,
        down_payment_amount: 10000,
        approved_term_months: 24,
        interest_rate_annual: 12,
        amortization_system: "PRICE",
      };

      service.list = jest.fn().mockResolvedValue([
        { id: "ps_1" }, { id: "ps_2" }
      ]); // Existing schedules
      service.delete = jest.fn().mockResolvedValue({});
      service.create = jest.fn().mockResolvedValue({});

      await service["generatePaymentSchedule"](proposal as any);

      expect(service.delete).toHaveBeenCalledTimes(2); // Delete existing
      expect(service.create).toHaveBeenCalledTimes(24); // Create new
    });
  });

  describe("✅ Admin Dashboard", () => {
    it("should provide comprehensive statistics", async () => {
      service.list = jest.fn().mockResolvedValue([
        { status: "pending", modality: "CDC", requested_amount: 30000 },
        { status: "approved", modality: "CDC", requested_amount: 50000 },
        { status: "contracted", modality: "LEASING", requested_amount: 70000 },
        { status: "cancelled", modality: "EAAS", requested_amount: 20000 },
      ]);

      const stats = await service.getProposalStats();

      expect(stats.total).toBe(4);
      expect(stats.by_status.pending).toBe(1);
      expect(stats.by_status.approved).toBe(1);
      expect(stats.by_status.contracted).toBe(1);
      expect(stats.by_status.cancelled).toBe(1);
      expect(stats.by_modality.CDC).toBe(2);
      expect(stats.by_modality.LEASING).toBe(1);
      expect(stats.by_modality.EAAS).toBe(1);
      expect(stats.total_amount).toBe(170000);
    });

    it("should get company financing history", async () => {
      const companyService = mockContainer.resolve();
      companyService.listEmployees.mockResolvedValue([
        { customer_id: "cust_1" },
        { customer_id: "cust_2" },
      ]);

      service.list = jest.fn().mockResolvedValue([
        { id: "fp_1", customer_id: "cust_1" },
        { id: "fp_2", customer_id: "cust_2" },
      ]);

      const history = await service.getCompanyFinancingHistory("comp_123");

      expect(service.list).toHaveBeenCalledWith("FinancingProposal", {
        where: { customer_id: { $in: ["cust_1", "cust_2"] } },
        relations: ["payment_schedules"],
        order: { created_at: "DESC" },
      });
    });
  });

  describe("✅ Error Handling", () => {
    it("should handle missing proposals", async () => {
      service.retrieve = jest.fn().mockResolvedValue(null);

      await expect(service.approveProposal({
        id: "nonexistent",
        approved_amount: 50000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      })).rejects.toThrow("Proposal nonexistent not found");
    });

    it("should handle service failures", async () => {
      service.create = jest.fn().mockRejectedValue(new Error("Database error"));

      await expect(service.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      })).rejects.toThrow("Database error");
    });
  });

  describe("✅ Utility Methods", () => {
    it("should generate unique contract numbers", () => {
      const contract1 = service["generateContractNumber"]();
      const contract2 = service["generateContractNumber"]();

      expect(contract1).toMatch(/^YSH-\d{8}-[A-Z0-9]{6}$/);
      expect(contract2).toMatch(/^YSH-\d{8}-[A-Z0-9]{6}$/);
      expect(contract1).not.toBe(contract2);
    });

    it("should calculate CET correctly", () => {
      const cet = service["calculateCET"](50000, 12, 48);
      
      expect(cet).toBeGreaterThan(12); // CET should be higher than nominal rate
      expect(cet).toBeLessThan(20); // But reasonable
    });
  });
});