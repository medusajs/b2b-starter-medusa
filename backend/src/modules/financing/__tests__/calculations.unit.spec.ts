import { describe, it, expect, beforeEach } from '@jest/globals';
import BACENFinancingService from '../bacen-service';

describe('Financing Calculations', () => {
  let bacenService: BACENFinancingService;

  beforeEach(() => {
    bacenService = new BACENFinancingService();
  });

  describe('PRICE System (Fixed Installments)', () => {
    it('should calculate PRICE system correctly', () => {
      const principal = 100000; // R$ 100k
      const annualRate = 12; // 12% a.a.
      const periods = 12; // 12 months

      const result = bacenService.simulatePrice(principal, annualRate, periods);

      expect(result.system).toBe('PRICE');
      expect(result.principal).toBe(principal);
      expect(result.interest_rate).toBe(annualRate);
      expect(result.periods).toBe(periods);
      expect(result.payments).toHaveLength(periods);

      // All payments should be equal in PRICE system
      const firstPayment = result.payments[0].total_payment;
      result.payments.forEach(payment => {
        expect(payment.total_payment).toBeCloseTo(firstPayment, 2);
      });

      // Total paid should equal sum of all payments
      const totalFromPayments = result.payments.reduce((sum, p) => sum + p.total_payment, 0);
      expect(result.summary.total_paid).toBeCloseTo(totalFromPayments, 2);

      // Interest should be positive
      expect(result.summary.total_interest).toBeGreaterThan(0);

      // Final balance should be zero
      const finalPayment = result.payments[periods - 1];
      expect(finalPayment.remaining_balance).toBeCloseTo(0, 2);
    });

    it('should handle different interest rates', () => {
      const principal = 50000;
      const periods = 24;

      const lowRate = bacenService.simulatePrice(principal, 6, periods);
      const highRate = bacenService.simulatePrice(principal, 18, periods);

      // Higher rate should result in higher total interest
      expect(highRate.summary.total_interest).toBeGreaterThan(lowRate.summary.total_interest);
      
      // Higher rate should result in higher monthly payment
      expect(highRate.summary.average_payment).toBeGreaterThan(lowRate.summary.average_payment);
    });
  });

  describe('SAC System (Constant Amortization)', () => {
    it('should calculate SAC system correctly', () => {
      const principal = 100000;
      const annualRate = 12;
      const periods = 12;

      const result = bacenService.simulateSAC(principal, annualRate, periods);

      expect(result.system).toBe('SAC');
      expect(result.principal).toBe(principal);
      expect(result.payments).toHaveLength(periods);

      // Principal payment should be constant
      const constantAmortization = principal / periods;
      result.payments.forEach(payment => {
        expect(payment.principal_payment).toBeCloseTo(constantAmortization, 2);
      });

      // Total payment should decrease over time
      for (let i = 1; i < result.payments.length; i++) {
        expect(result.payments[i].total_payment).toBeLessThan(result.payments[i - 1].total_payment);
      }

      // Interest should decrease over time
      for (let i = 1; i < result.payments.length; i++) {
        expect(result.payments[i].interest_payment).toBeLessThan(result.payments[i - 1].interest_payment);
      }

      // Final balance should be zero
      const finalPayment = result.payments[periods - 1];
      expect(finalPayment.remaining_balance).toBeCloseTo(0, 2);
    });

    it('should have first payment higher than last payment', () => {
      const result = bacenService.simulateSAC(100000, 12, 24);

      const firstPayment = result.payments[0].total_payment;
      const lastPayment = result.payments[23].total_payment;

      expect(firstPayment).toBeGreaterThan(lastPayment);
      expect(result.summary.first_payment).toBeCloseTo(firstPayment, 2);
      expect(result.summary.last_payment).toBeCloseTo(lastPayment, 2);
    });
  });

  describe('System Comparison', () => {
    it('should show SAC has lower total interest than PRICE', () => {
      const principal = 100000;
      const annualRate = 12;
      const periods = 24;

      const priceResult = bacenService.simulatePrice(principal, annualRate, periods);
      const sacResult = bacenService.simulateSAC(principal, annualRate, periods);

      // SAC should have lower total interest
      expect(sacResult.summary.total_interest).toBeLessThan(priceResult.summary.total_interest);

      // Both should have same principal
      expect(priceResult.principal).toBe(sacResult.principal);
    });

    it('should handle edge cases', () => {
      // Single payment
      const singlePayment = bacenService.simulatePrice(10000, 12, 1);
      expect(singlePayment.payments).toHaveLength(1);
      expect(singlePayment.payments[0].remaining_balance).toBeCloseTo(0, 2);

      // Very low interest rate
      const lowInterest = bacenService.simulatePrice(10000, 0.1, 12);
      expect(lowInterest.summary.total_interest).toBeGreaterThan(0);
      expect(lowInterest.summary.total_paid).toBeGreaterThan(10000);
    });
  });

  describe('Solar Financing Rate', () => {
    it('should calculate solar financing rate with spread', async () => {
      // Mock SELIC rate
      jest.spyOn(bacenService, 'getSELICRate').mockResolvedValue({
        data: '2024-01-01',
        valor: 10.5
      });

      const rate = await bacenService.getSolarFinancingRate(3.5);
      expect(rate).toBe(14.0); // 10.5 + 3.5

      const customSpread = await bacenService.getSolarFinancingRate(5.0);
      expect(customSpread).toBe(15.5); // 10.5 + 5.0
    });
  });

  describe('Input Validation', () => {
    it('should handle invalid inputs gracefully', () => {
      // Negative principal
      expect(() => bacenService.simulatePrice(-1000, 12, 12)).not.toThrow();
      
      // Zero periods
      expect(() => bacenService.simulatePrice(10000, 12, 0)).not.toThrow();
      
      // Very high interest rate
      const highRate = bacenService.simulatePrice(10000, 100, 12);
      expect(highRate.summary.total_interest).toBeGreaterThan(0);
    });
  });

  describe('Precision and Rounding', () => {
    it('should maintain precision in calculations', () => {
      const result = bacenService.simulatePrice(99999.99, 11.99, 13);
      
      // Check that calculations don't have excessive decimal places
      result.payments.forEach(payment => {
        expect(Number.isFinite(payment.total_payment)).toBe(true);
        expect(Number.isFinite(payment.principal_payment)).toBe(true);
        expect(Number.isFinite(payment.interest_payment)).toBe(true);
        expect(Number.isFinite(payment.remaining_balance)).toBe(true);
      });
    });
  });
});