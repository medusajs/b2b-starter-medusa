import { ModuleRegistrationName } from "@medusajs/framework/utils";
import { medusaIntegrationTestRunner } from "medusa-test-utils";
import { FINANCING_MODULE } from "../index";

jest.setTimeout(30000);

medusaIntegrationTestRunner({
  moduleName: FINANCING_MODULE,
  testSuite: ({ getContainer }) => {
    describe("Financing Module Integration", () => {
      let container: any;
      let financingService: any;
      let companyService: any;
      let approvalService: any;

      beforeEach(async () => {
        container = getContainer();
        financingService = container.resolve(FINANCING_MODULE);
        
        // Mock other services
        companyService = {
          retrieveEmployeeByCustomerId: jest.fn(),
          retrieveCompany: jest.fn(),
          checkSpendingLimit: jest.fn(),
        };
        
        approvalService = {
          createApproval: jest.fn(),
          updateApproval: jest.fn(),
        };

        container.register({
          "companyModuleService": companyService,
          "approvalModuleService": approvalService,
        });
      });

      describe("Customer Group Integration", () => {
        it("should link financing proposal to customer group", async () => {
          // Mock company data
          companyService.retrieveEmployeeByCustomerId.mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          });

          companyService.retrieveCompany.mockResolvedValue({
            id: "comp_123",
            customer_group_id: "cg_123",
            name: "Test Company",
          });

          const proposal = await financingService.createProposal({
            customer_id: "cust_123",
            modality: "CDC",
            requested_amount: 50000,
            requested_term_months: 48,
          });

          expect(proposal).toBeDefined();
          expect(proposal.customer_id).toBe("cust_123");
          expect(companyService.retrieveEmployeeByCustomerId).toHaveBeenCalledWith("cust_123");
        });
      });

      describe("Spending Limits Integration", () => {
        it("should enforce spending limits", async () => {
          companyService.retrieveEmployeeByCustomerId.mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          });

          companyService.checkSpendingLimit.mockResolvedValue({
            allowed: false,
            reason: "Monthly limit exceeded",
          });

          await expect(
            financingService.createProposal({
              customer_id: "cust_123",
              modality: "CDC",
              requested_amount: 100000,
              requested_term_months: 48,
            })
          ).rejects.toThrow("Spending limit exceeded");
        });

        it("should allow proposal within spending limits", async () => {
          companyService.retrieveEmployeeByCustomerId.mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          });

          companyService.checkSpendingLimit.mockResolvedValue({
            allowed: true,
            remaining: 50000,
          });

          const proposal = await financingService.createProposal({
            customer_id: "cust_123",
            modality: "CDC",
            requested_amount: 30000,
            requested_term_months: 48,
          });

          expect(proposal).toBeDefined();
          expect(proposal.requested_amount).toBe(30000);
        });
      });

      describe("Approval Workflow Integration", () => {
        it("should create approval for high-value proposals", async () => {
          companyService.retrieveEmployeeByCustomerId.mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          });

          companyService.checkSpendingLimit.mockResolvedValue({
            allowed: true,
            remaining: 200000,
          });

          approvalService.createApproval.mockResolvedValue({
            id: "appr_123",
            status: "pending",
            type: "financing_proposal",
          });

          const proposal = await financingService.createProposal({
            customer_id: "cust_123",
            modality: "CDC",
            requested_amount: 150000, // High value
            requested_term_months: 48,
          });

          expect(proposal).toBeDefined();
          expect(approvalService.createApproval).toHaveBeenCalled();
        });
      });

      describe("Complete Financing Lifecycle", () => {
        it("should handle complete proposal lifecycle", async () => {
          // Setup mocks
          companyService.retrieveEmployeeByCustomerId.mockResolvedValue({
            id: "emp_123",
            company_id: "comp_123",
            customer_id: "cust_123",
          });

          companyService.checkSpendingLimit.mockResolvedValue({
            allowed: true,
            remaining: 100000,
          });

          // 1. Create proposal
          const proposal = await financingService.createProposal({
            customer_id: "cust_123",
            modality: "CDC",
            requested_amount: 50000,
            requested_term_months: 48,
          });

          expect(proposal.status).toBe("pending");

          // 2. Approve proposal
          const approvedProposal = await financingService.approveProposal({
            id: proposal.id,
            approved_amount: 45000,
            approved_term_months: 48,
            interest_rate_annual: 12.5,
          });

          expect(approvedProposal.status).toBe("approved");
          expect(approvedProposal.approved_amount).toBe(45000);

          // 3. Contract proposal
          const contractedProposal = await financingService.contractProposal({
            id: proposal.id,
          });

          expect(contractedProposal.status).toBe("contracted");
          expect(contractedProposal.contract_number).toBeDefined();
          expect(contractedProposal.contract_url).toBeDefined();
        });

        it("should handle proposal cancellation", async () => {
          const proposal = await financingService.createProposal({
            customer_id: "cust_123",
            modality: "CDC",
            requested_amount: 50000,
            requested_term_months: 48,
          });

          const cancelledProposal = await financingService.cancelProposal({
            id: proposal.id,
            cancellation_reason: "Customer request",
          });

          expect(cancelledProposal.status).toBe("cancelled");
          expect(cancelledProposal.rejection_reason).toBe("Customer request");
        });
      });

      describe("Admin Dashboard Integration", () => {
        it("should provide proposal statistics", async () => {
          // Create test proposals
          await financingService.createProposal({
            customer_id: "cust_1",
            modality: "CDC",
            requested_amount: 30000,
            requested_term_months: 36,
          });

          await financingService.createProposal({
            customer_id: "cust_2",
            modality: "LEASING",
            requested_amount: 70000,
            requested_term_months: 48,
          });

          const stats = await financingService.getProposalStats();

          expect(stats.total).toBe(2);
          expect(stats.by_status.pending).toBe(2);
          expect(stats.by_modality.CDC).toBe(1);
          expect(stats.by_modality.LEASING).toBe(1);
          expect(stats.total_amount).toBe(100000);
        });

        it("should provide company financing history", async () => {
          companyService.listEmployees = jest.fn().mockResolvedValue([
            { id: "emp_1", customer_id: "cust_1", company_id: "comp_123" },
            { id: "emp_2", customer_id: "cust_2", company_id: "comp_123" },
          ]);

          // Create proposals for company employees
          await financingService.createProposal({
            customer_id: "cust_1",
            modality: "CDC",
            requested_amount: 30000,
            requested_term_months: 36,
          });

          await financingService.createProposal({
            customer_id: "cust_2",
            modality: "LEASING",
            requested_amount: 70000,
            requested_term_months: 48,
          });

          const history = await financingService.getCompanyFinancingHistory("comp_123");

          expect(history).toHaveLength(2);
          expect(history[0].customer_id).toBeOneOf(["cust_1", "cust_2"]);
        });
      });
    });
  },
});