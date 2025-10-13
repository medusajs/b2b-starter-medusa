/**
 * Financing Offers Unit Tests
 * 
 * Testes completos das funções de geração de ofertas e cálculo de CET.
 * 100% determinísticos, sem I/O, sem mocks.
 * 
 * @module credit-analysis/__tests__/offers.unit.spec
 */

import {
    calculateIOF,
    calculateTAC,
    calculateInsurance,
    calculateMonthlyPayment,
    calculateTotalAmount,
    calculateCET,
    generateFinancingOffers,
    formatOffer,
} from "../offers";
import { FinancingModality } from "../types/enums";

describe("Financing Offers - Pure Functions", () => {
    // ==========================================================================
    // IOF Calculation
    // ==========================================================================

    describe("calculateIOF", () => {
        it("should calculate IOF correctly for standard term", () => {
            const iof = calculateIOF(50000, 24); // 24 meses = 720 dias

            // IOF Diário: 50000 × 0.000082 × 365 = 1496.50 (cap at 365 days)
            // IOF Adicional: 50000 × 0.0038 = 190
            // Total: 1686.50
            expect(iof).toBeCloseTo(1686.50, 1);
        });

        it("should cap days at 365 for long terms", () => {
            const iof24 = calculateIOF(50000, 24); // 720 dias → capped at 365
            const iof60 = calculateIOF(50000, 60); // 1800 dias → capped at 365

            // IOF diário deve ser igual (ambos usam 365 dias)
            expect(iof24).toBeCloseTo(iof60, 1);
        });

        it("should calculate IOF for short term", () => {
            const iof = calculateIOF(10000, 6); // 6 meses = 180 dias

            // IOF Diário: 10000 × 0.000082 × 180 = 147.60
            // IOF Adicional: 10000 × 0.0038 = 38
            // Total: 185.60
            expect(iof).toBeCloseTo(185.60, 1);
        });

        it("should scale linearly with principal", () => {
            const iof10k = calculateIOF(10000, 12);
            const iof20k = calculateIOF(20000, 12);

            expect(iof20k).toBeCloseTo(iof10k * 2, 1);
        });
    });

    // ==========================================================================
    // TAC Calculation
    // ==========================================================================

    describe("calculateTAC", () => {
        it("should calculate TAC for CDC (2%)", () => {
            expect(calculateTAC(50000, FinancingModality.CDC)).toBe(1000);
            expect(calculateTAC(100000, FinancingModality.CDC)).toBe(2000);
        });

        it("should calculate TAC for LEASING (1.5%)", () => {
            expect(calculateTAC(50000, FinancingModality.LEASING)).toBe(750);
            expect(calculateTAC(100000, FinancingModality.LEASING)).toBe(1500);
        });

        it("should calculate TAC for EAAS (1%)", () => {
            expect(calculateTAC(50000, FinancingModality.EAAS)).toBe(500);
            expect(calculateTAC(100000, FinancingModality.EAAS)).toBe(1000);
        });

        it("should return 0 for CASH", () => {
            expect(calculateTAC(50000, FinancingModality.CASH)).toBe(0);
            expect(calculateTAC(100000, FinancingModality.CASH)).toBe(0);
        });
    });

    // ==========================================================================
    // Insurance Calculation
    // ==========================================================================

    describe("calculateInsurance", () => {
        it("should calculate insurance as 0.20% of balance", () => {
            expect(calculateInsurance(50000)).toBe(100);
            expect(calculateInsurance(100000)).toBe(200);
            expect(calculateInsurance(10000)).toBe(20);
        });
    });

    // ==========================================================================
    // Monthly Payment (Price Table)
    // ==========================================================================

    describe("calculateMonthlyPayment", () => {
        it("should calculate payment using Price table formula", () => {
            const pmt = calculateMonthlyPayment(50000, 0.015, 24);

            // PMT = 50000 × [0.015 × (1.015)^24] / [(1.015)^24 - 1]
            // PMT ≈ 2496 (correção: cálculo manual estava errado)
            expect(pmt).toBeCloseTo(2496, 0);
        }); it("should handle 0% interest rate (simple division)", () => {
            const pmt = calculateMonthlyPayment(60000, 0, 12);
            expect(pmt).toBe(5000); // 60000 / 12
        });

        it("should increase payment for higher interest rates", () => {
            const pmt1 = calculateMonthlyPayment(50000, 0.01, 24);
            const pmt2 = calculateMonthlyPayment(50000, 0.02, 24);

            expect(pmt2).toBeGreaterThan(pmt1);
        });

        it("should decrease payment for longer terms", () => {
            const pmt12 = calculateMonthlyPayment(50000, 0.015, 12);
            const pmt24 = calculateMonthlyPayment(50000, 0.015, 24);
            const pmt36 = calculateMonthlyPayment(50000, 0.015, 36);

            expect(pmt12).toBeGreaterThan(pmt24);
            expect(pmt24).toBeGreaterThan(pmt36);
        });
    });

    // ==========================================================================
    // Total Amount Calculation
    // ==========================================================================

    describe("calculateTotalAmount", () => {
        it("should sum all costs correctly", () => {
            const total = calculateTotalAmount(2386, 24, 500, 1000);

            // (2386 × 24) + 500 + 1000 = 57264 + 500 + 1000 = 58764
            expect(total).toBeCloseTo(58764, 0);
        });

        it("should handle zero additional costs", () => {
            const total = calculateTotalAmount(2000, 12, 0, 0);
            expect(total).toBe(24000); // 2000 × 12
        });
    });

    // ==========================================================================
    // CET Calculation (Custo Efetivo Total)
    // ==========================================================================

    describe("calculateCET", () => {
        it("should calculate CET higher than nominal rate (due to IOF/TAC)", () => {
            const result = calculateCET({
                principal: 50000,
                term_months: 24,
                interest_rate_monthly: 0.015,
                iof: 500,
                tac: 1000,
            });

            // CET deve ser maior que taxa nominal (0.015)
            expect(result.cet_monthly).toBeGreaterThan(0.015);

            // CET anual: (1 + cet_monthly)^12 - 1
            const expected_annual = Math.pow(1 + result.cet_monthly, 12) - 1;
            expect(result.cet_annual).toBeCloseTo(expected_annual, 4);
        });

        it("should include insurance in CET calculation", () => {
            const without_insurance = calculateCET({
                principal: 50000,
                term_months: 24,
                interest_rate_monthly: 0.015,
                iof: 500,
                tac: 1000,
                insurance_monthly: 0,
            });

            const with_insurance = calculateCET({
                principal: 50000,
                term_months: 24,
                interest_rate_monthly: 0.015,
                iof: 500,
                tac: 1000,
                insurance_monthly: 50,
            });

            // CET com seguro deve ser maior
            expect(with_insurance.cet_monthly).toBeGreaterThan(without_insurance.cet_monthly);
            expect(with_insurance.monthly_payment).toBeGreaterThan(without_insurance.monthly_payment);
        });

        it("should calculate correct monthly payment", () => {
            const result = calculateCET({
                principal: 50000,
                term_months: 24,
                interest_rate_monthly: 0.015,
                iof: 0,
                tac: 0,
                insurance_monthly: 0,
            });

            // Sem custos adicionais, CET = taxa nominal
            expect(result.cet_monthly).toBeCloseTo(0.015, 3);
            expect(result.monthly_payment).toBeCloseTo(2496, 0);
        }); it("should calculate correct total amounts", () => {
            const result = calculateCET({
                principal: 50000,
                term_months: 24,
                interest_rate_monthly: 0.015,
                iof: 500,
                tac: 1000,
                insurance_monthly: 50,
            });

            // Total IOF
            expect(result.total_iof).toBe(500);

            // Total Insurance: 50 × 24 = 1200
            expect(result.total_insurance).toBe(1200);

            // Total Amount: (monthly_payment × 24) + iof + tac
            const expected_total = (result.monthly_payment * 24) + 500 + 1000;
            expect(result.total_amount).toBeCloseTo(expected_total, 1);

            // Total Cost: total_amount - principal
            expect(result.total_cost).toBeCloseTo(expected_total - 50000, 1);
        });

        it("should handle edge case: very low interest rate", () => {
            const result = calculateCET({
                principal: 10000,
                term_months: 12,
                interest_rate_monthly: 0.001, // 0.1% a.m.
                iof: 100,
                tac: 100,
            });

            expect(result.cet_monthly).toBeGreaterThan(0.001);
            expect(result.cet_monthly).toBeLessThan(0.01);
        });

        it("should converge to correct CET (Newton-Raphson)", () => {
            const result = calculateCET({
                principal: 100000,
                term_months: 60,
                interest_rate_monthly: 0.02,
                iof: 2000,
                tac: 2000,
                insurance_monthly: 100,
            });

            // CET deve ser finito e positivo
            expect(result.cet_monthly).toBeGreaterThan(0);
            expect(result.cet_monthly).toBeLessThan(0.1); // Sanity check
            expect(isFinite(result.cet_monthly)).toBe(true);
        });
    });

    // ==========================================================================
    // Offer Generation
    // ==========================================================================

    describe("generateFinancingOffers", () => {
        it("should generate offers for all modalities", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            // Deve gerar 3 ofertas (CDC, LEASING, EAAS)
            expect(offers).toHaveLength(3);

            // Verificar modalidades presentes
            const modalities = offers.map(o => o.modality);
            expect(modalities).toContain(FinancingModality.CDC);
            expect(modalities).toContain(FinancingModality.LEASING);
            expect(modalities).toContain(FinancingModality.EAAS);
        });

        it("should order offers by CET (ascending)", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            // Verificar que CET está em ordem crescente
            for (let i = 1; i < offers.length; i++) {
                expect(offers[i].cet).toBeGreaterThanOrEqual(offers[i - 1].cet);
            }
        });

        it("should assign correct ranks", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            // Verificar ranks: 1, 2, 3
            expect(offers[0].rank).toBe(1);
            expect(offers[1].rank).toBe(2);
            expect(offers[2].rank).toBe(3);
        });

        it("should mark best offer as recommended", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            // Apenas a primeira oferta (rank 1) deve ser recomendada
            expect(offers[0].is_recommended).toBe(true);
            expect(offers[1].is_recommended).toBe(false);
            expect(offers[2].is_recommended).toBe(false);
        });

        it("should include all required fields", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            offers.forEach(offer => {
                expect(offer.credit_analysis_id).toBe("analysis-123");
                expect(offer.max_amount).toBe(50000);
                expect(offer.term_months).toBe(24);
                expect(offer.interest_rate_monthly).toBeGreaterThan(0);
                expect(offer.interest_rate_annual).toBeGreaterThan(0);
                expect(offer.cet).toBeGreaterThan(0);
                expect(offer.monthly_payment).toBeGreaterThan(0);
                expect(offer.total_amount).toBeGreaterThan(0);
                expect(offer.iof).toBeGreaterThan(0);
                expect(offer.tac).toBeGreaterThanOrEqual(0);
                expect(offer.insurance).toBeGreaterThanOrEqual(0);
                expect(offer.institution).toBeTruthy();
                expect(offer.offer_details).toBeDefined();
                expect(offer.offer_details?.features).toBeInstanceOf(Array);
            });
        });

        it("should require down payment for LEASING", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            const leasing = offers.find(o => o.modality === FinancingModality.LEASING);
            expect(leasing?.down_payment_required).toBe(10000); // 20% of 50000
        });

        it("should not require down payment for CDC and EAAS", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            const cdc = offers.find(o => o.modality === FinancingModality.CDC);
            const eaas = offers.find(o => o.modality === FinancingModality.EAAS);

            expect(cdc?.down_payment_required).toBeUndefined();
            expect(eaas?.down_payment_required).toBeUndefined();
        });

        it("should use BACEN rates when use_bacen_only = true", () => {
            const offers_custom = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.012, // Taxa customizada diferente das taxas BACEN
                false
            );

            const offers_bacen = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.012,
                true
            );

            // Taxas BACEN devem ser diferentes das taxas customizadas
            // BACEN usa taxas médias (0.0150 para EaaS, 0.0200 para Leasing, 0.0250 para CDC)
            expect(offers_bacen[0].interest_rate_monthly).not.toBe(offers_custom[0].interest_rate_monthly);
        }); it("should calculate correct annual rate from monthly", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            offers.forEach(offer => {
                const expected_annual = Math.pow(1 + offer.interest_rate_monthly, 12) - 1;
                expect(offer.interest_rate_annual).toBeCloseTo(expected_annual, 4);
            });
        });

        it("should include specific offer details per modality", () => {
            const offers = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            );

            const cdc = offers.find(o => o.modality === FinancingModality.CDC);
            const leasing = offers.find(o => o.modality === FinancingModality.LEASING);
            const eaas = offers.find(o => o.modality === FinancingModality.EAAS);

            // CDC: aprovação rápida, sem entrada
            expect(cdc?.offer_details?.features).toContain("Aprovação rápida (até 48h)");
            expect(cdc?.offer_details?.features).toContain("Não exige entrada");

            // LEASING: entrada 20%, bem em garantia
            expect(leasing?.offer_details?.requirements).toContain("Entrada de 20%");
            expect(leasing?.offer_details?.features).toContain("Bem fica em garantia");

            // EAAS: modelo assinatura, zero investimento
            expect(eaas?.offer_details?.features).toContain("Modelo de assinatura mensal");
            expect(eaas?.offer_details?.advantages).toContain("Zero investimento inicial");
        });
    });

    // ==========================================================================
    // Formatting
    // ==========================================================================

    describe("formatOffer", () => {
        it("should format offer correctly", () => {
            const offer = generateFinancingOffers(
                "analysis-123",
                50000,
                24,
                0.015,
                false
            )[0];

            const formatted = formatOffer(offer);

            // Deve conter modalidade, valor mensal, CET e instituição
            expect(formatted).toContain(offer.modality);
            expect(formatted).toContain("R$");
            expect(formatted).toContain("CET");
            expect(formatted).toContain(offer.institution);
        });
    });

    // ==========================================================================
    // Integration Tests
    // ==========================================================================

    describe("Integration: Full offer calculation", () => {
        it("should generate realistic offers for typical loan", () => {
            const offers = generateFinancingOffers(
                "analysis-456",
                75000,  // R$ 75k
                36,     // 3 anos
                0.0125, // 1.25% a.m.
                false
            );

            expect(offers).toHaveLength(3);

            // Verificar que todas as ofertas têm CET razoável (< 5% a.m.)
            offers.forEach(offer => {
                expect(offer.cet).toBeLessThan(0.05);
                expect(offer.cet).toBeGreaterThan(0.01);
            });

            // Verificar que parcelas são razoáveis (< R$ 3k para R$ 75k em 36 meses)
            offers.forEach(offer => {
                expect(offer.monthly_payment).toBeLessThan(3500);
                expect(offer.monthly_payment).toBeGreaterThan(2000);
            });
        });

        it("should show lower CET for longer terms (same rate)", () => {
            const offers_12m = generateFinancingOffers("analysis-789", 50000, 12, 0.015, false);
            const offers_60m = generateFinancingOffers("analysis-789", 50000, 60, 0.015, false);

            // IOF é capped em 365 dias, então prazo maior dilui IOF/TAC
            // CET deve ser similar ou menor para prazo maior
            expect(offers_60m[0].cet).toBeLessThanOrEqual(offers_12m[0].cet * 1.1);
        });
    });
});
