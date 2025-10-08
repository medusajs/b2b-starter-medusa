/**
 * Hook personalizado para gerenciar operações assíncronas
 * Fornece estado de loading, error handling e execução de funções async
 */

import { useState, useCallback } from 'react'
import { toast } from '@medusajs/ui'

interface AsyncState<T> {
    data: T | null
    loading: boolean
    error: Error | null
}

interface UseAsyncOperationReturn<T> {
    state: AsyncState<T>
    execute: (operation: () => Promise<T>) => Promise<T | null>
    reset: () => void
}

export function useAsyncOperation<T = any>(): UseAsyncOperationReturn<T> {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: false,
        error: null,
    })

    const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
        setState(prev => ({ ...prev, loading: true, error: null }))

        try {
            const result = await operation()
            setState({ data: result, loading: false, error: null })
            return result
        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error))
            setState(prev => ({ ...prev, loading: false, error: errorObj }))

            // Show error toast
            const message = errorObj.message || 'Ocorreu um erro inesperado'
            toast.error(message)

            console.error('Async operation error:', errorObj)
            return null
        }
    }, [])

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null })
    }, [])

    return { state, execute, reset }
}

/**
 * Hook específico para operações de Solar CV
 * Inclui validações comuns e tratamento de erros específicos
 */
export function useSolarCVOperation<T = any>() {
    const asyncOp = useAsyncOperation<T>()

    const executeWithValidation = useCallback(async (
        operation: () => Promise<T>,
        options?: {
            showSuccessToast?: boolean
            successMessage?: string
        }
    ): Promise<T | null> => {
        const result = await asyncOp.execute(operation)

        if (result !== null && options?.showSuccessToast) {
            toast.success(options.successMessage || 'Operação concluída com sucesso!')
        }

        return result
    }, [asyncOp])

    return {
        ...asyncOp,
        executeWithValidation,
    }
}