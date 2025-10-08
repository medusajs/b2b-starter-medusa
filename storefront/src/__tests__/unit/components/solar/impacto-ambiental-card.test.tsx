/**
 * Impacto Ambiental Card Component Tests
 * 
 * Comprehensive test suite covering:
 * - Component rendering
 * - Environmental metrics display (CO2, trees, cars)
 * - Number formatting
 * - Inspirational messaging
 * - Edge cases (zero impact, very large values)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImpactoAmbientalCard } from '@/components/solar/impacto-ambiental-card';
import type { ImpactoAmbiental } from '@/types/solar-calculator';

describe('ImpactoAmbientalCard', () => {
    const mockImpacto: ImpactoAmbiental = {
        co2_evitado_kg: 125500,
        co2_evitado_toneladas: 125.5,
        arvores_equivalentes: 850.3,
        carros_equivalentes: 2.5,
    };

    describe('Rendering', () => {
        it('should render component with title', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText('🌍')).toBeInTheDocument();
            expect(screen.getByText(/Impacto Ambiental/)).toBeInTheDocument();
            expect(screen.getByText(/25 anos/)).toBeInTheDocument();
        });

        it('should display subtitle', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText(/planeta mais sustentável/)).toBeInTheDocument();
            expect(screen.getByText(/energia limpa/)).toBeInTheDocument();
        });

        it('should display all three environmental metrics', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText('💨')).toBeInTheDocument();
            expect(screen.getByText('🌳')).toBeInTheDocument();
            expect(screen.getByText('🚗')).toBeInTheDocument();
        });
    });

    describe('CO2 Metric', () => {
        it('should display CO2 avoided in tonnes', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText('125.5')).toBeInTheDocument();
            expect(screen.getByText(/toneladas de CO₂ evitadas/)).toBeInTheDocument();
        });

        it('should format CO2 with 1 decimal place', () => {
            const preciseImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                co2_evitado_toneladas: 99.99,
            };

            render(<ImpactoAmbientalCard impacto={preciseImpacto} />);

            expect(screen.getByText('100.0')).toBeInTheDocument();
        });

        it('should handle zero CO2', () => {
            const zeroImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                co2_evitado_toneladas: 0,
            };

            render(<ImpactoAmbientalCard impacto={zeroImpacto} />);

            expect(screen.getByText('0.0')).toBeInTheDocument();
        });

        it('should handle very large CO2 values', () => {
            const largeImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                co2_evitado_toneladas: 9999.7,
            };

            render(<ImpactoAmbientalCard impacto={largeImpacto} />);

            expect(screen.getByText('9999.7')).toBeInTheDocument();
        });
    });

    describe('Trees Metric', () => {
        it('should display trees equivalent rounded', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            // 850.3 -> 850
            expect(screen.getByText('850')).toBeInTheDocument();
            expect(screen.getByText(/árvores plantadas equivalente/)).toBeInTheDocument();
        });

        it('should round trees to nearest integer', () => {
            const preciseImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                arvores_equivalentes: 1234.6,
            };

            render(<ImpactoAmbientalCard impacto={preciseImpacto} />);

            expect(screen.getByText('1235')).toBeInTheDocument();
        });

        it('should handle zero trees', () => {
            const zeroImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                arvores_equivalentes: 0,
            };

            render(<ImpactoAmbientalCard impacto={zeroImpacto} />);

            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    describe('Cars Metric', () => {
        it('should display cars equivalent', () => {
            render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText('2.5')).toBeInTheDocument();
            expect(screen.getByText(/carros fora de circulação equivalente/)).toBeInTheDocument();
        });

        it('should format cars with 1 decimal place', () => {
            const preciseImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                carros_equivalentes: 15.678,
            };

            render(<ImpactoAmbientalCard impacto={preciseImpacto} />);

            expect(screen.getByText('15.7')).toBeInTheDocument();
        });

        it('should handle fractional cars', () => {
            const fractionalImpacto: ImpactoAmbiental = {
                ...mockImpacto,
                carros_equivalentes: 0.3,
            };

            render(<ImpactoAmbientalCard impacto={fractionalImpacto} />);

            expect(screen.getByText('0.3')).toBeInTheDocument();
        });
    });

    describe('Inspirational Message', () => {
        it('should display motivational message', () => {
            const { container } = render(<ImpactoAmbientalCard impacto={mockImpacto} />);

            expect(screen.getByText(/Faça a diferença!/)).toBeInTheDocument();
            expect(screen.getByText(/redução de emissões de gases de efeito estufa/)).toBeInTheDocument();
            expect(container.textContent).toContain('✨');
        });
    });

    describe('Edge Cases', () => {
        it('should handle all zero values', () => {
            const allZero: ImpactoAmbiental = {
                co2_evitado_kg: 0,
                co2_evitado_toneladas: 0,
                arvores_equivalentes: 0,
                carros_equivalentes: 0,
            };

            expect(() => {
                render(<ImpactoAmbientalCard impacto={allZero} />);
            }).not.toThrow();
        });

        it('should handle very large values', () => {
            const massiveImpact: ImpactoAmbiental = {
                co2_evitado_kg: 50000000,
                co2_evitado_toneladas: 50000,
                arvores_equivalentes: 250000,
                carros_equivalentes: 100.5,
            };

            render(<ImpactoAmbientalCard impacto={massiveImpact} />);

            expect(screen.getByText('50000.0')).toBeInTheDocument();
            expect(screen.getByText('250000')).toBeInTheDocument();
            expect(screen.getByText('100.5')).toBeInTheDocument();
        });

        it('should handle small fractional values', () => {
            const tinyImpact: ImpactoAmbiental = {
                co2_evitado_kg: 100,
                co2_evitado_toneladas: 0.1,
                arvores_equivalentes: 5.2,
                carros_equivalentes: 0.02,
            };

            render(<ImpactoAmbientalCard impacto={tinyImpact} />);

            expect(screen.getByText('0.1')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('0.0')).toBeInTheDocument();
        });
    });
});

