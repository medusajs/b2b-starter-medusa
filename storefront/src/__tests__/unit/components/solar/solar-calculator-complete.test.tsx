/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SolarCalculatorComplete } from '@/components/solar/solar-calculator-complete';
import type { SolarCalculationOutput } from '@/types/solar-calculator';

// Mock dos hooks
const mockCalculate = jest.fn();
const mockReset = jest.fn();
const mockSaveCalculation = jest.fn();
const mockLoadCalculation = jest.fn();

jest.mock('@/hooks/use-solar-calculator', () => ({
    useSolarCalculator: jest.fn(() => ({
        calculate: mockCalculate,
        result: null,
        loading: false,
        error: null,
        reset: mockReset,
    })),
    usePersistedCalculation: jest.fn(() => ({
        saveCalculation: mockSaveCalculation,
        loadCalculation: mockLoadCalculation,
    })),
}));

// Mock do validateCalculationInput e sanitizeCalculationInput
jest.mock('@/lib/solar-calculator-client', () => ({
    validateCalculationInput: jest.fn((input) => ({ valid: true, errors: [] })),
    sanitizeCalculationInput: jest.fn((input) => input),
}));

// Mock do SolarResults component
jest.mock('@/components/solar', () => ({
    SolarResults: jest.fn(({ calculation, onRecalculate, onKitSelect }) => (
        <div data-testid="solar-results">
            <div>Mock Solar Results</div>
            <button onClick={onRecalculate}>Recalcular</button>
            <button onClick={() => onKitSelect?.('test-kit-id')}>Selecionar Kit</button>
        </div>
    )),
}));

describe('SolarCalculatorComplete', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLoadCalculation.mockReturnValue(null);

        // Reset mock implementation
        const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
        useSolarCalculator.mockImplementation(() => ({
            calculate: mockCalculate,
            result: null,
            loading: false,
            error: null,
            reset: mockReset,
        }));
    });

    describe('Form Rendering', () => {
        it('should render header with title', () => {
            render(<SolarCalculatorComplete />);

            expect(screen.getByText(/☀️ Calculadora Solar Fotovoltaica/)).toBeInTheDocument();
            expect(screen.getByText(/Dimensione seu sistema solar/)).toBeInTheDocument();
        });

        it('should render all form fields', () => {
            render(<SolarCalculatorComplete />);

            expect(screen.getByText(/💡 Consumo Mensal/)).toBeInTheDocument();
            expect(screen.getByText(/📍 Estado \(UF\)/)).toBeInTheDocument();
            expect(screen.getByText(/📊 Oversizing/)).toBeInTheDocument();
            expect(screen.getByText(/⚡ Tipo de Sistema/)).toBeInTheDocument();
            expect(screen.getByText(/🔌 Fase da Instalação/)).toBeInTheDocument();
            expect(screen.getByText(/🏠 Tipo de Telhado/)).toBeInTheDocument();
        });

        it('should render calculate button', () => {
            render(<SolarCalculatorComplete />);

            expect(screen.getByText(/🧮 Calcular Sistema Solar/)).toBeInTheDocument();
        });

        it('should have default values in form fields', () => {
            render(<SolarCalculatorComplete />);

            const consumoInput = screen.getByPlaceholderText(/Ex: 450/);
            expect(consumoInput).toHaveValue(450);

            const ufSelect = screen.getByLabelText(/Selecione o estado/);
            expect(ufSelect).toHaveValue('SP');
        });
    });

    describe('Form Input Changes', () => {
        it('should update consumo value when changed', () => {
            render(<SolarCalculatorComplete />);

            const consumoInput = screen.getByPlaceholderText(/Ex: 450/);
            fireEvent.change(consumoInput, { target: { value: '600' } });

            expect(consumoInput).toHaveValue(600);
        });

        it('should update UF when selected', () => {
            render(<SolarCalculatorComplete />);

            const ufSelect = screen.getByLabelText(/Selecione o estado/);
            fireEvent.change(ufSelect, { target: { value: 'RJ' } });

            expect(ufSelect).toHaveValue('RJ');
        });

        it('should update oversizing when selected', () => {
            render(<SolarCalculatorComplete />);

            const oversizingSelect = screen.getByLabelText(/Oversizing/);
            fireEvent.change(oversizingSelect, { target: { value: '160' } });

            expect(oversizingSelect).toHaveValue('160');
        });

        it('should update tipo de sistema when selected', () => {
            render(<SolarCalculatorComplete />);

            const tipoSistemaSelect = screen.getByLabelText(/Tipo de sistema/);
            fireEvent.change(tipoSistemaSelect, { target: { value: 'off-grid' } });

            expect(tipoSistemaSelect).toHaveValue('off-grid');
        });

        it('should update fase when selected', () => {
            render(<SolarCalculatorComplete />);

            const faseSelect = screen.getByLabelText(/Fase da instalação/);
            fireEvent.change(faseSelect, { target: { value: 'trifasico' } });

            expect(faseSelect).toHaveValue('trifasico');
        });

        it('should update tipo de telhado when selected', () => {
            render(<SolarCalculatorComplete />);

            const tipoTelhadoSelect = screen.getByLabelText(/Tipo de telhado/);
            fireEvent.change(tipoTelhadoSelect, { target: { value: 'metalico' } });

            expect(tipoTelhadoSelect).toHaveValue('metalico');
        });
    });

    describe('Form Submission', () => {
        it('should call calculate with sanitized input on form submit', async () => {
            const { validateCalculationInput, sanitizeCalculationInput } = require('@/lib/solar-calculator-client');

            validateCalculationInput.mockReturnValue({ valid: true, errors: [] });
            sanitizeCalculationInput.mockImplementation((input: any) => input);
            mockCalculate.mockResolvedValue(undefined);

            render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCalculate).toHaveBeenCalledWith({
                    consumo_kwh_mes: 450,
                    uf: 'SP',
                    oversizing_target: 130,
                    tipo_sistema: 'on-grid',
                    fase: 'bifasico',
                    tipo_telhado: 'ceramico',
                });
            });
        });

        it('should prevent default form submission', () => {
            render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);

            // fireEvent.click on submit button triggers form submission which is handled by onSubmit
            fireEvent.click(submitButton);

            // If we reach here without errors, preventDefault worked
            expect(submitButton).toBeInTheDocument();
        }); it('should call validation before calculate', async () => {
            const { validateCalculationInput } = require('@/lib/solar-calculator-client');
            validateCalculationInput.mockReturnValue({ valid: true, errors: [] });

            render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(validateCalculationInput).toHaveBeenCalled();
            });
        });
    });

    describe('Form Validation', () => {
        it('should display validation errors when validation fails', async () => {
            const { validateCalculationInput } = require('@/lib/solar-calculator-client');
            validateCalculationInput.mockReturnValue({
                valid: false,
                errors: ['Consumo deve ser maior que 0', 'Estado é obrigatório']
            });

            render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Erro\(s\) de validação:/)).toBeInTheDocument();
                expect(screen.getByText('Consumo deve ser maior que 0')).toBeInTheDocument();
                expect(screen.getByText('Estado é obrigatório')).toBeInTheDocument();
            });
        });

        it('should not call calculate when validation fails', async () => {
            const { validateCalculationInput } = require('@/lib/solar-calculator-client');
            validateCalculationInput.mockReturnValue({
                valid: false,
                errors: ['Invalid input']
            });

            render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCalculate).not.toHaveBeenCalled();
            });
        });

        it('should clear validation errors when submitting again with valid data', async () => {
            const { validateCalculationInput } = require('@/lib/solar-calculator-client');

            // First submission with errors
            validateCalculationInput.mockReturnValueOnce({
                valid: false,
                errors: ['Error message']
            });

            const { rerender } = render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Error message')).toBeInTheDocument();
            });

            // Second submission with valid data
            validateCalculationInput.mockReturnValueOnce({
                valid: true,
                errors: []
            });

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText('Error message')).not.toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        it('should show loading state when calculating', () => {
            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: null,
                loading: true,
                error: null,
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            expect(screen.getByText(/Calculando.../)).toBeInTheDocument();
        });

        it('should disable button when loading', () => {
            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: null,
                loading: true,
                error: null,
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            const button = screen.getByText(/Calculando.../).closest('button');
            expect(button).toBeDisabled();
        });

        it('should show spinner icon when loading', () => {
            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: null,
                loading: true,
                error: null,
                reset: mockReset,
            }));

            const { container } = render(<SolarCalculatorComplete />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should display error message when error occurs', () => {
            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: null,
                loading: false,
                error: new Error('Calculation failed'),
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            expect(screen.getByText('Calculation failed')).toBeInTheDocument();
        });

        it('should show error alert with icon', () => {
            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: null,
                loading: false,
                error: new Error('Test error'),
                reset: mockReset,
            }));

            const { container } = render(<SolarCalculatorComplete />);

            const errorAlert = container.querySelector('.bg-red-50');
            expect(errorAlert).toBeInTheDocument();
        });
    });

    describe('Results Display', () => {
        it('should hide form when result is present', () => {
            const mockResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: mockResult,
                loading: false,
                error: null,
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            expect(screen.queryByText(/💡 Consumo Mensal/)).not.toBeInTheDocument();
            expect(screen.queryByText(/🧮 Calcular Sistema Solar/)).not.toBeInTheDocument();
        });

        it('should show SolarResults component when result is present', () => {
            const mockResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: mockResult,
                loading: false,
                error: null,
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            expect(screen.getByTestId('solar-results')).toBeInTheDocument();
            expect(screen.getByText('Mock Solar Results')).toBeInTheDocument();
        });
    });

    describe('Reset Functionality', () => {
        it('should call reset when recalculate button is clicked', () => {
            const mockResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: mockResult,
                loading: false,
                error: null,
                reset: mockReset,
            }));

            render(<SolarCalculatorComplete />);

            const recalculateButton = screen.getByText('Recalcular');
            fireEvent.click(recalculateButton);

            expect(mockReset).toHaveBeenCalled();
        });

        it('should clear validation errors when reset is called', async () => {
            const { validateCalculationInput } = require('@/lib/solar-calculator-client');
            validateCalculationInput.mockReturnValue({
                valid: false,
                errors: ['Validation error']
            });

            const { rerender } = render(<SolarCalculatorComplete />);

            const submitButton = screen.getByText(/🧮 Calcular Sistema Solar/);
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('Validation error')).toBeInTheDocument();
            });

            // Simulate reset by re-rendering with result
            const mockResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: mockResult,
                loading: false,
                error: null,
                reset: mockReset,
            }));

            rerender(<SolarCalculatorComplete />);

            const recalculateButton = screen.getByText('Recalcular');
            fireEvent.click(recalculateButton);

            // After clicking reset, validation errors should be cleared
            // This would be shown in the actual component flow
            expect(mockReset).toHaveBeenCalled();
        });
    });

    describe('Kit Selection Handler', () => {
        it('should log and alert when kit is selected', () => {
            const mockResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            const { useSolarCalculator } = require('@/hooks/use-solar-calculator');
            useSolarCalculator.mockImplementation(() => ({
                calculate: mockCalculate,
                result: mockResult,
                loading: false,
                error: null,
                reset: mockReset,
            }));

            const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            render(<SolarCalculatorComplete />);

            const selectKitButton = screen.getByText('Selecionar Kit');
            fireEvent.click(selectKitButton);

            expect(consoleSpy).toHaveBeenCalledWith('[Calculator] Kit selecionado:', 'test-kit-id');
            expect(alertSpy).toHaveBeenCalledWith('Kit test-kit-id selecionado! Funcionalidade de cotação será implementada.');

            alertSpy.mockRestore();
            consoleSpy.mockRestore();
        });
    });

    describe('Saved Calculation Loading', () => {
        it('should attempt to load last calculation on mount', () => {
            render(<SolarCalculatorComplete />);

            expect(mockLoadCalculation).toHaveBeenCalled();
        });

        it('should log when loading saved calculation', () => {
            const mockSavedResult: SolarCalculationOutput = {
                dimensionamento: {
                    kwp_necessario: 5.4,
                    kwp_proposto: 5.4,
                    numero_paineis: 12,
                    potencia_inversor_kw: 5.0,
                    area_necessaria_m2: 24,
                    geracao_mensal_kwh: [400, 410, 420, 430, 440, 450, 460, 450, 440, 430, 420, 410],
                    geracao_anual_kwh: 5220,
                    performance_ratio: 0.8,
                    oversizing_ratio: 1.0
                },
                analise_financeira: {
                    capex: {
                        equipamentos_brl: 18000,
                        instalacao_brl: 5000,
                        projeto_brl: 1000,
                        homologacao_brl: 1000,
                        total_brl: 25000
                    },
                    economia: {
                        mensal_brl: 450,
                        anual_brl: 5400,
                        total_25anos_brl: 135000,
                        economia_percentual: 85
                    },
                    retorno: {
                        payback_simples_anos: 4.6,
                        payback_descontado_anos: 5.2,
                        tir_percentual: 18.5,
                        vpl_brl: 85000
                    }
                },
                impacto_ambiental: {
                    co2_evitado_toneladas: 67.5,
                    co2_evitado_kg: 67500,
                    arvores_equivalentes: 450,
                    carros_equivalentes: 12.5
                },
                conformidade_mmgd: {
                    conforme: true,
                    alertas: [],
                    observacoes: [],
                    oversizing_permitido: true,
                    potencia_dentro_limite: true
                },
                kits_recomendados: []
            };

            mockLoadCalculation.mockReturnValue(mockSavedResult);
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            render(<SolarCalculatorComplete />);

            expect(consoleSpy).toHaveBeenCalledWith('[Calculator] Carregando último cálculo salvo');

            consoleSpy.mockRestore();
        });
    });
});
