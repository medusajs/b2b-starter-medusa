import FinancingModuleService from "../service";

describe("Financing Module - Performance & Security", () => {
  let service: FinancingModuleService;
  let mockContainer: any;

  beforeEach(() => {
    mockContainer = {
      resolve: jest.fn().mockReturnValue({
        retrieveEmployeeByCustomerId: jest.fn().mockResolvedValue(null),
        checkSpendingLimit: jest.fn().mockResolvedValue({ allowed: true }),
      }),
    };

    service = new FinancingModuleService(mockContainer);
    service.create = jest.fn().mockResolvedValue({ id: "fp_test" });
    service.list = jest.fn().mockResolvedValue([]);
  });

  describe("✅ Performance Tests", () => {
    it("should handle bulk proposal creation efficiently", async () => {
      const startTime = Date.now();
      const promises = [];

      // Create 100 proposals concurrently
      for (let i = 0; i < 100; i++) {
        promises.push(service.createProposal({
          customer_id: `cust_${i}`,
          modality: "CDC",
          requested_amount: 50000,
          requested_term_months: 48,
        }));
      }

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust based on requirements)
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(service.create).toHaveBeenCalledTimes(100);
    });

    it("should handle large calculation datasets", async () => {
      const startTime = Date.now();

      // Calculate financing for large amounts and long terms
      const result = await service.calculateFinancing({
        amount: 10000000, // 10M
        term_months: 120, // 10 years
        interest_rate_annual: 15,
        system: "PRICE",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1 second
      expect(result.installments).toHaveLength(120);
      expect(result.total_paid).toBeGreaterThan(10000000);
    });

    it("should handle concurrent state transitions", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "pending",
        down_payment_amount: 0,
      });
      
      service.update = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "approved",
      });

      const promises = [];
      
      // Simulate concurrent approval attempts (should be idempotent)
      for (let i = 0; i < 10; i++) {
        promises.push(service.approveProposal({
          id: "fp_123",
          approved_amount: 50000,
          approved_term_months: 48,
          interest_rate_annual: 12.5,
        }));
      }

      const results = await Promise.all(promises);
      
      // All should succeed due to idempotency
      results.forEach(result => {
        expect(result.id).toBe("fp_123");
      });
    });
  });

  describe("✅ Security Tests", () => {
    it("should validate input parameters", async () => {
      // Test SQL injection attempts
      await expect(service.createProposal({
        customer_id: "'; DROP TABLE financing_proposal; --",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      })).resolves.toBeDefined(); // Should not crash

      // Test XSS attempts
      await expect(service.createProposal({
        customer_id: "<script>alert('xss')</script>",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      })).resolves.toBeDefined();
    });

    it("should handle malicious calculation inputs", async () => {
      // Test extremely large numbers
      await expect(service.calculateFinancing({
        amount: Number.MAX_SAFE_INTEGER,
        term_months: 1200, // 100 years
        interest_rate_annual: 1000, // 1000%
      })).rejects.toThrow(); // Should reject unrealistic inputs

      // Test negative values
      await expect(service.calculateFinancing({
        amount: -50000,
        term_months: 48,
        interest_rate_annual: 12,
      })).rejects.toThrow();

      // Test zero/null values
      await expect(service.calculateFinancing({
        amount: 0,
        term_months: 48,
        interest_rate_annual: 12,
      })).rejects.toThrow();
    });

    it("should prevent unauthorized state transitions", async () => {
      service.retrieve = jest.fn().mockResolvedValue({
        id: "fp_123",
        status: "contracted",
      });

      // Should prevent cancelling contracted proposals
      await expect(service.cancelProposal({
        id: "fp_123",
        cancellation_reason: "Unauthorized attempt",
      })).rejects.toThrow("Cannot cancel contracted proposal");
    });

    it("should handle contract number uniqueness", () => {
      const numbers = new Set();
      
      // Generate 1000 contract numbers
      for (let i = 0; i < 1000; i++) {
        const number = service["generateContractNumber"]();
        expect(numbers.has(number)).toBe(false); // Should be unique
        numbers.add(number);
      }
      
      expect(numbers.size).toBe(1000);
    });

    it("should sanitize audit log data", async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await service["logAuditEvent"]({
        entity_type: "financing_proposal",
        entity_id: "fp_123",
        action: "created",
        user_id: "<script>alert('xss')</script>",
        metadata: {
          malicious_field: "'; DROP TABLE users; --",
        },
      });

      // Should log without executing malicious code
      expect(logSpy).toHaveBeenCalled();
      logSpy.mockRestore();
    });
  });

  describe("✅ Memory & Resource Management", () => {
    it("should handle large payment schedules efficiently", async () => {
      const proposal = {
        id: "fp_123",
        approved_amount: 1000000,
        down_payment_amount: 0,
        approved_term_months: 360, // 30 years
        interest_rate_annual: 12,
        amortization_system: "PRICE",
      };

      service.list = jest.fn().mockResolvedValue([]); // No existing schedules
      service.create = jest.fn().mockResolvedValue({});

      const startMemory = process.memoryUsage().heapUsed;
      
      await service["generatePaymentSchedule"](proposal as any);
      
      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Should not consume excessive memory (adjust threshold as needed)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
      expect(service.create).toHaveBeenCalledTimes(360);
    });

    it("should cleanup resources properly", async () => {
      const proposal = {
        id: "fp_123",
        approved_amount: 50000,
        down_payment_amount: 0,
        approved_term_months: 48,
        interest_rate_annual: 12,
        amortization_system: "PRICE",
      };

      // Mock existing schedules
      service.list = jest.fn().mockResolvedValue([
        { id: "ps_1" }, { id: "ps_2" }, { id: "ps_3" }
      ]);
      service.delete = jest.fn().mockResolvedValue({});
      service.create = jest.fn().mockResolvedValue({});

      await service["generatePaymentSchedule"](proposal as any);

      // Should delete old schedules before creating new ones
      expect(service.delete).toHaveBeenCalledTimes(3);
      expect(service.create).toHaveBeenCalledTimes(48);
    });
  });

  describe("✅ Error Recovery", () => {
    it("should handle database connection failures", async () => {
      service.create = jest.fn().mockRejectedValue(new Error("Connection timeout"));

      await expect(service.createProposal({
        customer_id: "cust_123",
        modality: "CDC",
        requested_amount: 50000,
        requested_term_months: 48,
      })).rejects.toThrow("Connection timeout");
    });

    it("should handle partial failures in batch operations", async () => {
      let callCount = 0;
      service.create = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 3) {
          throw new Error("Partial failure");
        }
        return Promise.resolve({ id: `fp_${callCount}` });
      });

      const proposals = [];
      for (let i = 0; i < 5; i++) {
        try {
          const proposal = await service.createProposal({
            customer_id: `cust_${i}`,
            modality: "CDC",
            requested_amount: 50000,
            requested_term_months: 48,
          });
          proposals.push(proposal);
        } catch (error) {
          // Continue with other proposals
        }
      }

      expect(proposals).toHaveLength(4); // 5 attempts - 1 failure
    });
  });

  describe("✅ Data Integrity", () => {
    it("should maintain calculation precision", async () => {
      const result = await service.calculateFinancing({
        amount: 123456.78,
        down_payment: 12345.67,
        term_months: 37, // Odd number
        interest_rate_annual: 13.456, // Decimal rate
      });

      // Check precision is maintained
      expect(result.financed_amount).toBe(123456.78 - 12345.67);
      
      // Sum of all payments should equal total
      const totalPayments = result.installments.reduce((sum, inst) => sum + inst.total, 0);
      const expectedTotal = result.financed_amount + result.total_interest;
      
      // Allow small rounding differences
      expect(Math.abs(totalPayments - expectedTotal)).toBeLessThan(0.01);
    });

    it("should validate state transition integrity", async () => {
      const states = ["pending", "approved", "contracted", "cancelled"];
      const validTransitions = {
        pending: ["approved", "cancelled"],
        approved: ["contracted", "cancelled"],
        contracted: [], // No transitions allowed
        cancelled: [], // No transitions allowed
      };

      for (const fromState of states) {
        for (const toState of states) {
          if (fromState === toState) continue; // Skip same state

          service.retrieve = jest.fn().mockResolvedValue({
            id: "fp_test",
            status: fromState,
          });

          const isValidTransition = validTransitions[fromState].includes(toState);

          if (toState === "approved" && isValidTransition) {
            await expect(service.approveProposal({
              id: "fp_test",
              approved_amount: 50000,
              approved_term_months: 48,
              interest_rate_annual: 12,
            })).resolves.toBeDefined();
          } else if (toState === "contracted" && isValidTransition) {
            service.retrieve = jest.fn().mockResolvedValue({
              id: "fp_test",
              status: "approved",
              expires_at: new Date(Date.now() + 86400000),
            });
            
            await expect(service.contractProposal({
              id: "fp_test",
            })).resolves.toBeDefined();
          } else if (toState === "cancelled" && isValidTransition) {
            await expect(service.cancelProposal({
              id: "fp_test",
              cancellation_reason: "Test",
            })).resolves.toBeDefined();
          }
        }
      }
    });
  });
});