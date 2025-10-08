/**
 * Dimensionamento Card Component Tests
 * 
 * Comprehensive test suite covering:
 * - Component rendering with technical specifications
 * - Power display (kWp)
 * - Equipment counts (panels, inverters)
 * - Area calculation display
 * - Performance ratio display
 * - Energy generation estimates (monthly/annual)
 * - Oversizing indicator
 * - Edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DimensionamentoCard } from '@/components/solar/dimensionamento-card';
import type { Dimensionamento } from '@/types/solar-calculator';

describe('DimensionamentoCard', () => {
    const mockDimensionamento: Dimensionamento = {
        kwp_necessario: 5.0,
        kwp_proposto: 5.2,
        numero_paineis: 10,
        potencia_inversor_kw: 5.0,
        area_necessaria_m2: 20.5,
        geracao_mensal_kwh: [650, 650, 650, 650, 650, 650, 650, 650, 650, 650, 650, 650],
        geracao_anual_kwh: 7800,
        performance_ratio: 0.80,
        oversizing_ratio: 1.30,
    };

    describe('Rendering', () => {
        it('should render component with title', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('⚡')).toBeInTheDocument();
            expect(screen.getByText('Dimensionamento Técnico')).toBeInTheDocument();
        });

        it('should display system power prominently', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('Potência do Sistema')).toBeInTheDocument();
            expect(screen.getByText('5.20 kWp')).toBeInTheDocument();
        });

        it('should display all specification sections', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('Painéis Solares')).toBeInTheDocument();
            expect(screen.getByText('Inversor')).toBeInTheDocument();
            expect(screen.getByText('Área Necessária')).toBeInTheDocument();
            expect(screen.getByText('Performance Ratio')).toBeInTheDocument();
        });
    });

    describe('Equipment Display', () => {
        it('should display number of panels', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('10 unidades')).toBeInTheDocument();
        });

        it('should display inverter power', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('5.0 kW')).toBeInTheDocument();
        });

        it('should display required area', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('20.5 m²')).toBeInTheDocument();
        });

        it('should display performance ratio as percentage', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('80%')).toBeInTheDocument();
        });
    });

    describe('Energy Generation', () => {
        it('should display generation section', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('📈 Geração Estimada')).toBeInTheDocument();
        });

        it('should display monthly generation (annual / 12)', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            // 7800 / 12 = 650 kWh
            expect(screen.getByText('Mensal (média)')).toBeInTheDocument();
            expect(screen.getByText('650 kWh')).toBeInTheDocument();
        });

        it('should display annual generation', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText('Anual')).toBeInTheDocument();
            expect(screen.getByText('7800 kWh')).toBeInTheDocument();
        });

        it('should calculate monthly average correctly', () => {
            const customGen: Dimensionamento = {
                ...mockDimensionamento,
                geracao_anual_kwh: 9600, // 800/month
            };

            render(<DimensionamentoCard dimensionamento={customGen} />);

            expect(screen.getByText('800 kWh')).toBeInTheDocument();
        });
    });

    describe('Oversizing Indicator', () => {
        it('should show oversizing badge when ratio > 1', () => {
            render(<DimensionamentoCard dimensionamento={mockDimensionamento} />);

            expect(screen.getByText(/Sistema com oversizing/)).toBeInTheDocument();
            expect(screen.getByText(/30%/)).toBeInTheDocument(); // (1.30 - 1) * 100 = 30%
        });

        it('should calculate oversizing percentage correctly', () => {
            const highOversizing: Dimensionamento = {
                ...mockDimensionamento,
                oversizing_ratio: 1.45, // 45% oversizing
            };

            render(<DimensionamentoCard dimensionamento={highOversizing} />);

            expect(screen.getByText(/45%/)).toBeInTheDocument();
        });

        it('should NOT show oversizing badge when ratio = 1', () => {
            const noOversizing: Dimensionamento = {
                ...mockDimensionamento,
                oversizing_ratio: 1.0,
            };

            render(<DimensionamentoCard dimensionamento={noOversizing} />);

            expect(screen.queryByText(/Sistema com oversizing/)).not.toBeInTheDocument();
        });

        it('should NOT show oversizing badge when ratio < 1', () => {
            const undersized: Dimensionamento = {
                ...mockDimensionamento,
                oversizing_ratio: 0.95,
            };

            render(<DimensionamentoCard dimensionamento={undersized} />);

            expect(screen.queryByText(/Sistema com oversizing/)).not.toBeInTheDocument();
        });
    });

    describe('Number Formatting', () => {
        it('should format kWp with 2 decimal places', () => {
            const precisePower: Dimensionamento = {
                ...mockDimensionamento,
                kwp_proposto: 3.456,
            };

            render(<DimensionamentoCard dimensionamento={precisePower} />);

            expect(screen.getByText('3.46 kWp')).toBeInTheDocument();
        });

        it('should format inverter power with 1 decimal place', () => {
            const preciseInverter: Dimensionamento = {
                ...mockDimensionamento,
                potencia_inversor_kw: 4.567,
            };

            render(<DimensionamentoCard dimensionamento={preciseInverter} />);

            expect(screen.getByText('4.6 kW')).toBeInTheDocument();
        });

        it('should format area with 1 decimal place', () => {
            const preciseArea: Dimensionamento = {
                ...mockDimensionamento,
                area_necessaria_m2: 25.789,
            };

            render(<DimensionamentoCard dimensionamento={preciseArea} />);

            expect(screen.getByText('25.8 m²')).toBeInTheDocument();
        });

        it('should format performance ratio as integer percentage', () => {
            const preciseRatio: Dimensionamento = {
                ...mockDimensionamento,
                performance_ratio: 0.8567, // 85.67% -> 86%
            };

            render(<DimensionamentoCard dimensionamento={preciseRatio} />);

            expect(screen.getByText('86%')).toBeInTheDocument();
        });

        it('should round monthly generation to integer', () => {
            const oddGeneration: Dimensionamento = {
                ...mockDimensionamento,
                geracao_anual_kwh: 7777, // 647.75/month -> 648
            };

            render(<DimensionamentoCard dimensionamento={oddGeneration} />);

            expect(screen.getByText('648 kWh')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very small system (< 1 kWp)', () => {
            const tinySystem: Dimensionamento = {
                ...mockDimensionamento,
                kwp_proposto: 0.55,
                numero_paineis: 1,
            };

            render(<DimensionamentoCard dimensionamento={tinySystem} />);

            expect(screen.getByText('0.55 kWp')).toBeInTheDocument();
            expect(screen.getByText('1 unidades')).toBeInTheDocument();
        });

        it('should handle very large system (> 75 kWp)', () => {
            const largeSystem: Dimensionamento = {
                ...mockDimensionamento,
                kwp_proposto: 150.0,
                numero_paineis: 300,
                potencia_inversor_kw: 125.0,
            };

            render(<DimensionamentoCard dimensionamento={largeSystem} />);

            expect(screen.getByText('150.00 kWp')).toBeInTheDocument();
            expect(screen.getByText('300 unidades')).toBeInTheDocument();
            expect(screen.getByText('125.0 kW')).toBeInTheDocument();
        });

        it('should handle zero panels (edge case)', () => {
            const noPanels: Dimensionamento = {
                ...mockDimensionamento,
                numero_paineis: 0,
            };

            render(<DimensionamentoCard dimensionamento={noPanels} />);

            expect(screen.getByText('0 unidades')).toBeInTheDocument();
        });

        it('should handle very high performance ratio', () => {
            const highPR: Dimensionamento = {
                ...mockDimensionamento,
                performance_ratio: 0.95,
            };

            render(<DimensionamentoCard dimensionamento={highPR} />);

            expect(screen.getByText('95%')).toBeInTheDocument();
        });

        it('should handle low performance ratio', () => {
            const lowPR: Dimensionamento = {
                ...mockDimensionamento,
                performance_ratio: 0.60,
            };

            render(<DimensionamentoCard dimensionamento={lowPR} />);

            expect(screen.getByText('60%')).toBeInTheDocument();
        });
    });
});
