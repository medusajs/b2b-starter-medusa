/**
 * Shared Utilities for Catalog Normalization
 * 
 * Funções compartilhadas entre os scripts de normalização
 */

/**
 * Calcula similaridade entre duas strings usando distância de Levenshtein
 * @returns Valor entre 0 e 1 (1 = idêntico)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1.0;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;

    const distance = levenshteinDistance(s1, s2);
    return 1 - distance / maxLen;
}

/**
 * Calcula distância de Levenshtein entre duas strings
 */
export function levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= s2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= s1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2[i - 1] === s1[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[s2.length][s1.length];
}

/**
 * Sanitiza string para uso em SKU (remove caracteres especiais)
 */
export function sanitizeForSKU(input: string): string {
    return input
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 20);
}

/**
 * Calcula mediana de um array de números
 */
export function calculateMedian(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

/**
 * Calcula desvio padrão de um array de números
 */
export function calculateStdDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;

    const avg = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - avg, 2));
    const variance = squaredDiffs.reduce((sum, n) => sum + n, 0) / numbers.length;

    return Math.sqrt(variance);
}

/**
 * Formata preço em BRL
 */
export function formatPriceBRL(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
}

/**
 * Extrai potência de uma string (suporta W e kW)
 */
export function extractPowerFromString(str: string): number | null {
    // Tenta extrair kW
    const kwMatch = str.match(/(\d+(?:\.\d+)?)\s*kW/i);
    if (kwMatch) {
        return parseFloat(kwMatch[1]) * 1000;
    }

    // Tenta extrair W
    const wMatch = str.match(/(\d+(?:\.\d+)?)\s*W/i);
    if (wMatch) {
        return parseFloat(wMatch[1]);
    }

    return null;
}

/**
 * Extrai voltagem de uma string
 */
export function extractVoltageFromString(str: string): number | null {
    const match = str.match(/(\d+)\s*V/i);
    return match ? parseInt(match[1]) : null;
}

/**
 * Gera timestamp no formato ISO
 */
export function timestamp(): string {
    return new Date().toISOString();
}

/**
 * Sleep assíncrono (útil para rate limiting)
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
