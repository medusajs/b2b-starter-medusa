import { model } from "@medusajs/framework/utils"

/**
 * CatalogAccessLog Model
 * 
 * PURPOSE:
 * Rastreia acesso a produtos do catálogo interno para analytics de produto,
 * recomendações personalizadas, e otimização de estoque.
 * 
 * BUSINESS IMPACT:
 * - Recomendações personalizadas (produtos mais vistos)
 * - Otimização de estoque (quais produtos têm mais demanda)
 * - Pricing strategy (produtos populares vs conversão)
 * - Merchandising (posicionamento de produtos)
 * 
 * DIFFERENT from Event:
 * - Event: Generic analytics (page views, clicks, etc)
 * - CatalogAccessLog: PRODUCT-SPECIFIC analytics (SKU, category, filters)
 * 
 * EXAMPLE:
 * ```typescript
 * // Cliente visualiza produto
 * const log = catalogLogRepository.create({
 *   session_id: 'sess_abc',
 *   action_type: 'product_view',
 *   product_id: 'prod_123',
 *   product_sku: 'INV-FRONIUS-5KW',
 *   product_name: 'Inversor Fronius Primo 5kW',
 *   product_category: 'Inversores',
 *   product_price_brl: 8500,
 *   time_spent_seconds: 45
 * })
 * ```
 */
export const CatalogAccessLog = model.define("catalog_access_log", {
    id: model.id({ prefix: "cat_log" }).primaryKey(),

    // ===========================
    // IDENTIFICAÇÃO
    // ===========================

    customer_id: model.text().nullable(),
    session_id: model.text(),
    anonymous_id: model.text().nullable(),

    // ===========================
    // AÇÃO
    // ===========================

    action_type: model.enum([
        'product_view',
        'product_click',
        'category_view',
        'search',
        'filter',
        'add_to_cart',
        'remove_from_cart',
        'wishlist_add',
        'compare_add',
        'download_spec'
    ]),
    
    product_id: model.text().nullable(),
    product_sku: model.text().nullable(),
    product_name: model.text().nullable(),
    product_category: model.text().nullable(),
    product_subcategory: model.text().nullable(),
    product_brand: model.text().nullable(),
    product_price_brl: model.bigNumber().nullable(),
    product_availability: model.enum(['in_stock', 'out_of_stock', 'pre_order', 'discontinued']).nullable(),

    // ===========================
    // CONTEXTO DA VISUALIZAÇÃO
    // ===========================

    view_context: model.enum(['listing', 'detail', 'search', 'recommendation', 'related', 'cart', 'quote']).nullable(),
    search_term: model.text().nullable(),
    search_results_count: model.number().nullable(),
    search_result_position: model.number().nullable(),
    applied_filters: model.json().nullable(),
    total_results_with_filters: model.number().nullable(),

    // ===========================
    // ENGAJAMENTO
    // ===========================

    time_spent_seconds: model.number().nullable(),
    scroll_depth_percentage: model.number().nullable(),
    clicked_image: model.boolean().default(false),
    clicked_video: model.boolean().default(false),
    downloaded_datasheet: model.boolean().default(false),
    downloaded_manual: model.boolean().default(false),
    downloaded_certification: model.boolean().default(false),
    clicked_add_to_cart: model.boolean().default(false),
    clicked_quote_request: model.boolean().default(false),
    quantity_viewed: model.number().nullable(),

    // ===========================
    // NAVEGAÇÃO
    // ===========================

    page_url: model.text(),
    page_path: model.text().nullable(),
    referrer_url: model.text().nullable(),
    referrer_type: model.enum(['internal', 'search_engine', 'social', 'direct', 'email', 'ad']).nullable(),
    previous_product_id: model.text().nullable(),
    next_product_id: model.text().nullable(),

    // ===========================
    // DEVICE
    // ===========================

    user_agent: model.text().nullable(),
    device_type: model.enum(['mobile', 'tablet', 'desktop']).nullable(),
    browser: model.text().nullable(),
    os: model.text().nullable(),
    screen_resolution: model.text().nullable(),

    // ===========================
    // GEO
    // ===========================

    ip_hash: model.text().nullable(),
    country: model.text().nullable(),
    region: model.text().nullable(),
    city: model.text().nullable(),

    // ===========================
    // MARKETING
    // ===========================

    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),
    utm_content: model.text().nullable(),
    gclid: model.text().nullable(),
    fbclid: model.text().nullable(),

    // ===========================
    // CONVERSÃO
    // ===========================

    led_to_cart: model.boolean().default(false),
    cart_id: model.text().nullable(),
    led_to_quote: model.boolean().default(false),
    quote_id: model.text().nullable(),
    led_to_purchase: model.boolean().default(false),
    order_id: model.text().nullable(),
    conversion_value_brl: model.bigNumber().nullable(),
    time_to_conversion_minutes: model.number().nullable(),

    // ===========================
    // RECOMENDAÇÕES
    // ===========================

    recommendation_source: model.enum(['trending', 'personalized', 'similar', 'frequently_bought', 'recently_viewed', 'ai_helio']).nullable(),
    recommendation_algorithm: model.text().nullable(),
    recommendation_score: model.number().nullable(),
    was_recommended: model.boolean().default(false),

    // ===========================
    // A/B TESTING
    // ===========================

    experiment_id: model.text().nullable(),
    experiment_variant: model.text().nullable(),

    // ===========================
    // METADATA
    // ===========================

    source: model.enum(['web', 'app', 'api']).default('web'),
    custom_properties: model.json().nullable(),

    // ===========================
    // TIMESTAMPS
    // ===========================

    created_at: model.dateTime(),
    session_started_at: model.dateTime().nullable(),
    session_ended_at: model.dateTime().nullable(),
})

export default CatalogAccessLog

/**
 * USAGE GUIDE:
 * 
 * 1. LOG PRODUCT VIEW:
 * ```typescript
 * POST /store/catalog/log
 * {
 *   action_type: 'product_view',
 *   product_id: 'prod_123',
 *   view_context: 'listing',
 *   session_id: 'sess_abc'
 * }
 * ```
 * 
 * 2. LOG SEARCH:
 * ```typescript
 * POST /store/catalog/log
 * {
 *   action_type: 'search',
 *   search_term: 'inversor 5kw',
 *   search_results_count: 12
 * }
 * ```
 * 
 * 3. LOG ADD TO CART:
 * ```typescript
 * POST /store/catalog/log
 * {
 *   action_type: 'add_to_cart',
 *   product_id: 'prod_123',
 *   quantity_viewed: 2,
 *   cart_id: 'cart_456'
 * }
 * ```
 * 
 * 4. ANALYTICS QUERIES:
 * 
 * ```sql
 * -- Top 10 produtos mais vistos (últimos 30 dias)
 * SELECT product_id, product_name, COUNT(*) as views
 * FROM catalog_access_log
 * WHERE action_type = 'product_view'
 *   AND created_at > NOW() - INTERVAL '30 days'
 * GROUP BY product_id, product_name
 * ORDER BY views DESC
 * LIMIT 10;
 * 
 * -- Taxa de conversão por produto
 * SELECT 
 *   product_id,
 *   product_name,
 *   COUNT(*) as views,
 *   SUM(CASE WHEN led_to_cart THEN 1 ELSE 0 END) as cart_adds,
 *   SUM(CASE WHEN led_to_purchase THEN 1 ELSE 0 END) as purchases,
 *   ROUND(SUM(CASE WHEN led_to_purchase THEN 1 ELSE 0 END)::decimal / COUNT(*) * 100, 2) as conversion_rate
 * FROM catalog_access_log
 * WHERE action_type = 'product_view'
 *   AND created_at > NOW() - INTERVAL '30 days'
 * GROUP BY product_id, product_name
 * HAVING COUNT(*) > 10
 * ORDER BY conversion_rate DESC;
 * 
 * -- Tempo médio por categoria
 * SELECT 
 *   product_category,
 *   AVG(time_spent_seconds) as avg_time,
 *   COUNT(*) as views
 * FROM catalog_access_log
 * WHERE action_type = 'product_view'
 *   AND time_spent_seconds IS NOT NULL
 * GROUP BY product_category
 * ORDER BY avg_time DESC;
 * 
 * -- Buscas sem resultado
 * SELECT search_term, COUNT(*) as searches
 * FROM catalog_access_log
 * WHERE action_type = 'search'
 *   AND search_results_count = 0
 * GROUP BY search_term
 * ORDER BY searches DESC
 * LIMIT 20;
 * ```
 */
