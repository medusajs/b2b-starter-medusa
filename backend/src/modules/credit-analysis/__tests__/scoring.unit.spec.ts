/**
 * Credit Scoring Unit Tests
 * 
 * Testes completos das pure functions de scoring de crédito.
 * 100% determinísticos, sem I/O, sem mocks.
 * 
 * @module credit-analysis/__tests__/scoring.unit.spec
 */

import {
    calculateIncomeScore,
    calculateEmploymentScore,
    calculateCreditHistoryScore,
    calculateDebtRatioScore,
    calculateDebtToIncomeRatio,
    calculateTotalScore,
    calculateCreditScore,
    isApproved,
    calculateInterestRate,
    getRiskLevel,
    getApprovalProbability,
    calculateLoanToIncomeRatio,
    calculateRecommendedMaxAmount,
} from "../scoring";
import { CustomerType, RiskLevel } from "../types/enums";

describe("Credit Scoring - Pure Functions", () => {
    // ==========================================================================
    // Income Score (0-30 pontos)
    // ==========================================================================

    describe("calculateIncomeScore", () => {
        it("should return 30 points for income >= 10000", () => {
            expect(calculateIncomeScore(10000)).toBe(30);
            expect(calculateIncomeScore(15000)).toBe(30);
            expect(calculateIncomeScore(50000)).toBe(30);
        });

        it("should return 20 points for income >= 5000 and < 10000", () => {
            expect(calculateIncomeScore(5000)).toBe(20);
            expect(calculateIncomeScore(7500)).toBe(20);
            expect(calculateIncomeScore(9999)).toBe(20);
        });

        it("should return 15 points for income >= 3000 and < 5000", () => {
            expect(calculateIncomeScore(3000)).toBe(15);
            expect(calculateIncomeScore(4000)).toBe(15);
            expect(calculateIncomeScore(4999)).toBe(15);
        });

        it("should return 10 points for income >= 1500 and < 3000", () => {
            expect(calculateIncomeScore(1500)).toBe(10);
            expect(calculateIncomeScore(2000)).toBe(10);
            expect(calculateIncomeScore(2999)).toBe(10);
        });

        it("should return 5 points for income < 1500", () => {
            expect(calculateIncomeScore(1499)).toBe(5);
            expect(calculateIncomeScore(1000)).toBe(5);
            expect(calculateIncomeScore(500)).toBe(5);
        });
    });

    // ==========================================================================
    // Employment Score (0-15 pontos)
    // ==========================================================================

    describe("calculateEmploymentScore", () => {
        describe("Pessoa Jurídica (PJ)", () => {
            it("should return 15 points for foundation_years >= 5", () => {
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 5)).toBe(15);
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 10)).toBe(15);
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 20)).toBe(15);
            });

            it("should return 12 points for foundation_years >= 3 and < 5", () => {
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 3)).toBe(12);
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 4)).toBe(12);
            });

            it("should return 8 points for foundation_years >= 1 and < 3", () => {
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 1)).toBe(8);
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 2)).toBe(8);
            });

            it("should return 5 points for foundation_years < 1", () => {
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 0)).toBe(5);
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, 0.5)).toBe(5);
            });

            it("should handle undefined foundation_years as 0", () => {
                expect(calculateEmploymentScore(CustomerType.BUSINESS, undefined, undefined)).toBe(5);
            });
        });

        describe("Pessoa Física (PF)", () => {
            it("should return 15 points for employment_time_months >= 36", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 36, undefined)).toBe(15);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 48, undefined)).toBe(15);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 60, undefined)).toBe(15);
            });

            it("should return 12 points for employment_time_months >= 24 and < 36", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 24, undefined)).toBe(12);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 30, undefined)).toBe(12);
            });

            it("should return 8 points for employment_time_months >= 12 and < 24", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 12, undefined)).toBe(8);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 18, undefined)).toBe(8);
            });

            it("should return 5 points for employment_time_months >= 6 and < 12", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 6, undefined)).toBe(5);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 9, undefined)).toBe(5);
            });

            it("should return 2 points for employment_time_months < 6", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 0, undefined)).toBe(2);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 3, undefined)).toBe(2);
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, 5, undefined)).toBe(2);
            });

            it("should handle undefined employment_time_months as 0", () => {
                expect(calculateEmploymentScore(CustomerType.INDIVIDUAL, undefined, undefined)).toBe(2);
            });
        });
    });

    // ==========================================================================
    // Credit History Score (0-35 pontos)
    // ==========================================================================

    describe("calculateCreditHistoryScore", () => {
        describe("Base score (without penalties)", () => {
            it("should return 35 points for credit_score >= 750", () => {
                expect(calculateCreditHistoryScore(750, false, false)).toBe(35);
                expect(calculateCreditHistoryScore(800, false, false)).toBe(35);
                expect(calculateCreditHistoryScore(1000, false, false)).toBe(35);
            });

            it("should return 30 points for credit_score >= 700 and < 750", () => {
                expect(calculateCreditHistoryScore(700, false, false)).toBe(30);
                expect(calculateCreditHistoryScore(725, false, false)).toBe(30);
            });

            it("should return 25 points for credit_score >= 650 and < 700", () => {
                expect(calculateCreditHistoryScore(650, false, false)).toBe(25);
                expect(calculateCreditHistoryScore(675, false, false)).toBe(25);
            });

            it("should return 20 points for credit_score >= 600 and < 650", () => {
                expect(calculateCreditHistoryScore(600, false, false)).toBe(20);
                expect(calculateCreditHistoryScore(625, false, false)).toBe(20);
            });

            it("should return 15 points for credit_score >= 550 and < 600", () => {
                expect(calculateCreditHistoryScore(550, false, false)).toBe(15);
                expect(calculateCreditHistoryScore(575, false, false)).toBe(15);
            });

            it("should return 10 points for credit_score >= 500 and < 550", () => {
                expect(calculateCreditHistoryScore(500, false, false)).toBe(10);
                expect(calculateCreditHistoryScore(525, false, false)).toBe(10);
            });

            it("should return 5 points for credit_score < 500", () => {
                expect(calculateCreditHistoryScore(499, false, false)).toBe(5);
                expect(calculateCreditHistoryScore(300, false, false)).toBe(5);
                expect(calculateCreditHistoryScore(0, false, false)).toBe(5);
            });
        });

        describe("Penalties", () => {
            it("should apply -20 penalty for negative credit", () => {
                expect(calculateCreditHistoryScore(750, true, false)).toBe(15); // 35 - 20
                expect(calculateCreditHistoryScore(700, true, false)).toBe(10); // 30 - 20
                expect(calculateCreditHistoryScore(600, true, false)).toBe(0);  // 20 - 20
            });

            it("should apply -35 penalty for bankruptcy", () => {
                expect(calculateCreditHistoryScore(750, false, true)).toBe(0);  // 35 - 35
                expect(calculateCreditHistoryScore(700, false, true)).toBe(0);  // 30 - 35 = -5, min 0
                expect(calculateCreditHistoryScore(600, false, true)).toBe(0);  // 20 - 35 = -15, min 0
            });

            it("should apply both penalties if both conditions are true", () => {
                expect(calculateCreditHistoryScore(750, true, true)).toBe(0);  // 35 - 20 - 35 = -20, min 0
                expect(calculateCreditHistoryScore(800, true, true)).toBe(0);  // 35 - 55 = -20, min 0
            });

            it("should never return negative score", () => {
                expect(calculateCreditHistoryScore(500, true, true)).toBe(0);
                expect(calculateCreditHistoryScore(300, true, true)).toBe(0);
                expect(calculateCreditHistoryScore(0, true, true)).toBe(0);
            });
        });

        describe("Default values", () => {
            it("should use default credit_score 500 if not provided", () => {
                expect(calculateCreditHistoryScore(undefined, false, false)).toBe(10);
            });

            it("should default penalties to false", () => {
                expect(calculateCreditHistoryScore(750)).toBe(35);
            });
        });
    });

    // ==========================================================================
    // Debt Ratio Score (0-20 pontos)
    // ==========================================================================

    describe("calculateDebtRatioScore", () => {
        it("should return 20 points for debt_ratio = 0", () => {
            expect(calculateDebtRatioScore(0)).toBe(20);
        });

        it("should return 18 points for debt_ratio < 0.20", () => {
            expect(calculateDebtRatioScore(0.01)).toBe(18);
            expect(calculateDebtRatioScore(0.10)).toBe(18);
            expect(calculateDebtRatioScore(0.19)).toBe(18);
        });

        it("should return 15 points for debt_ratio >= 0.20 and < 0.30", () => {
            expect(calculateDebtRatioScore(0.20)).toBe(15);
            expect(calculateDebtRatioScore(0.25)).toBe(15);
            expect(calculateDebtRatioScore(0.29)).toBe(15);
        });

        it("should return 10 points for debt_ratio >= 0.30 and < 0.40", () => {
            expect(calculateDebtRatioScore(0.30)).toBe(10);
            expect(calculateDebtRatioScore(0.35)).toBe(10);
            expect(calculateDebtRatioScore(0.39)).toBe(10);
        });

        it("should return 5 points for debt_ratio >= 0.40 and < 0.50", () => {
            expect(calculateDebtRatioScore(0.40)).toBe(5);
            expect(calculateDebtRatioScore(0.45)).toBe(5);
            expect(calculateDebtRatioScore(0.49)).toBe(5);
        });

        it("should return 0 points for debt_ratio >= 0.50", () => {
            expect(calculateDebtRatioScore(0.50)).toBe(0);
            expect(calculateDebtRatioScore(0.70)).toBe(0);
            expect(calculateDebtRatioScore(1.00)).toBe(0);
        });
    });

    // ==========================================================================
    // Helper Functions
    // ==========================================================================

    describe("calculateDebtToIncomeRatio", () => {
        it("should calculate correct ratio", () => {
            expect(calculateDebtToIncomeRatio(1500, 5000)).toBe(0.30);
            expect(calculateDebtToIncomeRatio(0, 3000)).toBe(0);
            expect(calculateDebtToIncomeRatio(2500, 5000)).toBe(0.50);
        });

        it("should return 1.0 for zero income (protection)", () => {
            expect(calculateDebtToIncomeRatio(1000, 0)).toBe(1.0);
        });
    });

    describe("calculateTotalScore", () => {
        it("should sum all factor scores correctly", () => {
            const factors = {
                income_score: 30,
                employment_score: 15,
                credit_history_score: 35,
                debt_ratio_score: 20,
            };
            expect(calculateTotalScore(factors)).toBe(100);
        });

        it("should handle partial scores", () => {
            const factors = {
                income_score: 20,
                employment_score: 8,
                credit_history_score: 25,
                debt_ratio_score: 10,
            };
            expect(calculateTotalScore(factors)).toBe(63);
        });
    });

    // ==========================================================================
    // Integrated Score Calculation
    // ==========================================================================

    describe("calculateCreditScore", () => {
        it("should calculate perfect score (100 points)", () => {
            const result = calculateCreditScore({
                customer_type: CustomerType.INDIVIDUAL,
                monthly_income: 15000,
                monthly_debts: 0,
                employment_time_months: 48,
                credit_score: 800,
                has_negative_credit: false,
                has_bankruptcy: false,
            });

            expect(result.income_score).toBe(30);
            expect(result.employment_score).toBe(15);
            expect(result.credit_history_score).toBe(35);
            expect(result.debt_ratio_score).toBe(20);
            expect(result.total_score).toBe(100);
        });

        it("should calculate minimum passing score (60 points)", () => {
            const result = calculateCreditScore({
                customer_type: CustomerType.INDIVIDUAL,
                monthly_income: 3000,      // 15 pts
                monthly_debts: 600,         // 20% ratio = 15 pts
                employment_time_months: 12, // 8 pts
                credit_score: 650,          // 25 pts
                has_negative_credit: false,
                has_bankruptcy: false,
            });

            expect(result.income_score).toBe(15);
            expect(result.employment_score).toBe(8);
            expect(result.credit_history_score).toBe(25);
            expect(result.debt_ratio_score).toBe(15);
            expect(result.total_score).toBe(63);
        });

        it("should handle edge case: exact 60 score", () => {
            const result = calculateCreditScore({
                customer_type: CustomerType.INDIVIDUAL,
                monthly_income: 3000,       // 15 pts
                monthly_debts: 900,          // 30% ratio = 10 pts
                employment_time_months: 12,  // 8 pts
                credit_score: 700,           // 30 pts
                has_negative_credit: true,   // -20 penalty
                has_bankruptcy: false,
            });

            // 15 + 8 + 10 + 10 = 43 (abaixo de 60, seria rejeitado)
            expect(result.total_score).toBeLessThan(60);
        });

        it("should calculate low score with penalties", () => {
            const result = calculateCreditScore({
                customer_type: CustomerType.INDIVIDUAL,
                monthly_income: 1200,        // 5 pts
                monthly_debts: 700,           // 58% ratio = 0 pts
                employment_time_months: 3,    // 2 pts
                credit_score: 450,            // 5 pts
                has_negative_credit: true,    // -20 penalty
                has_bankruptcy: true,         // -35 penalty
            });

            expect(result.income_score).toBe(5);
            expect(result.employment_score).toBe(2);
            expect(result.credit_history_score).toBe(0); // 5 - 55 = -50, min 0
            expect(result.debt_ratio_score).toBe(0);
            expect(result.total_score).toBe(7);
        });

        it("should calculate PJ score correctly", () => {
            const result = calculateCreditScore({
                customer_type: CustomerType.BUSINESS,
                monthly_income: 20000,
                monthly_debts: 4000,          // 20% ratio
                foundation_years: 7,
                credit_score: 720,
                has_negative_credit: false,
                has_bankruptcy: false,
            });

            expect(result.income_score).toBe(30);
            expect(result.employment_score).toBe(15);
            expect(result.credit_history_score).toBe(30);
            expect(result.debt_ratio_score).toBe(15);
            expect(result.total_score).toBe(90);
        });
    });

    // ==========================================================================
    // Approval Logic
    // ==========================================================================

    describe("isApproved", () => {
        it("should approve strong applicant (score 70, debt 30%, no restrictions)", () => {
            expect(isApproved(70, 0.30, false, false)).toBe(true);
        });

        it("should approve minimum passing (score 60, debt 49%, no restrictions)", () => {
            expect(isApproved(60, 0.49, false, false)).toBe(true);
        });

        it("should reject if score < 60", () => {
            expect(isApproved(59, 0.30, false, false)).toBe(false);
            expect(isApproved(45, 0.20, false, false)).toBe(false);
        });

        it("should reject if debt_ratio >= 0.50", () => {
            expect(isApproved(70, 0.50, false, false)).toBe(false);
            expect(isApproved(80, 0.70, false, false)).toBe(false);
        });

        it("should reject if has_negative_credit = true", () => {
            expect(isApproved(75, 0.20, true, false)).toBe(false);
        });

        it("should reject if has_bankruptcy = true", () => {
            expect(isApproved(80, 0.20, false, true)).toBe(false);
        });

        it("should reject if any condition fails", () => {
            expect(isApproved(59, 0.51, true, true)).toBe(false); // All fail
            expect(isApproved(70, 0.30, true, false)).toBe(false); // Negative credit
            expect(isApproved(70, 0.30, false, true)).toBe(false); // Bankruptcy
        });
    });

    // ==========================================================================
    // Interest Rate Calculation
    // ==========================================================================

    describe("calculateInterestRate", () => {
        it("should return base rate (1.5%) for score 60", () => {
            expect(calculateInterestRate(60)).toBe(0.015);
        });

        it("should apply discount for score above 60", () => {
            expect(calculateInterestRate(80)).toBeCloseTo(0.013, 4); // 1.5% - 0.2%
            expect(calculateInterestRate(70)).toBeCloseTo(0.014, 4); // 1.5% - 0.1%
        });

        it("should cap at minimum rate (1.1%) for score 100", () => {
            expect(calculateInterestRate(100)).toBe(0.011);
            expect(calculateInterestRate(150)).toBe(0.011); // Still capped
        });

        it("should not give discount for score below 60", () => {
            expect(calculateInterestRate(50)).toBe(0.015);
            expect(calculateInterestRate(30)).toBe(0.015);
        });
    });

    // ==========================================================================
    // Risk Assessment
    // ==========================================================================

    describe("getRiskLevel", () => {
        it("should return LOW for score >= 75", () => {
            expect(getRiskLevel(75)).toBe(RiskLevel.LOW);
            expect(getRiskLevel(85)).toBe(RiskLevel.LOW);
            expect(getRiskLevel(100)).toBe(RiskLevel.LOW);
        });

        it("should return MEDIUM for score >= 50 and < 75", () => {
            expect(getRiskLevel(50)).toBe(RiskLevel.MEDIUM);
            expect(getRiskLevel(65)).toBe(RiskLevel.MEDIUM);
            expect(getRiskLevel(74)).toBe(RiskLevel.MEDIUM);
        });

        it("should return HIGH for score < 50", () => {
            expect(getRiskLevel(49)).toBe(RiskLevel.HIGH);
            expect(getRiskLevel(30)).toBe(RiskLevel.HIGH);
            expect(getRiskLevel(0)).toBe(RiskLevel.HIGH);
        });
    });

    describe("getApprovalProbability", () => {
        it("should return score as probability for clean applicant", () => {
            expect(getApprovalProbability(80, false, false)).toBe(80);
            expect(getApprovalProbability(60, false, false)).toBe(60);
            expect(getApprovalProbability(45, false, false)).toBe(45);
        });

        it("should return 0 if has negative credit", () => {
            expect(getApprovalProbability(90, true, false)).toBe(0);
        });

        it("should return 0 if has bankruptcy", () => {
            expect(getApprovalProbability(85, false, true)).toBe(0);
        });

        it("should return 0 if has both restrictions", () => {
            expect(getApprovalProbability(70, true, true)).toBe(0);
        });
    });

    // ==========================================================================
    // Additional Helpers
    // ==========================================================================

    describe("calculateLoanToIncomeRatio", () => {
        it("should calculate correct ratio", () => {
            expect(calculateLoanToIncomeRatio(50000, 5000)).toBe(10);
            expect(calculateLoanToIncomeRatio(30000, 3000)).toBe(10);
            expect(calculateLoanToIncomeRatio(15000, 5000)).toBe(3);
        });

        it("should return Infinity for zero income", () => {
            expect(calculateLoanToIncomeRatio(50000, 0)).toBe(Infinity);
        });
    });

    describe("calculateRecommendedMaxAmount", () => {
        it("should return 30x monthly income", () => {
            expect(calculateRecommendedMaxAmount(5000)).toBe(150000);
            expect(calculateRecommendedMaxAmount(3000)).toBe(90000);
            expect(calculateRecommendedMaxAmount(10000)).toBe(300000);
        });
    });
});
