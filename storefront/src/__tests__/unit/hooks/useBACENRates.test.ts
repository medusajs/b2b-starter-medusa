/**
 * useBACENRates Hook Tests
 * 
 * Comprehensive test suite covering all functionality of the BACEN rates hook:
 * - API fetch success/failure scenarios
 * - Error handling with fallback rates
 * - Loading state management
 * - Auto-fetch on mount
 * - Manual refetch capability
 * - Network error scenarios
 * - Data validation
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { useBACENRates } from '@/hooks/useBACENRates';

// Mock fetch globally
global.fetch = jest.fn();

describe('useBACENRates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with loading state', () => {
            (global.fetch as jest.Mock).mockImplementation(() =>
                new Promise(() => { }) // Never resolves
            );

            const { result } = renderHook(() => useBACENRates());

            expect(result.current.loading).toBe(true);
            expect(result.current.rates).toBeNull();
            expect(result.current.error).toBeNull();
        });

        it('should have refetch function available', () => {
            (global.fetch as jest.Mock).mockImplementation(() =>
                new Promise(() => { })
            );

            const { result } = renderHook(() => useBACENRates());

            expect(typeof result.current.refetch).toBe('function');
        });
    });

    describe('Successful API Fetch', () => {
        const mockSuccessResponse = {
            success: true,
            data: {
                bacen: {
                    selic: 11.75,
                    cdi: 11.65,
                    ipca: 4.8,
                    credit_rates: {
                        personal_non_consigned: 54.2,
                        personal_consigned_inss: 19.1,
                        other_goods_acquisition: 25.3,
                        vehicle_acquisition: 23.5,
                    },
                    updated_at: '2025-10-08T10:00:00Z',
                    source: 'BACEN_API',
                },
                solar_rate: {
                    annual_rate: 0.253,
                    monthly_rate: 0.0190,
                    rate_type: 'calculated',
                    source: 'BACEN',
                },
                scenarios: {
                    conservative: { annual_rate: 0.542, monthly_rate: 0.036 },
                    moderate: { annual_rate: 0.253, monthly_rate: 0.0190 },
                    aggressive: { annual_rate: 0.191, monthly_rate: 0.0145 },
                },
                fetched_at: '2025-10-08T10:00:00Z',
                cache_duration_seconds: 3600,
            },
        };

        it('should fetch rates successfully on mount', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSuccessResponse,
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.rates).toEqual(mockSuccessResponse.data);
            expect(result.current.error).toBeNull();
            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/finance/bacen-rates',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
            );
        });

        it('should parse rate data correctly', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSuccessResponse,
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.rates?.bacen.selic).toBe(11.75);
            expect(result.current.rates?.solar_rate.annual_rate).toBe(0.253);
            expect(result.current.rates?.scenarios.moderate.monthly_rate).toBe(0.0190);
        });

        it('should log success message', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSuccessResponse,
            });

            renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(console.log).toHaveBeenCalledWith(
                    '[useBACENRates] Rates loaded:',
                    mockSuccessResponse.data.solar_rate
                );
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle HTTP error responses', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('HTTP error! status: 500');
            expect(result.current.rates).not.toBeNull(); // Should have fallback rates
        });

        it('should handle API error response with success=false', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: false,
                    error: {
                        message: 'BACEN API unavailable',
                    },
                }),
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('BACEN API unavailable');
            expect(result.current.rates).not.toBeNull();
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Network error');
            expect(result.current.rates).not.toBeNull();
        });

        it('should handle fetch timeout', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Request timeout')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Request timeout');
        });

        it('should handle invalid JSON response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Invalid JSON');
        });

        it('should handle unknown error types', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce('Unknown error string');

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Unknown error');
        });

        it('should log error messages', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Test error')
            );

            renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(console.error).toHaveBeenCalledWith(
                    '[useBACENRates] Error:',
                    'Test error'
                );
            });
        });
    });

    describe('Fallback Rates', () => {
        it('should provide fallback rates on error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('API Error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.rates).not.toBeNull();
            expect(result.current.rates?.bacen.selic).toBe(10.75);
            expect(result.current.rates?.solar_rate.rate_type).toBe('fallback');
            expect(result.current.rates?.solar_rate.source).toBe('FALLBACK');
        });

        it('should include all required fallback rate fields', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('API Error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const rates = result.current.rates!;

            // Verify BACEN rates
            expect(rates.bacen).toHaveProperty('selic');
            expect(rates.bacen).toHaveProperty('cdi');
            expect(rates.bacen).toHaveProperty('ipca');
            expect(rates.bacen).toHaveProperty('credit_rates');
            expect(rates.bacen).toHaveProperty('updated_at');
            expect(rates.bacen).toHaveProperty('source');

            // Verify solar rate
            expect(rates.solar_rate).toHaveProperty('annual_rate');
            expect(rates.solar_rate).toHaveProperty('monthly_rate');
            expect(rates.solar_rate).toHaveProperty('rate_type');
            expect(rates.solar_rate).toHaveProperty('source');

            // Verify scenarios
            expect(rates.scenarios).toHaveProperty('conservative');
            expect(rates.scenarios).toHaveProperty('moderate');
            expect(rates.scenarios).toHaveProperty('aggressive');
        });

        it('should include valid credit rates in fallback', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('API Error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const creditRates = result.current.rates!.bacen.credit_rates;

            expect(creditRates.personal_non_consigned).toBe(52.5);
            expect(creditRates.personal_consigned_inss).toBe(18.5);
            expect(creditRates.other_goods_acquisition).toBe(24.5);
            expect(creditRates.vehicle_acquisition).toBe(22.8);
        });

        it('should include all three scenario rates in fallback', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('API Error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const scenarios = result.current.rates!.scenarios;

            expect(scenarios.conservative.annual_rate).toBe(0.525);
            expect(scenarios.moderate.annual_rate).toBe(0.245);
            expect(scenarios.aggressive.annual_rate).toBe(0.185);
        });
    });

    describe('Loading States', () => {
        it('should set loading to true during fetch', async () => {
            let resolvePromise: any;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            (global.fetch as jest.Mock).mockReturnValueOnce(promise);

            const { result } = renderHook(() => useBACENRates());

            expect(result.current.loading).toBe(true);

            resolvePromise({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        bacen: { selic: 11.0 },
                        solar_rate: { annual_rate: 0.24 },
                        scenarios: {},
                    },
                }),
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should set loading to false after successful fetch', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        bacen: {},
                        solar_rate: {},
                        scenarios: {},
                    },
                }),
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should set loading to false after error', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Error')
            );

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('Manual Refetch', () => {
        it('should refetch rates when refetch is called', async () => {
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            bacen: {},
                            solar_rate: { annual_rate: 0.24 },
                            scenarios: {},
                        },
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            bacen: {},
                            solar_rate: { annual_rate: 0.26 },
                            scenarios: {},
                        },
                    }),
                });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.rates?.solar_rate.annual_rate).toBe(0.24);

            await result.current.refetch();

            await waitFor(() => {
                expect(result.current.rates?.solar_rate.annual_rate).toBe(0.26);
            });

            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should set loading state during refetch', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        bacen: {},
                        solar_rate: {},
                        scenarios: {},
                    },
                }),
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Trigger refetch without waiting
            act(() => {
                result.current.refetch();
            });

            // Should be loading
            await waitFor(() => {
                expect(result.current.loading).toBe(true);
            });

            // Should complete
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });

        it('should clear previous error on refetch', async () => {
            (global.fetch as jest.Mock)
                .mockRejectedValueOnce(new Error('First error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({
                        success: true,
                        data: {
                            bacen: {},
                            solar_rate: {},
                            scenarios: {},
                        },
                    }),
                });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.error).toBe('First error');
            });

            await result.current.refetch();

            await waitFor(() => {
                expect(result.current.error).toBeNull();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty success response', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: false,
                    error: undefined,
                }),
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch rates');
        });

        it('should handle concurrent refetch calls', async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: {
                        bacen: {},
                        solar_rate: {},
                        scenarios: {},
                    },
                }),
            });

            const { result } = renderHook(() => useBACENRates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Call refetch multiple times
            const promises = [
                result.current.refetch(),
                result.current.refetch(),
                result.current.refetch(),
            ];

            await Promise.all(promises);

            // Should complete without errors
            expect(result.current.loading).toBe(false);
        });

        it('should handle unmounting during fetch', async () => {
            (global.fetch as jest.Mock).mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 1000))
            );

            const { unmount } = renderHook(() => useBACENRates());

            unmount();

            // Should not throw errors
            expect(true).toBe(true);
        });
    });
});
