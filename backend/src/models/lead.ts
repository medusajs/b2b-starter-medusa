import { model } from "@medusajs/framework/utils"

/**
 * Lead Model
 * Modelo para capturar e gerenciar leads do funil de vendas
 * 
 * CRÍTICO: Este modelo evita perda de leads e permite rastreamento completo
 * do funil de conversão desde o primeiro contato até a conversão final.
 * 
 * Compliance: LGPD-compliant com hash de IP e campos auditáveis
 */
export const Lead = model.define("lead", {
    id: model.id({ prefix: "lead" }).primaryKey(),
    
    // ==========================================
    // Identificação do Lead
    // ==========================================
    
    name: model.text(),
    email: model.text(),
    phone: model.text(),
    company: model.text().nullable(),
    cpf_cnpj: model.text().nullable(),
    
    // ==========================================
    // Interesse e Contexto
    // ==========================================
    
    interest_type: model.enum([
        "solar",           // Interesse em sistema solar
        "financing",       // Interesse em financiamento
        "quote",          // Solicitação de cotação
        "product",        // Interesse em produto específico
        "catalog",        // Navegação de catálogo
        "calculator",     // Uso de calculadora
        "chat",           // Conversa com Helio
        "other"          // Outro interesse
    ]),
    
    product_id: model.text().nullable(),           // Produto de interesse
    product_category: model.text().nullable(),     // Categoria de interesse
    message: model.text().nullable(),              // Mensagem do lead
    estimated_value: model.number().nullable(),    // Valor estimado do negócio
    
    // ==========================================
    // Origem e Marketing
    // ==========================================
    
    source: model.text(), // "homepage", "product-page", "calculator", "chat", "landing-page"
    utm_source: model.text().nullable(),      // Google, Facebook, Newsletter, etc.
    utm_medium: model.text().nullable(),      // CPC, email, social, organic
    utm_campaign: model.text().nullable(),    // Nome da campanha
    utm_term: model.text().nullable(),        // Termo de busca
    utm_content: model.text().nullable(),     // Variação do anúncio
    referring_url: model.text().nullable(),   // URL de origem
    landing_page: model.text().nullable(),    // Página de aterrissagem
    
    // ==========================================
    // Status e Gestão
    // ==========================================
    
    status: model.enum([
        "new",           // Lead novo, não contatado
        "contacted",     // Lead contatado
        "qualified",     // Lead qualificado (MQL)
        "proposal",      // Proposta enviada
        "negotiation",   // Em negociação
        "converted",     // Convertido em venda
        "lost",          // Perdido
        "unqualified"    // Desqualificado
    ]).default("new"),
    
    assigned_to: model.text().nullable(),         // Vendedor/representante responsável
    priority: model.enum(["low", "medium", "high", "urgent"]).default("medium"),
    
    // Histórico de contatos
    contact_attempts: model.number().default(0),
    last_contact_at: model.dateTime().nullable(),
    next_followup_at: model.dateTime().nullable(),
    
    // ==========================================
    // Qualificação (Lead Scoring)
    // ==========================================
    
    score: model.number().default(0),             // Score 0-100
    score_breakdown: model.json().nullable(),     // { behavior: 30, demographic: 20, engagement: 15 }
    
    is_qualified: model.boolean().default(false),
    qualification_reason: model.text().nullable(),
    disqualification_reason: model.text().nullable(),
    
    // ==========================================
    // Relacionamentos
    // ==========================================
    
    customer_id: model.text().nullable(),         // Se converteu em customer
    quote_id: model.text().nullable(),            // Cotação associada
    order_id: model.text().nullable(),            // Pedido final (se converteu)
    
    // ==========================================
    // Dados de Sessão (Analytics)
    // ==========================================
    
    session_id: model.text().nullable(),
    anonymous_id: model.text().nullable(),        // ID anônimo (cookie)
    
    // Device & Browser
    user_agent: model.text().nullable(),
    device_type: model.text().nullable(),         // mobile, tablet, desktop
    browser: model.text().nullable(),
    os: model.text().nullable(),
    
    // Geo
    ip_hash: model.text().nullable(),             // SHA-256 hash (LGPD compliant)
    country: model.text().nullable(),
    region: model.text().nullable(),
    city: model.text().nullable(),
    
    // ==========================================
    // Interações
    // ==========================================
    
    pages_viewed: model.number().default(1),
    time_on_site_seconds: model.number().default(0),
    interactions: model.json().nullable(),        // Array de interações
    
    // ==========================================
    // Notas e Observações
    // ==========================================
    
    internal_notes: model.text().nullable(),      // Notas internas da equipe
    tags: model.json().nullable(),                // Array de tags ["solar", "empresa", "urgente"]
    
    // ==========================================
    // Conversão
    // ==========================================
    
    conversion_value: model.number().nullable(),  // Valor da venda final
    conversion_date: model.dateTime().nullable(),
    time_to_conversion_days: model.number().nullable(),
    
    // ==========================================
    // Timestamps
    // ==========================================
    
    created_at: model.dateTime(),
    updated_at: model.dateTime().nullable(),
    contacted_at: model.dateTime().nullable(),
    qualified_at: model.dateTime().nullable(),
    converted_at: model.dateTime().nullable(),
    lost_at: model.dateTime().nullable(),
})

export default Lead
