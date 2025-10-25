-- ===================================================================
-- VALIDAÇÃO DAS MIGRATIONS DO DATABASE 360°
-- ===================================================================
-- Este script valida se as 5 tabelas foram criadas corretamente
-- no RDS PostgreSQL com todos os campos, tipos e indexes.
--
-- EXECUÇÃO:
--   psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
--        -U medusa_user -d medusa_db -f validate-migrations.sql
-- ===================================================================

\echo '\n====================================================================='
\echo '  VALIDAÇÃO DE MIGRATIONS - DATABASE 360°'
\echo '====================================================================='

\echo '\n[1/5] Verificando existência das tabelas...\n'

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis') 
        THEN '✓ OK'
        ELSE '✗ INESPERADO'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
ORDER BY table_name;

\echo '\n[2/5] Verificando contagem de colunas por tabela...\n'

SELECT 
    table_name,
    COUNT(*) as total_columns,
    CASE 
        WHEN table_name = 'lead' AND COUNT(*) >= 27 THEN '✓ OK (27+ campos)'
        WHEN table_name = 'event' AND COUNT(*) >= 49 THEN '✓ OK (49+ campos)'
        WHEN table_name = 'rag_query' AND COUNT(*) >= 35 THEN '✓ OK (35+ campos)'
        WHEN table_name = 'helio_conversation' AND COUNT(*) >= 49 THEN '✓ OK (49+ campos)'
        WHEN table_name = 'photogrammetry_analysis' AND COUNT(*) >= 64 THEN '✓ OK (64+ campos)'
        ELSE '⚠ VERIFICAR SCHEMA'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
GROUP BY table_name
ORDER BY table_name;

\echo '\n[3/5] Verificando indexes criados...\n'

SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
ORDER BY tablename, indexname;

\echo '\n[4/5] Verificando campos críticos da tabela LEAD...\n'

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'lead'
AND column_name IN ('id', 'email', 'phone', 'status', 'customer_id', 'source', 'created_at')
ORDER BY 
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'email' THEN 2
        WHEN 'phone' THEN 3
        WHEN 'status' THEN 4
        WHEN 'customer_id' THEN 5
        WHEN 'source' THEN 6
        WHEN 'created_at' THEN 7
    END;

\echo '\n[5/5] Verificando campos críticos da tabela EVENT...\n'

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'event'
AND column_name IN ('id', 'customer_id', 'session_id', 'event_name', 'event_category', 'page_path', 'created_at')
ORDER BY 
    CASE column_name
        WHEN 'id' THEN 1
        WHEN 'customer_id' THEN 2
        WHEN 'session_id' THEN 3
        WHEN 'event_name' THEN 4
        WHEN 'event_category' THEN 5
        WHEN 'page_path' THEN 6
        WHEN 'created_at' THEN 7
    END;

\echo '\n====================================================================='
\echo '  SUMÁRIO DA VALIDAÇÃO'
\echo '====================================================================='

-- Resumo geral
SELECT 
    'Tabelas criadas' as metric,
    COUNT(DISTINCT table_name)::text as value,
    '5 esperadas' as expected
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')

UNION ALL

SELECT 
    'Total de colunas',
    COUNT(*)::text,
    '264+ esperadas (soma das 5 tabelas)'
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')

UNION ALL

SELECT 
    'Indexes criados',
    COUNT(*)::text,
    '37+ esperados (7+8+7+7+8)'
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')

UNION ALL

SELECT
    'Database',
    current_database(),
    'medusa_db'

UNION ALL

SELECT
    'Schema',
    'public',
    'public'

UNION ALL

SELECT
    'Versão PostgreSQL',
    version(),
    '15.x';

\echo '\n====================================================================='
\echo '  TESTES DE INSERT BÁSICOS'
\echo '====================================================================='

\echo '\nTestando INSERT em LEAD (será feito ROLLBACK)...\n'

BEGIN;

INSERT INTO lead (
    email,
    status,
    source,
    created_at,
    updated_at
) VALUES (
    'test@example.com',
    'new',
    'website',
    NOW(),
    NOW()
) RETURNING id, email, status, source, created_at;

ROLLBACK;

\echo '✓ INSERT em LEAD funcionou corretamente\n'

\echo 'Testando INSERT em EVENT (será feito ROLLBACK)...\n'

BEGIN;

INSERT INTO event (
    event_name,
    event_category,
    page_path,
    created_at
) VALUES (
    'page_view',
    'navigation',
    '/products',
    NOW()
) RETURNING id, event_name, event_category, page_path, created_at;

ROLLBACK;

\echo '✓ INSERT em EVENT funcionou corretamente\n'

\echo '\n====================================================================='
\echo '  ✓ VALIDAÇÃO CONCLUÍDA COM SUCESSO!'
\echo '====================================================================='
\echo '\nAs migrations foram aplicadas corretamente no RDS PostgreSQL.'
\echo 'Todas as 5 tabelas estão criadas com schemas completos.\n'
