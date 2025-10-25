import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import FinancingModuleService from '../service';
import { CreateFinancingProposalDTO, ApproveFinancingDTO } from '../types/mutations';

// Mock dependencies
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRetrieve = jest.fn();
const mockList = jest.fn();
const mockDelete = jest.fn();

jest.mock('@medusajs/framework/utils', () => ({
  MedusaService: jest.fn((models) => {
    return class MockService {
      create = mockCreate;
      update = mockUpdate;
      retrieve = mockRetrieve;
      list = mockList;
      delete = mockDelete;
    };
  }),
}));

describe('Financing Service Integration', () => {
  let service: FinancingModuleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new FinancingModuleService({});
  });

  describe('Complete Financing Cycle', () => {
    it('should complete full cycle: pending → approved → contracted', async () => {
      const proposalData: CreateFinancingProposalDTO = {
        customer_id: 'cust_123',
        modality: 'CDC',
        requested_amount: 100000,
        requested_term_months: 48,
        down_payment_amount: 20000,
      };

      // Step 1: Create proposal
      const mockProposal = {
        id: 'fp_123',
        ...proposalData,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockCreate.mockResolvedValue(mockProposal);

      const createdProposal = await service.createProposal(proposalData);
      
      expect(mockCreate).toHaveBeenCalledWith('FinancingProposal', {
        ...proposalData,
        down_payment_amount: 20000,
        amortization_system: 'PRICE',
        status: 'pending',
      });
      expect(createdProposal.status).toBe('pending');

      // Step 2: Approve proposal
      const approvalData: ApproveFinancingDTO = {
        id: 'fp_123',
        approved_amount: 90000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
        approval_conditions: ['Seguro obrigatório'],
      };

      const mockApprovedProposal = {
        ...mockProposal,
        ...approvalData,
        status: 'approved',
        approved_at: new Date(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cet_rate: 13.2,
        financed_amount: 70000, // 90000 - 20000
      };

      mockRetrieve.mockResolvedValue(mockProposal);
      mockUpdate.mockResolvedValue(mockApprovedProposal);
      mockList.mockResolvedValue([]); // No existing schedules
      mockCreate.mockResolvedValue({}); // Payment schedule creation

      const approvedProposal = await service.approveProposal(approvalData);
      
      expect(mockRetrieve).toHaveBeenCalledWith('FinancingProposal', 'fp_123');
      expect(mockUpdate).toHaveBeenCalledWith('FinancingProposal', 'fp_123', expect.objectContaining({
        approved_amount: 90000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
        status: 'approved',
      }));
      expect(approvedProposal.status).toBe('approved');

      // Step 3: Contract proposal
      const mockContractedProposal = {
        ...mockApprovedProposal,
        status: 'contracted',
        contracted_at: new Date(),
        contract_number: 'YSH-12345678-ABC123',
        contract_url: 'https://contracts.yellosolarhub.com/YSH-12345678-ABC123.pdf',
      };

      mockRetrieve.mockResolvedValue(mockApprovedProposal);
      mockUpdate.mockResolvedValue(mockContractedProposal);

      const contractedProposal = await service.contractProposal({ id: 'fp_123' });
      
      expect(mockUpdate).toHaveBeenCalledWith('FinancingProposal', 'fp_123', expect.objectContaining({
        status: 'contracted',
        contract_number: expect.stringMatching(/^YSH-\d{8}-[A-Z0-9]{6}$/),
        contract_url: expect.stringContaining('contracts.yellosolarhub.com'),
      }));
      expect(contractedProposal.status).toBe('contracted');
    });

    it('should handle cancellation at any stage', async () => {
      const mockProposal = {
        id: 'fp_123',
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockCancelledProposal = {
        ...mockProposal,
        status: 'cancelled',
        cancelled_at: new Date(),
        rejection_reason: 'Customer request',
      };

      mockRetrieve.mockResolvedValue(mockProposal);
      mockUpdate.mockResolvedValue(mockCancelledProposal);

      const cancelledProposal = await service.cancelProposal({
        id: 'fp_123',
        cancellation_reason: 'Customer request',
      });

      expect(cancelledProposal.status).toBe('cancelled');
      expect(mockUpdate).toHaveBeenCalledWith('FinancingProposal', 'fp_123', expect.objectContaining({
        status: 'cancelled',
        rejection_reason: 'Customer request',
      }));
    });
  });

  describe('State Validation and Idempotency', () => {
    it('should be idempotent for approval', async () => {
      const mockApprovedProposal = {
        id: 'fp_123',
        status: 'approved',
        approved_amount: 90000,
      };

      mockRetrieve.mockResolvedValue(mockApprovedProposal);

      const result = await service.approveProposal({
        id: 'fp_123',
        approved_amount: 90000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      });

      // Should return existing approved proposal without calling update
      expect(result).toEqual(mockApprovedProposal);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should prevent invalid state transitions', async () => {
      const mockContractedProposal = {
        id: 'fp_123',
        status: 'contracted',
      };

      mockRetrieve.mockResolvedValue(mockContractedProposal);

      // Cannot approve contracted proposal
      await expect(service.approveProposal({
        id: 'fp_123',
        approved_amount: 90000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      })).rejects.toThrow('Cannot approve proposal in status: contracted');

      // Cannot cancel contracted proposal
      await expect(service.cancelProposal({
        id: 'fp_123',
        cancellation_reason: 'Test',
      })).rejects.toThrow('Cannot cancel contracted proposal');
    });

    it('should handle expired proposals', async () => {
      const expiredProposal = {
        id: 'fp_123',
        status: 'approved',
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      };

      mockRetrieve.mockResolvedValue(expiredProposal);

      await expect(service.contractProposal({ id: 'fp_123' }))
        .rejects.toThrow('Proposal has expired');
    });
  });

  describe('Financing Calculations', () => {
    it('should calculate financing correctly', async () => {
      const calculation = await service.calculateFinancing({
        amount: 100000,
        down_payment: 20000,
        term_months: 48,
        interest_rate_annual: 12,
        system: 'PRICE',
      });

      expect(calculation.principal).toBe(100000);
      expect(calculation.down_payment).toBe(20000);
      expect(calculation.financed_amount).toBe(80000);
      expect(calculation.term_months).toBe(48);
      expect(calculation.system).toBe('PRICE');
      expect(calculation.installments).toHaveLength(48);
      expect(calculation.monthly_payment).toBeGreaterThan(0);
      expect(calculation.total_interest).toBeGreaterThan(0);
      expect(calculation.cet_rate).toBeGreaterThan(0);

      // Check installment structure
      calculation.installments.forEach((installment, index) => {
        expect(installment.number).toBe(index + 1);
        expect(installment.due_date).toBeInstanceOf(Date);
        expect(installment.principal).toBeGreaterThan(0);
        expect(installment.interest).toBeGreaterThan(0);
        expect(installment.total).toBeGreaterThan(0);
        expect(installment.balance).toBeGreaterThanOrEqual(0);
      });

      // Last installment should have zero balance
      const lastInstallment = calculation.installments[47];
      expect(lastInstallment.balance).toBeCloseTo(0, 2);
    });

    it('should reject invalid calculation inputs', async () => {
      // Zero financed amount
      await expect(service.calculateFinancing({
        amount: 20000,
        down_payment: 20000, // Same as amount
        term_months: 48,
        interest_rate_annual: 12,
      })).rejects.toThrow('Financed amount must be greater than zero');

      // Negative financed amount
      await expect(service.calculateFinancing({
        amount: 10000,
        down_payment: 15000, // More than amount
        term_months: 48,
        interest_rate_annual: 12,
      })).rejects.toThrow('Financed amount must be greater than zero');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent proposals', async () => {
      mockRetrieve.mockResolvedValue(null);

      await expect(service.approveProposal({
        id: 'non_existent',
        approved_amount: 90000,
        approved_term_months: 48,
        interest_rate_annual: 12.5,
      })).rejects.toThrow('Proposal non_existent not found');

      await expect(service.contractProposal({
        id: 'non_existent',
      })).rejects.toThrow('Proposal non_existent not found');

      await expect(service.cancelProposal({
        id: 'non_existent',
        cancellation_reason: 'Test',
      })).rejects.toThrow('Proposal non_existent not found');
    });
  });

  describe('Payment Schedule Generation', () => {
    it('should generate payment schedule on approval', async () => {
      const mockProposal = {
        id: 'fp_123',
        status: 'pending',
        down_payment_amount: 20000,
      };

      const mockApprovedProposal = {
        ...mockProposal,
        status: 'approved',
        approved_amount: 100000,
        approved_term_months: 12,
        interest_rate_annual: 12,
        amortization_system: 'PRICE',
      };

      mockRetrieve.mockResolvedValue(mockProposal);
      mockUpdate.mockResolvedValue(mockApprovedProposal);
      mockList.mockResolvedValue([]); // No existing schedules
      mockCreate.mockResolvedValue({}); // Payment schedule creation

      await service.approveProposal({
        id: 'fp_123',
        approved_amount: 100000,
        approved_term_months: 12,
        interest_rate_annual: 12,
      });

      // Should create 12 payment schedules
      expect(mockCreate).toHaveBeenCalledTimes(13); // 1 for update + 12 for schedules
    });
  });
});