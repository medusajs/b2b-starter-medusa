import { model } from "@medusajs/framework/utils"

/**
 * HelioConversation Model
 * Modelo para persistir conversas completas com o assistente virtual Helio
 * 
 * CRÍTICO PARA COMPLIANCE: Rastreamento de conversas multi-turn com AI
 * para auditoria, análise de qualidade e melhoria contínua.
 * 
 * Relacionamento: Uma conversation tem múltiplas RagQuery (mensagens)
 */
export const HelioConversation = model.define("helio_conversation", {
    id: model.id({ prefix: "hconv" }).primaryKey(),

    // ==========================================
    // Identificação
    // ==========================================

    customer_id: model.text().nullable(),
    session_id: model.text(),
    anonymous_id: model.text().nullable(),

    // ==========================================
    // Metadata da Conversa
    // ==========================================

    title: model.text().nullable(),               // Título gerado automaticamente
    summary: model.text().nullable(),             // Resumo da conversa

    status: model.enum([
        "active",           // Conversa em andamento
        "resolved",         // Questão resolvida
        "abandoned",        // Usuário abandonou
        "escalated",        // Escalado para humano
        "completed"         // Conversa finalizada com sucesso
    ]).default("active"),

    // ==========================================
    // Contadores
    // ==========================================

    message_count: model.number().default(0),     // Total de mensagens
    user_message_count: model.number().default(0),
    helio_message_count: model.number().default(0),

    // ==========================================
    // Engajamento
    // ==========================================

    duration_seconds: model.number().nullable(),  // Duração total
    avg_response_time_ms: model.number().nullable(),

    user_satisfaction: model.enum([
        "very_satisfied",
        "satisfied",
        "neutral",
        "dissatisfied",
        "very_dissatisfied",
        null
    ]).nullable(),

    satisfaction_score: model.number().nullable(), // 1-5
    feedback_text: model.text().nullable(),

    // ==========================================
    // Resultados
    // ==========================================

    // Issue resolution
    issue_resolved: model.boolean().default(false),
    resolution_type: model.text().nullable(),     // "self_service", "escalated", "failed"

    // Conversão
    led_to_purchase: model.boolean().default(false),
    products_recommended: model.json().nullable(), // Array de product IDs recomendados
    products_purchased: model.json().nullable(),   // Array de product IDs comprados

    cart_id: model.text().nullable(),
    order_id: model.text().nullable(),
    order_value: model.number().nullable(),

    // Lead generation
    lead_generated: model.boolean().default(false),
    lead_id: model.text().nullable(),

    // ==========================================
    // Tópicos e Categorias
    // ==========================================

    topics: model.json().nullable(),              // Array de tópicos discutidos
    // Exemplo: ["solar_panels", "pricing", "installation", "financing"]

    primary_topic: model.text().nullable(),
    secondary_topics: model.json().nullable(),

    intent: model.text().nullable(),              // Intent principal
    // Exemplos: "buy", "learn", "compare", "support"

    // ==========================================
    // Qualidade da Conversa
    // ==========================================

    quality_score: model.number().nullable(),     // 0-100
    quality_metrics: model.json().nullable(),
    // Exemplo:
    // {
    //   coherence: 0.95,
    //   relevance: 0.90,
    //   helpfulness: 0.85,
    //   accuracy: 0.92
    // }

    // Flags de qualidade
    had_hallucinations: model.boolean().default(false),
    had_errors: model.boolean().default(false),
    needed_clarification: model.boolean().default(false),

    // ==========================================
    // Custos
    // ==========================================

    total_tokens_used: model.number().default(0),
    total_cost_usd: model.number().nullable(),

    // ==========================================
    // Escalation
    // ==========================================

    escalated_to_human: model.boolean().default(false),
    escalation_reason: model.text().nullable(),
    escalated_at: model.dateTime().nullable(),
    assigned_to: model.text().nullable(),         // ID do atendente humano

    // ==========================================
    // Context e Metadata
    // ==========================================

    user_context: model.json().nullable(),
    // Exemplo:
    // {
    //   location: { city: "São Paulo", state: "SP" },
    //   consumption: 500,
    //   property_type: "residential",
    //   budget_range: "10k-20k"
    // }

    // Página onde conversa iniciou
    started_on_page: model.text().nullable(),
    started_on_url: model.text().nullable(),

    // ==========================================
    // Device & Browser
    // ==========================================

    device_type: model.text().nullable(),
    browser: model.text().nullable(),
    os: model.text().nullable(),

    // ==========================================
    // Geo
    // ==========================================

    ip_hash: model.text().nullable(),             // SHA-256 (LGPD)
    country: model.text().nullable(),
    region: model.text().nullable(),
    city: model.text().nullable(),

    // ==========================================
    // Marketing Attribution
    // ==========================================

    utm_source: model.text().nullable(),
    utm_medium: model.text().nullable(),
    utm_campaign: model.text().nullable(),

    // ==========================================
    // A/B Testing
    // ==========================================

    experiment_id: model.text().nullable(),
    experiment_variant: model.text().nullable(),
    helio_version: model.text().nullable(),       // Versão do Helio

    // ==========================================
    // Compliance
    // ==========================================

    contains_pii: model.boolean().default(false),
    pii_redacted: model.boolean().default(false),
    reviewed_by_human: model.boolean().default(false),
    flagged_for_review: model.boolean().default(false),
    flag_reason: model.text().nullable(),

    // GDPR/LGPD
    data_retention_until: model.dateTime().nullable(), // Data de expiração dos dados
    user_requested_deletion: model.boolean().default(false),
    deletion_scheduled_at: model.dateTime().nullable(),

    // ==========================================
    // Timestamps
    // ==========================================

    created_at: model.dateTime(),                 // Início da conversa
    updated_at: model.dateTime().nullable(),      // Última mensagem
    completed_at: model.dateTime().nullable(),    // Fim da conversa
    last_message_at: model.dateTime().nullable(), // Timestamp da última msg
})

export default HelioConversation

/**
 * Relacionamento com RagQuery:
 * 
 * Uma HelioConversation tem múltiplas RagQuery (mensagens individuais).
 * 
 * Para buscar todas mensagens de uma conversa:
 * SELECT * FROM rag_query WHERE conversation_id = 'hconv_xxx' ORDER BY created_at
 * 
 * Isso permite:
 * - Reconstruir conversa completa
 * - Análise de contexto multi-turn
 * - Debugging de problemas
 * - Auditoria compliance
 */

/**
 * Métricas de Qualidade:
 * 
 * - Conversation completion rate (% conversas completadas vs abandonadas)
 * - Resolution rate (% conversas que resolveram problema)
 * - Escalation rate (% conversas escaladas para humano)
 * - Customer satisfaction (NPS, CSAT)
 * - Conversion rate (% conversas que levaram a venda)
 * - Revenue per conversation (valor médio gerado)
 * - Cost per conversation (custo de tokens)
 * - Average conversation duration
 * - Messages per conversation
 */

/**
 * Uso para Treinamento:
 * 
 * Este modelo fornece dados para:
 * - Fine-tuning de modelos
 * - Análise de tópicos comuns
 * - Identificação de gaps de conhecimento
 * - Melhoria de prompts
 * - Otimização de retrieval
 * - A/B testing de variantes
 */
