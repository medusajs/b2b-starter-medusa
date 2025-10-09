-- =============================================
-- SEED DATA - PERSONAS, JOURNEYS E TOOLS
-- =============================================
-- Descrição: Dados iniciais para personas, buyer journeys, journey steps e tools
-- Data: 2025-01-10
-- Versão: 1.0

-- =============================================
-- 1. SEED PERSONAS
-- =============================================

INSERT INTO personas
    (code, name, display_name, description, customer_group_id, sales_channel_ids, pricing_tier, capabilities, persona_type, target_market, min_order_value, requires_approval, approval_threshold, is_active, priority)
VALUES

    -- B2B Professional Personas
    ('CG_PRO_INSTALLER', 'Professional Installer', 'Instalador Profissional', 'Eletricistas, integradores e empresas de instalação verificadas com acesso a preços de atacado', NULL, '["SC_B2B_PROFESSIONAL"]', 'installer_plus', '{"can_buy_bulk": true, "can_request_quotes": true, "has_credit_limit": true, "can_manage_projects": true, "access_technical_docs": true}', 'B2B_PROFESSIONAL', 'all', 500.00, true, 10000.00, true, 10),

    ('CG_PRO_INTEGRATOR', 'System Integrator', 'Integrador de Sistemas', 'Empresas especializadas em integração completa de sistemas solares', NULL, '["SC_B2B_PROFESSIONAL"]', 'integrator', '{"can_buy_bulk": true, "can_request_quotes": true, "has_credit_limit": true, "can_manage_multiple_projects": true, "access_engineering_tools": true}', 'B2B_PROFESSIONAL', 'all', 1000.00, true, 20000.00, true, 20),

    ('CG_PRO_ENGINEER', 'Solar Engineer', 'Engenheiro Solar', 'Engenheiros especializados em projetos solares', NULL, '["SC_B2B_PROFESSIONAL"]', 'professional', '{"can_request_quotes": true, "access_engineering_tools": true, "access_technical_docs": true, "can_validate_projects": true}', 'B2B_PROFESSIONAL', 'all', 0, false, NULL, true, 30),

    -- Affiliate Personas
    ('CG_AFFILIATE', 'Affiliate Partner', 'Parceiro Afiliado', 'Associados e parceiros do programa de afiliados', NULL, '["SC_AFFILIATE_LANDING", "SC_DTC_OWNER"]', 'basic', '{"can_generate_links": true, "can_track_conversions": true, "can_earn_commissions": true, "access_marketing_materials": true}', 'AFFILIATE', 'all', 0, false, NULL, true, 40),

    ('CG_AFFILIATE_PREMIUM', 'Premium Affiliate', 'Afiliado Premium', 'Afiliados de alto desempenho com benefícios adicionais', NULL, '["SC_AFFILIATE_LANDING", "SC_DTC_OWNER", "SC_B2B_PROFESSIONAL"]', 'premium', '{"can_generate_links": true, "can_track_conversions": true, "can_earn_commissions": true, "access_marketing_materials": true, "higher_commission_rate": true, "dedicated_support": true}', 'AFFILIATE', 'all', 0, false, NULL, true, 41),

    -- Owner Personas (DTC)
    ('CG_OWNER_RESIDENTIAL', 'Residential Owner', 'Proprietário Residencial', 'Proprietários de imóveis residenciais buscando soluções solares', NULL, '["SC_DTC_OWNER"]', 'basic', '{"can_use_calculators": true, "can_request_quotes": true, "access_educational_content": true}', 'DTC_OWNER', 'residential', 0, false, NULL, true, 50),

    ('CG_OWNER_COMMERCIAL', 'Commercial Owner', 'Proprietário Comercial', 'Gestores e proprietários de imóveis comerciais', NULL, '["SC_DTC_OWNER"]', 'basic', '{"can_use_calculators": true, "can_request_quotes": true, "access_educational_content": true, "access_commercial_solutions": true}', 'DTC_OWNER', 'commercial', 0, false, NULL, true, 51),

    ('CG_OWNER_RURAL', 'Rural Owner', 'Proprietário Rural', 'Proprietários de imóveis rurais e agropecuários', NULL, '["SC_DTC_OWNER"]', 'basic', '{"can_use_calculators": true, "can_request_quotes": true, "access_educational_content": true, "access_rural_solutions": true, "access_off_grid_options": true}', 'DTC_OWNER', 'rural', 0, false, NULL, true, 52),

    ('CG_OWNER_INDUSTRIAL', 'Industrial Owner', 'Proprietário Industrial', 'Gestores de instalações industriais', NULL, '["SC_DTC_OWNER", "SC_B2B_PROFESSIONAL"]', 'commercial', '{"can_use_calculators": true, "can_request_quotes": true, "access_industrial_solutions": true, "has_credit_limit": true}', 'DTC_OWNER', 'industrial', 0, true, 50000.00, true, 53),

    -- Admin Personas
    ('CG_ADMIN', 'Platform Admin', 'Administrador da Plataforma', 'Administradores internos com acesso total', NULL, '["SC_B2B_PROFESSIONAL", "SC_DTC_OWNER", "SC_AFFILIATE_LANDING"]', 'admin', '{"full_access": true, "can_override_approvals": true, "can_manage_users": true, "access_all_analytics": true}', 'ADMIN', 'all', 0, false, NULL, true, 1);

-- =============================================
-- 2. SEED BUYER JOURNEYS
-- =============================================

INSERT INTO buyer_journeys
    (code, name, display_name, description, objective, duration_minutes_min, duration_minutes_max, complexity, target_conversion_rate, target_time_to_purchase, target_satisfaction_score, primary_persona_ids, secondary_persona_ids, journey_category, difficulty_level, is_active, completion_status, completion_percentage)
VALUES

    ('DISCOVERY_TO_PURCHASE', 'discovery_to_purchase', 'Descoberta → Compra Simples', 'Jornada básica de descoberta e compra de produtos solares específicos', 'Encontrar e comprar produtos solares específicos rapidamente', 5, 15, 'low', 70.00, 15, 4.50, '["CG_PRO_INSTALLER", "CG_OWNER_RESIDENTIAL"]', '["CG_AFFILIATE"]', 'sales', 'beginner', true, 'complete', 100),

    ('SOLAR_ANALYSIS_TO_KIT', 'solar_analysis_to_kit', 'Análise Solar → Kit Completo', 'Jornada completa desde dimensionamento até seleção de kit', 'Dimensionar sistema solar e comprar kit completo adequado', 20, 60, 'high', 45.00, 45, 4.30, '["CG_OWNER_RESIDENTIAL", "CG_OWNER_COMMERCIAL"]', '["CG_PRO_INSTALLER"]', 'sales', 'intermediate', true, 'partial', 95),

    ('LEAD_TO_B2B_CLIENT', 'lead_to_b2b_client', 'Lead → Cliente B2B', 'Conversão de lead profissional em cliente B2B ativo', 'Converter instalador ou integrador em cliente B2B verificado', 30, 90, 'medium', 35.00, 60, 4.20, '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', NULL, 'onboarding', 'intermediate', true, 'partial', 90),

    ('QUOTE_TO_ORDER', 'quote_to_order', 'Cotação B2B → Pedido', 'Processo de cotação, negociação e fechamento B2B', 'Solicitar cotação, negociar condições e fechar pedido', 60, 300, 'high', 60.00, 180, 4.40, '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', '["CG_PRO_ENGINEER"]', 'sales', 'advanced', true, 'partial', 85),

    ('COMPARISON_TO_DECISION', 'comparison_to_decision', 'Comparação → Decisão', 'Comparação técnica de produtos para decisão informada', 'Comparar especificações técnicas e escolher melhor opção', 10, 30, 'low', 65.00, 20, 4.60, '["CG_PRO_ENGINEER", "CG_PRO_INSTALLER"]', '["CG_OWNER_COMMERCIAL"]', 'sales', 'intermediate', true, 'complete', 100),

    ('CV_TO_PROPOSAL', 'cv_to_proposal', 'Computer Vision → Proposta', 'Análise de telhado via CV para proposta automática', 'Analisar telhado com IA e gerar proposta técnica', 15, 45, 'high', 40.00, 35, 4.20, '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', '["CG_OWNER_RESIDENTIAL"]', 'sales', 'advanced', true, 'partial', 80),

    ('POST_SALE_SUPPORT', 'post_sale_support', 'Pós-Venda → Suporte', 'Acompanhamento de pedido, suporte e manutenção', 'Rastrear pedido, acessar documentos e obter suporte', 5, 30, 'medium', 85.00, 10, 4.70, NULL, '["CG_PRO_INSTALLER", "CG_OWNER_RESIDENTIAL", "CG_OWNER_COMMERCIAL"]', 'support', 'beginner', true, 'partial', 60);

-- =============================================
-- 3. SEED PERSONA TOOLS
-- =============================================

INSERT INTO persona_tools
    (code, name, display_name, description, tool_type, category, available_for_personas, requires_authentication, requires_b2b_account, api_endpoint, http_method, icon_name, route_path, component_path, max_executions_per_day, execution_timeout_seconds, is_free, is_active, is_beta)
VALUES

    -- Solar Calculators
    ('solar_dimensioning', 'Solar Dimensioning Calculator', 'Calculadora de Dimensionamento', 'Calcula o sistema solar ideal baseado em consumo e localização (NASA POWER/PVGIS)', 'calculator', 'solar', '["CG_OWNER_RESIDENTIAL", "CG_OWNER_COMMERCIAL", "CG_OWNER_RURAL", "CG_PRO_INSTALLER"]', false, false, '/api/solar/dimensionamento', 'POST', 'Calculator', '/dimensionamento', '/modules/onboarding/components/DimensionamentoClient', 50, 30, true, true, false),

    ('viability_analyzer', 'Viability Analyzer', 'Analisador de Viabilidade', 'Análise completa de viabilidade técnica, financeira e regulatória', 'analyzer', 'solar', '["CG_OWNER_COMMERCIAL", "CG_OWNER_INDUSTRIAL", "CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR", "CG_PRO_ENGINEER"]', true, false, '/api/solar/viability', 'POST', 'TrendingUp', '/viability', '/modules/viability/components/ViabilityAnalyzer', 20, 60, true, true, false),

    ('tariff_classifier', 'Tariff Classifier', 'Classificador de Tarifas', 'Identifica melhor modalidade tarifária ANEEL para o perfil de consumo', 'classifier', 'solar', '["CG_OWNER_COMMERCIAL", "CG_OWNER_INDUSTRIAL", "CG_PRO_INSTALLER"]', false, false, '/api/aneel/tariff-classifier', 'POST', 'Zap', '/tariff-classifier', '/modules/tariff/components/TariffClassifier', 30, 15, true, true, false),

    -- Computer Vision Tools
    ('cv_roof_analyzer', 'CV Roof Analyzer', 'Analisador de Telhado (CV)', 'Análise automática de telhado usando Computer Vision e imagens de satélite', 'analyzer', 'technical', '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR", "CG_PRO_ENGINEER"]', true, true, '/api/solar-cv/analyze', 'POST', 'ScanLine', '/solar-cv', '/modules/solar-cv/components/CVAnalyzer', 10, 120, false, true, true),

    ('panel_layout_optimizer', 'Panel Layout Optimizer', 'Otimizador de Layout', 'Otimiza o layout de painéis no telhado considerando obstáculos e sombreamento', 'simulator', 'technical', '["CG_PRO_INSTALLER", "CG_PRO_ENGINEER"]', true, true, '/api/solar-cv/optimize-layout', 'POST', 'LayoutGrid', '/panel-layout', '/modules/solar-cv/components/LayoutOptimizer', 15, 90, false, true, true),

    -- Financial Tools
    ('credit_analyzer', 'Credit Analyzer', 'Analisador de Crédito', 'Análise de crédito para financiamento de sistemas solares', 'analyzer', 'financial', '["CG_OWNER_RESIDENTIAL", "CG_OWNER_COMMERCIAL", "CG_OWNER_INDUSTRIAL"]', true, false, '/api/finance/credit-analysis', 'POST', 'BadgeDollarSign', '/credit-analysis', '/modules/finance/components/CreditAnalyzer', 5, 45, true, true, false),

    ('roi_calculator', 'ROI Calculator', 'Calculadora de ROI', 'Calcula retorno sobre investimento (payback, VPL, TIR) para sistemas solares', 'calculator', 'financial', '["CG_OWNER_COMMERCIAL", "CG_OWNER_INDUSTRIAL", "CG_PRO_INSTALLER"]', false, false, '/api/finance/roi', 'POST', 'TrendingUp', '/roi-calculator', '/modules/finance/components/ROICalculator', 30, 15, true, true, false),

    ('financing_simulator', 'Financing Simulator', 'Simulador de Financiamento', 'Simula diferentes modalidades de financiamento (CDC, LEASING, EAAS)', 'simulator', 'financial', '["CG_OWNER_RESIDENTIAL", "CG_OWNER_COMMERCIAL"]', false, false, '/api/finance/simulate', 'POST', 'Calculator', '/financing', '/modules/finance/components/FinancingSimulator', 30, 20, true, true, false),

    -- B2B Tools
    ('quote_generator', 'Quote Generator', 'Gerador de Cotações', 'Gera cotações profissionais personalizadas com logo e branding da empresa', 'generator', 'business', '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', true, true, '/api/quotes/generate', 'POST', 'FileText', '/quote-generator', '/modules/quote/components/QuoteGenerator', 50, 30, true, true, false),

    ('project_manager', 'Project Manager', 'Gerenciador de Projetos', 'Gerencia múltiplos projetos/obras com orçamentos e carrinhos separados', 'manager', 'business', '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', true, true, NULL, NULL, 'Briefcase', '/projects', '/modules/projects/components/ProjectManager', NULL, NULL, true, true, false),

    ('bulk_pricer', 'Bulk Pricer', 'Cotador em Lote', 'Cotação rápida de múltiplos produtos por SKU em lote', 'calculator', 'business', '["CG_PRO_INSTALLER", "CG_PRO_INTEGRATOR"]', true, true, '/api/pricing/bulk', 'POST', 'ListCheck', '/bulk-pricer', '/modules/pricing/components/BulkPricer', 20, 30, true, true, false),

    -- Technical Tools
    ('compatibility_checker', 'Compatibility Checker', 'Verificador de Compatibilidade', 'Verifica compatibilidade técnica entre painéis, inversores e outros componentes', 'validator', 'technical', '["CG_PRO_INSTALLER", "CG_PRO_ENGINEER"]', false, false, '/api/products/check-compatibility', 'POST', 'CheckCircle', '/compatibility', '/modules/products/components/CompatibilityChecker', 50, 10, true, true, false),

    ('load_calculator', 'Load Calculator', 'Calculadora de Cargas', 'Calcula cargas elétricas e dimensiona cabos, disjuntores e proteções', 'calculator', 'technical', '["CG_PRO_INSTALLER", "CG_PRO_ENGINEER"]', false, false, '/api/technical/load-calc', 'POST', 'Zap', '/load-calculator', '/modules/technical/components/LoadCalculator', 30, 20, true, true, false),

    ('shading_simulator', 'Shading Simulator', 'Simulador de Sombreamento', 'Simula sombreamento ao longo do ano e impacto na geração', 'simulator', 'technical', '["CG_PRO_ENGINEER", "CG_PRO_INTEGRATOR"]', true, false, '/api/solar/shading', 'POST', 'Sun', '/shading', '/modules/solar/components/ShadingSimulator', 15, 60, false, true, true),

    -- Comparison & Analysis
    ('product_comparator', 'Product Comparator', 'Comparador de Produtos', 'Compara especificações técnicas detalhadas de múltiplos produtos', 'analyzer', 'business', NULL, false, false, NULL, NULL, 'ArrowLeftRight', '/compare', '/modules/products/components/ProductComparison', NULL, NULL, true, true, false),

    ('performance_predictor', 'Performance Predictor', 'Preditor de Performance', 'Prevê performance do sistema ao longo de 25 anos considerando degradação', 'simulator', 'technical', '["CG_PRO_ENGINEER", "CG_PRO_INSTALLER"]', true, false, '/api/solar/performance', 'POST', 'Activity', '/performance', '/modules/solar/components/PerformancePredictor', 20, 45, true, true, false);

-- =============================================
-- 4. UPDATE METADATA
-- =============================================

-- Adicionar schemas JSON aos tools (exemplos simplificados)
UPDATE persona_tools 
SET input_schema = '{"type": "object", "properties": {"location": {"type": "object"}, "consumption_kwh_monthly": {"type": "number"}}, "required": ["location", "consumption_kwh_monthly"]}'
::jsonb,
    output_schema = '{"type": "object", "properties": {"recommended_power_kw": {"type": "number"}, "estimated_generation_kwh": {"type": "object"}}}'::jsonb
WHERE code = 'solar_dimensioning';

UPDATE persona_tools
SET input_schema = '{"type": "object", "properties": {"solar_calculation_result": {"type": "object"}, "project_details": {"type": "object"}}}'
::jsonb,
    output_schema = '{"type": "object", "properties": {"viability_score": {"type": "number"}, "recommendation": {"type": "string"}}}'::jsonb
WHERE code = 'viability_analyzer';

UPDATE persona_tools
SET input_schema = '{"type": "object", "properties": {"cpf_cnpj": {"type": "string"}, "requested_amount": {"type": "number"}}}'
::jsonb,
    output_schema = '{"type": "object", "properties": {"status": {"type": "string"}, "approved_amount": {"type": "number"}}}'::jsonb
WHERE code = 'credit_analyzer';

-- =============================================
-- COMENTÁRIOS FINAIS
-- =============================================

-- Este seed data cria:
-- - 10 personas cobrindo B2B Professional, Affiliate e DTC Owner
-- - 7 buyer journeys principais mapeadas
-- - 15 ferramentas principais do sistema
-- - Relacionamentos e configurações básicas

-- Próximos passos:
-- 1. Popular journey_steps com as etapas detalhadas de cada jornada
-- 2. Atualizar customer_persona_assignments quando clientes se cadastrarem
-- 3. Monitorar tool_usage_tracking para analytics
-- 4. Ajustar capabilites e permissions conforme necessidades
