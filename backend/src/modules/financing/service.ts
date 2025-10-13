import { MedusaService } from "@medusajs/framework/utils";
import { FinancingProposal, PaymentSchedule } from "./models";
import {
  CreateFinancingProposalDTO,
  UpdateFinancingProposalDTO,
  ApproveFinancingDTO,
  ContractFinancingDTO,
  CancelFinancingDTO,
  CalculateFinancingDTO,
} from "./types/mutations";
import {
  FinancingProposalDTO,
  PaymentScheduleDTO,
  FinancingCalculation,
  ContractData,
} from "./types/common";
import BACENFinancingService from "./bacen-service";
import { createFinancingProposalWorkflow } from "./workflows";
import { COMPANY_MODULE } from "../company";
import { APPROVAL_MODULE } from "../approval";

class FinancingModuleService extends MedusaService({
  FinancingProposal,
  PaymentSchedule,
}) {
  private bacenService: BACENFinancingService;
  private container: any;

  constructor(container: any) {
    super(container);
    this.container = container;
    this.bacenService = new BACENFinancingService();
  }

  // CRUD Operations with Integrations
  async createProposal(data: CreateFinancingProposalDTO): Promise<FinancingProposalDTO> {
    try {
      // 1. Check spending limits first
      const companyService = this.container.resolve(COMPANY_MODULE);
      const employee = await companyService.retrieveEmployeeByCustomerId(data.customer_id);

      if (employee) {
        const spendingCheck = await companyService.checkSpendingLimit(
          employee.id,
          data.requested_amount
        );

        if (!spendingCheck.allowed) {
          throw new Error(`Spending limit exceeded: ${spendingCheck.reason}`);
        }
      }

      // 2. Create proposal
      const proposalData = {
        ...data,
        down_payment_amount: data.down_payment_amount || 0,
        amortization_system: data.amortization_system || "PRICE",
        status: "pending" as const,
      };

      const [proposal] = await this.createFinancingProposals([proposalData]);

      // 3. Create approval for high-value proposals
      if (data.requested_amount > 100000) {
        try {
          const approvalService = this.container.resolve(APPROVAL_MODULE);
          await approvalService.createApproval({
            cart_id: proposal.id,
            type: "financing_proposal",
            status: "pending",
            created_by: data.customer_id,
            cart_total_snapshot: data.requested_amount,
            priority: data.requested_amount > 500000 ? 2 : 1,
          });
        } catch (error) {
          console.warn("Failed to create approval:", error);
        }
      }

      // 4. Log audit trail
      await this.logAuditEvent({
        entity_type: "financing_proposal",
        entity_id: proposal.id,
        action: "created",
        user_id: data.customer_id,
        metadata: {
          requested_amount: data.requested_amount,
          modality: data.modality,
          employee_id: employee?.id,
          company_id: employee?.company_id,
        },
      });

      return proposal;
    } catch (error) {
      console.error("Failed to create financing proposal:", error);
      throw error;
    }
  }

  async updateProposal(data: UpdateFinancingProposalDTO): Promise<FinancingProposalDTO> {
    const [updated] = await this.updateFinancingProposals([data]);
    return updated;
  }

  async getProposal(id: string): Promise<FinancingProposalDTO | null> {
    return await this.retrieveFinancingProposal(id);
  }

  async getProposalsByCustomer(customerId: string): Promise<FinancingProposalDTO[]> {
    return await this.listFinancingProposals({ customer_id: customerId });
  }

  // State Management (Idempotent)
  async approveProposal(data: ApproveFinancingDTO): Promise<FinancingProposalDTO> {
    const proposal = await this.retrieveFinancingProposal(data.id);

    if (!proposal) {
      throw new Error(`Proposal ${data.id} not found`);
    }

    // Idempotency check
    if (proposal.status === "approved") {
      return proposal;
    }

    if (proposal.status !== "pending") {
      throw new Error(`Cannot approve proposal in status: ${proposal.status}`);
    }

    // Calculate CET and expiration
    const cetRate = this.calculateCET(
      data.approved_amount,
      data.interest_rate_annual,
      data.approved_term_months
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (data.expires_in_days || 30));

    const updateData = {
      id: data.id,
      approved_amount: data.approved_amount,
      approved_term_months: data.approved_term_months,
      interest_rate_annual: data.interest_rate_annual,
      interest_rate_monthly: data.interest_rate_annual / 12,
      cet_rate: cetRate,
      financed_amount: data.approved_amount - proposal.down_payment_amount,
      approval_conditions: data.approval_conditions,
      status: "approved" as const,
      approved_at: new Date(),
      expires_at: expiresAt,
    };

    const [updatedProposal] = await this.updateFinancingProposals([updateData]);

    // Generate payment schedule
    await this.generatePaymentSchedule(updatedProposal);

    return updatedProposal;
  } async contractProposal(data: ContractFinancingDTO): Promise<FinancingProposalDTO> {
    const proposal = await this.retrieve("FinancingProposal", data.id);

    if (!proposal) {
      throw new Error(`Proposal ${data.id} not found`);
    }

    // Idempotency check
    if (proposal.status === "contracted") {
      return proposal;
    }

    if (proposal.status !== "approved") {
      throw new Error(`Cannot contract proposal in status: ${proposal.status}`);
    }

    // Check expiration
    if (proposal.expires_at && new Date() > proposal.expires_at) {
      throw new Error("Proposal has expired");
    }

    // Generate contract
    const contractNumber = this.generateContractNumber();
    const contractUrl = await this.generateContract(proposal, contractNumber);

    const updateData = {
      id: data.id,
      status: "contracted" as const,
      contracted_at: new Date(),
      contract_number: contractNumber,
      contract_url: contractUrl,
    };

    const [updated] = await this.updateFinancingProposals([updateData]);
    return updated;
  }

  async cancelProposal(data: CancelFinancingDTO): Promise<FinancingProposalDTO> {
    const proposal = await this.retrieve("FinancingProposal", data.id);

    if (!proposal) {
      throw new Error(`Proposal ${data.id} not found`);
    }

    // Idempotency check
    if (proposal.status === "cancelled") {
      return proposal;
    }

    if (proposal.status === "contracted") {
      throw new Error("Cannot cancel contracted proposal");
    }

    const updateData = {
      status: "cancelled" as const,
      cancelled_at: new Date(),
      rejection_reason: data.cancellation_reason,
    };

    return await this.update("FinancingProposal", data.id, updateData);
  }

  // Calculations (aligned with credit-analysis)
  async calculateFinancing(data: CalculateFinancingDTO): Promise<FinancingCalculation> {
    const downPayment = data.down_payment || 0;
    const financedAmount = data.amount - downPayment;

    if (financedAmount <= 0) {
      throw new Error("Financed amount must be greater than zero");
    }

    const system = data.system || "PRICE";
    const startDate = data.start_date || new Date();

    let simulation;
    if (system === "PRICE") {
      simulation = this.bacenService.simulatePrice(
        financedAmount,
        data.interest_rate_annual,
        data.term_months
      );
    } else {
      simulation = this.bacenService.simulateSAC(
        financedAmount,
        data.interest_rate_annual,
        data.term_months
      );
    }

    // Calculate CET
    const cetRate = this.calculateCET(
      data.amount,
      data.interest_rate_annual,
      data.term_months
    );

    // Generate installments with dates
    const installments = simulation.payments.map((payment, index) => {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + index + 1);

      return {
        number: payment.period,
        due_date: dueDate,
        principal: payment.principal_payment,
        interest: payment.interest_payment,
        total: payment.total_payment,
        balance: payment.remaining_balance,
      };
    });

    return {
      principal: data.amount,
      interest_rate_annual: data.interest_rate_annual,
      term_months: data.term_months,
      system,
      down_payment: downPayment,
      financed_amount: financedAmount,
      monthly_payment: simulation.summary.average_payment,
      total_paid: simulation.summary.total_paid + downPayment,
      total_interest: simulation.summary.total_interest,
      cet_rate: cetRate,
      installments,
    };
  }

  // Payment Schedule Generation
  private async generatePaymentSchedule(proposal: FinancingProposalDTO): Promise<void> {
    if (!proposal.approved_amount || !proposal.approved_term_months || !proposal.interest_rate_annual) {
      throw new Error("Missing required data for payment schedule generation");
    }

    const calculation = await this.calculateFinancing({
      amount: proposal.approved_amount,
      down_payment: proposal.down_payment_amount,
      term_months: proposal.approved_term_months,
      interest_rate_annual: proposal.interest_rate_annual,
      system: proposal.amortization_system,
    });

    // Delete existing schedules
    const existingSchedules = await this.list("PaymentSchedule", {
      where: { financing_proposal_id: proposal.id },
    });

    for (const schedule of existingSchedules) {
      await this.delete("PaymentSchedule", schedule.id);
    }

    // Create new schedules
    for (const installment of calculation.installments) {
      await this.create("PaymentSchedule", {
        financing_proposal_id: proposal.id,
        installment_number: installment.number,
        due_date: installment.due_date,
        principal_amount: installment.principal,
        interest_amount: installment.interest,
        total_amount: installment.total,
        remaining_balance: installment.balance,
        status: "pending",
      });
    }
  }

  // Contract Generation (Stub)
  private async generateContract(proposal: FinancingProposalDTO, contractNumber: string): Promise<string> {
    const contractData: ContractData = {
      proposal_id: proposal.id,
      contract_number: contractNumber,
      customer_data: {
        name: "Customer Name", // Would come from customer service
        document: "000.000.000-00",
        email: "customer@email.com",
        phone: "(11) 99999-9999",
        address: "Customer Address",
      },
      financing_data: {
        amount: proposal.approved_amount!,
        term_months: proposal.approved_term_months!,
        interest_rate: proposal.interest_rate_annual!,
        monthly_payment: 0, // Would be calculated
        total_amount: 0,
      },
      terms_and_conditions: "Standard terms and conditions...",
      generated_at: new Date(),
    };

    // Stub: Generate PDF and upload to S3
    const contractUrl = await this.uploadContractToS3(contractData);

    return contractUrl;
  }

  private async uploadContractToS3(contractData: ContractData): Promise<string> {
    // Stub implementation
    console.log("Uploading contract to S3:", contractData.contract_number);

    // In real implementation:
    // 1. Generate PDF from template
    // 2. Upload to S3
    // 3. Return public URL

    return `https://contracts.yellosolarhub.com/${contractData.contract_number}.pdf`;
  }

  // Utility Methods
  private generateContractNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `YSH-${timestamp.slice(-8)}-${random}`;
  }

  private calculateCET(amount: number, annualRate: number, termMonths: number): number {
    // Simplified CET calculation
    // In real implementation, would include all fees and costs
    const monthlyRate = annualRate / 100 / 12;
    const totalInterest = amount * monthlyRate * termMonths;
    const totalAmount = amount + totalInterest;

    // CET as effective annual rate
    return ((totalAmount / amount) ** (12 / termMonths) - 1) * 100;
  }

  // Integration Methods
  async createProposalFromCreditAnalysis(
    creditAnalysisId: string,
    modality: "CDC" | "LEASING" | "EAAS"
  ): Promise<FinancingProposalDTO> {
    // This would integrate with credit-analysis module
    // For now, stub implementation

    const proposalData: CreateFinancingProposalDTO = {
      customer_id: "cust_from_analysis",
      credit_analysis_id: creditAnalysisId,
      modality,
      requested_amount: 50000,
      requested_term_months: 48,
      down_payment_amount: 10000,
    };

    return await this.createProposal(proposalData);
  }

  // Audit Logging
  private async logAuditEvent(event: {
    entity_type: string;
    entity_id: string;
    action: string;
    user_id: string;
    metadata?: any;
  }): Promise<void> {
    // Stub implementation for audit logging
    console.log("Audit Event:", {
      ...event,
      timestamp: new Date().toISOString(),
    });

    // In real implementation:
    // 1. Store in audit_log table
    // 2. Send to monitoring system
    // 3. Trigger alerts if needed
  }

  // Admin Dashboard Methods
  async getProposalStats(): Promise<{
    total: number;
    by_status: Record<string, number>;
    by_modality: Record<string, number>;
    total_amount: number;
  }> {
    const proposals = await this.list("FinancingProposal", {});

    const stats = {
      total: proposals.length,
      by_status: {} as Record<string, number>,
      by_modality: {} as Record<string, number>,
      total_amount: 0,
    };

    proposals.forEach((proposal) => {
      // Count by status
      stats.by_status[proposal.status] = (stats.by_status[proposal.status] || 0) + 1;

      // Count by modality
      stats.by_modality[proposal.modality] = (stats.by_modality[proposal.modality] || 0) + 1;

      // Sum amounts
      stats.total_amount += proposal.requested_amount;
    });

    return stats;
  }

  async getCompanyFinancingHistory(companyId: string): Promise<FinancingProposalDTO[]> {
    const companyService = this.container.resolve(COMPANY_MODULE);
    const employees = await companyService.listEmployees({ company_id: companyId });
    const customerIds = employees.map(emp => emp.customer_id).filter(Boolean);

    if (customerIds.length === 0) {
      return [];
    }

    return await this.list("FinancingProposal", {
      where: { customer_id: { $in: customerIds } },
      relations: ["payment_schedules"],
      order: { created_at: "DESC" },
    });
  }
}

export default FinancingModuleService;