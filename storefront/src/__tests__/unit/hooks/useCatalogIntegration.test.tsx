/**
 * useCatalogIntegration Hook Tests
 * 
 * Comprehensive test suite covering:
 * - Kit search with various criteria
 * - Ranking algorithm correctness
 * - Kit selection and state management
 * - Auto-search on viability changes
 * - Viability transformation logic
 * - Error handling and loading states
 * - Empty results and edge cases
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useCatalogIntegration } from '@/hooks/useCatalogIntegration';
import type { ViabilityOutput } from '@/modules/viability/types';
import type { CatalogKit } from '@/lib/catalog/integration';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the integration utilities
jest.mock('@/modules/education/viability/catalog-integration', () => ({
    viabilityToKitSearch: jest.fn((viability, oversizing) => ({
        minKwp: viability.proposal_kwp * 0.95,
        maxKwp: viability.proposal_kwp * 1.60,
        type: 'grid_tie',
        oversizingScenario: oversizing,
    })),
    rankKitsByViability: jest.fn((kits, viability, oversizing) =>
        kits.map((kit: CatalogKit, index: number) => ({
            kit,
            score: 100 - (index * 10),
            oversizing_ratio: kit.potencia_kwp / viability.proposal_kwp,
            reasons: ['Matches power requirements'],
        }))
    ),
    kitToFinanceInput: jest.fn((kit, viability, oversizing) => ({
        capex_total_brl: kit.price_brl || 25000,
        potencia_kwp: kit.potencia_kwp,
        geracao_anual_kwh: viability.expected_gen_mwh_y * 1000,
    })),
}));

describe('useCatalogIntegration', () => {
    const mockViability: ViabilityOutput = {
        proposal_kwp: 5.2,
        expected_gen_mwh_y: 7.8,
        pr: 0.85,
        losses: {
            soiling: 0.03,
            temp: 0.08,
            ohmic: 0.02,
        },
        inverters: [{
            model: 'Growatt MIN 5000TL-X',
            phase: 'mono',
            mppt: 2,
            quantity: 1,
        }],
        strings: [{
            modules: 13,
            model: 'Canadian CS7N-MS 400Wp',
            power_wp: 400,
        }],
        oversizing_ratio: 1.04,
        hsp: 5.2,
        degradacao_anual: 0.005,
        attachments: [],
        savings_analysis: {
            savings_category: 'ALTA_ECONOMIA',
            monthly_savings_brl: 450,
            annual_savings_brl: 5400,
        },
    } as ViabilityOutput;

    const mockKits: CatalogKit[] = [
        {
            id: 'kit-1',
            name: 'Kit Solar 5.2kWp',
            potencia_kwp: 5.2,
            price_brl: 25000,
            type: 'grid_tie',
            panels: [{ brand: 'Canadian', power_w: 400, quantity: 13, description: 'CS7N-MS' }],
            inverters: [{ brand: 'Growatt', power_kw: 5.0, quantity: 1, description: 'MIN 5000TL-X' }],
            batteries: [],
            structures: [],
            total_panels: 13,
            total_inverters: 1,
            total_power_w: 5200,
            distributor: 'FOTUS',
            pricing: {
                price: 25000,
                price_brl: 25000,
                currency: 'BRL',
            },
        },
        {
            id: 'kit-2',
            name: 'Kit Solar 5.6kWp',
            potencia_kwp: 5.6,
            price_brl: 27000,
            type: 'grid_tie',
            panels: [{ brand: 'BYD', power_w: 400, quantity: 14, description: '600W' }],
            inverters: [{ brand: 'Fronius', power_kw: 5.0, quantity: 1, description: 'Primo' }],
            batteries: [],
            structures: [],
            total_panels: 14,
            total_inverters: 1,
            total_power_w: 5600,
            distributor: 'FOTUS',
            pricing: {
                price: 27000,
                price_brl: 27000,
                currency: 'BRL',
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with empty state when no viability provided', () => {
            const { result } = renderHook(() => useCatalogIntegration());

            expect(result.current.criteria).toBeNull();
            expect(result.current.kits).toEqual([]);
            expect(result.current.recommendations).toEqual([]);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.selectedKit).toBeNull();
            expect(result.current.financeInput).toBeNull();
        });

        it('should have all action functions available', () => {
            const { result } = renderHook(() => useCatalogIntegration());

            expect(typeof result.current.searchKits).toBe('function');
            expect(typeof result.current.selectKit).toBe('function');
            expect(typeof result.current.clearSelection).toBe('function');
        });

        it('should initialize stats with zero values', () => {
            const { result } = renderHook(() => useCatalogIntegration());

            expect(result.current.totalKits).toBe(0);
            expect(result.current.hasMore).toBe(false);
        });
    });

    describe('Auto-search on Viability', () => {
        it('should auto-search when viability is provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: {
                            total: 2,
                            hasMore: false,
                        },
                    },
                }),
            });

            renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });
        });

        it('should not auto-search when autoSearch is false', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            renderHook(() =>
                useCatalogIntegration({
                    viability: mockViability,
                    autoSearch: false,
                })
            );

            await waitFor(() => {
                expect(global.fetch).not.toHaveBeenCalled();
            });
        });

        it('should update search when viability changes', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { rerender } = renderHook(
                ({ viability }) => useCatalogIntegration({ viability }),
                { initialProps: { viability: mockViability } }
            );

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            const updatedViability = {
                ...mockViability,
                proposal_kwp: 6.0,
            };

            rerender({ viability: updatedViability });

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Kit Search', () => {
        it('should search kits successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: {
                            total: 2,
                            hasMore: false,
                        },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.kits).toEqual(mockKits);
            expect(result.current.totalKits).toBe(2);
            expect(result.current.hasMore).toBe(false);
        });

        it('should build correct query parameters', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: [],
                        pagination: { total: 0, hasMore: false },
                    },
                }),
            });

            renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
            expect(fetchCall).toContain('/api/catalog/kits?');
            expect(fetchCall).toContain('minPower=');
            expect(fetchCall).toContain('maxPower=');
            expect(fetchCall).toContain('limit=50');
            expect(fetchCall).toContain('offset=0');
        });

        it('should include type parameter when not "all"', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: [],
                        pagination: { total: 0, hasMore: false },
                    },
                }),
            });

            renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            });

            const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
            expect(fetchCall).toContain('type=grid_tie');
        });

        it('should set loading state during search', async () => {
            let resolvePromise: any;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            (global.fetch as jest.Mock).mockReturnValueOnce(promise);

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(true);
            });

            resolvePromise({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: [],
                        pagination: { total: 0, hasMore: false },
                    },
                }),
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should log search results', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    '[Catalog] Found 2 kits matching criteria'
                );
            });
        });
    });

    describe('Kit Ranking', () => {
        it('should rank kits when viability is provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.recommendations.length).toBe(2);
            });

            expect(result.current.recommendations[0].score).toBe(100);
            expect(result.current.recommendations[1].score).toBe(90);
        });

        it('should not rank kits when no viability', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration());

            const criteria = {
                minKwp: 4.0,
                maxKwp: 6.0,
                type: 'grid-tie' as const,
                oversizingScenario: 114 as const,
            };

            await act(async () => {
                await result.current.searchKits(criteria);
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.recommendations).toEqual([]);
        });

        it('should handle empty kit list in ranking', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: [],
                        pagination: { total: 0, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.recommendations).toEqual([]);
        });
    });

    describe('Kit Selection', () => {
        it('should select a kit', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.kits.length).toBe(2);
            });

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(result.current.selectedKit).toEqual(mockKits[0]);
        });

        it('should log kit selection', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.kits.length).toBe(2);
            });

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(console.log).toHaveBeenCalledWith(
                '[Catalog] Selected kit:',
                'kit-1',
                'Kit Solar 5.2kWp'
            );
        });

        it('should clear selection', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.kits.length).toBe(2);
            });

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(result.current.selectedKit).not.toBeNull();

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.selectedKit).toBeNull();
        });
    });

    describe('Finance Input Generation', () => {
        it('should generate finance input when kit is selected', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.kits.length).toBe(2);
            });

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(result.current.financeInput).not.toBeNull();
            expect(result.current.financeInput?.potencia_kwp).toBe(5.2);
        });

        it('should not generate finance input without viability', () => {
            const { result } = renderHook(() => useCatalogIntegration());

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(result.current.financeInput).toBeNull();
        });

        it('should clear finance input when selection is cleared', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.kits.length).toBe(2);
            });

            act(() => {
                result.current.selectKit(mockKits[0]);
            });

            expect(result.current.financeInput).not.toBeNull();

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.financeInput).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should handle HTTP error', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch kits');
            expect(result.current.kits).toEqual([]);
        });

        it('should handle API error response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: false,
                    error: 'Database connection failed',
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Database connection failed');
        });

        it('should handle network error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            );

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Network error');
        });

        it('should log error messages', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Test error')
            );

            renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith(
                    '[Catalog] Search error:',
                    expect.any(Error)
                );
            });
        });

        it('should clear kits and recommendations on error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Error')
            );

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.kits).toEqual([]);
            expect(result.current.recommendations).toEqual([]);
        });

        it('should error when searching without criteria', async () => {
            const { result } = renderHook(() => useCatalogIntegration());

            await act(async () => {
                await result.current.searchKits();
            });

            expect(result.current.error).toBe('No search criteria provided');
        });
    });

    describe('Manual Search', () => {
        it('should allow manual search with custom criteria', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ autoSearch: false }));

            const customCriteria = {
                minKwp: 4.0,
                maxKwp: 6.0,
                type: 'grid-tie' as const,
                oversizingScenario: 114 as const,
            };

            await act(async () => {
                await result.current.searchKits(customCriteria);
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.kits).toEqual(mockKits);
        });

        it('should use stored criteria if no custom criteria provided', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            (global.fetch as jest.Mock).mockClear();

            await act(async () => {
                await result.current.searchKits();
            });

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing pagination data', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: {},
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.totalKits).toBe(0);
            expect(result.current.hasMore).toBe(false);
        });

        it('should handle null kit array', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: null,
                        pagination: { total: 0, hasMore: false },
                    },
                }),
            });

            const { result } = renderHook(() => useCatalogIntegration({ viability: mockViability }));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.kits).toEqual([]);
        });

        it('should handle oversizing scenario changes', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        kits: mockKits,
                        pagination: { total: 2, hasMore: false },
                    },
                }),
            });

            const { rerender } = renderHook(
                ({ oversizing }: { oversizing: 114 | 130 | 145 | 160 }) => useCatalogIntegration({
                    viability: mockViability,
                    oversizingScenario: oversizing,
                }),
                { initialProps: { oversizing: 114 as 114 | 130 | 145 | 160 } }
            );

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(1);
            });

            rerender({ oversizing: 160 as 114 | 130 | 145 | 160 }); await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledTimes(2);
            });
        });
    });
});
