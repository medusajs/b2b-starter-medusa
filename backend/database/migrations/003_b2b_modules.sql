-- =============================================
-- MÓDULOS B2B E PRICING - YSH B2B
-- =============================================
-- Descrição: Schema para companies, employees, approvals, quotes, distributors e pricing
-- Data: 2025-01-10
-- Versão: 1.0

-- =============================================
-- 1. COMPANIES (Empresas B2B)
-- =============================================
-- Baseado em src/modules/company/models/company.ts

CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255), -- Nome fantasia
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Documentos
    cnpj VARCHAR(20),
    state_registration VARCHAR(50),
    municipal_registration VARCHAR(50),
    
    -- Endereço
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(10),
    country VARCHAR(3) DEFAULT 'BRA',
    
    -- Branding
    logo_url VARCHAR(500),
    
    -- Financeiro
    currency_code VARCHAR(3) DEFAULT 'BRL',
    credit_limit NUMERIC(12, 2) DEFAULT 0,
    spending_limit NUMERIC(12, 2) DEFAULT 0,
    spending_limit_reset_frequency VARCHAR(20) DEFAULT 'monthly', -- never, daily, weekly, monthly, yearly
    last_spending_reset TIMESTAMP,
    current_period_spent NUMERIC(12, 2) DEFAULT 0,
    
    -- Termos de pagamento
    payment_terms VARCHAR(50) DEFAULT 'upfront', -- upfront, net_30, net_60, net_90
    default_payment_method VARCHAR(50),
    
    -- Customer Group associado
    customer_group_id VARCHAR(255), -- Customer Group criado automaticamente para a empresa
    
    -- Tipo de empresa
    company_type VARCHAR(50), -- installer, integrator, distributor, end_customer
    industry VARCHAR(100), -- solar, construction, electrical, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,
    verified_by VARCHAR(255),
    
    -- Configurações
    allow_employee_purchases BOOLEAN DEFAULT true,
    require_approval_above NUMERIC(10, 2), -- Valor acima do qual requer aprovação
    auto_approve_within_limit BOOLEAN DEFAULT true,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_verified ON companies(is_verified);
CREATE INDEX idx_companies_type ON companies(company_type);
CREATE INDEX idx_companies_customer_group ON companies(customer_group_id);

-- =============================================
-- 2. EMPLOYEES (Funcionários/Colaboradores)
-- =============================================
-- Baseado em src/modules/company/models/employee.ts

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id VARCHAR(255), -- Medusa customer ID (remote link)
    
    -- Dados pessoais
    full_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    job_title VARCHAR(100),
    
    -- Papel na empresa
    role VARCHAR(50) DEFAULT 'viewer', -- admin, purchaser, viewer, approver
    is_admin BOOLEAN DEFAULT false,
    
    -- Limites de compra
    spending_limit NUMERIC(12, 2) DEFAULT 0,
    monthly_limit NUMERIC(12, 2),
    current_month_spent NUMERIC(12, 2) DEFAULT 0,
    
    -- Permissões específicas
    permissions JSONB,
    -- {
    --   can_invite_employees: boolean,
    --   can_approve_purchases: boolean,
    --   can_manage_projects: boolean,
    --   can_request_quotes: boolean,
    --   can_view_analytics: boolean
    -- }
    
    -- Status do convite
    invite_status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, expired
    invite_token VARCHAR(64) UNIQUE,
    invited_by VARCHAR(255),
    invited_at TIMESTAMP,
    accepted_at TIMESTAMP,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(company_id, email)
);

-- Índices
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_customer ON employees(customer_id);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_active ON employees(is_active);
CREATE INDEX idx_employees_invite ON employees(invite_status);

-- =============================================
-- 3. PROJECTS (Projetos/Obras)
-- =============================================

CREATE TABLE IF NOT EXISTS company_projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    company_id VARCHAR(36) NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by VARCHAR(36) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Informações do projeto
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Código interno do projeto
    description TEXT,
    
    -- Localização
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(10),
    location JSONB, -- { lat, lng }
    
    -- Tipo de projeto
    project_type VARCHAR(50), -- residential, commercial, industrial, rural
    project_category VARCHAR(50), -- new_installation, upgrade, maintenance, repair
    
    -- Datas
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    
    -- Orçamento
    estimated_budget NUMERIC(12, 2),
    approved_budget NUMERIC(12, 2),
    spent_to_date NUMERIC(12, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
    
    -- Responsável
    project_manager_id VARCHAR(36) REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Cliente final (se diferente da empresa)
    end_customer_name VARCHAR(255),
    end_customer_contact VARCHAR(255),
    
    -- Carrinhos associados
    cart_ids JSONB, -- Array de cart IDs vinculados a este projeto
    
    -- Pedidos associados
    order_ids JSONB, -- Array de order IDs
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_projects_company ON company_projects(company_id);
CREATE INDEX idx_projects_created_by ON company_projects(created_by);
CREATE INDEX idx_projects_status ON company_projects(status);
CREATE INDEX idx_projects_type ON company_projects(project_type);
CREATE INDEX idx_projects_manager ON company_projects(project_manager_id);

-- =============================================
-- 4. APPROVALS (Aprovações de Compra)
-- =============================================
-- Baseado em src/modules/approval/models/approval.ts

CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    cart_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE CASCADE,
    project_id VARCHAR(36) REFERENCES company_projects(id) ON DELETE SET NULL,
    
    -- Tipo de aprovação
    type VARCHAR(50) NOT NULL, -- spending_limit, technical_review, management, credit
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled, expired
    
    -- Valores
    requested_amount NUMERIC(12, 2) NOT NULL,
    approved_amount NUMERIC(12, 2),
    
    -- Solicitante
    created_by VARCHAR(36) NOT NULL, -- employee_id
    created_by_name VARCHAR(255),
    
    -- Aprovador
    assigned_to VARCHAR(36), -- employee_id do aprovador
    handled_by VARCHAR(255), -- customer_id ou employee_id
    handled_by_name VARCHAR(255),
    handled_at TIMESTAMP,
    
    -- Justificativas
    request_reason TEXT,
    rejection_reason TEXT,
    approval_notes TEXT,
    
    -- Prioridade
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Prazo
    expires_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_approvals_cart ON approvals(cart_id);
CREATE INDEX idx_approvals_company ON approvals(company_id);
CREATE INDEX idx_approvals_project ON approvals(project_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_created_by ON approvals(created_by);
CREATE INDEX idx_approvals_assigned_to ON approvals(assigned_to);
CREATE INDEX idx_approvals_type ON approvals(type);

-- =============================================
-- 5. QUOTES (Cotações)
-- =============================================
-- Baseado em src/modules/quote/models/quote.ts

CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    customer_id VARCHAR(255) NOT NULL,
    company_id VARCHAR(36) REFERENCES companies(id) ON DELETE SET NULL,
    project_id VARCHAR(36) REFERENCES company_projects(id) ON DELETE SET NULL,
    cart_id VARCHAR(255),
    draft_order_id VARCHAR(255),
    order_change_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending_merchant',
    -- pending_merchant, pending_customer, accepted, customer_rejected, merchant_rejected
    
    -- Informações da cotação
    quote_number VARCHAR(50) UNIQUE,
    version INTEGER DEFAULT 1,
    
    -- Itens
    items JSONB NOT NULL,
    -- Array de { variant_id, quantity, unit_price, total, notes }
    
    -- Valores
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_total NUMERIC(12, 2) DEFAULT 0,
    tax_total NUMERIC(12, 2) DEFAULT 0,
    shipping_total NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'BRL',
    
    -- Termos
    payment_terms VARCHAR(50),
    delivery_terms TEXT,
    validity_days INTEGER DEFAULT 30,
    valid_until TIMESTAMP,
    
    -- Notas e observações
    customer_notes TEXT,
    internal_notes TEXT,
    terms_and_conditions TEXT,
    
    -- Anexos
    attachments JSONB, -- Array de URLs
    
    -- Timestamps importantes
    requested_at TIMESTAMP DEFAULT NOW(),
    responded_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_project ON quotes(project_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_number ON quotes(quote_number);
CREATE INDEX idx_quotes_date ON quotes(created_at);

-- =============================================
-- 6. QUOTE MESSAGES (Mensagens de Cotação)
-- =============================================
-- Baseado em src/modules/quote/models/message.ts

CREATE TABLE IF NOT EXISTS quote_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    quote_id VARCHAR(36) NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    
    -- Autor
    author_id VARCHAR(255) NOT NULL, -- customer_id ou admin_id
    author_name VARCHAR(255),
    author_type VARCHAR(50) NOT NULL, -- customer, merchant, system
    
    -- Conteúdo
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'comment', -- comment, status_change, price_update, attachment
    
    -- Anexos
    attachments JSONB,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_quote_messages_quote ON quote_messages(quote_id);
CREATE INDEX idx_quote_messages_author ON quote_messages(author_id);
CREATE INDEX idx_quote_messages_date ON quote_messages(created_at);

-- =============================================
-- 7. DISTRIBUTORS (Distribuidores/Fornecedores)
-- =============================================
-- Baseado em src/modules/ysh-pricing/models/distributor.ts

CREATE TABLE IF NOT EXISTS ysh_distributors (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    slug VARCHAR(100) UNIQUE NOT NULL,
    
    -- Contato
    email VARCHAR(255),
    phone VARCHAR(20),
    website VARCHAR(500),
    
    -- Endereço
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(3) DEFAULT 'BRA',
    
    -- Configuração de matching
    keywords JSONB, -- Array de palavras-chave para matching automático
    price_markup NUMERIC(5, 2) DEFAULT 1.15, -- 1.15 = 15% markup
    
    -- Regras de negócio
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    allowed_companies JSONB, -- Array de company IDs permitidos (null = todos)
    priority INTEGER DEFAULT 100, -- Menor = maior prioridade
    
    -- Logística
    default_lead_time_days INTEGER DEFAULT 7,
    shipping_zones JSONB, -- Array de estados/regiões atendidos
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    sync_frequency_hours INTEGER DEFAULT 24,
    
    -- Integração API (se aplicável)
    api_endpoint VARCHAR(500),
    api_key VARCHAR(255),
    api_type VARCHAR(50), -- rest, soap, ftp, manual
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_distributors_slug ON ysh_distributors(slug);
CREATE INDEX idx_distributors_active ON ysh_distributors(is_active);
CREATE INDEX idx_distributors_priority ON ysh_distributors(priority);

-- =============================================
-- 8. DISTRIBUTOR PRICES (Preços por Distribuidor)
-- =============================================
-- Baseado em src/modules/ysh-pricing/models/distributor-price.ts

CREATE TABLE IF NOT EXISTS ysh_distributor_prices (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamentos
    distributor_id VARCHAR(36) NOT NULL REFERENCES ysh_distributors(id) ON DELETE CASCADE,
    variant_id VARCHAR(255) NOT NULL, -- Medusa product variant ID
    variant_external_id VARCHAR(100), -- SKU ou referência externa
    
    -- Preços
    base_price NUMERIC(10, 2) NOT NULL, -- Preço original do distribuidor
    final_price NUMERIC(10, 2) NOT NULL, -- Após markup
    currency_code VARCHAR(3) DEFAULT 'BRL',
    
    -- Comparação
    cost_price NUMERIC(10, 2), -- Custo real (confidencial)
    list_price NUMERIC(10, 2), -- Preço de tabela (MSRP)
    
    -- Disponibilidade
    availability VARCHAR(50) DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock, backorder
    qty_available INTEGER DEFAULT 0,
    qty_reserved INTEGER DEFAULT 0,
    allow_backorder BOOLEAN DEFAULT false,
    
    -- Logística
    lead_time_days INTEGER,
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    quantity_step INTEGER DEFAULT 1, -- Múltiplos permitidos
    
    -- Localização do estoque
    warehouse_location VARCHAR(255),
    warehouse_code VARCHAR(50),
    restock_date TIMESTAMP,
    
    -- Sincronização
    last_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT false, -- True se não atualizado na última sync
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(variant_id, distributor_id)
);

-- Índices
CREATE INDEX idx_dist_prices_distributor ON ysh_distributor_prices(distributor_id);
CREATE INDEX idx_dist_prices_variant ON ysh_distributor_prices(variant_id);
CREATE INDEX idx_dist_prices_external ON ysh_distributor_prices(variant_external_id);
CREATE INDEX idx_dist_prices_availability ON ysh_distributor_prices(availability);
CREATE INDEX idx_dist_prices_price ON ysh_distributor_prices(final_price);
CREATE INDEX idx_dist_prices_stale ON ysh_distributor_prices(is_stale);

-- =============================================
-- 9. PRICE CHANGE LOG (Histórico de Mudanças de Preço)
-- =============================================

CREATE TABLE IF NOT EXISTS price_change_log (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    
    -- Relacionamento
    distributor_price_id VARCHAR(36) NOT NULL REFERENCES ysh_distributor_prices(id) ON DELETE CASCADE,
    distributor_id VARCHAR(36) NOT NULL,
    variant_id VARCHAR(255) NOT NULL,
    
    -- Mudança
    old_base_price NUMERIC(10, 2),
    new_base_price NUMERIC(10, 2),
    old_final_price NUMERIC(10, 2),
    new_final_price NUMERIC(10, 2),
    price_change_percent NUMERIC(5, 2),
    
    -- Disponibilidade
    old_availability VARCHAR(50),
    new_availability VARCHAR(50),
    old_qty INTEGER,
    new_qty INTEGER,
    
    -- Contexto
    change_reason VARCHAR(255), -- sync, manual, api_update, price_adjustment
    changed_by VARCHAR(255),
    
    -- Timestamps
    changed_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_price_log_dist_price ON price_change_log(distributor_price_id);
CREATE INDEX idx_price_log_variant ON price_change_log(variant_id);
CREATE INDEX idx_price_log_date ON price_change_log(changed_at);

-- =============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON TABLE companies IS 'Empresas B2B com limites de crédito, customer groups dedicados e configurações';
COMMENT ON TABLE employees IS 'Funcionários/colaboradores com papéis, permissões e limites de compra';
COMMENT ON TABLE company_projects IS 'Projetos/obras gerenciados por empresas B2B';
COMMENT ON TABLE approvals IS 'Aprovações de compra por limite, revisão técnica ou gerencial';
COMMENT ON TABLE quotes IS 'Cotações (RFQ) com versionamento, mensagens e conversão para pedido';
COMMENT ON TABLE quote_messages IS 'Thread de mensagens entre cliente e merchant em cotações';
COMMENT ON TABLE ysh_distributors IS 'Distribuidores/fornecedores com regras de matching e pricing';
COMMENT ON TABLE ysh_distributor_prices IS 'Preços por variante e distribuidor com disponibilidade';
COMMENT ON TABLE price_change_log IS 'Histórico completo de mudanças de preço e disponibilidade';

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_projects_updated_at BEFORE UPDATE ON company_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_messages_updated_at BEFORE UPDATE ON quote_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ysh_distributors_updated_at BEFORE UPDATE ON ysh_distributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ysh_distributor_prices_updated_at BEFORE UPDATE ON ysh_distributor_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
