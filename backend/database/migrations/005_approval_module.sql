-- =============================================
-- MIGRATION 005: APPROVAL MODULE
-- =============================================
-- Módulo: approval
-- Objetivo: Complementar tabela approvals com approval_settings e approval_status
-- Baseado em: src/modules/approval/models/
-- Data: 2025-01-10

-- =============================================
-- 1. APPROVAL SETTINGS (Configurações de Aprovação por Empresa)
-- =============================================

CREATE TABLE IF NOT EXISTS approval_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    company_id VARCHAR(36) NOT NULL,
    
    -- Configurações
    requires_admin_approval BOOLEAN DEFAULT false,
    requires_sales_manager_approval BOOLEAN DEFAULT false,
    
    -- Limites personalizados (opcional, complementa company.require_approval_above)
    auto_approve_below NUMERIC(10, 2), -- Valor abaixo do qual aprova automaticamente
    admin_approval_threshold NUMERIC(10, 2), -- Acima deste valor, requer aprovação de admin
    manager_approval_threshold NUMERIC(10, 2), -- Acima deste valor, requer aprovação de gerente
    
    -- Configurações avançadas
    require_dual_approval BOOLEAN DEFAULT false, -- Requer 2 aprovações para valores altos
    dual_approval_threshold NUMERIC(10, 2), -- Limite para dupla aprovação
    
    -- Notificações
    notify_on_pending BOOLEAN DEFAULT true,
    notify_on_approved BOOLEAN DEFAULT true,
    notify_on_rejected BOOLEAN DEFAULT true,
    notification_emails JSONB, -- ["email1@domain.com", "email2@domain.com"]
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(company_id)
);

-- Índices
CREATE INDEX idx_approval_settings_company ON approval_settings(company_id);
CREATE INDEX idx_approval_settings_deleted ON approval_settings(deleted_at);

-- =============================================
-- 2. APPROVAL STATUS (Status de Aprovação por Cart)
-- =============================================
-- Tabela para tracking rápido de status de aprovação por carrinho
-- Útil para consultas rápidas sem precisar fazer JOIN com approvals

CREATE TABLE IF NOT EXISTS approval_status (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    cart_id VARCHAR(255) NOT NULL UNIQUE, -- Remote link para Medusa cart
    
    -- Status agregado
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected, cancelled
    
    -- Contadores
    total_approvals_required INTEGER DEFAULT 1,
    approvals_received INTEGER DEFAULT 0,
    rejections_received INTEGER DEFAULT 0,
    
    -- Tracking
    first_approval_at TIMESTAMP,
    last_approval_at TIMESTAMP,
    final_decision_at TIMESTAMP,
    final_decision_by VARCHAR(255),
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_approval_status_cart ON approval_status(cart_id);
CREATE INDEX idx_approval_status_status ON approval_status(status);
CREATE INDEX idx_approval_status_deleted ON approval_status(deleted_at);

-- =============================================
-- 3. APPROVAL HISTORY (Histórico de Mudanças)
-- =============================================
-- Tabela de auditoria para tracking completo de todas as mudanças

CREATE TABLE IF NOT EXISTS approval_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    approval_id VARCHAR(36) NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    cart_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(36),
    
    -- Mudança
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    
    -- Ator
    changed_by VARCHAR(255) NOT NULL,
    changed_by_role VARCHAR(50), -- admin, purchaser, approver, system
    
    -- Contexto
    change_reason TEXT,
    notes TEXT,
    
    -- IP e User Agent (segurança)
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamp
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_approval_history_approval ON approval_history(approval_id);
CREATE INDEX idx_approval_history_cart ON approval_history(cart_id);
CREATE INDEX idx_approval_history_company ON approval_history(company_id);
CREATE INDEX idx_approval_history_changed_by ON approval_history(changed_by);
CREATE INDEX idx_approval_history_date ON approval_history(changed_at);

-- =============================================
-- 4. APPROVAL RULES (Regras de Aprovação)
-- =============================================
-- Tabela para regras dinâmicas de aprovação

CREATE TABLE IF NOT EXISTS approval_rules (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Escopo
    company_id VARCHAR(36), -- NULL = regra global
    customer_group_id VARCHAR(255), -- NULL = aplica a todos
    
    -- Nome e descrição
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Condições (JSONB para flexibilidade)
    conditions JSONB NOT NULL,
    -- Exemplo:
    -- {
    --   "cart_total": {"min": 10000, "max": 50000},
    --   "customer_type": ["B2B_PROFESSIONAL"],
    --   "product_categories": ["solar_panels", "inverters"],
    --   "time_window": {"start": "09:00", "end": "18:00"}
    -- }
    
    -- Ações requeridas
    required_approvers JSONB, -- ["admin", "sales_manager", "technical_team"]
    approval_count INTEGER DEFAULT 1, -- Quantas aprovações são necessárias
    
    -- Prioridade e ordem
    priority INTEGER DEFAULT 0, -- Maior número = maior prioridade
    execution_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_approval_rules_company ON approval_rules(company_id);
CREATE INDEX idx_approval_rules_customer_group ON approval_rules(customer_group_id);
CREATE INDEX idx_approval_rules_active ON approval_rules(is_active);
CREATE INDEX idx_approval_rules_priority ON approval_rules(priority DESC);
CREATE INDEX idx_approval_rules_deleted ON approval_rules(deleted_at);

-- =============================================
-- 5. TRIGGERS
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_approval_module_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_approval_settings_updated_at
    BEFORE UPDATE ON approval_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_module_updated_at();

CREATE TRIGGER trigger_approval_status_updated_at
    BEFORE UPDATE ON approval_status
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_module_updated_at();

CREATE TRIGGER trigger_approval_rules_updated_at
    BEFORE UPDATE ON approval_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_module_updated_at();

-- =============================================
-- 6. COMMENTS (Documentação)
-- =============================================

COMMENT ON TABLE approval_settings IS 'Configurações de aprovação por empresa - define regras e limiares';
COMMENT ON TABLE approval_status IS 'Status consolidado de aprovação por carrinho - cache para consultas rápidas';
COMMENT ON TABLE approval_history IS 'Histórico completo de mudanças de status de aprovação - auditoria';
COMMENT ON TABLE approval_rules IS 'Regras dinâmicas de aprovação baseadas em condições - motor de decisão';

COMMENT ON COLUMN approval_settings.auto_approve_below IS 'Valor abaixo do qual carrinhos são aprovados automaticamente';
COMMENT ON COLUMN approval_settings.require_dual_approval IS 'Se true, valores acima do threshold requerem 2 aprovações';
COMMENT ON COLUMN approval_status.total_approvals_required IS 'Total de aprovações necessárias (baseado em approval_rules)';
COMMENT ON COLUMN approval_rules.conditions IS 'JSONB com condições para aplicar regra (cart_total, customer_type, etc)';
COMMENT ON COLUMN approval_rules.priority IS 'Maior número = maior prioridade na avaliação de regras';

-- =============================================
-- FIM DA MIGRATION 005
-- =============================================
