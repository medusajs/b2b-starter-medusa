/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSolarCalculator, useSolarKits, useCalculatorInfo, useCalculatorHealth, usePersistedCalculation, useDebounce } from '@/hooks/use-solar-calculator';
import type { SolarCalculationInput, SolarCalculationOutput } from '@/types/solar-calculator';

// Mock do solar calculator client
jest.mock('@/lib/solar-calculator-client', () => ({
    solarCalculatorClient: {
        calculate: jest.fn(),
        getInfo: jest.fn(),
        healthCheck: jest.fn(),
    },
}));

import { solarCalculatorClient } from '@/lib/solar-calculator-client';

// Mock do localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useSolarCalculator', () => {
    const mockInput: SolarCalculationInput = {
        consumo_kwh_mes: 300,
        uf: 'SP',
        oversizing_target: 130,
        tipo_sistema: 'on-grid',
        fase: 'trifasico',
    };

    const mockOutput: SolarCalculationOutput = {
        dimensionamento: {
            kwp_necessario: 4.8,
            kwp_proposto: 5.2,
            numero_paineis: 13,
            potencia_inversor_kw: 5.0,
            area_necessaria_m2: 30,
            geracao_mensal_kwh: [450, 420, 380, 350, 320, 300, 320, 350, 380, 420, 450, 460],
            geracao_anual_kwh: 4800,
            performance_ratio: 0.85,
            oversizing_ratio: 1.08,
        },
        kits_recomendados: [{
            kit_id: 'kit-1',
            nome: 'Kit Solar 5.2kWp',
            potencia_kwp: 5.2,
            match_score: 0.95,
            componentes: {
                paineis: [{
                    marca: 'Canadian',
                    modelo: 'CS6U-400',
                    potencia_w: 400,
                    quantidade: 13,
                    eficiencia: 0.21,
                }],
                inversores: [{
                    marca: 'Growatt',
                    modelo: 'MIN 5000 TL-X',
                    potencia_kw: 5.0,
                    quantidade: 1,
                    mppt: 2,
                    tipo: 'on-grid',
                }],
            },
            preco_brl: 25000,
            disponibilidade: {
                em_estoque: true,
                centro_distribuicao: 'São Paulo',
                prazo_entrega_dias: 7,
            },
        }],
        financeiro: {
            capex: {
                equipamentos_brl: 20000,
                instalacao_brl: 3000,
                projeto_brl: 1000,
                homologacao_brl: 1000,
                total_brl: 25000,
            },
            economia: {
                mensal_brl: 450,
                anual_brl: 5400,
                total_25anos_brl: 135000,
                economia_percentual: 0.75,
            },
            retorno: {
                payback_simples_anos: 4.2,
                payback_descontado_anos: 4.8,
                tir_percentual: 0.15,
                vpl_brl: 85000,
            },
        },
        impacto_ambiental: {
            co2_evitado_kg: 4800,
            co2_evitado_toneladas: 4.8,
            arvores_equivalentes: 240,
            carros_equivalentes: 1.2,
        },
        conformidade: {
            conforme: true,
            alertas: [],
            oversizing_permitido: true,
            potencia_dentro_limite: true,
            observacoes: [],
        },
        dados_localizacao: {
            estado: 'SP',
            hsp: 4.8,
            tarifa_kwh: 0.85,
            latitude: -23.5505,
            longitude: -46.6333,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    describe('Initial State', () => {
        it('should initialize with null result, no loading, no error', () => {
            const { result } = renderHook(() => useSolarCalculator());

            expect(result.current.result).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });

        it('should accept options', () => {
            const options = { autoCalculate: true };
            const { result } = renderHook(() => useSolarCalculator(options));

            expect(result.current.result).toBeNull();
        });
    });

    describe('calculate function', () => {
        it('should calculate successfully and update state', async () => {
            (solarCalculatorClient.calculate as jest.Mock).mockResolvedValue(mockOutput);

            const { result } = renderHook(() => useSolarCalculator());

            await act(async () => {
                await result.current.calculate(mockInput);
            });

            expect(result.current.result).toEqual(mockOutput);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(solarCalculatorClient.calculate).toHaveBeenCalledWith(mockInput);
        });

        it('should handle calculation errors', async () => {
            const mockError = new Error('Calculation failed');
            (solarCalculatorClient.calculate as jest.Mock).mockRejectedValue(mockError);

            const { result } = renderHook(() => useSolarCalculator());

            await act(async () => {
                await result.current.calculate(mockInput);
            });

            expect(result.current.result).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toEqual(mockError);
        });

        it('should use cached result for same input', async () => {
            (solarCalculatorClient.calculate as jest.Mock).mockResolvedValue(mockOutput);

            const { result } = renderHook(() => useSolarCalculator());

            // First calculation
            await act(async () => {
                await result.current.calculate(mockInput);
            });

            // Second calculation with same input should use cache
            await act(async () => {
                await result.current.calculate(mockInput);
            });

            expect(solarCalculatorClient.calculate).toHaveBeenCalledTimes(1);
            expect(result.current.result).toEqual(mockOutput);
        });

        it('should call onSuccess callback when provided', async () => {
            (solarCalculatorClient.calculate as jest.Mock).mockResolvedValue(mockOutput);
            const onSuccess = jest.fn();

            const { result } = renderHook(() => useSolarCalculator({ onSuccess }));

            await act(async () => {
                await result.current.calculate(mockInput);
            });

            expect(onSuccess).toHaveBeenCalledWith(mockOutput);
        });

        it('should call onError callback when provided', async () => {
            const mockError = new Error('Calculation failed');
            (solarCalculatorClient.calculate as jest.Mock).mockRejectedValue(mockError);
            const onError = jest.fn();

            const { result } = renderHook(() => useSolarCalculator({ onError }));

            await act(async () => {
                await result.current.calculate(mockInput);
            });

            expect(onError).toHaveBeenCalledWith(mockError);
        });

        it('should limit cache size to 10 entries', async () => {
            (solarCalculatorClient.calculate as jest.Mock).mockResolvedValue(mockOutput);

            const { result } = renderHook(() => useSolarCalculator());

            // Make 11 different calculations
            for (let i = 0; i < 11; i++) {
                const input = { ...mockInput, consumo_kwh_mes: 300 + i };
                await act(async () => {
                    await result.current.calculate(input);
                });
            }

            expect(solarCalculatorClient.calculate).toHaveBeenCalledTimes(11);
        });
    });

    describe('reset function', () => {
        it('should reset all state', async () => {
            (solarCalculatorClient.calculate as jest.Mock).mockResolvedValue(mockOutput);
            const mockError = new Error('Test error');

            const { result } = renderHook(() => useSolarCalculator());

            // Set some state
            await act(async () => {
                await result.current.calculate(mockInput);
            });

            // Manually set error to test reset
            act(() => {
                result.current.error = mockError;
            });

            // Reset
            act(() => {
                result.current.reset();
            });

            expect(result.current.result).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });
});

describe('useSolarKits', () => {
    const mockCalculation: SolarCalculationOutput = {
        dimensionamento: {
            kwp_necessario: 4.8,
            kwp_proposto: 5.2,
            numero_paineis: 13,
            potencia_inversor_kw: 5.0,
            area_necessaria_m2: 30,
            geracao_mensal_kwh: [],
            geracao_anual_kwh: 4800,
            performance_ratio: 0.85,
            oversizing_ratio: 1.08,
        },
        kits_recomendados: [{
            kit_id: 'kit-1',
            nome: 'Kit Solar 5.2kWp',
            potencia_kwp: 5.2,
            match_score: 0.95,
            componentes: {
                paineis: [{
                    marca: 'Canadian',
                    potencia_w: 400,
                    quantidade: 13,
                }],
                inversores: [{
                    marca: 'Growatt',
                    potencia_kw: 5.0,
                    quantidade: 1,
                }],
            },
            preco_brl: 25000,
            disponibilidade: {
                em_estoque: true,
            },
        }],
        financeiro: {
            capex: {
                equipamentos_brl: 20000,
                instalacao_brl: 3000,
                projeto_brl: 1000,
                homologacao_brl: 1000,
                total_brl: 25000,
            },
            economia: {
                mensal_brl: 450,
                anual_brl: 5400,
                total_25anos_brl: 135000,
                economia_percentual: 0.75,
            },
            retorno: {
                payback_simples_anos: 4.2,
                payback_descontado_anos: 4.8,
                tir_percentual: 0.15,
                vpl_brl: 85000,
            },
        },
        impacto_ambiental: {
            co2_evitado_kg: 4800,
            co2_evitado_toneladas: 4.8,
            arvores_equivalentes: 240,
            carros_equivalentes: 1.2,
        },
        conformidade: {
            conforme: true,
            alertas: [],
            oversizing_permitido: true,
            potencia_dentro_limite: true,
            observacoes: [],
        },
        dados_localizacao: {
            estado: 'SP',
            hsp: 4.8,
            tarifa_kwh: 0.85,
        },
    } as any;

    it('should return kits from calculation', () => {
        const { result } = renderHook(() => useSolarKits(mockCalculation));

        expect(result.current.kits).toEqual(mockCalculation.kits_recomendados);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should return empty array when no calculation', () => {
        const { result } = renderHook(() => useSolarKits(null));

        expect(result.current.kits).toEqual([]);
    });

    it('should update kits when calculation changes', () => {
        const { result, rerender } = renderHook(
            ({ calculation }) => useSolarKits(calculation),
            { initialProps: { calculation: null } }
        );

        expect(result.current.kits).toEqual([]);

        rerender({ calculation: mockCalculation as any });

        expect(result.current.kits).toEqual(mockCalculation.kits_recomendados);
    });
});

describe('useCalculatorInfo', () => {
    const mockInfo = { version: '1.0.0', status: 'healthy' };

    beforeEach(() => {
        jest.clearAllMocks();
        (solarCalculatorClient.getInfo as jest.Mock).mockClear();
        (solarCalculatorClient.getInfo as jest.Mock).mockResolvedValue(mockInfo);
    });

    it('should fetch info on mount', async () => {
        const { result } = renderHook(() => useCalculatorInfo());

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.info).toEqual(mockInfo);
        expect(result.current.error).toBeNull();
        expect(solarCalculatorClient.getInfo).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
        const mockError = new Error('Fetch failed');
        (solarCalculatorClient.getInfo as jest.Mock).mockRejectedValue(mockError);

        const { result } = renderHook(() => useCalculatorInfo());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.info).toBeNull();
        expect(result.current.error).toEqual(mockError);
    });
});

describe('useCalculatorHealth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        (solarCalculatorClient.healthCheck as jest.Mock).mockClear();
        (solarCalculatorClient.healthCheck as jest.Mock).mockResolvedValue(true);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should check health on mount', async () => {
        const { result } = renderHook(() => useCalculatorHealth());

        expect(result.current.checking).toBe(true);

        await waitFor(() => {
            expect(result.current.checking).toBe(false);
        });

        expect(result.current.healthy).toBe(true);
        expect(solarCalculatorClient.healthCheck).toHaveBeenCalledTimes(1);
    });

    it('should handle health check errors', async () => {
        (solarCalculatorClient.healthCheck as jest.Mock).mockRejectedValue(new Error('Health check failed'));

        const { result } = renderHook(() => useCalculatorHealth());

        await waitFor(() => {
            expect(result.current.checking).toBe(false);
        });

        expect(result.current.healthy).toBe(false);
    });

    it('should check health periodically', async () => {
        const { result } = renderHook(() => useCalculatorHealth());

        await waitFor(() => {
            expect(result.current.checking).toBe(false);
        });

        // Should have been called once on mount
        expect(solarCalculatorClient.healthCheck).toHaveBeenCalledTimes(1);

        // Advance time by 30 seconds
        act(() => {
            jest.advanceTimersByTime(30000);
        });

        // Should have been called again
        expect(solarCalculatorClient.healthCheck).toHaveBeenCalledTimes(2);
    });
});

describe('usePersistedCalculation', () => {
    const mockCalculation: SolarCalculationOutput = {
        dimensionamento: {
            kwp_necessario: 4.8,
            kwp_proposto: 5.2,
            numero_paineis: 13,
            potencia_inversor_kw: 5.0,
            area_necessaria_m2: 30,
            geracao_mensal_kwh: [],
            geracao_anual_kwh: 4800,
            performance_ratio: 0.85,
            oversizing_ratio: 1.08,
        },
        kits_recomendados: [],
        financeiro: {
            capex: {
                equipamentos_brl: 20000,
                instalacao_brl: 3000,
                projeto_brl: 1000,
                homologacao_brl: 1000,
                total_brl: 25000,
            },
            economia: {
                mensal_brl: 450,
                anual_brl: 5400,
                total_25anos_brl: 135000,
                economia_percentual: 0.75,
            },
            retorno: {
                payback_simples_anos: 4.2,
                payback_descontado_anos: 4.8,
                tir_percentual: 0.15,
                vpl_brl: 85000,
            },
        },
        impacto_ambiental: {
            co2_evitado_kg: 4800,
            co2_evitado_toneladas: 4.8,
            arvores_equivalentes: 240,
            carros_equivalentes: 1.2,
        },
        conformidade: {
            conforme: true,
            alertas: [],
            oversizing_permitido: true,
            potencia_dentro_limite: true,
            observacoes: [],
        },
        dados_localizacao: {
            estado: 'SP',
            hsp: 4.8,
            tarifa_kwh: 0.85,
        },
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    describe('saveCalculation', () => {
        it('should save calculation to localStorage', () => {
            const { result } = renderHook(() => usePersistedCalculation());

            act(() => {
                result.current.saveCalculation(mockCalculation);
            });

            expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'ysh_last_solar_calculation',
                expect.stringContaining('"calculation":')
            );
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'ysh_last_solar_calculation',
                expect.stringContaining('"savedAt":')
            );
        });

        it('should handle localStorage errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const { result } = renderHook(() => usePersistedCalculation());

            act(() => {
                result.current.saveCalculation(mockCalculation);
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[usePersistedCalculation] Erro ao salvar:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('loadCalculation', () => {
        it('should load calculation from localStorage', () => {
            const storedData = {
                calculation: mockCalculation,
                savedAt: new Date().toISOString(),
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

            const { result } = renderHook(() => usePersistedCalculation());

            const loaded = result.current.loadCalculation();

            expect(loaded).toEqual(mockCalculation);
            expect(localStorageMock.getItem).toHaveBeenCalledWith('ysh_last_solar_calculation');
        });

        it('should return null when no data in localStorage', () => {
            localStorageMock.getItem.mockReturnValue(null);

            const { result } = renderHook(() => usePersistedCalculation());

            const loaded = result.current.loadCalculation();

            expect(loaded).toBeNull();
        });

        it('should return null for expired data (older than 7 days)', () => {
            const eightDaysAgo = new Date();
            eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

            const storedData = {
                calculation: mockCalculation,
                savedAt: eightDaysAgo.toISOString(),
            };
            localStorageMock.getItem.mockReturnValue(JSON.stringify(storedData));

            const { result } = renderHook(() => usePersistedCalculation());

            const loaded = result.current.loadCalculation();

            expect(loaded).toBeNull();
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('ysh_last_solar_calculation');
        });

        it('should handle invalid JSON gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            localStorageMock.getItem.mockReturnValue('invalid json');

            const { result } = renderHook(() => usePersistedCalculation());

            const loaded = result.current.loadCalculation();

            expect(loaded).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[usePersistedCalculation] Erro ao carregar:',
                expect.any(SyntaxError)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('clearCalculation', () => {
        it('should clear calculation from localStorage', () => {
            const { result } = renderHook(() => usePersistedCalculation());

            act(() => {
                result.current.clearCalculation();
            });

            expect(localStorageMock.removeItem).toHaveBeenCalledWith('ysh_last_solar_calculation');
        });

        it('should handle localStorage errors gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            localStorageMock.removeItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const { result } = renderHook(() => usePersistedCalculation());

            act(() => {
                result.current.clearCalculation();
            });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[usePersistedCalculation] Erro ao limpar:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });
});

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        // Change value
        rerender({ value: 'changed' });

        // Should still return old value immediately
        expect(result.current).toBe('initial');

        // Advance time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Should now return new value
        expect(result.current).toBe('changed');
    });

    it('should cancel previous timeout on value change', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'first' } }
        );

        // Change value quickly
        rerender({ value: 'second' });

        // Advance partial time
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Change value again
        rerender({ value: 'third' });

        // Advance remaining time
        act(() => {
            jest.advanceTimersByTime(500);
        });

        // Should return latest value
        expect(result.current).toBe('third');
    });

    it('should use custom delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 1000),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'changed' });

        // Advance 500ms - should still be old value
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('initial');

        // Advance another 500ms - should now be new value
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('changed');
    });
});