/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSavedCalculations } from '@/hooks/useSavedCalculations';
import type { SolarCalculationInput, SolarCalculationOutput } from '@/types/solar-calculator';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock do localStorage (se usado)
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useSavedCalculations', () => {
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

    const mockSavedCalculation = {
        id: 'calc-1',
        customer_id: 'user-123',
        name: 'Casa São Paulo',
        input: mockInput,
        output: mockOutput,
        calculation_hash: 'hash123',
        notes: 'Primeiro cálculo',
        is_favorite: false,
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });

    describe('Initial State and Fetch', () => {
        it('should initialize with empty calculations and loading true', () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ calculations: [] }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            expect(result.current.calculations).toEqual([]);
            expect(result.current.loading).toBe(true);
            expect(result.current.error).toBeNull();
        });

        it('should fetch calculations on mount', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ calculations: [mockSavedCalculation] }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.calculations).toEqual([mockSavedCalculation]);
            expect(result.current.error).toBeNull();
            expect(mockFetch).toHaveBeenCalledWith('/api/store/solar-calculations', {
                method: 'GET',
                credentials: 'include',
            });
        });

        it('should handle fetch errors', async () => {
            const mockError = new Error('Network error');
            mockFetch.mockRejectedValue(mockError);

            const { result } = renderHook(() => useSavedCalculations());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.calculations).toEqual([]);
            expect(result.current.error).toEqual(mockError);
        });

        it('should handle 401 unauthorized (user not logged in)', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
            });

            const { result } = renderHook(() => useSavedCalculations());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.calculations).toEqual([]);
            expect(result.current.error).toBeNull();
        });

        it('should handle API errors', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ message: 'Server error' }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.calculations).toEqual([]);
            expect(result.current.error).toBeInstanceOf(Error);
        });
    });

    describe('saveCalculation', () => {
        it('should save calculation successfully', async () => {
            const newCalculation = {
                name: 'Nova Casa',
                input: mockInput,
                output: mockOutput,
                notes: 'Cálculo atualizado',
            };

            const savedCalculation = {
                ...newCalculation,
                id: 'calc-new',
                customer_id: 'user-123',
                calculation_hash: 'hash456',
                is_favorite: false,
                created_at: new Date(),
                updated_at: new Date(),
            };

            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [] }),
            });

            // Mock save request
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculation: savedCalculation }),
            });

            // Mock refetch after save
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [savedCalculation] }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let savedResult;
            await act(async () => {
                savedResult = await result.current.saveCalculation(newCalculation);
            });

            expect(savedResult).toEqual(savedCalculation);
            expect(result.current.calculations).toEqual([savedCalculation]);
            expect(mockFetch).toHaveBeenCalledWith('/api/store/solar-calculations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(newCalculation),
            });
        });

        it('should handle save errors', async () => {
            const newCalculation = {
                input: mockInput,
                output: mockOutput,
            };

            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [] }),
            });

            // Mock save request failure
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Save failed' }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(result.current.saveCalculation(newCalculation)).rejects.toThrow('Save failed');
        });
    });

    describe('deleteCalculation', () => {
        it('should delete calculation successfully', async () => {
            // Mock initial fetch with calculation
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [mockSavedCalculation] }),
            });

            // Mock delete request
            mockFetch.mockResolvedValueOnce({
                ok: true,
            });

            // Mock refetch after delete
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [] }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteCalculation('calc-1');
            });

            expect(result.current.calculations).toEqual([]);
            expect(mockFetch).toHaveBeenCalledWith('/api/store/solar-calculations/calc-1', {
                method: 'DELETE',
                credentials: 'include',
            });
        });

        it('should handle delete errors', async () => {
            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [mockSavedCalculation] }),
            });

            // Mock delete request failure
            mockFetch.mockResolvedValueOnce({
                ok: false,
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(result.current.deleteCalculation('calc-1')).rejects.toThrow('Failed to delete calculation');
        });
    });

    describe('updateCalculation', () => {
        it('should update calculation successfully', async () => {
            const updateData = {
                name: 'Casa Atualizada',
                notes: 'Notas atualizadas',
                is_favorite: true,
            };

            const updatedCalculation = {
                ...mockSavedCalculation,
                ...updateData,
                updated_at: new Date(),
            };

            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [mockSavedCalculation] }),
            });

            // Mock update request
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculation: updatedCalculation }),
            });

            // Mock refetch after update
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [updatedCalculation] }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            let updatedResult;
            await act(async () => {
                updatedResult = await result.current.updateCalculation('calc-1', updateData);
            });

            expect(updatedResult).toEqual(updatedCalculation);
            expect(result.current.calculations).toEqual([updatedCalculation]);
            expect(mockFetch).toHaveBeenCalledWith('/api/store/solar-calculations/calc-1', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });
        });

        it('should handle update errors', async () => {
            const updateData = { name: 'Novo Nome' };

            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: [mockSavedCalculation] }),
            });

            // Mock update request failure
            mockFetch.mockResolvedValueOnce({
                ok: false,
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            await expect(result.current.updateCalculation('calc-1', updateData)).rejects.toThrow('Failed to update calculation');
        });
    });

    describe('refetch', () => {
        it('should refetch calculations', async () => {
            const initialCalculations = [mockSavedCalculation];
            const updatedCalculations = [
                mockSavedCalculation,
                { ...mockSavedCalculation, id: 'calc-2', name: 'Segundo Cálculo' },
            ];

            // Mock initial fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: initialCalculations }),
            });

            // Mock refetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ calculations: updatedCalculations }),
            });

            const { result } = renderHook(() => useSavedCalculations());

            // Wait for initial load
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.calculations).toEqual(initialCalculations);

            // Refetch
            await act(async () => {
                await result.current.refetch();
            });

            expect(result.current.calculations).toEqual(updatedCalculations);
        });
    });
});
