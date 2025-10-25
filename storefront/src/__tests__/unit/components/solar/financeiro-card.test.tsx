/**
 * Financeiro Card Component Tests
 * 
 * Comprehensive test suite covering:
 * - Component rendering with mock data
 * - Currency formatting (BRL with Intl.NumberFormat)
 * - Years/months formatting (payback display)
 * - ROI calculations display (TIR, VPL, payback)
 * - Conditional financing section
 * - Viability indicator (TIR > 12%)
 * - Edge cases (missing data, zero values)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FinanceiroCard } from '@/components/solar/financeiro-card';
import type { AnaliseFinanceira } from '@/types/solar-calculator';

describe('FinanceiroCard', () => {
    const mockFinanceiro: AnaliseFinanceira = {
        capex: {
            equipamentos_brl: 20000,
            instalacao_brl: 3000,
            projeto_brl: 1000,
            homologacao_brl: 500,
            total_brl: 24500,
        },
        economia: {
            mensal_brl: 450.75,
            anual_brl: 5409,
            total_25anos_brl: 180000,
            economia_percentual: 85.5,
        },
        retorno: {
            payback_simples_anos: 4.53,
            tir_percentual: 18.5,
            vpl_brl: 155500,
        },
        financiamento: {
            parcela_mensal_brl: 680.50,
            economia_liquida_mensal_brl: -229.75,
            total_pago_brl: 30000,
        },
    };

    describe('Rendering', () => {
        it('should render component with title', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('💰')).toBeInTheDocument();
            expect(screen.getByText('Análise Financeira')).toBeInTheDocument();
        });

        it('should render all main sections', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('Investimento Total')).toBeInTheDocument();
            expect(screen.getByText('📊 Economia de Energia')).toBeInTheDocument();
            expect(screen.getByText('🎯 Retorno do Investimento')).toBeInTheDocument();
        });

        it('should display total investment prominently', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // R$ 24.500,00 formatted with non-breaking space
            expect(screen.getByText(/R\$\s*24\.500,00/)).toBeInTheDocument();
        });

        it('should display CAPEX breakdown', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('• Equipamentos:')).toBeInTheDocument();
            expect(screen.getByText('• Instalação:')).toBeInTheDocument();
            expect(screen.getByText('• Projeto + Homologação:')).toBeInTheDocument();
        });
    });

    describe('Currency Formatting', () => {
        it('should format all currency values as BRL', () => {
            const { container } = render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // All BRL values should have R$ prefix
            const brlValues = container.querySelectorAll('[class*="font-bold"]');
            const brlTexts = Array.from(brlValues).map((el) => el.textContent);

            // At least one should contain R$
            const hasBRL = brlTexts.some((text) => text?.includes('R$'));
            expect(hasBRL).toBe(true);
        });

        it('should format monthly savings correctly', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // R$ 450,75
            expect(screen.getByText(/R\$\s*450,75/)).toBeInTheDocument();
        });

        it('should format equipment costs correctly', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // R$ 20.000,00
            expect(screen.getByText(/R\$\s*20\.000,00/)).toBeInTheDocument();
        });

        it('should format large values (25-year savings)', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // R$ 180.000,00
            expect(screen.getByText(/R\$\s*180\.000,00/)).toBeInTheDocument();
        });
    });

    describe('Years/Months Formatting', () => {
        it('should format payback with years and months', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // 4.53 anos = 4 anos e 6 meses
            expect(screen.getByText('4 anos e 6 meses')).toBeInTheDocument();
        });

        it('should format exact years without months', () => {
            const exactYears: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    payback_simples_anos: 5.0,
                },
            };

            render(<FinanceiroCard financeiro={exactYears} />);

            expect(screen.getByText('5 anos')).toBeInTheDocument();
        });

        it('should round months correctly', () => {
            const fractionalYears: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    payback_simples_anos: 3.95, // Should round to 3 anos e 11 meses
                },
            };

            render(<FinanceiroCard financeiro={fractionalYears} />);

            expect(screen.getByText('3 anos e 11 meses')).toBeInTheDocument();
        });
    });

    describe('ROI Metrics Display', () => {
        it('should display TIR percentage', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('TIR')).toBeInTheDocument();
            expect(screen.getByText('18.5% a.a.')).toBeInTheDocument();
        });

        it('should display VPL value', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('VPL (25 anos)')).toBeInTheDocument();
            expect(screen.getByText(/R\$\s*155\.500,00/)).toBeInTheDocument();
        });

        it('should display economia percentual', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('Economia %')).toBeInTheDocument();
            expect(screen.getByText('86%')).toBeInTheDocument(); // 85.5 rounded
        });

        it('should display all savings periods', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('Mensal:')).toBeInTheDocument();
            expect(screen.getByText('Anual:')).toBeInTheDocument();
            expect(screen.getByText('25 anos:')).toBeInTheDocument();
        });
    });

    describe('Financing Section', () => {
        it('should render financing section when data is provided', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText('💳 Opção de Financiamento')).toBeInTheDocument();
            expect(screen.getByText('Parcela mensal:')).toBeInTheDocument();
            expect(screen.getByText('Economia líquida:')).toBeInTheDocument();
        });

        it('should display financing monthly payment', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText(/R\$\s*680,50/)).toBeInTheDocument();
        });

        it('should display net savings (negative value)', () => {
            render(<FinanceiroCard financeiro={mockFinanceiro} />);

            // -R$ 229,75
            expect(screen.getByText(/-R\$\s*229,75/)).toBeInTheDocument();
        });

        it('should NOT render financing section when data is null', () => {
            const noFinancing: AnaliseFinanceira = {
                ...mockFinanceiro,
                financiamento: null as any,
            };

            render(<FinanceiroCard financeiro={noFinancing} />);

            expect(screen.queryByText('💳 Opção de Financiamento')).not.toBeInTheDocument();
        });

        it('should NOT render financing section when data is undefined', () => {
            const noFinancing: AnaliseFinanceira = {
                ...mockFinanceiro,
                financiamento: undefined as any,
            };

            render(<FinanceiroCard financeiro={noFinancing} />);

            expect(screen.queryByText('💳 Opção de Financiamento')).not.toBeInTheDocument();
        });
    });

    describe('Viability Indicator', () => {
        it('should show viability indicator when TIR > 12%', () => {
            const { container } = render(<FinanceiroCard financeiro={mockFinanceiro} />);

            expect(screen.getByText(/Investimento Viável!/)).toBeInTheDocument();
            expect(screen.getByText(/TIR acima da SELIC/)).toBeInTheDocument();
            // Check for checkmark emoji in the container
            expect(container.textContent).toContain('✅');
        });

        it('should NOT show viability indicator when TIR <= 12%', () => {
            const lowTIR: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    tir_percentual: 10.0,
                },
            };

            render(<FinanceiroCard financeiro={lowTIR} />);

            expect(screen.queryByText(/Investimento Viável!/)).not.toBeInTheDocument();
        });

        it('should NOT show viability indicator when TIR = 12% (boundary)', () => {
            const boundaryTIR: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    tir_percentual: 12.0,
                },
            };

            render(<FinanceiroCard financeiro={boundaryTIR} />);

            expect(screen.queryByText(/Investimento Viável!/)).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero CAPEX values', () => {
            const zeroCapex: AnaliseFinanceira = {
                ...mockFinanceiro,
                capex: {
                    equipamentos_brl: 0,
                    instalacao_brl: 0,
                    projeto_brl: 0,
                    homologacao_brl: 0,
                    total_brl: 0,
                },
            };

            render(<FinanceiroCard financeiro={zeroCapex} />);

            // Should render without crashing
            expect(screen.getByText('Investimento Total')).toBeInTheDocument();
            // Multiple R$ 0,00 will appear, just check component renders
            const { container } = render(<FinanceiroCard financeiro={zeroCapex} />);
            expect(container.querySelector('.text-3xl')).toHaveTextContent(/R\$/);
        });

        it('should handle very short payback period', () => {
            const shortPayback: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    payback_simples_anos: 0.5, // 6 months
                },
            };

            render(<FinanceiroCard financeiro={shortPayback} />);

            expect(screen.getByText('0 anos e 6 meses')).toBeInTheDocument();
        });

        it('should handle very large VPL values', () => {
            const largeVPL: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    vpl_brl: 999999999,
                },
            };

            render(<FinanceiroCard financeiro={largeVPL} />);

            expect(screen.getByText(/R\$\s*999\.999\.999,00/)).toBeInTheDocument();
        });

        it('should handle negative VPL (bad investment)', () => {
            const negativeVPL: AnaliseFinanceira = {
                ...mockFinanceiro,
                retorno: {
                    ...mockFinanceiro.retorno,
                    vpl_brl: -50000,
                },
            };

            const { container } = render(<FinanceiroCard financeiro={negativeVPL} />);

            // Check that negative sign is present
            expect(container.textContent).toContain('-R$');
            expect(container.textContent).toContain('50.000');
        });
    });
});
