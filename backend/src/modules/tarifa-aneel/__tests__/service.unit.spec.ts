/**
 * 🧪 ANEEL Tariff Service - Unit Tests
 * Testes das funções puras e cálculos
 */

import {
    calcularTarifaEfetiva,
    calcularCustoMensal,
    calcularBreakdownCustos,
    calcularPaybackSimples,
    calcularROI,
    normalizeUF,
    obterBandeiraVigente,
} from "../service-new";
import { BandeiraTarifaria, UF } from "../types/enums";
import { BandeiraHistorico } from "../types/interfaces";

describe("ANEELTariffService - Pure Functions", () => {
    describe("calcularTarifaEfetiva", () => {
        it("deve calcular tarifa com bandeira verde (sem adicional)", () => {
            const result = calcularTarifaEfetiva(0.72, BandeiraTarifaria.VERDE);
            expect(result).toBe(0.72);
        });

        it("deve calcular tarifa com bandeira amarela (+0.02)", () => {
            const result = calcularTarifaEfetiva(0.72, BandeiraTarifaria.AMARELA);
            expect(result).toBe(0.74);
        });

        it("deve calcular tarifa com bandeira vermelha 1 (+0.04)", () => {
            const result = calcularTarifaEfetiva(0.72, BandeiraTarifaria.VERMELHA_1);
            expect(result).toBe(0.76);
        });

        it("deve calcular tarifa com bandeira vermelha 2 (+0.06)", () => {
            const result = calcularTarifaEfetiva(0.72, BandeiraTarifaria.VERMELHA_2);
            expect(result).toBe(0.78);
        });

        it("deve arredondar para 4 casas decimais", () => {
            const result = calcularTarifaEfetiva(0.123456, BandeiraTarifaria.AMARELA);
            expect(result).toBe(0.1435); // 0.123456 + 0.02 = 0.143456 → 0.1435
        });
    });

    describe("calcularCustoMensal", () => {
        it("deve calcular custo mensal corretamente", () => {
            const result = calcularCustoMensal(500, 0.72);
            expect(result).toBe(360.0);
        });

        it("deve arredondar para 2 casas decimais", () => {
            const result = calcularCustoMensal(333, 0.72);
            expect(result).toBe(239.76);
        });

        it("deve retornar 0 para consumo zero", () => {
            const result = calcularCustoMensal(0, 0.72);
            expect(result).toBe(0);
        });
    });

    describe("calcularBreakdownCustos", () => {
        it("deve decompor custos em energia, distribuição e bandeira", () => {
            const result = calcularBreakdownCustos(
                500, // consumo mensal
                0.42, // TUSD
                0.30, // TE
                0.02  // bandeira amarela
            );

            expect(result.energia).toBe(1800.0); // 500 * 0.30 * 12
            expect(result.distribuicao).toBe(2520.0); // 500 * 0.42 * 12
            expect(result.bandeira).toBe(120.0); // 500 * 0.02 * 12
        });

        it("deve retornar zeros para consumo zero", () => {
            const result = calcularBreakdownCustos(0, 0.42, 0.30, 0.02);

            expect(result.energia).toBe(0);
            expect(result.distribuicao).toBe(0);
            expect(result.bandeira).toBe(0);
        });

        it("deve calcular breakdown com bandeira verde (zero)", () => {
            const result = calcularBreakdownCustos(500, 0.42, 0.30, 0);

            expect(result.bandeira).toBe(0);
            expect(result.energia).toBe(1800.0);
        });
    });

    describe("calcularPaybackSimples", () => {
        it("deve calcular payback em anos", () => {
            const result = calcularPaybackSimples(30000, 5000);
            expect(result).toBe(6.0); // 30000 / 5000 = 6 anos
        });

        it("deve retornar Infinity para economia zero", () => {
            const result = calcularPaybackSimples(30000, 0);
            expect(result).toBe(Infinity);
        });

        it("deve retornar Infinity para economia negativa", () => {
            const result = calcularPaybackSimples(30000, -1000);
            expect(result).toBe(Infinity);
        });

        it("deve arredondar para 2 casas decimais", () => {
            const result = calcularPaybackSimples(30000, 4321);
            expect(result).toBe(6.94);
        });
    });

    describe("calcularROI", () => {
        it("deve calcular ROI positivo", () => {
            const result = calcularROI(30000, 60000);
            expect(result).toBe(100.0); // (60000 - 30000) / 30000 * 100 = 100%
        });

        it("deve calcular ROI negativo", () => {
            const result = calcularROI(30000, 15000);
            expect(result).toBe(-50.0); // (15000 - 30000) / 30000 * 100 = -50%
        });

        it("deve retornar 0 para investimento zero", () => {
            const result = calcularROI(0, 10000);
            expect(result).toBe(0);
        });

        it("deve arredondar para 2 casas decimais", () => {
            const result = calcularROI(30000, 45321);
            expect(result).toBe(51.07);
        });
    });

    describe("normalizeUF", () => {
        it("deve normalizar UF lowercase para uppercase", () => {
            expect(normalizeUF("sp")).toBe(UF.SP);
            expect(normalizeUF("rj")).toBe(UF.RJ);
        });

        it("deve manter UF uppercase", () => {
            expect(normalizeUF("MG")).toBe(UF.MG);
        });

        it("deve remover espaços", () => {
            expect(normalizeUF(" PR ")).toBe(UF.PR);
        });

        it("deve lançar erro para UF inválida", () => {
            expect(() => normalizeUF("XX")).toThrow("UF inválida: XX");
            expect(() => normalizeUF("123")).toThrow("UF inválida: 123");
        });
    });

    describe("obterBandeiraVigente", () => {
        const historico: BandeiraHistorico[] = [
            {
                id: "1",
                mes: 1,
                ano: 2024,
                bandeira: BandeiraTarifaria.VERDE,
                valor_adicional: 0,
                regiao: "nacional",
                fonte: "ANEEL",
                created_at: new Date("2024-01-01"),
            },
            {
                id: "2",
                mes: 10,
                ano: 2024,
                bandeira: BandeiraTarifaria.VERMELHA_1,
                valor_adicional: 0.04,
                regiao: "nacional",
                fonte: "ANEEL",
                created_at: new Date("2024-10-01"),
            },
        ];

        it("deve retornar bandeira do mês correto", () => {
            const result = obterBandeiraVigente(historico, new Date("2024-10-15"));
            expect(result).not.toBeNull();
            expect(result!.bandeira).toBe(BandeiraTarifaria.VERMELHA_1);
            expect(result!.mes).toBe(10);
        });

        it("deve retornar null se bandeira não encontrada", () => {
            const result = obterBandeiraVigente(historico, new Date("2024-12-01"));
            expect(result).toBeNull();
        });

        it("deve buscar bandeira para janeiro", () => {
            const result = obterBandeiraVigente(historico, new Date("2024-01-15"));
            expect(result).not.toBeNull();
            expect(result!.bandeira).toBe(BandeiraTarifaria.VERDE);
        });
    });
});

describe("ANEELTariffService - Integration Scenarios", () => {
    describe("Cálculo completo de economia solar", () => {
        it("deve calcular economia com sistema offset 100%", () => {
            const consumo_mensal = 500; // kWh
            const geracao_mensal = 500; // kWh
            const tarifa_efetiva = 0.74; // R$/kWh (bandeira amarela)

            const custo_atual_mensal = calcularCustoMensal(consumo_mensal, tarifa_efetiva);
            const custo_novo_mensal = calcularCustoMensal(0, tarifa_efetiva); // consumo residual = 0

            const economia_mensal = custo_atual_mensal - custo_novo_mensal;
            const economia_anual = economia_mensal * 12;

            expect(economia_anual).toBe(4440.0); // 500 * 0.74 * 12 = 4440

            const payback = calcularPaybackSimples(30000, economia_anual);
            expect(payback).toBe(6.76); // 30000 / 4440
        });

        it("deve calcular economia com sistema offset 70%", () => {
            const consumo_mensal = 500;
            const geracao_mensal = 350; // 70% do consumo
            const tarifa_efetiva = 0.74;

            const custo_atual_mensal = calcularCustoMensal(consumo_mensal, tarifa_efetiva);
            const consumo_residual = consumo_mensal - geracao_mensal;
            const custo_novo_mensal = calcularCustoMensal(consumo_residual, tarifa_efetiva);

            const economia_mensal = custo_atual_mensal - custo_novo_mensal;
            const economia_anual = economia_mensal * 12;

            expect(economia_anual).toBe(3108.0); // 350 * 0.74 * 12
        });
    });

    describe("Breakdown de custos realista", () => {
        it("deve calcular breakdown para tarifa CPFL Paulista", () => {
            const breakdown = calcularBreakdownCustos(
                500,  // consumo mensal
                0.42, // TUSD
                0.30, // TE
                0.02  // bandeira amarela
            );

            const total = breakdown.energia + breakdown.distribuicao + breakdown.bandeira;
            expect(total).toBe(4440.0); // 500 * (0.42 + 0.30 + 0.02) * 12 = 4440

            // Percentuais
            const pct_energia = (breakdown.energia / total) * 100;
            const pct_dist = (breakdown.distribuicao / total) * 100;
            const pct_bandeira = (breakdown.bandeira / total) * 100;

            expect(pct_energia).toBeCloseTo(40.54, 1); // ~40%
            expect(pct_dist).toBeCloseTo(56.76, 1);    // ~57%
            expect(pct_bandeira).toBeCloseTo(2.70, 1); // ~3%
        });
    });
});
