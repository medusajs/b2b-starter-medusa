import { model } from "@medusajs/framework/utils"

/**
 * PhotogrammetryAnalysis Model
 * Modelo para persistir análises fotogramétricas de telhados
 * 
 * CRÍTICO PARA ECONOMIA: Processamento fotogramétrico é CARO.
 * Cache por localização evita processamentos duplicados e reduz custos em 50%.
 * 
 * Este modelo permite:
 * - Cache de análises por endereço
 * - Histórico de análises do cliente
 * - Auditoria de custos
 * - Reutilização de resultados
 */
export const PhotogrammetryAnalysis = model.define("photogrammetry_analysis", {
    id: model.id({ prefix: "photo" }).primaryKey(),

    // ==========================================
    // Identificação
    // ==========================================

    customer_id: model.text().nullable(),
    session_id: model.text().nullable(),

    // ==========================================
    // Localização (para cache)
    // ==========================================

    address: model.text(),                        // Endereço completo
    address_hash: model.text(),                   // SHA-256 hash (para cache lookup)

    // Coordenadas
    latitude: model.number(),
    longitude: model.number(),
    coordinates_hash: model.text(),               // Hash de lat/lng (cache secundário)

    // Normalizado
    street: model.text().nullable(),
    number: model.text().nullable(),
    complement: model.text().nullable(),
    neighborhood: model.text().nullable(),
    city: model.text(),
    state: model.text(),
    zip_code: model.text().nullable(),
    country: model.text().default("BR"),

    // ==========================================
    // Input - Imagens
    // ==========================================

    input_images: model.json(),                   // Array de URLs/paths das imagens
    input_image_count: model.number(),
    input_source: model.enum([
        "google_maps",
        "google_earth",
        "nearmap",
        "drone",
        "satellite",
        "user_upload",
        "other"
    ]),

    image_date: model.dateTime().nullable(),      // Data das imagens (se disponível)
    image_resolution: model.text().nullable(),    // Ex: "0.5m/pixel"

    // ==========================================
    // Análise do Telhado
    // ==========================================

    // Área
    roof_total_area_m2: model.number(),           // Área total do telhado
    roof_usable_area_m2: model.number(),          // Área útil para painéis
    roof_unusable_area_m2: model.number().nullable(),

    // Geometria
    roof_shape: model.text().nullable(),          // "gable", "hip", "flat", "complex"
    roof_planes_count: model.number().default(1), // Número de planos/faces
    roof_planes: model.json().nullable(),         // Detalhes de cada plano

    // Orientação
    roof_orientation: model.text(),               // "N", "S", "E", "W", "NE", "NW", "SE", "SW"
    roof_azimuth_degrees: model.number().nullable(), // 0-360° (0=Norte, 90=Leste, 180=Sul, 270=Oeste)

    // Inclinação
    roof_tilt_degrees: model.number(),            // 0-90° (0=plano, 90=vertical)
    is_flat_roof: model.boolean().default(false),

    // ==========================================
    // Análise de Sombreamento
    // ==========================================

    shading_analysis: model.json().nullable(),
    // Exemplo:
    // {
    //   annual_shade_percentage: 15,
    //   shade_by_hour: {...},
    //   shade_by_season: {...},
    //   obstacles: [
    //     { type: "tree", location: {...}, height: 8, shade_impact: "medium" },
    //     { type: "building", location: {...}, shade_impact: "low" }
    //   ]
    // }

    has_significant_shading: model.boolean().default(false),
    shade_loss_percentage: model.number().nullable(), // % de perda por sombreamento

    // Obstáculos
    obstacles: model.json().nullable(),           // Array de obstáculos detectados
    obstacles_count: model.number().default(0),

    // ==========================================
    // Modelo 3D
    // ==========================================

    model_3d_url: model.text().nullable(),        // URL do modelo 3D gerado
    model_3d_format: model.text().nullable(),     // "glb", "obj", "dae"
    model_3d_size_bytes: model.number().nullable(),

    point_cloud_url: model.text().nullable(),     // URL da nuvem de pontos
    point_cloud_size: model.number().nullable(),  // Número de pontos

    // ==========================================
    // Recomendações
    // ==========================================

    recommended_panel_count: model.number().nullable(),
    recommended_panel_layout: model.json().nullable(),
    recommended_system_size_kwp: model.number().nullable(),

    installation_complexity: model.enum([
        "simple",
        "moderate",
        "complex",
        "very_complex"
    ]).nullable(),

    installation_notes: model.text().nullable(),

    // ==========================================
    // Processamento
    // ==========================================

    processing_provider: model.text(),            // "google", "nearmap", "internal", "aurora"
    processing_version: model.text().nullable(),
    processing_algorithm: model.text().nullable(),

    processing_status: model.enum([
        "pending",
        "processing",
        "completed",
        "failed",
        "expired"
    ]).default("pending"),

    processing_started_at: model.dateTime().nullable(),
    processing_completed_at: model.dateTime().nullable(),
    processing_time_ms: model.number().nullable(),

    // Custos
    processing_cost_usd: model.number().nullable(),
    api_calls_count: model.number().default(0),

    // ==========================================
    // Qualidade
    // ==========================================

    confidence_score: model.number().nullable(),  // 0-1
    quality_score: model.number().nullable(),     // 0-100

    quality_flags: model.json().nullable(),
    // Exemplo:
    // {
    //   image_resolution: "good",
    //   cloud_coverage: "none",
    //   roof_visibility: "excellent",
    //   model_accuracy: "high"
    // }

    // ==========================================
    // Cache
    // ==========================================

    cache_hit: model.boolean().default(false),    // Foi um hit de cache?
    cache_source_id: model.text().nullable(),     // ID da análise original (se cache hit)
    times_reused: model.number().default(0),      // Quantas vezes foi reutilizado

    expires_at: model.dateTime(),                 // Data de expiração do cache
    cache_ttl_days: model.number().default(90),   // TTL padrão 90 dias

    // ==========================================
    // Relacionamentos
    // ==========================================

    quote_id: model.text().nullable(),            // Cotação associada
    solar_calculation_id: model.text().nullable(), // Cálculo solar associado
    order_id: model.text().nullable(),            // Pedido final (se converteu)

    // ==========================================
    // Metadados
    // ==========================================

    source: model.text().nullable(),              // "storefront", "admin", "api", "mobile"
    ip_hash: model.text().nullable(),             // SHA-256 (LGPD)
    user_agent: model.text().nullable(),

    // ==========================================
    // Validação e Revisão
    // ==========================================

    validated_by_human: model.boolean().default(false),
    validator_id: model.text().nullable(),
    validation_notes: model.text().nullable(),
    validated_at: model.dateTime().nullable(),

    needs_review: model.boolean().default(false),
    review_reason: model.text().nullable(),

    // ==========================================
    // Erros
    // ==========================================

    error_message: model.text().nullable(),
    error_type: model.text().nullable(),
    error_details: model.json().nullable(),

    // ==========================================
    // Timestamps
    // ==========================================

    created_at: model.dateTime(),
    updated_at: model.dateTime().nullable(),
    accessed_at: model.dateTime().nullable(),     // Último acesso (para cache)
})

export default PhotogrammetryAnalysis

/**
 * Estratégia de Cache:
 * 
 * 1. Cache por Endereço:
 *    - Hash do endereço completo (address_hash)
 *    - Lookup: SELECT * WHERE address_hash = ? AND expires_at > NOW()
 * 
 * 2. Cache por Coordenadas:
 *    - Hash de lat/lng com precisão de 5 decimais (~1.1m)
 *    - Útil quando endereço não está exato
 * 
 * 3. Cache Geográfico:
 *    - Busca por proximidade: lat/lng ± 0.0001° (~11m)
 *    - Usado quando não há match exato
 * 
 * 4. TTL Dinâmico:
 *    - Imagens recentes (< 1 ano): 90 dias
 *    - Imagens antigas (> 1 ano): 30 dias
 *    - Análise modificada (construção): 7 dias
 */

/**
 * Economia de Custos:
 * 
 * Exemplo (valores estimados):
 * - Custo por análise: $2.00 USD
 * - Taxa de cache hit: 50%
 * - Análises por mês: 1000
 * 
 * Sem cache: 1000 * $2 = $2,000/mês
 * Com cache: 500 * $2 = $1,000/mês
 * Economia: $1,000/mês ($12,000/ano)
 * 
 * ROI: Implementação em 4 horas vs $12k economia = ROI em 1 dia
 */

/**
 * Providers Comuns:
 * 
 * - Google Maps Solar API (descontinuado, usar Earth Engine)
 * - Google Earth Engine (gratuito para pesquisa)
 * - Nearmap (pago, alta resolução)
 * - Aurora Solar (pago, especializado)
 * - Internal Processing (custo de computação)
 */
