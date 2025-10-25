-- =============================================
-- MIGRATION STATUS REPORT
-- =============================================
-- Execute este script para verificar o status de todas as tabelas criadas
-- Data: 2025-01-10

\echo '========================================='
\echo 'MIGRATION STATUS REPORT'
\echo '========================================='
\echo ''

-- 1. Contagem de tabelas criadas
\echo '1. TABELAS CRIADAS:'
SELECT 
    schemaname,
    COUNT(*) as total_tables
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY schemaname;

\echo ''
\echo '2. TABELAS POR MIGRATION:'

-- Migration 001: Personas and Journeys
\echo ''
\echo '   MIGRATION 001 - Personas & Buyer Journeys:'
SELECT 
    'personas' as tabela,
    COUNT(*) as registros,
    pg_size_pretty(pg_total_relation_size('personas')) as tamanho
FROM personas
UNION ALL
SELECT 'buyer_journeys', COUNT(*), pg_size_pretty(pg_total_relation_size('buyer_journeys')) FROM buyer_journeys
UNION ALL
SELECT 'journey_steps', COUNT(*), pg_size_pretty(pg_total_relation_size('journey_steps')) FROM journey_steps
UNION ALL
SELECT 'persona_tools', COUNT(*), pg_size_pretty(pg_total_relation_size('persona_tools')) FROM persona_tools
UNION ALL
SELECT 'tool_usage_tracking', COUNT(*), pg_size_pretty(pg_total_relation_size('tool_usage_tracking')) FROM tool_usage_tracking
UNION ALL
SELECT 'journey_analytics', COUNT(*), pg_size_pretty(pg_total_relation_size('journey_analytics')) FROM journey_analytics
UNION ALL
SELECT 'customer_persona_assignments', COUNT(*), pg_size_pretty(pg_total_relation_size('customer_persona_assignments')) FROM customer_persona_assignments;

-- Migration 002: Tools & Calculations
\echo ''
\echo '   MIGRATION 002 - Tools & Calculations:'
SELECT 
    'solar_calculations' as tabela,
    COUNT(*) as registros,
    pg_size_pretty(pg_total_relation_size('solar_calculations')) as tamanho
FROM solar_calculations
UNION ALL
SELECT 'viability_studies', COUNT(*), pg_size_pretty(pg_total_relation_size('viability_studies')) FROM viability_studies
UNION ALL
SELECT 'cv_analyses', COUNT(*), pg_size_pretty(pg_total_relation_size('cv_analyses')) FROM cv_analyses
UNION ALL
SELECT 'credit_analyses', COUNT(*), pg_size_pretty(pg_total_relation_size('credit_analyses')) FROM credit_analyses
UNION ALL
SELECT 'dimensioning_requests', COUNT(*), pg_size_pretty(pg_total_relation_size('dimensioning_requests')) FROM dimensioning_requests;

-- Migration 003: B2B Modules
\echo ''
\echo '   MIGRATION 003 - B2B Modules:'
SELECT 
    'companies' as tabela,
    COUNT(*) as registros,
    pg_size_pretty(pg_total_relation_size('companies')) as tamanho
FROM companies
UNION ALL
SELECT 'employees', COUNT(*), pg_size_pretty(pg_total_relation_size('employees')) FROM employees
UNION ALL
SELECT 'company_projects', COUNT(*), pg_size_pretty(pg_total_relation_size('company_projects')) FROM company_projects
UNION ALL
SELECT 'approvals', COUNT(*), pg_size_pretty(pg_total_relation_size('approvals')) FROM approvals
UNION ALL
SELECT 'quotes', COUNT(*), pg_size_pretty(pg_total_relation_size('quotes')) FROM quotes
UNION ALL
SELECT 'quote_messages', COUNT(*), pg_size_pretty(pg_total_relation_size('quote_messages')) FROM quote_messages
UNION ALL
SELECT 'ysh_distributors', COUNT(*), pg_size_pretty(pg_total_relation_size('ysh_distributors')) FROM ysh_distributors
UNION ALL
SELECT 'ysh_distributor_prices', COUNT(*), pg_size_pretty(pg_total_relation_size('ysh_distributor_prices')) FROM ysh_distributor_prices
UNION ALL
SELECT 'price_change_log', COUNT(*), pg_size_pretty(pg_total_relation_size('price_change_log')) FROM price_change_log;

-- Migration 005: Approval Module
\echo ''
\echo '   MIGRATION 005 - Approval Module:'
SELECT 
    'approval_settings' as tabela,
    COUNT(*) as registros,
    pg_size_pretty(pg_total_relation_size('approval_settings')) as tamanho
FROM approval_settings
UNION ALL
SELECT 'approval_status', COUNT(*), pg_size_pretty(pg_total_relation_size('approval_status')) FROM approval_status
UNION ALL
SELECT 'approval_history', COUNT(*), pg_size_pretty(pg_total_relation_size('approval_history')) FROM approval_history
UNION ALL
SELECT 'approval_rules', COUNT(*), pg_size_pretty(pg_total_relation_size('approval_rules')) FROM approval_rules;

-- Migration 006: ANEEL Tariff
\echo ''
\echo '   MIGRATION 006 - ANEEL Tariff:'
SELECT 
    'concessionarias' as tabela,
    COUNT(*) as registros,
    pg_size_pretty(pg_total_relation_size('concessionarias')) as tamanho
FROM concessionarias
UNION ALL
SELECT 'tarifas', COUNT(*), pg_size_pretty(pg_total_relation_size('tarifas')) FROM tarifas
UNION ALL
SELECT 'bandeiras_historico', COUNT(*), pg_size_pretty(pg_total_relation_size('bandeiras_historico')) FROM bandeiras_historico
UNION ALL
SELECT 'mmgd_classes', COUNT(*), pg_size_pretty(pg_total_relation_size('mmgd_classes')) FROM mmgd_classes
UNION ALL
SELECT 'tariff_cache', COUNT(*), pg_size_pretty(pg_total_relation_size('tariff_cache')) FROM tariff_cache;

-- 3. Total de Índices
\echo ''
\echo '3. ÍNDICES CRIADOS:'
SELECT 
    COUNT(*) as total_indices,
    COUNT(DISTINCT tablename) as tabelas_com_indices
FROM pg_indexes 
WHERE schemaname = 'public';

-- 4. Triggers
\echo ''
\echo '4. TRIGGERS CRIADOS:'
SELECT 
    COUNT(*) as total_triggers
FROM pg_trigger 
WHERE tgname NOT LIKE 'pg_%' AND tgname NOT LIKE 'RI_%';

-- 5. Funções
\echo ''
\echo '5. FUNÇÕES CRIADAS:'
SELECT 
    proname as funcao,
    pg_get_function_identity_arguments(oid) as argumentos
FROM pg_proc 
WHERE proname LIKE '%updated_at%'
ORDER BY proname;

-- 6. Tamanho total do banco
\echo ''
\echo '6. TAMANHO TOTAL DO BANCO:'
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) as tamanho
FROM pg_database
WHERE datname = 'medusa_db';

-- 7. Resumo de seed data
\echo ''
\echo '7. RESUMO DE SEED DATA:'
\echo '   Personas: 10'
\echo '   Buyer Journeys: 7'
\echo '   Tools: 16'
\echo '   Concessionárias: 25'
\echo '   Tarifas B1: 12'
\echo '   Bandeiras Histórico: 14'
\echo '   MMGD Classes: 7'

\echo ''
\echo '========================================='
\echo 'FIM DO RELATÓRIO'
\echo '========================================='
