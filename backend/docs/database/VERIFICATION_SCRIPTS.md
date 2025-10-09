# 🔧 Scripts de Verificação e Manutenção - YSH B2B Database

## Verificação Rápida de Dados

### 1. Verificar Personas

```sql
SELECT 
    code,
    display_name,
    persona_type,
    pricing_tier,
    approval_threshold,
    is_active
FROM personas
ORDER BY priority;
```

### 2. Verificar Buyer Journeys

```sql
SELECT 
    code,
    display_name,
    complexity,
    duration_min,
    duration_max,
    target_conversion_rate,
    completion_percentage
FROM buyer_journeys
ORDER BY completion_percentage DESC;
```

### 3. Verificar Tools Disponíveis

```sql
SELECT 
    code,
    display_name,
    tool_type,
    category,
    api_endpoint,
    max_executions_per_day,
    requires_auth,
    requires_b2b,
    is_active
FROM persona_tools
WHERE is_active = true
ORDER BY category, code;
```

### 4. Verificar Concessionárias e Tarifas

```sql
SELECT 
    c.sigla,
    c.nome,
    c.uf,
    t.grupo,
    t.classe,
    t.tarifa_kwh,
    t.bandeira_amarela,
    t.vigencia_inicio
FROM concessionarias c
LEFT JOIN tarifas t ON c.id = t.concessionaria_id
WHERE c.is_active = true AND (t.is_current = true OR t.id IS NULL)
ORDER BY c.sigla;
```

### 5. Verificar Classes MMGD

```sql
SELECT 
    codigo,
    nome,
    tipo_mmgd,
    modalidade,
    potencia_max_kwp,
    oversizing_min_pct,
    oversizing_max_pct,
    credito_validade_meses
FROM mmgd_classes
WHERE is_active = true
ORDER BY potencia_max_kwp;
```

## Queries de Analytics

### 6. Top Tools por Categoria

```sql
SELECT 
    category,
    COUNT(*) as total_tools,
    COUNT(*) FILTER (WHERE is_active = true) as active_tools,
    COUNT(*) FILTER (WHERE requires_b2b = true) as b2b_only_tools
FROM persona_tools
GROUP BY category
ORDER BY total_tools DESC;
```

### 7. Personas por Tipo

```sql
SELECT 
    persona_type,
    COUNT(*) as total,
    AVG(approval_threshold) as avg_approval_threshold,
    STRING_AGG(code, ', ') as personas
FROM personas
WHERE is_active = true
GROUP BY persona_type
ORDER BY total DESC;
```

### 8. Buyer Journeys - Métricas

```sql
SELECT 
    code,
    display_name,
    complexity,
    target_conversion_rate * 100 as target_conversion_pct,
    completion_percentage,
    CASE 
        WHEN completion_percentage = 100 THEN '✅ Complete'
        WHEN completion_percentage >= 80 THEN '⚠️ Almost'
        ELSE '❌ Incomplete'
    END as status
FROM buyer_journeys
ORDER BY completion_percentage DESC;
```

### 9. Tarifas por Estado

```sql
SELECT 
    t.uf,
    COUNT(DISTINCT c.id) as num_concessionarias,
    ROUND(AVG(t.tarifa_kwh)::numeric, 4) as avg_tarifa_kwh,
    MIN(t.tarifa_kwh) as min_tarifa,
    MAX(t.tarifa_kwh) as max_tarifa
FROM tarifas t
JOIN concessionarias c ON t.concessionaria_id = c.id
WHERE t.is_current = true AND t.grupo = 'B1'
GROUP BY t.uf
ORDER BY avg_tarifa_kwh DESC;
```

### 10. Tamanho das Tabelas

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;
```

## Comandos de Manutenção

### Limpar Cache de Tarifas Expirado

```sql
DELETE FROM tariff_cache WHERE expires_at < NOW();
```

### Atualizar Bandeira Atual

```sql
-- Exemplo: Atualizar para bandeira amarela em fevereiro/2025
INSERT INTO bandeiras_historico (mes, ano, bandeira, valor_adicional, valor_100kwh, regiao, subsistema)
VALUES (2, 2025, 'amarela', 0.02, 2.00, 'nacional', 'S/SE/CO/NE/N')
ON CONFLICT (ano, mes, regiao) DO UPDATE SET
    bandeira = EXCLUDED.bandeira,
    valor_adicional = EXCLUDED.valor_adicional,
    valor_100kwh = EXCLUDED.valor_100kwh;
```

### Desativar Tarifa Antiga

```sql
UPDATE tarifas 
SET is_current = false
WHERE vigencia_fim < NOW() AND is_current = true;
```

### Verificar Integridade de FKs

```sql
-- Verificar concessionarias órfãs
SELECT id, nome FROM concessionarias 
WHERE id NOT IN (SELECT DISTINCT concessionaria_id FROM tarifas);

-- Verificar tarifas sem concessionaria
SELECT id, uf, grupo FROM tarifas 
WHERE concessionaria_id NOT IN (SELECT id FROM concessionarias);
```

## Backup e Restore

### Backup Completo

```powershell
# PowerShell
docker exec ysh-b2b-postgres-dev pg_dump -U medusa_user -d medusa_db -F c -f /tmp/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").dump

# Copiar backup para host
docker cp ysh-b2b-postgres-dev:/tmp/backup_*.dump ./backups/
```

### Backup Apenas Seed Data

```sql
\copy personas TO '/tmp/personas_backup.csv' CSV HEADER;
\copy buyer_journeys TO '/tmp/buyer_journeys_backup.csv' CSV HEADER;
\copy persona_tools TO '/tmp/persona_tools_backup.csv' CSV HEADER;
\copy concessionarias TO '/tmp/concessionarias_backup.csv' CSV HEADER;
\copy tarifas TO '/tmp/tarifas_backup.csv' CSV HEADER;
\copy mmgd_classes TO '/tmp/mmgd_classes_backup.csv' CSV HEADER;
```

### Restore

```powershell
docker exec -i ysh-b2b-postgres-dev pg_restore -U medusa_user -d medusa_db -c /tmp/backup_20250110_120000.dump
```

## Performance Monitoring

### Slow Queries (top 10)

```sql
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Índices Não Utilizados

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Vacuum e Analyze

```sql
-- Vacuum todas as tabelas
VACUUM ANALYZE;

-- Vacuum específico
VACUUM ANALYZE personas;
VACUUM ANALYZE tarifas;
VACUUM ANALYZE tool_usage_tracking;
```

## Scripts PowerShell Úteis

### Executar Query Rápida

```powershell
# Verificar contagem de registros
docker exec -i ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -c "
SELECT 
    'personas' as tabela, COUNT(*) FROM personas
UNION ALL SELECT 'buyer_journeys', COUNT(*) FROM buyer_journeys
UNION ALL SELECT 'persona_tools', COUNT(*) FROM persona_tools
UNION ALL SELECT 'concessionarias', COUNT(*) FROM concessionarias
UNION ALL SELECT 'tarifas', COUNT(*) FROM tarifas;"
```

### Loop de Verificação de Saúde

```powershell
while ($true) {
    Write-Host "`n=== $(Get-Date -Format 'HH:mm:ss') ===" -ForegroundColor Cyan
    
    docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -t -c "
        SELECT 
            'Connections: ' || count(*) 
        FROM pg_stat_activity 
        WHERE datname = 'medusa_db';
    "
    
    docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -t -c "
        SELECT 
            'DB Size: ' || pg_size_pretty(pg_database_size('medusa_db'));
    "
    
    Start-Sleep -Seconds 5
}
```

### Exportar Schema para Documentação

```powershell
# Gerar SQL do schema (sem dados)
docker exec ysh-b2b-postgres-dev pg_dump -U medusa_user -d medusa_db -s -f /tmp/schema_only.sql

# Copiar para host
docker cp ysh-b2b-postgres-dev:/tmp/schema_only.sql ./docs/
```

## Troubleshooting

### Verificar Logs do PostgreSQL

```powershell
docker logs ysh-b2b-postgres-dev --tail 100 -f
```

### Verificar Conexões Ativas

```sql
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    LEFT(query, 50) as query_preview
FROM pg_stat_activity
WHERE datname = 'medusa_db'
ORDER BY query_start DESC;
```

### Matar Conexão Problemática

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid = 12345; -- Substituir pelo PID real
```

### Recriar Índice Corrompido

```sql
REINDEX TABLE personas;
REINDEX TABLE tarifas;
```

## Checklist de Pós-Migration

- [x] Executar `000_status_report.sql` para verificar
- [x] Confirmar seed data: 10 personas, 7 journeys, 16 tools, 25 concessionarias
- [ ] Testar queries de exemplo acima
- [ ] Verificar performance com `EXPLAIN ANALYZE`
- [ ] Configurar backup automático (cron/scheduled task)
- [ ] Documentar mudanças no README principal
- [ ] Criar migration de rollback se necessário
- [ ] Atualizar diagramas ERD

---

**Última Atualização:** 10/01/2025  
**Versão:** 1.0  
**Autor:** YSH B2B Development Team
