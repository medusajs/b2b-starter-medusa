/**
 * Client Helper para consumir APIs de Solar Computer Vision
 * Use este helper no storefront para funcionalidades de CV solar
 */

export type SolarDetectionResult = {
    panels: Array<{
        id: string
        bbox: [number, number, number, number]
        confidence: number
        area: number
    }>
    totalPanels: number
    totalArea: number
    processingTime: number
    irradiance?: number
}

export type ThermalAnalysisResult = {
    anomalies: Array<{
        id: string
        type: 'hotspot' | 'cold_cell' | 'shading' | 'soiling' | 'cracking' | 'delamination'
        severity: 'low' | 'medium' | 'high' | 'critical'
        confidence: number
        location: [number, number]
        temperature: number
        description: string
    }>
    overallHealth: 'good' | 'fair' | 'poor' | 'critical'
    recommendations: string[]
    processingTime: number
    irradiance?: number
}

export type PhotogrammetryResult = {
    roofModel: {
        area: number
        perimeter: number
        orientation: number
        tilt: number
        geometry: {
            type: 'Polygon'
            coordinates: number[][][]
        }
    }
    processingTime: number
    quality: 'good' | 'fair' | 'poor'
    recommendations: string[]
    irradiance?: number
}

export type SolarCVAPIResponse<T> = {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: string
}

/**
 * Classe principal para integração com APIs de Solar CV
 */
export class SolarCVClient {
    private baseURL: string

    constructor(baseURL = '/api/store') {
        this.baseURL = baseURL
    }

    /**
     * Detectar painéis solares em imagem de satélite
     */
    async detectPanels(imageFile: File): Promise<SolarDetectionResult> {
        const formData = new FormData()
        formData.append('image', imageFile)

        const response = await this.makeRequest<SolarDetectionResult>(
            `${this.baseURL}/solar-detection`,
            {
                method: 'POST',
                body: formData,
            }
        )

        return response
    }

    /**
     * Analisar imagem térmica para detectar anomalias
     */
    async analyzeThermal(thermalImage: File): Promise<ThermalAnalysisResult> {
        const formData = new FormData()
        formData.append('thermalImage', thermalImage)

        const response = await this.makeRequest<ThermalAnalysisResult>(
            `${this.baseURL}/thermal-analysis`,
            {
                method: 'POST',
                body: formData,
            }
        )

        return response
    }

    /**
     * Processar imagens para fotogrametria 3D
     */
    async processPhotogrammetry(images: File[]): Promise<PhotogrammetryResult> {
        if (images.length < 5) {
            throw new Error('Pelo menos 5 imagens são necessárias para fotogrametria')
        }

        if (images.length > 10) {
            throw new Error('Máximo de 10 imagens permitidas')
        }

        const formData = new FormData()
        images.forEach((file, index) => {
            formData.append('images', file)
        })

        const response = await this.makeRequest<PhotogrammetryResult>(
            `${this.baseURL}/photogrammetry`,
            {
                method: 'POST',
                body: formData,
            }
        )

        return response
    }

    /**
     * Método genérico para fazer requests HTTP
     */
    private async makeRequest<T>(
        url: string,
        options: RequestInit
    ): Promise<T> {
        try {
            const response = await fetch(url, {
                ...options,
                // Não definir Content-Type para FormData (browser define automaticamente)
                ...(options.body instanceof FormData ? {} : {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers,
                    },
                }),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
            }

            const result: SolarCVAPIResponse<T> = await response.json()

            if (!result.success) {
                throw new Error(result.message || result.error || 'Request failed')
            }

            if (!result.data) {
                throw new Error('No data returned from API')
            }

            return result.data
        } catch (error) {
            console.error('Solar CV API Error:', error)
            throw error
        }
    }
}

// Instância singleton para uso global
export const solarCVClient = new SolarCVClient()

/**
 * Hook React para usar Solar CV APIs no client-side
 */
export function useSolarCVAPI() {
    return {
        detectPanels: solarCVClient.detectPanels.bind(solarCVClient),
        analyzeThermal: solarCVClient.analyzeThermal.bind(solarCVClient),
        processPhotogrammetry: solarCVClient.processPhotogrammetry.bind(solarCVClient),
    }
}

/**
 * Utilitários para validação de arquivos
 */
export const SolarCVValidators = {
    /**
     * Validar se arquivo é uma imagem
     */
    isValidImage(file: File): boolean {
        return file.type.startsWith('image/')
    },

    /**
     * Validar tamanho do arquivo (máx 10MB)
     */
    isValidSize(file: File, maxSizeMB = 10): boolean {
        return file.size <= maxSizeMB * 1024 * 1024
    },

    /**
     * Validar múltiplos arquivos para fotogrametria
     */
    validatePhotogrammetryFiles(files: File[]): { valid: boolean; errors: string[] } {
        const errors: string[] = []

        if (files.length < 5) {
            errors.push('Pelo menos 5 imagens são necessárias')
        }

        if (files.length > 10) {
            errors.push('Máximo de 10 imagens permitidas')
        }

        files.forEach((file, index) => {
            if (!this.isValidImage(file)) {
                errors.push(`Arquivo ${index + 1} não é uma imagem válida`)
            }

            if (!this.isValidSize(file)) {
                errors.push(`Arquivo ${index + 1} é muito grande (máx. 10MB)`)
            }
        })

        return {
            valid: errors.length === 0,
            errors
        }
    }
}

/**
 * Tipos de erro comuns
 */
export class SolarCVError extends Error {
    constructor(
        message: string,
        public code: string,
        public statusCode?: number
    ) {
        super(message)
        this.name = 'SolarCVError'
    }
}

export const SolarCVErrorCodes = {
    INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    INSUFFICIENT_IMAGES: 'INSUFFICIENT_IMAGES',
    PROCESSING_FAILED: 'PROCESSING_FAILED',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
} as const