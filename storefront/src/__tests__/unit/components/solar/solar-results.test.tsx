/**
 * Solar Results Component Tests
 * 
 * Comprehensive test suite covering:
 * - Component rendering with full calculation output
 * - Display of system specifications
 * - Sub-component integration
 * - Conditional rendering (conformidade alert)
 * - Action handlers (recalculate, kit selection)
 * - Information sections
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SolarResults } from '@/components/solar/solar-results';
import type { SolarCalculationOutput } from '@/types/solar-calculator';

// Mock child components
jest.mock('@/components/solar/dimensionamento-card', () => ({
    DimensionamentoCard: ({ dimensionamento }: any) => (
        <div data-testid="dimensionamento-card">
            Dimensionamento: {dimensionamento.kwp_total}kWp
        </div>
    ),
}));

jest.mock('@/components/solar/financeiro-card', () => ({
    FinanceiroCard: ({ financeiro }: any) => (
        <div data-testid="financeiro-card">
            Investimento: R$ {financeiro.capex.total_brl}
        </div>
    ),
}));

jest.mock('@/components/solar/kits-recomendados-card', () => ({
    KitsRecomendadosCard: ({ kits, onKitSelect }: any) => (
        <div data-testid="kits-card">
            <button onClick={() => onKitSelect?.(kits[0]?.id)}>Select Kit</button>
        </div>
    ),
}));

jest.mock('@/components/solar/impacto-ambiental-card', () => ({
    ImpactoAmbientalCard: ({ impacto }: any) => (
        <div data-testid="impacto-card">CO2: {impacto.co2_evitado_kg}kg</div>
    ),
}));

jest.mock('@/components/solar/conformidade-card', () => ({
    ConformidadeCard: ({ conformidade }: any) => (
        <div data-testid="conformidade-card">Conforme: {String(conformidade.conforme)}</div>
    ),
}));

describe('SolarResults', () => {
    const mockCalculation: SolarCalculationOutput = {
        dimensionamento: {
            kwp_total: 5.2,
            num_paineis: 10,
            num_inversores: 1,
            geracao_mensal_kwh: 650,
            geracao_anual_kwh: 7800,
            area_necessaria_m2: 20,
        },
        kits_recomendados: [
            {
                id: 'kit-1',
                nome: 'Kit Solar 5.2kWp',
                potencia_kwp: 5.2,
                preco_brl: 24500,
            },
        ],
        financeiro: {
            capex: {
                equipamentos_brl: 20000,
                instalacao_brl: 3000,
                projeto_brl: 1000,
                homologacao_brl: 500,
                total_brl: 24500,
            },
            economia: {
                mensal_brl: 450,
                anual_brl: 5400,
                total_25anos_brl: 180000,
                economia_percentual: 85,
            },
            retorno: {
                payback_simples_anos: 4.5,
                tir_percentual: 18,
                vpl_brl: 155000,
            },
            financiamento: null,
        },
        impacto_ambiental: {
            co2_evitado_kg: 5000,
            arvores_equivalentes: 250,
            carros_equivalentes: 1.2,
        },
        conformidade: {
            conforme: true,
            alertas: [],
            normas_aplicaveis: ['REN 482/2012', 'REN 687/2015'],
        },
        dados_localizacao: {
            estado: 'SP',
            cidade: 'São Paulo',
            hsp: 4.8,
            latitude: -23.5,
            longitude: -46.6,
        },
    } as any;

    describe('Rendering', () => {
        it('should render component with header', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText('☀️ Seu Sistema Solar Fotovoltaico')).toBeInTheDocument();
        });

        it('should display location information', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText(/SP/)).toBeInTheDocument();
            expect(screen.getByText(/4\.8 kWh\/m²\/dia/)).toBeInTheDocument();
        });

        it('should render all child components', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByTestId('dimensionamento-card')).toBeInTheDocument();
            expect(screen.getByTestId('financeiro-card')).toBeInTheDocument();
            expect(screen.getByTestId('kits-card')).toBeInTheDocument();
            expect(screen.getByTestId('impacto-card')).toBeInTheDocument();
        });

        it('should render information section', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText('ℹ️ Informações Importantes')).toBeInTheDocument();
            expect(screen.getByText(/Valores estimados/)).toBeInTheDocument();
            expect(screen.getByText(/Instalação deve ser feita por profissional/)).toBeInTheDocument();
        });
    });

    describe('Conditional Rendering', () => {
        it('should NOT render conformidade card when system is compliant', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.queryByTestId('conformidade-card')).not.toBeInTheDocument();
        });

        it('should render conformidade card when system is NOT compliant', () => {
            const nonCompliant = {
                ...mockCalculation,
                conformidade: {
                    ...mockCalculation.conformidade,
                    conforme: false,
                    alertas: ['Potência acima do limite residencial'],
                },
            };

            render(<SolarResults calculation={nonCompliant} />);

            expect(screen.getByTestId('conformidade-card')).toBeInTheDocument();
        });

        it('should render recalculate button when handler is provided', () => {
            const onRecalculate = jest.fn();

            render(
                <SolarResults
                    calculation={mockCalculation}
                    onRecalculate={onRecalculate}
                />
            );

            expect(screen.getByText('🔄 Recalcular')).toBeInTheDocument();
        });

        it('should NOT render recalculate button when handler is not provided', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.queryByText('🔄 Recalcular')).not.toBeInTheDocument();
        });
    });

    describe('Action Handlers', () => {
        it('should call onRecalculate when button is clicked', () => {
            const onRecalculate = jest.fn();

            render(
                <SolarResults
                    calculation={mockCalculation}
                    onRecalculate={onRecalculate}
                />
            );

            const button = screen.getByText('🔄 Recalcular');
            fireEvent.click(button);

            expect(onRecalculate).toHaveBeenCalledTimes(1);
        });

        it('should pass onKitSelect to KitsRecomendadosCard', () => {
            const onKitSelect = jest.fn();

            render(
                <SolarResults
                    calculation={mockCalculation}
                    onKitSelect={onKitSelect}
                />
            );

            const selectButton = screen.getByText('Select Kit');
            fireEvent.click(selectButton);

            expect(onKitSelect).toHaveBeenCalledWith('kit-1');
        });

        it('should work without optional handlers', () => {
            expect(() => {
                render(<SolarResults calculation={mockCalculation} />);
            }).not.toThrow();
        });
    });

    describe('Data Propagation', () => {
        it('should pass dimensionamento data to DimensionamentoCard', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText('Dimensionamento: 5.2kWp')).toBeInTheDocument();
        });

        it('should pass financeiro data to FinanceiroCard', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText('Investimento: R$ 24500')).toBeInTheDocument();
        });

        it('should pass impacto data to ImpactoAmbientalCard', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText('CO2: 5000kg')).toBeInTheDocument();
        });

        it('should pass kits array to KitsRecomendadosCard', () => {
            render(<SolarResults calculation={mockCalculation} />);

            const kitsCard = screen.getByTestId('kits-card');
            expect(kitsCard).toBeInTheDocument();
        });
    });

    describe('Information Notices', () => {
        it('should display all important notices', () => {
            render(<SolarResults calculation={mockCalculation} />);

            expect(screen.getByText(/média de irradiância solar/)).toBeInTheDocument();
            expect(screen.getByText(/condições climáticas/)).toBeInTheDocument();
            expect(screen.getByText(/Preços sujeitos a alteração/)).toBeInTheDocument();
            expect(screen.getByText(/profissional qualificado/)).toBeInTheDocument();
            expect(screen.getByText(/homologado pela distribuidora/)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle calculation with no kits', () => {
            const noKits = {
                ...mockCalculation,
                kits_recomendados: [],
            };

            expect(() => {
                render(<SolarResults calculation={noKits} />);
            }).not.toThrow();
        });

        it('should handle very high HSP values', () => {
            const highHSP = {
                ...mockCalculation,
                dados_localizacao: {
                    ...mockCalculation.dados_localizacao,
                    hsp: 6.5,
                },
            };

            render(<SolarResults calculation={highHSP} />);

            expect(screen.getByText(/6\.5 kWh\/m²\/dia/)).toBeInTheDocument();
        });

        it('should handle different state codes', () => {
            const differentState = {
                ...mockCalculation,
                dados_localizacao: {
                    ...mockCalculation.dados_localizacao,
                    estado: 'CE',
                    cidade: 'Fortaleza',
                },
            };

            render(<SolarResults calculation={differentState} />);

            expect(screen.getByText(/CE/)).toBeInTheDocument();
        });
    });
});
