/**
 * 📊 Solar Calculator Analytics Tracking
 * Integração com PostHog para rastreamento de eventos da calculadora solar
 */

import type { 
  SolarCalculationInput, 
  SolarCalculationOutput,
  KitRecomendado 
} from '@/types/solar-calculator';

declare global {
  interface Window {
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
      __loaded?: boolean;
    };
  }
}

/**
 * Verifica se PostHog está disponível
 */
function isPostHogAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.posthog !== undefined && 
         window.posthog.__loaded === true;
}

/**
 * Rastreia conclusão de cálculo solar
 */
export function trackCalculation(
  output: SolarCalculationOutput,
  input: SolarCalculationInput
): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_calculation_complete', {
      // Dimensionamento
      system_size_kwp: output.dimensionamento.kwp_proposto,
      num_panels: output.dimensionamento.numero_paineis,
      inverter_power_kw: output.dimensionamento.potencia_inversor_kw,
      area_required_m2: output.dimensionamento.area_necessaria_m2,
      annual_generation_kwh: output.dimensionamento.geracao_anual_kwh,
      oversizing_ratio: output.dimensionamento.oversizing_ratio,
      
      // Financeiro
      total_investment: output.financeiro.capex.total_brl,
      equipment_cost: output.financeiro.capex.equipamentos_brl,
      installation_cost: output.financeiro.capex.instalacao_brl,
      monthly_savings: output.financeiro.economia.mensal_brl,
      annual_savings: output.financeiro.economia.anual_brl,
      payback_years: output.financeiro.retorno.payback_simples_anos,
      irr_percent: output.financeiro.retorno.tir_percentual,
      npv: output.financeiro.retorno.vpl_brl,
      
      // Input do usuário
      consumption_kwh: input.consumo_kwh_mes,
      state: input.uf,
      tariff: input.tarifa_energia_kwh,
      roof_type: input.tipo_telhado,
      system_type: input.tipo_sistema,
      oversizing_target: input.oversizing_target,
      
      // Kits recomendados
      num_kits_recommended: output.kits_recomendados.length,
      best_kit_match_score: output.kits_recomendados[0]?.match_score,
      
      // Timestamp
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track solar calculation:', error);
  }
}

/**
 * Rastreia seleção de kit solar
 */
export function trackKitSelection(kit: KitRecomendado): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_kit_selected', {
      kit_id: kit.kit_id,
      kit_name: kit.nome,
      power_kwp: kit.potencia_kwp,
      price_brl: kit.preco_brl,
      match_score: kit.match_score,
      match_reasons: kit.match_reasons,
      
      // Componentes
      panel_brand: kit.componentes.paineis[0]?.marca,
      panel_power_w: kit.componentes.paineis[0]?.potencia_w,
      panel_quantity: kit.componentes.paineis[0]?.quantidade,
      inverter_brand: kit.componentes.inversores[0]?.marca,
      inverter_power_kw: kit.componentes.inversores[0]?.potencia_kw,
      has_batteries: kit.componentes.baterias && kit.componentes.baterias.length > 0,
      
      // Disponibilidade
      in_stock: kit.disponibilidade.em_estoque,
      delivery_days: kit.disponibilidade.prazo_entrega_dias,
      distribution_center: kit.disponibilidade.centro_distribuicao,
      
      // Timestamp
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track kit selection:', error);
  }
}

/**
 * Rastreia solicitação de cotação
 */
export function trackQuoteRequest(data: {
  system_size: number;
  investment: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
}): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_quote_requested', {
      system_size_kwp: data.system_size,
      total_investment: data.investment,
      has_contact_info: !!(data.customer_email || data.customer_phone),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track quote request:', error);
  }
}

/**
 * Rastreia adição de kit ao carrinho
 */
export function trackAddKitToCart(kit: KitRecomendado): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_kit_added_to_cart', {
      kit_id: kit.kit_id,
      kit_name: kit.nome,
      power_kwp: kit.potencia_kwp,
      price_brl: kit.preco_brl,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track add to cart:', error);
  }
}

/**
 * Rastreia salvamento de cálculo
 */
export function trackSaveCalculation(calculationId: string): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_calculation_saved', {
      calculation_id: calculationId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track save calculation:', error);
  }
}

/**
 * Rastreia comparação de cálculos
 */
export function trackCompareCalculations(calculationIds: string[]): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_calculations_compared', {
      calculation_ids: calculationIds,
      num_calculations: calculationIds.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track compare calculations:', error);
  }
}

/**
 * Rastreia compartilhamento de cálculo
 */
export function trackShareCalculation(calculationId: string, method: 'link' | 'native'): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_calculation_shared', {
      calculation_id: calculationId,
      share_method: method,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track share calculation:', error);
  }
}

/**
 * Rastreia interação com integração de CV
 */
export function trackCVIntegration(data: {
  has_analysis: boolean;
  fields_filled: number;
  total_fields: number;
}): void {
  if (!isPostHogAvailable()) return;

  try {
    window.posthog!.capture('solar_cv_integration_used', {
      has_analysis: data.has_analysis,
      fields_filled: data.fields_filled,
      total_fields: data.total_fields,
      completion_rate: data.fields_filled / data.total_fields,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to track CV integration:', error);
  }
}
