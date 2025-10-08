/**
 * 🌞 YSH Solar Calculator - React Hooks
 * Hooks personalizados para gerenciamento de estado e cache
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
    SolarCalculationInput,
    SolarCalculationOutput,
    KitRecomendado,
    UseSolarCalculatorOptions,
    UseSolarCalculatorReturn,
    UseSolarKitsOptions,
    UseSolarKitsReturn,
} from '@/types/solar-calculator';
import { solarCalculatorClient } from '@/lib/solar-calculator-client';

// ============================================================================
// useSolarCalculator Hook
// ============================================================================

/**
 * Hook para gerenciar cálculos solares com cache e estado
 */
export function useSolarCalculator(
    options: UseSolarCalculatorOptions = {}
): UseSolarCalculatorReturn {
    const { autoCalculate = false, onSuccess, onError } = options;

    const [result, setResult] = useState<SolarCalculationOutput | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Cache de cálculos (evita recalcular com mesmos parâmetros)
    const cacheRef = useRef<Map<string, SolarCalculationOutput>>(new Map());

    const getCacheKey = (input: SolarCalculationInput): string => {
        return JSON.stringify({
            consumo: input.consumo_kwh_mes || input.consumo_mensal_kwh,
            uf: input.uf,
            oversizing: input.oversizing_target,
            tipo: input.tipo_sistema,
            fase: input.fase,
        });
    };

    const calculate = useCallback(
        async (input: SolarCalculationInput) => {
            try {
                setLoading(true);
                setError(null);

                // Verificar cache
                const cacheKey = getCacheKey(input);
                const cached = cacheRef.current.get(cacheKey);

                if (cached) {
                    console.log('[useSolarCalculator] Usando resultado em cache');
                    setResult(cached);
                    onSuccess?.(cached);
                    return;
                }

                // Fazer requisição
                console.log('[useSolarCalculator] Calculando sistema solar...');
                const calculation = await solarCalculatorClient.calculate(input);

                // Salvar em cache
                cacheRef.current.set(cacheKey, calculation);

                // Limitar tamanho do cache (últimos 10 cálculos)
                if (cacheRef.current.size > 10) {
                    const firstKey = cacheRef.current.keys().next().value;
                    if (firstKey) {
                        cacheRef.current.delete(firstKey);
                    }
                }

                setResult(calculation);
                onSuccess?.(calculation);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Erro ao calcular sistema solar');
                console.error('[useSolarCalculator] Erro:', error);
                setError(error);
                onError?.(error);
            } finally {
                setLoading(false);
            }
        },
        [onSuccess, onError]
    );

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        calculate,
        result,
        loading,
        error,
        reset,
    };
}

// ============================================================================
// useSolarKits Hook
// ============================================================================

/**
 * Hook para buscar kits solares recomendados
 * NOTA: Por ora, usa os kits do resultado do cálculo
 * Futuramente pode ter endpoint separado para busca de kits
 */
export function useSolarKits(
    calculation: SolarCalculationOutput | null
): UseSolarKitsReturn {
    const [kits, setKits] = useState<KitRecomendado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (calculation?.kits_recomendados) {
            setKits(calculation.kits_recomendados);
        }
    }, [calculation]);

    const refetch = useCallback(async () => {
        // Por ora, não há endpoint separado para buscar apenas kits
        // Essa função seria útil se implementarmos endpoint /store/solar/kits
        setLoading(true);
        try {
            // TODO: Implementar busca separada de kits quando endpoint existir
            console.log('[useSolarKits] Refetch não implementado ainda');
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro ao buscar kits'));
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        kits,
        loading,
        error,
        refetch,
    };
}

// ============================================================================
// useCalculatorInfo Hook
// ============================================================================

/**
 * Hook para obter informações sobre o serviço de cálculo
 */
export function useCalculatorInfo() {
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        async function fetchInfo() {
            try {
                const data = await solarCalculatorClient.getInfo();
                if (mounted) {
                    setInfo(data);
                    setError(null);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Erro ao obter informações'));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchInfo();

        return () => {
            mounted = false;
        };
    }, []);

    return { info, loading, error };
}

// ============================================================================
// useCalculatorHealth Hook
// ============================================================================

/**
 * Hook para monitorar saúde do serviço de cálculo
 */
export function useCalculatorHealth() {
    const [healthy, setHealthy] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        let mounted = true;
        let intervalId: NodeJS.Timeout;

        async function checkHealth() {
            try {
                const isHealthy = await solarCalculatorClient.healthCheck();
                if (mounted) {
                    setHealthy(isHealthy);
                    setChecking(false);
                }
            } catch {
                if (mounted) {
                    setHealthy(false);
                    setChecking(false);
                }
            }
        }

        // Check imediato
        checkHealth();

        // Check a cada 30 segundos
        intervalId = setInterval(checkHealth, 30000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    return { healthy, checking };
}

// ============================================================================
// useLocalStorage Hook (para persistir cálculos)
// ============================================================================

/**
 * Hook para persistir último cálculo no localStorage
 */
export function usePersistedCalculation() {
    const STORAGE_KEY = 'ysh_last_solar_calculation';

    const saveCalculation = useCallback((calculation: SolarCalculationOutput) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                calculation,
                savedAt: new Date().toISOString(),
            }));
        } catch (err) {
            console.error('[usePersistedCalculation] Erro ao salvar:', err);
        }
    }, []);

    const loadCalculation = useCallback((): SolarCalculationOutput | null => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const { calculation, savedAt } = JSON.parse(stored);

            // Expirar após 7 dias
            const savedDate = new Date(savedAt);
            const now = new Date();
            const daysDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff > 7) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }

            return calculation;
        } catch (err) {
            console.error('[usePersistedCalculation] Erro ao carregar:', err);
            return null;
        }
    }, []);

    const clearCalculation = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error('[usePersistedCalculation] Erro ao limpar:', err);
        }
    }, []);

    return {
        saveCalculation,
        loadCalculation,
        clearCalculation,
    };
}

// ============================================================================
// useDebounce Hook (para inputs do formulário)
// ============================================================================

/**
 * Hook para debounce de valores (útil para inputs)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}
