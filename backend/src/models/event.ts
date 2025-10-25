import { model } from "@medusajs/framework/utils"

/**
 * Event Model
 * Modelo para tracking de eventos e analytics
 * 
 * CRÍTICO: Este modelo permite rastreamento completo da jornada do cliente,
 * análise de conversão, otimização de funil e decisões baseadas em dados.
 * 
 * Baseado em padrões de analytics (GA4, Segment, Mixpanel)
 * Compliance: LGPD-compliant com anonimização de dados sensíveis
 */
export const Event = model.define("event", {
    id: model.id({ prefix: "evt" }).primaryKey(),

    // ==========================================
    // Identificação
    // ==========================================

    customer_id: model.text().nullable(),         // ID do customer (se autenticado)
    session_id: model.text(),                     // ID da sessão (obrigatório)
    anonymous_id: model.text().nullable(),        // ID anônimo (cookie)

    // ==========================================
    // Evento
    // ==========================================

    event_name: model.text(),                     // Ex: "page_view", "add_to_cart", "purchase"
    event_category: model.text(),                 // Ex: "engagement", "ecommerce", "navigation"
    event_action: model.text().nullable(),        // Ex: "click", "submit", "scroll"
    event_label: model.text().nullable(),         // Ex: "buy_button", "header_menu"
    event_value: model.number().nullable(),       // Valor numérico associado

    // ==========================================
    // Contexto da Página
    // ==========================================

    page_url: model.text(),
    page_path: model.text().nullable(),           // Ex: "/products/solar-panels"
    page_title: model.text().nullable(),
    page_referrer: model.text().nullable(),

    // ==========================================
    // Device & Browser
    // ==========================================

    user_agent: model.text().nullable(),
    device_type: model.text().nullable(),         // mobile, tablet, desktop
    device_brand: model.text().nullable(),        // Apple, Samsung, etc.
    device_model: model.text().nullable(),
    browser: model.text().nullable(),             // Chrome, Safari, Firefox
    browser_version: model.text().nullable(),
    os: model.text().nullable(),                  // Windows, iOS, Android
    os_version: model.text().nullable(),
    screen_resolution: model.text().nullable(),   // 1920x1080
    viewport_size: model.text().nullable(),       // 1440x900

    // ==========================================
    // Geo & Network
    // ==========================================

    ip_hash: model.text().nullable(),             // SHA-256 hash (LGPD)
    country: model.text().nullable(),
    region: model.text().nullable(),
    city: model.text().nullable(),
    timezone: model.text().nullable(),            // America/Sao_Paulo
    locale: model.text().nullable(),              // pt-BR

    // ==========================================
    // Marketing & Attribution
    // ==========================================

    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),
    utm_term: model.text().nullable(),
    utm_content: model.text().nullable(),
    gclid: model.text().nullable(),               // Google Click ID
    fbclid: model.text().nullable(),              // Facebook Click ID

    // ==========================================
    // E-commerce (se aplicável)
    // ==========================================

    cart_id: model.text().nullable(),
    product_id: model.text().nullable(),
    product_sku: model.text().nullable(),
    product_name: model.text().nullable(),
    product_category: model.text().nullable(),
    product_price: model.number().nullable(),
    product_quantity: model.number().nullable(),

    order_id: model.text().nullable(),
    order_total: model.number().nullable(),
    order_currency: model.text().nullable(),

    // ==========================================
    // Engagement
    // ==========================================

    scroll_depth: model.number().nullable(),      // 0-100%
    time_on_page: model.number().nullable(),      // Segundos
    clicks_count: model.number().nullable(),
    form_id: model.text().nullable(),             // ID do formulário interagido

    // ==========================================
    // Search & Content
    // ==========================================

    search_term: model.text().nullable(),         // Termo de busca
    search_results_count: model.number().nullable(),
    content_id: model.text().nullable(),          // ID do conteúdo visualizado
    content_type: model.text().nullable(),        // article, product, video

    // ==========================================
    // Custom Properties
    // ==========================================

    properties: model.json().nullable(),          // Propriedades customizadas

    // Exemplos de propriedades customizadas:
    // {
    //   calculator_consumption: 500,
    //   calculator_uf: "SP",
    //   helio_question: "Quanto custa um sistema solar?",
    //   lead_source: "calculator",
    //   ab_test_variant: "B"
    // }

    // ==========================================
    // Performance
    // ==========================================

    page_load_time: model.number().nullable(),    // Milissegundos
    server_response_time: model.number().nullable(),

    // ==========================================
    // A/B Testing
    // ==========================================

    experiment_id: model.text().nullable(),
    experiment_variant: model.text().nullable(),

    // ==========================================
    // Error Tracking
    // ==========================================

    error_message: model.text().nullable(),
    error_stack: model.text().nullable(),
    error_type: model.text().nullable(),

    // ==========================================
    // Timestamps
    // ==========================================

    created_at: model.dateTime(),                 // Quando evento ocorreu
    received_at: model.dateTime().nullable(),     // Quando servidor recebeu
})

export default Event

/**
 * Event Categories (Padrões)
 * 
 * - page_view: Visualização de página
 * - engagement: Interação com conteúdo
 * - ecommerce: Eventos de e-commerce
 * - navigation: Navegação no site
 * - form: Interação com formulários
 * - search: Buscas
 * - social: Compartilhamentos sociais
 * - video: Interação com vídeos
 * - download: Downloads
 * - error: Erros
 * - performance: Métricas de performance
 */

/**
 * Event Names Comuns (Exemplos)
 * 
 * Pageviews:
 * - page_view
 * - homepage_view
 * - product_view
 * - category_view
 * 
 * E-commerce:
 * - add_to_cart
 * - remove_from_cart
 * - begin_checkout
 * - add_payment_info
 * - add_shipping_info
 * - purchase
 * - refund
 * 
 * Engagement:
 * - click
 * - scroll
 * - time_on_page
 * - video_play
 * - video_complete
 * - share
 * 
 * Forms:
 * - form_start
 * - form_submit
 * - form_error
 * - lead_generated
 * 
 * Search:
 * - search
 * - search_results
 * - filter_applied
 * 
 * Calculator:
 * - calculator_started
 * - calculator_completed
 * - calculator_result_viewed
 * 
 * Helio AI:
 * - helio_question_asked
 * - helio_answer_received
 * - helio_product_recommended
 */
