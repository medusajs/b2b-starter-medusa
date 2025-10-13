import { model } from "@medusajs/framework/utils"

/**
 * RagQuery Model
 * Modelo para logging de queries ao sistema RAG (Retrieval-Augmented Generation)
 * 
 * CRÍTICO PARA COMPLIANCE: LGPD e AI Act europeu exigem audit trail completo
 * de sistemas de IA, incluindo inputs, outputs, contexto usado e decisões.
 * 
 * Este modelo garante:
 * - Rastreabilidade completa de queries
 * - Auditoria de respostas geradas
 * - Análise de qualidade do RAG
 * - Dados para treinamento/melhoria
 * - Compliance regulatório
 */
export const RagQuery = model.define("rag_query", {
    id: model.id({ prefix: "ragq" }).primaryKey(),
    
    // ==========================================
    // Identificação
    // ==========================================
    
    customer_id: model.text().nullable(),
    session_id: model.text(),
    conversation_id: model.text().nullable(),     // Agrupa queries da mesma conversa
    
    // ==========================================
    // Query Input
    // ==========================================
    
    query_text: model.text(),                     // Pergunta original do usuário
    query_language: model.text().default("pt-BR"),
    query_type: model.enum([
        "question",          // Pergunta direta
        "search",           // Busca de produtos
        "recommendation",   // Pedido de recomendação
        "comparison",       // Comparação de produtos
        "technical",        // Questão técnica
        "pricing",          // Questão de preço
        "other"
    ]),
    
    // ==========================================
    // RAG Processing
    // ==========================================
    
    // Embeddings
    query_embedding: model.json().nullable(),     // Vetor da query (pode ser grande)
    embedding_model: model.text().nullable(),     // Ex: "text-embedding-ada-002"
    
    // Retrieval
    retrieved_chunks: model.json(),               // Chunks recuperados do vector DB
    retrieval_scores: model.json().nullable(),    // Scores de relevância
    num_chunks_retrieved: model.number(),
    
    // Vector DB
    vector_db_query_time_ms: model.number().nullable(),
    vector_db_collection: model.text().nullable(), // Nome da collection no Qdrant
    
    // ==========================================
    // LLM Generation
    // ==========================================
    
    llm_model: model.text(),                      // Ex: "gpt-4", "gpt-3.5-turbo"
    llm_temperature: model.number().nullable(),
    llm_max_tokens: model.number().nullable(),
    llm_prompt: model.text().nullable(),          // Prompt enviado ao LLM
    llm_response: model.text(),                   // Resposta gerada
    llm_response_time_ms: model.number().nullable(),
    
    // Tokens
    prompt_tokens: model.number().nullable(),
    completion_tokens: model.number().nullable(),
    total_tokens: model.number().nullable(),
    estimated_cost_usd: model.number().nullable(),
    
    // ==========================================
    // Produtos Recomendados
    // ==========================================
    
    recommended_products: model.json().nullable(), // Array de product IDs
    recommendation_scores: model.json().nullable(),
    num_products_recommended: model.number().default(0),
    
    // ==========================================
    // Qualidade e Feedback
    // ==========================================
    
    confidence_score: model.number().nullable(),   // 0-1
    quality_score: model.number().nullable(),      // 0-100
    
    user_feedback: model.enum([
        "helpful",
        "not_helpful",
        "partially_helpful",
        "irrelevant",
        null
    ]).nullable(),
    
    user_feedback_text: model.text().nullable(),
    user_clicked_product: model.boolean().default(false),
    user_added_to_cart: model.boolean().default(false),
    
    // ==========================================
    // Performance
    // ==========================================
    
    total_processing_time_ms: model.number().nullable(),
    cache_hit: model.boolean().default(false),
    cache_key: model.text().nullable(),
    
    // ==========================================
    // Status e Erros
    // ==========================================
    
    status: model.enum([
        "success",
        "partial_success",  // Resposta gerada mas com warnings
        "failed",
        "timeout",
        "rate_limited"
    ]).default("success"),
    
    error_message: model.text().nullable(),
    error_type: model.text().nullable(),
    
    // ==========================================
    // Context
    // ==========================================
    
    user_context: model.json().nullable(),        // Contexto adicional
    // Exemplo:
    // {
    //   location: "SP",
    //   previous_products_viewed: [...],
    //   budget_range: "10k-20k",
    //   installation_type: "residential"
    // }
    
    // ==========================================
    // Compliance & Audit
    // ==========================================
    
    ip_hash: model.text().nullable(),             // SHA-256 (LGPD)
    user_agent: model.text().nullable(),
    
    // Flags para compliance
    contains_pii: model.boolean().default(false), // Query contém dados pessoais?
    pii_redacted: model.boolean().default(false), // PII foi removido?
    reviewed_by_human: model.boolean().default(false),
    flagged_for_review: model.boolean().default(false),
    flag_reason: model.text().nullable(),
    
    // ==========================================
    // A/B Testing
    // ==========================================
    
    experiment_id: model.text().nullable(),
    experiment_variant: model.text().nullable(),
    
    // ==========================================
    // Timestamps
    // ==========================================
    
    created_at: model.dateTime(),
    feedback_received_at: model.dateTime().nullable(),
})

export default RagQuery

/**
 * Uso para Compliance:
 * 
 * LGPD (Brasil):
 * - Art. 20: Direito de revisão de decisões automatizadas
 * - Necessário log completo de: input, contexto, output, modelo usado
 * 
 * AI Act (Europa):
 * - High-risk AI systems requerem audit trail completo
 * - Logging de: dados de treinamento, decisões, outputs
 * - Rastreabilidade end-to-end
 * 
 * Este modelo atende ambos requisitos.
 */

/**
 * Métricas de Qualidade a Calcular:
 * 
 * - Answer relevance (chunks usados foram relevantes?)
 * - Response coherence (resposta é coerente?)
 * - Hallucination rate (modelo inventou informações?)
 * - User satisfaction (feedback do usuário)
 * - Conversion rate (query levou a venda?)
 * - Cost per query (custo de tokens)
 * - Latency (tempo de resposta)
 */
