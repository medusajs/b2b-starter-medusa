/**
 * 🪝 useSavedCalculations Hook
 * Hook para gerenciar cálculos solares salvos do usuário
 */

import { useState, useEffect, useCallback } from 'react';
import type { SolarCalculationInput, SolarCalculationOutput } from '@/types/solar-calculator';

export interface SavedCalculation {
    id: string;
    customer_id: string;
    name?: string;
    input: SolarCalculationInput;
    output: SolarCalculationOutput;
    calculation_hash?: string;
    notes?: string;
    is_favorite?: boolean;
    created_at: Date;
    updated_at: Date;
}

interface UseSavedCalculationsReturn {
    calculations: SavedCalculation[];
    loading: boolean;
    error: Error | null;
    saveCalculation: (data: {
        name?: string;
        input: SolarCalculationInput;
        output: SolarCalculationOutput;
        calculation_hash?: string;
        notes?: string;
    }) => Promise<SavedCalculation>;
    deleteCalculation: (id: string) => Promise<void>;
    updateCalculation: (id: string, data: {
        name?: string;
        notes?: string;
        is_favorite?: boolean;
    }) => Promise<SavedCalculation>;
    refetch: () => Promise<void>;
}

export function useSavedCalculations(): UseSavedCalculationsReturn {
    const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchCalculations = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/store/solar-calculations', {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // User not logged in, return empty array
                    setCalculations([]);
                    return;
                }
                throw new Error('Failed to fetch calculations');
            }

            const data = await response.json();
            setCalculations(data.calculations || []);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setCalculations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCalculations();
    }, [fetchCalculations]);

    const saveCalculation = useCallback(async (data: {
        name?: string;
        input: SolarCalculationInput;
        output: SolarCalculationOutput;
        calculation_hash?: string;
        notes?: string;
    }): Promise<SavedCalculation> => {
        const response = await fetch('/api/store/solar-calculations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save calculation');
        }

        const result = await response.json();

        // Refetch to update list
        await fetchCalculations();

        return result.calculation;
    }, [fetchCalculations]);

    const deleteCalculation = useCallback(async (id: string): Promise<void> => {
        const response = await fetch(`/api/store/solar-calculations/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to delete calculation');
        }

        // Refetch to update list
        await fetchCalculations();
    }, [fetchCalculations]);

    const updateCalculation = useCallback(async (id: string, data: {
        name?: string;
        notes?: string;
        is_favorite?: boolean;
    }): Promise<SavedCalculation> => {
        const response = await fetch(`/api/store/solar-calculations/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Failed to update calculation');
        }

        const result = await response.json();

        // Refetch to update list
        await fetchCalculations();

        return result.calculation;
    }, [fetchCalculations]);

    return {
        calculations,
        loading,
        error,
        saveCalculation,
        deleteCalculation,
        updateCalculation,
        refetch: fetchCalculations,
    };
}
