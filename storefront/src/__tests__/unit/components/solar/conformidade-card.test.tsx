/**
 * Conformidade Card Component Tests
 * 
 * Comprehensive test suite covering:
 * - Conditional rendering (only shows when issues exist)
 * - Compliance status display
 * - Alerts rendering
 * - Observations rendering
 * - Recommendations display
 * - Visual styling (colors, badges)
 * - Edge cases
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConformidadeCard } from '@/components/solar/conformidade-card';
import type { ConformidadeMMGD } from '@/types/solar-calculator';

describe('ConformidadeCard', () => {
    const mockNonCompliant: ConformidadeMMGD = {
        conforme: false,
        alertas: [
            'Potência acima do limite residencial (75 kWp)',
            'Sistema requer aprovação especial da distribuidora',
        ],
        oversizing_permitido: false,
        potencia_dentro_limite: false,
        observacoes: [
            'Sistema pode requerer estudo de impacto',
            'Prazo de homologação pode ser estendido',
        ],
    };

    const mockCompliantWithWarnings: ConformidadeMMGD = {
        conforme: true,
        alertas: ['Atenção: sistema próximo ao limite'],
        oversizing_permitido: true,
        potencia_dentro_limite: true,
        observacoes: [],
    };

    const mockFullyCompliant: ConformidadeMMGD = {
        conforme: true,
        alertas: [],
        oversizing_permitido: true,
        potencia_dentro_limite: true,
        observacoes: [],
    };

    describe('Conditional Rendering', () => {
        it('should return null when fully compliant (no alerts, no observations)', () => {
            const { container } = render(<ConformidadeCard conformidade={mockFullyCompliant} />);

            expect(container.firstChild).toBeNull();
        });

        it('should render when NOT compliant', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/Conformidade MMGD/)).toBeInTheDocument();
        });

        it('should render when compliant but has alerts', () => {
            render(<ConformidadeCard conformidade={mockCompliantWithWarnings} />);

            expect(screen.getByText(/Conformidade MMGD/)).toBeInTheDocument();
        });

        it('should render when compliant but has observations', () => {
            const compliantWithObs: ConformidadeMMGD = {
                conforme: true,
                alertas: [],
                oversizing_permitido: true,
                potencia_dentro_limite: true,
                observacoes: ['Sistema aprovado com ressalvas'],
            };

            render(<ConformidadeCard conformidade={compliantWithObs} />);

            expect(screen.getByText(/Conformidade MMGD/)).toBeInTheDocument();
        });
    });

    describe('Compliance Status', () => {
        it('should show warning emoji when compliant but has issues', () => {
            render(<ConformidadeCard conformidade={mockCompliantWithWarnings} />);

            expect(screen.getByText('⚠️')).toBeInTheDocument();
        });

        it('should show prohibition emoji when NOT compliant', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText('🚫')).toBeInTheDocument();
        });

        it('should display title with ANEEL regulation', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/ANEEL 1\.059\/2023/)).toBeInTheDocument();
        });

        it('should show non-compliance warning message', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/não está em conformidade/)).toBeInTheDocument();
        });

        it('should NOT show non-compliance message when compliant', () => {
            render(<ConformidadeCard conformidade={mockCompliantWithWarnings} />);

            expect(screen.queryByText(/não está em conformidade/)).not.toBeInTheDocument();
        });
    });

    describe('Alerts Display', () => {
        it('should display alerts section when alerts exist', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/⚠️ Alertas:/)).toBeInTheDocument();
        });

        it('should render all alert messages', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/Potência acima do limite residencial/)).toBeInTheDocument();
            expect(screen.getByText(/aprovação especial da distribuidora/)).toBeInTheDocument();
        });

        it('should NOT display alerts section when empty', () => {
            const noAlerts: ConformidadeMMGD = {
                conforme: true,
                alertas: [],
                oversizing_permitido: true,
                potencia_dentro_limite: true,
                observacoes: ['Teste'],
            };

            render(<ConformidadeCard conformidade={noAlerts} />);

            expect(screen.queryByText(/⚠️ Alertas:/)).not.toBeInTheDocument();
        });

        it('should render single alert', () => {
            const singleAlert: ConformidadeMMGD = {
                conforme: false,
                alertas: ['Sistema requer atenção especial'],
                oversizing_permitido: false,
                potencia_dentro_limite: false,
                observacoes: [],
            };

            render(<ConformidadeCard conformidade={singleAlert} />);

            expect(screen.getByText(/Sistema requer atenção especial/)).toBeInTheDocument();
        });
    });

    describe('Observations Display', () => {
        it('should display observations section when observations exist', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/ℹ️ Observações:/)).toBeInTheDocument();
        });

        it('should render all observation messages', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/estudo de impacto/)).toBeInTheDocument();
            expect(screen.getByText(/Prazo de homologação pode ser estendido/)).toBeInTheDocument();
        });

        it('should NOT display observations section when empty', () => {
            const noObs: ConformidadeMMGD = {
                conforme: false,
                alertas: ['Teste'],
                oversizing_permitido: false,
                potencia_dentro_limite: false,
                observacoes: [],
            };

            render(<ConformidadeCard conformidade={noObs} />);

            expect(screen.queryByText(/ℹ️ Observações:/)).not.toBeInTheDocument();
        });
    });

    describe('Recommendations', () => {
        it('should show recommendation when NOT compliant', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/Recomendação:/)).toBeInTheDocument();
            expect(screen.getByText(/Ajuste os parâmetros/)).toBeInTheDocument();
        });

        it('should NOT show recommendation when compliant', () => {
            render(<ConformidadeCard conformidade={mockCompliantWithWarnings} />);

            expect(screen.queryByText(/Recomendação:/)).not.toBeInTheDocument();
        });

        it('should suggest contacting technical team', () => {
            render(<ConformidadeCard conformidade={mockNonCompliant} />);

            expect(screen.getByText(/Entre em contato com nossa equipe/)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle many alerts (>5)', () => {
            const manyAlerts: ConformidadeMMGD = {
                conforme: false,
                alertas: [
                    'Alerta 1',
                    'Alerta 2',
                    'Alerta 3',
                    'Alerta 4',
                    'Alerta 5',
                    'Alerta 6',
                    'Alerta 7',
                ],
                oversizing_permitido: false,
                potencia_dentro_limite: false,
                observacoes: [],
            };

            render(<ConformidadeCard conformidade={manyAlerts} />);

            expect(screen.getByText('Alerta 1')).toBeInTheDocument();
            expect(screen.getByText('Alerta 7')).toBeInTheDocument();
        });

        it('should handle very long alert messages', () => {
            const longAlert: ConformidadeMMGD = {
                conforme: false,
                alertas: [
                    'Este é um alerta extremamente longo que contém muitas informações técnicas e detalhes sobre o sistema fotovoltaico e suas especificações',
                ],
                oversizing_permitido: false,
                potencia_dentro_limite: false,
                observacoes: [],
            };

            expect(() => {
                render(<ConformidadeCard conformidade={longAlert} />);
            }).not.toThrow();
        });

        it('should handle empty strings in arrays', () => {
            const emptyStrings: ConformidadeMMGD = {
                conforme: true,
                alertas: ['', 'Valid alert'],
                oversizing_permitido: true,
                potencia_dentro_limite: true,
                observacoes: ['Valid obs', ''],
            };

            render(<ConformidadeCard conformidade={emptyStrings} />);

            expect(screen.getByText('Valid alert')).toBeInTheDocument();
            expect(screen.getByText('Valid obs')).toBeInTheDocument();
        });
    });
});
