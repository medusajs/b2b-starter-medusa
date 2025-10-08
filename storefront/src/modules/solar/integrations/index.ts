/**
 * 🔗 Solar Module - Integrations
 * Funções de integração com outros módulos
 */

import type { KitRecomendado, SolarCalculationOutput } from '@/types/solar-calculator';

// ============================================================================
// Product Integration
// ============================================================================

/**
 * Converte kit recomendado em produto para adicionar ao carrinho
 */
export interface ProductForCart {
    productId: string;
    variantId?: string;
    quantity: number;
    metadata?: {
        source: 'solar_calculator';
        calculation_id?: string;
        kwp?: number;
    };
}

export function kitToCartProduct(kit: KitRecomendado): ProductForCart {
    return {
        productId: kit.product_id || kit.kit_id,
        quantity: 1,
        metadata: {
            source: 'solar_calculator',
            kwp: kit.potencia_kwp,
        },
    };
}

/**
 * Gera URL do produto a partir do kit
 */
export function getKitProductUrl(kit: KitRecomendado, countryCode: string = 'br'): string {
    // Normalizar kit_id para handle (slug)
    const handle = kit.kit_id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `/${countryCode}/products/${handle}`;
}

// ============================================================================
// Quote Integration
// ============================================================================

/**
 * Estrutura de cotação a partir do cálculo solar
 */
export interface SolarQuoteData {
    customer_email?: string;
    customer_name?: string;
    items: Array<{
        kit_id: string;
        kit_name: string;
        quantity: number;
        price: number;
    }>;
    calculation_details: {
        consumo_kwh_mes: number;
        uf: string;
        kwp_proposto: number;
        investimento_total: number;
        payback_anos: number;
        economia_mensal: number;
    };
    notes?: string;
}

export function calculationToQuote(
    calculation: SolarCalculationOutput,
    selectedKitId?: string
): SolarQuoteData {
    const selectedKit = selectedKitId
        ? calculation.kits_recomendados.find((k) => k.kit_id === selectedKitId)
        : calculation.kits_recomendados[0];

    if (!selectedKit) {
        throw new Error('Nenhum kit selecionado para cotação');
    }

    return {
        items: [
            {
                kit_id: selectedKit.kit_id,
                kit_name: selectedKit.nome,
                quantity: 1,
                price: selectedKit.preco_brl,
            },
        ],
        calculation_details: {
            consumo_kwh_mes: 0, // TODO: Pegar do input original
            uf: calculation.dados_localizacao.estado,
            kwp_proposto: calculation.dimensionamento.kwp_proposto,
            investimento_total: calculation.financeiro.capex.total_brl,
            payback_anos: calculation.financeiro.retorno.payback_simples_anos,
            economia_mensal: calculation.financeiro.economia.mensal_brl,
        },
        notes: `Cotação gerada a partir da calculadora solar YSH.\n\nSistema dimensionado para ${calculation.dados_localizacao.estado} com ${calculation.dimensionamento.kwp_proposto.toFixed(2)} kWp.`,
    };
}

// ============================================================================
// Solar CV Integration
// ============================================================================

/**
 * Dados de análise de imagem para alimentar calculadora
 */
export interface SolarCVAnalysis {
    area_disponivel_m2?: number;
    orientacao?: 'norte' | 'sul' | 'leste' | 'oeste';
    inclinacao_graus?: number;
    tipo_telhado?: 'ceramico' | 'metalico' | 'laje' | 'fibrocimento';
    sombreamento_percentual?: number;
    numero_paineis_detectados?: number;
}

export function cvAnalysisToCalculatorInput(
    analysis: SolarCVAnalysis,
    baseInput: any
): any {
    return {
        ...baseInput,
        area_disponivel_m2: analysis.area_disponivel_m2,
        orientacao: analysis.orientacao,
        inclinacao_graus: analysis.inclinacao_graus,
        tipo_telhado: analysis.tipo_telhado,
    };
}

// ============================================================================
// Analytics Integration
// ============================================================================

/**
 * Eventos de analytics para rastreamento
 */
export interface SolarAnalyticsEvent {
    event: string;
    properties: Record<string, any>;
}

export function trackCalculation(calculation: SolarCalculationOutput): SolarAnalyticsEvent {
    return {
        event: 'solar_calculation_completed',
        properties: {
            kwp_proposto: calculation.dimensionamento.kwp_proposto,
            investimento_total: calculation.financeiro.capex.total_brl,
            payback_anos: calculation.financeiro.retorno.payback_simples_anos,
            estado: calculation.dados_localizacao.estado,
            numero_kits: calculation.kits_recomendados.length,
            top_kit_score: calculation.kits_recomendados[0]?.match_score || 0,
        },
    };
}

export function trackKitSelection(kit: KitRecomendado): SolarAnalyticsEvent {
    return {
        event: 'solar_kit_selected',
        properties: {
            kit_id: kit.kit_id,
            kit_name: kit.nome,
            kwp: kit.potencia_kwp,
            price: kit.preco_brl,
            match_score: kit.match_score,
        },
    };
}

export function trackQuoteRequest(quoteData: SolarQuoteData): SolarAnalyticsEvent {
    return {
        event: 'solar_quote_requested',
        properties: {
            kit_id: quoteData.items[0]?.kit_id,
            kwp: quoteData.calculation_details.kwp_proposto,
            investimento: quoteData.calculation_details.investimento_total,
            estado: quoteData.calculation_details.uf,
        },
    };
}

// ============================================================================
// Lead Quote Integration
// ============================================================================

export interface SolarLeadData {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    state: string;
    monthly_consumption?: number;
    estimated_investment?: number;
    notes?: string;
    source: 'solar_calculator';
}

export function calculationToLead(
    calculation: SolarCalculationOutput,
    contactInfo: { name: string; email: string; phone?: string; company?: string }
): SolarLeadData {
    return {
        ...contactInfo,
        state: calculation.dados_localizacao.estado,
        monthly_consumption: calculation.dimensionamento.geracao_anual_kwh / 12,
        estimated_investment: calculation.financeiro.capex.total_brl,
        notes: `Lead gerado via calculadora solar.\n\nSistema: ${calculation.dimensionamento.kwp_proposto.toFixed(2)} kWp\nPayback: ${calculation.financeiro.retorno.payback_simples_anos.toFixed(1)} anos\nEconomia mensal: R$ ${calculation.financeiro.economia.mensal_brl.toFixed(2)}`,
        source: 'solar_calculator',
    };
}

// ============================================================================
// URL Helpers
// ============================================================================

export function getSolarCalculatorUrl(countryCode: string = 'br'): string {
    return `/${countryCode}/dimensionamento`;
}

export function getSolarCVUrl(countryCode: string = 'br'): string {
    return `/${countryCode}/solar-cv`;
}

export function getProductsUrl(countryCode: string = 'br', category?: string): string {
    if (category) {
        return `/${countryCode}/produtos/${category}`;
    }
    return `/${countryCode}/produtos`;
}

export function getQuotesUrl(countryCode: string = 'br'): string {
    return `/${countryCode}/account/quotes`;
}
