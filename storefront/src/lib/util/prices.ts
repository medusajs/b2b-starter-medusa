/**
 * Funções utilitárias para formatação de preços
 */

type Region = {
    currency_code: string;
};

type FormatAmountInput = {
    amount: number;
    region: Region;
    includeTaxes?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    locale?: string;
};

/**
 * Formata um valor monetário de acordo com a região
 * @param amount - Valor em centavos (ex: 1000 = R$ 10,00)
 * @param region - Região com código de moeda
 * @param locale - Locale para formatação (padrão: pt-BR)
 */
export function formatAmount({
    amount,
    region,
    locale = "pt-BR",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
}: FormatAmountInput): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: region.currency_code.toUpperCase(),
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(amount / 100);
}

/**
 * Converte valor de centavos para unidade decimal
 */
export function convertToDecimal(amount: number): number {
    return amount / 100;
}

/**
 * Converte valor decimal para centavos
 */
export function convertToCents(amount: number): number {
    return Math.round(amount * 100);
}
