/**
 * React hooks para gerenciamento de imagens de produtos
 * Gerencia upload, reordenação e remoção
 */

"use client"

import { useState, useCallback } from "react"
import {
    attachProductImages,
    reorderProductImages,
    removeProductImages,
    presignUpload,
    type AttachImagesRequest,
    type ReorderImagesRequest,
    type RemoveImagesRequest,
} from "@/lib/api/internal"

interface MutationState {
    isLoading: boolean
    error: Error | null
    isSuccess: boolean
}

/**
 * Hook para anexar imagens a um produto
 */
export const useAttachImages = (productId: string) => {
    const [state, setState] = useState<MutationState>({
        isLoading: false,
        error: null,
        isSuccess: false,
    })

    const mutate = useCallback(
        async (body: AttachImagesRequest) => {
            setState({ isLoading: true, error: null, isSuccess: false })
            try {
                await attachProductImages(productId, body)
                setState({ isLoading: false, error: null, isSuccess: true })
            } catch (error) {
                setState({
                    isLoading: false,
                    error: error as Error,
                    isSuccess: false,
                })
            }
        },
        [productId]
    )

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, isSuccess: false })
    }, [])

    return {
        ...state,
        mutate,
        reset,
    }
}

/**
 * Hook para reordenar imagens de um produto
 */
export const useReorderImages = (productId: string) => {
    const [state, setState] = useState<MutationState>({
        isLoading: false,
        error: null,
        isSuccess: false,
    })

    const mutate = useCallback(
        async (body: ReorderImagesRequest) => {
            setState({ isLoading: true, error: null, isSuccess: false })
            try {
                await reorderProductImages(productId, body)
                setState({ isLoading: false, error: null, isSuccess: true })
            } catch (error) {
                setState({
                    isLoading: false,
                    error: error as Error,
                    isSuccess: false,
                })
            }
        },
        [productId]
    )

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, isSuccess: false })
    }, [])

    return {
        ...state,
        mutate,
        reset,
    }
}

/**
 * Hook para remover imagens de um produto
 */
export const useRemoveImages = (productId: string) => {
    const [state, setState] = useState<MutationState>({
        isLoading: false,
        error: null,
        isSuccess: false,
    })

    const mutate = useCallback(
        async (body: RemoveImagesRequest) => {
            setState({ isLoading: true, error: null, isSuccess: false })
            try {
                await removeProductImages(productId, body)
                setState({ isLoading: false, error: null, isSuccess: true })
            } catch (error) {
                setState({
                    isLoading: false,
                    error: error as Error,
                    isSuccess: false,
                })
            }
        },
        [productId]
    )

    const reset = useCallback(() => {
        setState({ isLoading: false, error: null, isSuccess: false })
    }, [])

    return {
        ...state,
        mutate,
        reset,
    }
}

/**
 * Hook para upload direto ao S3 com pré-assinatura
 */
export const usePresignedUpload = () => {
    const [state, setState] = useState<MutationState & { fileUrl?: string }>({
        isLoading: false,
        error: null,
        isSuccess: false,
        fileUrl: undefined,
    })

    const upload = useCallback(async (file: File) => {
        setState({ isLoading: true, error: null, isSuccess: false })
        try {
            // 1. Obter URL pré-assinada
            const presign = await presignUpload(file.name, file.type)

            // 2. Upload direto ao S3
            const formData = new FormData()
            if (presign.data.fields) {
                Object.entries(presign.data.fields).forEach(([key, value]) => {
                    formData.append(key, value)
                })
            }
            formData.append("file", file)

            const uploadRes = await fetch(presign.data.url, {
                method: "POST",
                body: formData,
            })

            if (!uploadRes.ok) {
                throw new Error("Failed to upload file to S3")
            }

            setState({
                isLoading: false,
                error: null,
                isSuccess: true,
                fileUrl: presign.data.file_url,
            })

            return presign.data.file_url
        } catch (error) {
            setState({
                isLoading: false,
                error: error as Error,
                isSuccess: false,
            })
            return null
        }
    }, [])

    const reset = useCallback(() => {
        setState({
            isLoading: false,
            error: null,
            isSuccess: false,
            fileUrl: undefined,
        })
    }, [])

    return {
        ...state,
        upload,
        reset,
    }
}
