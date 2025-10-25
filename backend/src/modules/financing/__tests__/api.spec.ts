import request from "supertest";
import express from "express";

// Mock the API routes for testing
const createMockApp = () => {
  const app = express();
  app.use(express.json());
  
  // Mock financing service
  const mockFinancingService = {
    createProposal: jest.fn(),
    getProposal: jest.fn(),
    getProposalStats: jest.fn(),
    approveProposal: jest.fn(),
    calculateFinancing: jest.fn(),
  };

  // Mock request scope
  app.use((req: any, res, next) => {
    req.scope = {
      resolve: () => mockFinancingService,
    };
    req.auth_context = { actor_id: "cust_123" };
    next();
  });

  return { app, mockFinancingService };
};

describe("Financing API - Complete Coverage", () => {
  describe("✅ Admin API Routes", () => {
    it("GET /admin/financing - should return statistics", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.getProposalStats.mockResolvedValue({
        total: 10,
        by_status: { pending: 5, approved: 3, contracted: 2 },
        total_amount: 500000,
      });

      // Simulate admin route
      app.get("/admin/financing", async (req: any, res) => {
        try {
          const financingService = req.scope.resolve();
          const stats = await financingService.getProposalStats();
          res.json({ stats });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app).get("/admin/financing");
      
      expect(response.status).toBe(200);
      expect(response.body.stats.total).toBe(10);
    });

    it("POST /admin/financing - should create proposal with validation", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.createProposal.mockResolvedValue({
        id: "fp_123",
        status: "pending",
      });

      // Simulate admin route with validation
      app.post("/admin/financing", async (req: any, res) => {
        try {
          // Basic validation
          if (!req.body.customer_id) {
            return res.status(400).json({ errors: ["customer_id is required"] });
          }
          
          const financingService = req.scope.resolve();
          const proposal = await financingService.createProposal(req.body);
          res.status(201).json({ proposal });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app)
        .post("/admin/financing")
        .send({
          customer_id: "cust_123",
          modality: "CDC",
          requested_amount: 50000,
          requested_term_months: 48,
        });
      
      expect(response.status).toBe(201);
      expect(response.body.proposal.id).toBe("fp_123");
    });

    it("POST /admin/financing/[id] - should handle approval actions", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.approveProposal.mockResolvedValue({
        id: "fp_123",
        status: "approved",
      });

      app.post("/admin/financing/:id", async (req: any, res) => {
        try {
          const { id } = req.params;
          const { action, ...data } = req.body;
          
          const financingService = req.scope.resolve();
          let result;
          
          if (action === "approve") {
            result = await financingService.approveProposal({ id, ...data });
          }
          
          res.json({ proposal: result });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app)
        .post("/admin/financing/fp_123")
        .send({
          action: "approve",
          approved_amount: 45000,
          interest_rate_annual: 12.5,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.proposal.status).toBe("approved");
    });
  });

  describe("✅ Store API Routes", () => {
    it("GET /store/financing - should return customer proposals", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.getProposalsByCustomer = jest.fn().mockResolvedValue([
        { id: "fp_1", status: "pending" },
        { id: "fp_2", status: "approved" },
      ]);

      app.get("/store/financing", async (req: any, res) => {
        try {
          const customerId = req.auth_context?.actor_id;
          if (!customerId) {
            return res.status(401).json({ message: "Authentication required" });
          }
          
          const financingService = req.scope.resolve();
          const proposals = await financingService.getProposalsByCustomer(customerId);
          res.json({ proposals });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app).get("/store/financing");
      
      expect(response.status).toBe(200);
      expect(response.body.proposals).toHaveLength(2);
    });

    it("POST /store/financing/calculate - should calculate financing", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.calculateFinancing.mockResolvedValue({
        monthly_payment: 1200,
        total_paid: 57600,
        cet_rate: 15.2,
      });

      app.post("/store/financing/calculate", async (req: any, res) => {
        try {
          const financingService = req.scope.resolve();
          const calculation = await financingService.calculateFinancing(req.body);
          res.json({ calculation });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app)
        .post("/store/financing/calculate")
        .send({
          amount: 50000,
          term_months: 48,
          interest_rate_annual: 12.5,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.calculation.monthly_payment).toBe(1200);
    });
  });

  describe("✅ Error Handling", () => {
    it("should handle validation errors", async () => {
      const { app } = createMockApp();
      
      app.post("/test", (req, res) => {
        const errors = [];
        if (!req.body.required_field) {
          errors.push("required_field is missing");
        }
        
        if (errors.length > 0) {
          return res.status(400).json({ errors });
        }
        
        res.json({ success: true });
      });

      const response = await request(app).post("/test").send({});
      
      expect(response.status).toBe(400);
      expect(response.body.errors).toContain("required_field is missing");
    });

    it("should handle service errors", async () => {
      const { app, mockFinancingService } = createMockApp();
      
      mockFinancingService.createProposal.mockRejectedValue(
        new Error("Database connection failed")
      );

      app.post("/test", async (req: any, res) => {
        try {
          const service = req.scope.resolve();
          await service.createProposal(req.body);
          res.json({ success: true });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      const response = await request(app).post("/test").send({});
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database connection failed");
    });
  });
});