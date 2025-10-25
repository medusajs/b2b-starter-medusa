/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KitsRecomendadosCard } from '@/components/solar/kits-recomendados-card';
import type { KitRecomendado } from '@/types/solar-calculator';

describe('KitsRecomendadosCard', () => {
    const mockKit: KitRecomendado = {
        kit_id: 'kit-001',
        nome: 'Kit Solar 5kWp Premium',
        potencia_kwp: 5.4,
        match_score: 92,
        match_reasons: [
            'Potência ideal para seu consumo',
            'Melhor custo-benefício',
            'Componentes de alta eficiência'
        ],
        preco_brl: 25000,
        componentes: {
            paineis: [
                {
                    marca: 'Canadian Solar',
                    modelo: 'HiKu6',
                    potencia_w: 450,
                    quantidade: 12,
                    eficiencia: 21.5
                }
            ],
            inversores: [
                {
                    marca: 'Growatt',
                    modelo: 'MIN 5000TL-X',
                    potencia_kw: 5,
                    quantidade: 1,
                    mppt: 2
                }
            ],
            estrutura: {
                tipo: 'Solo Fibrocimento',
                material: 'Alumínio'
            }
        },
        disponibilidade: {
            em_estoque: true,
            centro_distribuicao: 'São Paulo - SP',
            prazo_entrega_dias: 5
        }
    };

    const mockKitWithBatteries: KitRecomendado = {
        ...mockKit,
        kit_id: 'kit-002',
        nome: 'Kit Solar 5kWp Off-Grid',
        componentes: {
            ...mockKit.componentes,
            baterias: [
                {
                    marca: 'BYD',
                    modelo: 'Battery-Box Premium',
                    capacidade_kwh: 10.24,
                    quantidade: 1
                }
            ]
        }
    };

    describe('Rendering - Empty State', () => {
        it('should render empty state when no kits available', () => {
            render(<KitsRecomendadosCard kits={[]} />);

            expect(screen.getByText('📦')).toBeInTheDocument();
            expect(screen.getByText('Kits Recomendados')).toBeInTheDocument();
            expect(screen.getByText(/Nenhum kit disponível/)).toBeInTheDocument();
            expect(screen.getByText(/Entre em contato para cotação personalizada/)).toBeInTheDocument();
        });
    });

    describe('Rendering - With Kits', () => {
        it('should render component with kits count', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText('📦')).toBeInTheDocument();
            expect(screen.getByText(/Kits Recomendados \(1\)/)).toBeInTheDocument();
        });

        it('should render kit name and power', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText('Kit Solar 5kWp Premium')).toBeInTheDocument();
            expect(screen.getByText(/5\.40 kWp/)).toBeInTheDocument();
        });

        it('should render kit price formatted as BRL', () => {
            const { container } = render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(container.textContent).toContain('R$');
            expect(container.textContent).toContain('25.000,00');
        });

        it('should render multiple kits', () => {
            render(<KitsRecomendadosCard kits={[mockKit, mockKitWithBatteries]} />);

            expect(screen.getByText(/Kits Recomendados \(2\)/)).toBeInTheDocument();
            expect(screen.getByText('Kit Solar 5kWp Premium')).toBeInTheDocument();
            expect(screen.getByText('Kit Solar 5kWp Off-Grid')).toBeInTheDocument();
        });
    });

    describe('Ranking Display', () => {
        it('should display ranking number', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText('#1')).toBeInTheDocument();
        });

        it('should display correct ranking for multiple kits', () => {
            render(<KitsRecomendadosCard kits={[mockKit, mockKitWithBatteries]} />);

            expect(screen.getByText('#1')).toBeInTheDocument();
            expect(screen.getByText('#2')).toBeInTheDocument();
        });
    });

    describe('Match Score Display', () => {
        it('should display match score and label for excellent score (>= 90)', () => {
            const { container } = render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(container.textContent).toContain('★');
            expect(screen.getByText('92')).toBeInTheDocument();
            expect(screen.getByText('(Excelente)')).toBeInTheDocument();
        });

        it('should display "Bom" label for good score (70-89)', () => {
            const goodKit = { ...mockKit, match_score: 85 };
            render(<KitsRecomendadosCard kits={[goodKit]} />);

            expect(screen.getByText('85')).toBeInTheDocument();
            expect(screen.getByText('(Bom)')).toBeInTheDocument();
        });

        it('should display "Aceitável" label for acceptable score (< 70)', () => {
            const acceptableKit = { ...mockKit, match_score: 65 };
            render(<KitsRecomendadosCard kits={[acceptableKit]} />);

            expect(screen.getByText('65')).toBeInTheDocument();
            expect(screen.getByText('(Aceitável)')).toBeInTheDocument();
        });
    });

    describe('Availability Display', () => {
        it('should display "Em estoque" badge when available', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText(/✓ Em estoque/)).toBeInTheDocument();
        });

        it('should not display "Em estoque" badge when not available', () => {
            const outOfStockKit = {
                ...mockKit,
                disponibilidade: { ...mockKit.disponibilidade, em_estoque: false }
            };
            render(<KitsRecomendadosCard kits={[outOfStockKit]} />);

            expect(screen.queryByText(/✓ Em estoque/)).not.toBeInTheDocument();
        });

        it('should display distribution center', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText(/📍 São Paulo - SP/)).toBeInTheDocument();
        });

        it('should display delivery time', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText(/⏱️ Entrega em 5 dias úteis/)).toBeInTheDocument();
        });

        it('should not display delivery time when not provided', () => {
            const noDeliveryKit = {
                ...mockKit,
                disponibilidade: { ...mockKit.disponibilidade, prazo_entrega_dias: undefined }
            };
            render(<KitsRecomendadosCard kits={[noDeliveryKit]} />);

            expect(screen.queryByText(/⏱️ Entrega em/)).not.toBeInTheDocument();
        });
    });

    describe('Components Expansion', () => {
        it('should not show components initially', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.queryByText(/☀️ Painéis Solares/)).not.toBeInTheDocument();
        });

        it('should expand components when clicking button', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/☀️ Painéis Solares/)).toBeInTheDocument();
            expect(screen.getByText(/🔌 Inversor\(es\)/)).toBeInTheDocument();
        });

        it('should collapse components when clicking button again', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');

            fireEvent.click(expandButton);
            expect(screen.getByText(/☀️ Painéis Solares/)).toBeInTheDocument();

            fireEvent.click(expandButton);
            expect(screen.queryByText(/☀️ Painéis Solares/)).not.toBeInTheDocument();
        });

        it('should display panel information when expanded', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/12x Canadian Solar HiKu6 \(450W\)/)).toBeInTheDocument();
            expect(screen.getByText(/21\.5% eficiência/)).toBeInTheDocument();
        });

        it('should display inverter information when expanded', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/1x Growatt MIN 5000TL-X \(5kW\)/)).toBeInTheDocument();
            expect(screen.getByText(/2 MPPT/)).toBeInTheDocument();
        });

        it('should display structure information when expanded', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/🏗️ Estrutura/)).toBeInTheDocument();
            expect(screen.getByText(/Solo Fibrocimento \(Alumínio\)/)).toBeInTheDocument();
        });

        it('should display batteries when present', () => {
            render(<KitsRecomendadosCard kits={[mockKitWithBatteries]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/🔋 Baterias/)).toBeInTheDocument();
            expect(screen.getByText(/1x BYD Battery-Box Premium \(10\.24kWh\)/)).toBeInTheDocument();
        });

        it('should not display batteries section when not present', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.queryByText(/🔋 Baterias/)).not.toBeInTheDocument();
        });

        it('should display match reasons when expanded', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.getByText(/Por que este kit\?/)).toBeInTheDocument();
            expect(screen.getByText(/✓ Potência ideal para seu consumo/)).toBeInTheDocument();
            expect(screen.getByText(/✓ Melhor custo-benefício/)).toBeInTheDocument();
            expect(screen.getByText(/✓ Componentes de alta eficiência/)).toBeInTheDocument();
        });
    });

    describe('Kit Selection', () => {
        it('should call onKitSelect when clicking "Solicitar Cotação"', () => {
            const onKitSelect = jest.fn();
            render(<KitsRecomendadosCard kits={[mockKit]} onKitSelect={onKitSelect} />);

            const button = screen.getByText('Solicitar Cotação');
            fireEvent.click(button);

            expect(onKitSelect).toHaveBeenCalledWith('kit-001');
        });

        it('should call onKitSelect with correct kit_id for second kit', () => {
            const onKitSelect = jest.fn();
            render(<KitsRecomendadosCard kits={[mockKit, mockKitWithBatteries]} onKitSelect={onKitSelect} />);

            const buttons = screen.getAllByText('Solicitar Cotação');
            fireEvent.click(buttons[1]);

            expect(onKitSelect).toHaveBeenCalledWith('kit-002');
        });

        it('should not crash when onKitSelect is undefined', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            const button = screen.getByText('Solicitar Cotação');

            expect(() => fireEvent.click(button)).not.toThrow();
        });
    });

    describe('Footer Information', () => {
        it('should display ranking observation', () => {
            render(<KitsRecomendadosCard kits={[mockKit]} />);

            expect(screen.getByText(/Os kits são ranqueados por compatibilidade/)).toBeInTheDocument();
            expect(screen.getByText(/Preços podem variar/)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle kit without optional fields', () => {
            const minimalKit: KitRecomendado = {
                kit_id: 'kit-minimal',
                nome: 'Kit Básico',
                potencia_kwp: 3.0,
                match_score: 70,
                preco_brl: 15000,
                componentes: {
                    paineis: [{ marca: 'Genérico', potencia_w: 250, quantidade: 12 }],
                    inversores: [{ marca: 'Genérico', potencia_kw: 3, quantidade: 1 }]
                },
                disponibilidade: {
                    em_estoque: false
                }
            };

            render(<KitsRecomendadosCard kits={[minimalKit]} />);

            expect(screen.getByText('Kit Básico')).toBeInTheDocument();
            expect(screen.queryByText(/📍/)).not.toBeInTheDocument();
            expect(screen.queryByText(/⏱️/)).not.toBeInTheDocument();
        });

        it('should handle very large kit list', () => {
            const manyKits = Array.from({ length: 10 }, (_, i) => ({
                ...mockKit,
                kit_id: `kit-${i}`,
                nome: `Kit ${i + 1}`
            }));

            render(<KitsRecomendadosCard kits={manyKits} />);

            expect(screen.getByText(/Kits Recomendados \(10\)/)).toBeInTheDocument();
            expect(screen.getByText('#1')).toBeInTheDocument();
            expect(screen.getByText('#10')).toBeInTheDocument();
        });

        it('should format large prices correctly', () => {
            const expensiveKit = { ...mockKit, preco_brl: 125500.50 };
            const { container } = render(<KitsRecomendadosCard kits={[expensiveKit]} />);

            expect(container.textContent).toContain('125.500,50');
        });

        it('should handle kit with no match_reasons', () => {
            const noReasonsKit = { ...mockKit, match_reasons: undefined };
            render(<KitsRecomendadosCard kits={[noReasonsKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.queryByText(/Por que este kit\?/)).not.toBeInTheDocument();
        });

        it('should handle kit with empty match_reasons array', () => {
            const emptyReasonsKit = { ...mockKit, match_reasons: [] };
            render(<KitsRecomendadosCard kits={[emptyReasonsKit]} />);

            const expandButton = screen.getByText('📋 Componentes do Kit');
            fireEvent.click(expandButton);

            expect(screen.queryByText(/Por que este kit\?/)).not.toBeInTheDocument();
        });
    });
});
