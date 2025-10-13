# 🚀 Checklist de Implementação - Módulo de Aprovações B2B

**Data**: 2025-10-12  
**Objetivo**: Migrar e validar melhorias do módulo de aprovações  
**Tempo Estimado**: 45 minutos

---

## ⚙️ Preparação

### 1. Backup do Banco de Dados

```powershell
# Criar backup antes de migrações
docker-compose exec -T postgres pg_dump -U postgres medusa > backup_pre_approval_$(Get-Date -Format 'yyyy-MM-dd_HH-mm').sql

# Confirmar backup criado
Get-ChildItem *.sql | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

**Status**: [ ] Backup criado em `backup_pre_approval_YYYY-MM-DD_HH-mm.sql`

---

### 2. Verificar Estado Atual

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# Verificar se serviços estão rodando
docker-compose ps

# Verificar conexão com banco
docker-compose exec postgres psql -U postgres -d medusa -c "\dt approval*"
```

**Status**: [ ] Services UP | [ ] Tabelas existentes: `approval`, `approval_settings`, `approval_status`

---

## 🔧 Fase 1: Geração de Migrações

### 3. Gerar Migrações para Novos Modelos

```powershell
cd backend

# Gerar migração para módulo de aprovações
yarn medusa db:generate ApprovalModule

# Verificar arquivos de migração gerados
Get-ChildItem src\modules\approval\migrations\*.ts | Sort-Object LastWriteTime -Descending | Select-Object -First 4
```

**Esperado**: 4 novos arquivos de migração criados

**Status**:

- [ ] `00X_add_approval_audit_fields.ts` (approval)
- [ ] `00X_add_approval_settings_advanced.ts` (approval_settings)
- [ ] `00X_create_approval_rule.ts` (approval_rule)
- [ ] `00X_create_approval_history.ts` (approval_history)

---

### 4. Revisar Migrações Geradas

```powershell
# Ver última migração gerada
Get-Content (Get-ChildItem src\modules\approval\migrations\*.ts | Sort-Object LastWriteTime -Descending | Select-Object -First 1).FullName
```

**Checklist de Revisão**:

- [ ] Colunas `approval.rejection_reason`, `approval_comment`, `handled_at` presentes
- [ ] Colunas `approval.client_ip_hash`, `user_agent_hash` presentes
- [ ] Colunas `approval.cart_total_snapshot`, `priority`, `escalated` presentes
- [ ] Coluna `approval.idempotency_key` presente
- [ ] Tabela `approval_rule` com campos `company_id`, `conditions`, `priority`
- [ ] Tabela `approval_history` com campos `actor_id`, `action_timestamp`, `is_system_action`

---

## 🗄️ Fase 2: Execução de Migrações

### 5. Executar Migrações

```powershell
# Backup antes da migração (redundante, mas seguro)
docker-compose exec -T postgres pg_dump -U postgres medusa > backup_before_migrate.sql

# Executar migrações
yarn medusa db:migrate

# Verificar status
docker-compose exec postgres psql -U postgres -d medusa -c "\d+ approval"
docker-compose exec postgres psql -U postgres -d medusa -c "\d+ approval_rule"
docker-compose exec postgres psql -U postgres -d medusa -c "\d+ approval_history"
```

**Status**:

- [ ] Migrações executadas sem erros
- [ ] Tabela `approval` tem 22+ colunas (antigas + novas)
- [ ] Tabela `approval_rule` criada com 10 colunas
- [ ] Tabela `approval_history` criada com 15 colunas

---

### 6. Validação de Schema

```powershell
# Verificar colunas de auditoria em approval
docker-compose exec postgres psql -U postgres -d medusa -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='approval' AND column_name IN ('rejection_reason', 'client_ip_hash', 'idempotency_key')"

# Verificar tabela approval_rule
docker-compose exec postgres psql -U postgres -d medusa -c "SELECT COUNT(*) FROM approval_rule"

# Verificar tabela approval_history
docker-compose exec postgres psql -U postgres -d medusa -c "SELECT COUNT(*) FROM approval_history"
```

**Status**:

- [ ] Colunas de auditoria presentes em `approval`
- [ ] Tabela `approval_rule` acessível (COUNT = 0)
- [ ] Tabela `approval_history` acessível (COUNT = 0)

---

## 🧪 Fase 3: Testes Unitários

### 7. Executar Testes do Serviço

```powershell
cd backend

# Executar testes unitários do módulo de aprovações
yarn test:unit src/modules/approval/__tests__/service.unit.spec.ts

# Se falhar, ver detalhes
yarn test:unit src/modules/approval/__tests__/service.unit.spec.ts --verbose
```

**Esperado**: 12 testes passando

**Status**:

- [ ] ✅ Rule Evaluation Matrix (6 testes)
- [ ] ✅ Idempotency (2 testes)
- [ ] ✅ Audit Trail (2 testes)
- [ ] ✅ Escalation (4 testes)

**Se falhar**: Capturar log de erro e revisar `service.ts` line XX

---

## 🔗 Fase 4: Testes de Integração

### 8. Corrigir Import Paths (se necessário)

```powershell
# Verificar estrutura de helpers
Get-ChildItem -Recurse -Filter "helpers*" integration-tests/

# Se paths estiverem incorretos, ajustar em approval.spec.ts:
# - Linha 17: import { ... } from "../helpers" (ajustar conforme estrutura real)
# - Linha 18: import { ApprovalStatusType } from "../../src/types/approval"
```

**Status**: [ ] Paths corrigidos se necessário

---

### 9. Executar Testes de Integração

```powershell
# Executar testes HTTP de aprovações
yarn test:integration:http integration-tests/http/approval.spec.ts

# Ver output detalhado
yarn test:integration:http integration-tests/http/approval.spec.ts --verbose
```

**Esperado**: 8 suítes passando

**Status**:

- [ ] ✅ Happy Path (criação + aprovação)
- [ ] ✅ Rejection Cascade
- [ ] ✅ Idempotency (duplicatas)
- [ ] ✅ State Persistence
- [ ] ✅ Escalation
- [ ] ✅ Auto-Approval

**Se falhar**:

1. Verificar se backend está rodando (`docker-compose ps`)
2. Verificar logs do backend (`docker-compose logs backend`)
3. Verificar se migrações rodaram (Fase 2, step 6)

---

## ✅ Fase 5: Validação Funcional

### 10. Testar Criação de Regra de Aprovação (Manual)

```powershell
# Via SQL (temporário até API estar pronta)
docker-compose exec postgres psql -U postgres -d medusa

# No psql:
```

```sql
-- Inserir regra de teste
INSERT INTO approval_rule (
  id, company_id, rule_name, conditions, 
  required_approval_type, required_approvers_count,
  priority, is_active, created_at, updated_at
) VALUES (
  'appr_rule_test_01', 
  'comp_01H8XYZ', 
  'High-Value Weekend Orders',
  '{"cart_total_gte": 10000, "day_of_week": ["SAT", "SUN"]}',
  'admin',
  2,
  100,
  true,
  NOW(),
  NOW()
);

-- Verificar criação
SELECT * FROM approval_rule WHERE id = 'appr_rule_test_01';
```

**Status**: [ ] Regra criada com sucesso | [ ] JSON `conditions` armazenado corretamente

---

### 11. Testar Fluxo de Aprovação Completo (Manual)

```powershell
# Criar carrinho de teste via API Admin
$adminToken = "SEU_TOKEN_AQUI"  # Obter do Admin UI

# Criar carrinho
$cart = Invoke-RestMethod -Uri "http://localhost:9000/admin/carts" -Method POST -Headers @{
  "Authorization" = "Bearer $adminToken"
  "Content-Type" = "application/json"
} -Body '{
  "region_id": "reg_01H8XYZ",
  "customer_id": "cus_01H8XYZ"
}'

# Adicionar item de alto valor
Invoke-RestMethod -Uri "http://localhost:9000/admin/carts/$($cart.cart.id)/line-items" -Method POST -Headers @{
  "Authorization" = "Bearer $adminToken"
  "Content-Type" = "application/json"
} -Body '{
  "variant_id": "variant_01H8XYZ",
  "quantity": 100
}'

# Solicitar aprovação
$approval = Invoke-RestMethod -Uri "http://localhost:9000/admin/carts/$($cart.cart.id)/approvals" -Method POST -Headers @{
  "Authorization" = "Bearer $adminToken"
  "Content-Type" = "application/json"
} -Body '{
  "created_by": "emp_01H8XYZ"
}'

# Verificar aprovação criada
$approval.approvals

# Verificar histórico
docker-compose exec postgres psql -U postgres -d medusa -c "SELECT * FROM approval_history WHERE approval_id = '$($approval.approvals[0].id)'"
```

**Status**:

- [ ] Carrinho criado
- [ ] Aprovação criada com `idempotency_key` presente
- [ ] Histórico registrado com `previous_status = NULL`, `new_status = 'pending'`
- [ ] `client_ip_hash` presente (não IP cru)

---

## 📊 Fase 6: Verificação de Auditoria

### 12. Validar PII Redaction

```powershell
# Verificar que IPs NÃO são armazenados crus
docker-compose exec postgres psql -U postgres -d medusa -c "
  SELECT 
    id, 
    actor_ip_hash, 
    LENGTH(actor_ip_hash) as hash_length,
    actor_user_agent_hash
  FROM approval_history 
  LIMIT 5;
"
```

**Checklist de Validação**:

- [ ] `actor_ip_hash` tem 64 caracteres (SHA-256 hex)
- [ ] `actor_ip_hash` não contém pontos (e.g., `192.168.1.1`)
- [ ] `actor_user_agent_hash` tem 64 caracteres
- [ ] Coluna `actor_ip` NÃO existe na tabela

**Status**: [ ] ✅ PII Redacted corretamente

---

### 13. Validar Imutabilidade de Histórico

```powershell
# Tentar UPDATE em approval_history (deve falhar se constraint está ativa)
docker-compose exec postgres psql -U postgres -d medusa -c "
  UPDATE approval_history 
  SET actor_id = 'HACKED' 
  WHERE id = (SELECT id FROM approval_history LIMIT 1);
"
```

**Esperado**:

- ⚠️ Se UPDATE funcionar, adicionar constraint de imutabilidade (opcional)
- ✅ Se aplicação controla imutabilidade via lógica (sem UPDATE statements)

**Status**: [ ] Imutabilidade verificada (controlada por aplicação)

---

## 🔍 Fase 7: Performance & Observabilidade

### 14. Verificar Índices de Banco

```powershell
# Índices críticos para performance
docker-compose exec postgres psql -U postgres -d medusa -c "
  SELECT indexname, indexdef 
  FROM pg_indexes 
  WHERE tablename IN ('approval', 'approval_rule', 'approval_history')
  ORDER BY tablename, indexname;
"
```

**Índices Esperados**:

- [ ] `approval.cart_id` (queries por carrinho)
- [ ] `approval.status` (filtro por status)
- [ ] `approval.idempotency_key` (duplicate checking)
- [ ] `approval_history.approval_id` (fetch histórico)
- [ ] `approval_rule.company_id` (rules por empresa)

**Se faltando**: Criar manualmente:

```sql
CREATE INDEX idx_approval_cart_id ON approval(cart_id);
CREATE INDEX idx_approval_status ON approval(status);
CREATE INDEX idx_approval_idempotency_key ON approval(idempotency_key);
CREATE INDEX idx_approval_history_approval_id ON approval_history(approval_id);
CREATE INDEX idx_approval_rule_company_id ON approval_rule(company_id);
```

**Status**: [ ] Índices críticos presentes

---

### 15. Monitorar Logs de Aplicação

```powershell
# Ver logs em tempo real
docker-compose logs -f backend --tail=100

# Em terminal separado, criar aprovação e ver logs
# Procurar por:
# - "evaluateApprovalRules" (lógica de regras)
# - "recordApprovalHistory" (auditoria)
# - "generateIdempotencyKey" (chave única)
```

**Status**: [ ] Logs mostrando fluxo de aprovação sem erros

---

## 🎯 Fase 8: Documentação & Handoff

### 16. Atualizar README com Novos Endpoints

```powershell
# Adicionar ao backend/README.md:
```

```markdown
## Módulo de Aprovações - Endpoints

### Admin
- `POST /admin/carts/:id/approvals` - Criar solicitação de aprovação
- `POST /admin/approvals/:id` - Aprovar/rejeitar
- `POST /admin/approvals/:id/escalate` - Escalar manualmente (TODO)
- `GET /admin/approvals/:id/history` - Histórico de auditoria (TODO)
- `GET /admin/companies/:id/approval-settings` - Configurações
- `POST /admin/companies/:id/approval-settings` - Atualizar configurações
- `CRUD /admin/approval-rules` - Gerenciar regras (TODO)

### Novos Campos
- **ApprovalSettings**: 
  - `admin_approval_threshold`, `sales_manager_approval_threshold`
  - `requires_multiple_approvers`, `min_approvers_count`
  - `escalation_enabled`, `escalation_timeout_hours`
  - `auto_approve_threshold`

- **Approval**:
  - `rejection_reason`, `approval_comment`, `handled_at`
  - `client_ip_hash`, `user_agent_hash` (PII redacted)
  - `cart_total_snapshot`, `priority`, `escalated`
  - `idempotency_key`

### Novos Modelos
- **ApprovalRule**: Políticas granulares com condições JSON
- **ApprovalHistory**: Trilha imutável de auditoria
```

**Status**: [ ] README atualizado

---

### 17. Criar Exemplo de Configuração

```powershell
# Criar arquivo de exemplo
New-Item -Path backend\examples\approval-settings-example.json -ItemType File -Force
```

```json
{
  "company_id": "comp_01H8XYZ",
  "requires_admin_approval": true,
  "admin_approval_threshold": 5000.00,
  "requires_sales_manager_approval": true,
  "sales_manager_approval_threshold": 10000.00,
  "requires_multiple_approvers": true,
  "min_approvers_count": 2,
  "escalation_enabled": true,
  "escalation_timeout_hours": 24,
  "escalation_role": "sales_director",
  "auto_approve_below_threshold": true,
  "auto_approve_threshold": 500.00,
  "priority_threshold": 50000.00
}
```

**Status**: [ ] Exemplo criado em `backend/examples/`

---

## 🚨 Troubleshooting

### Problema 1: Migrações Falham

**Sintomas**: `yarn medusa db:migrate` retorna erro

**Soluções**:

1. Verificar sintaxe SQL nas migrações geradas
2. Verificar conflitos de nome de coluna:

   ```powershell
   docker-compose exec postgres psql -U postgres -d medusa -c "\d approval"
   ```

3. Rollback e recriar:

   ```powershell
   yarn medusa db:migrate down
   yarn medusa db:generate ApprovalModule
   yarn medusa db:migrate
   ```

---

### Problema 2: Testes Unitários Falham

**Sintomas**: Jest retorna erros em `service.unit.spec.ts`

**Soluções**:

1. Verificar mocks em `service.unit.spec.ts`:
   - `mockRepository.listApprovalRules` retorna array correto
   - `mockRepository.createApprovalHistories` é mockado
2. Verificar imports:

   ```typescript
   import { ApprovalType, ApprovalStatusType } from "../../../types/approval";
   ```

3. Rodar teste isolado para debugging:

   ```powershell
   yarn test:unit -t "should require admin approval when cart total exceeds threshold"
   ```

---

### Problema 3: Testes de Integração Falham

**Sintomas**: HTTP requests retornam 404 ou 500

**Soluções**:

1. Verificar se backend está UP:

   ```powershell
   docker-compose ps backend
   ```

2. Verificar se endpoints existem:

   ```powershell
   Get-ChildItem -Recurse backend/src/api/admin/approvals
   ```

3. Verificar logs de erro:

   ```powershell
   docker-compose logs backend --tail=50 | Select-String -Pattern "error|Error|ERROR"
   ```

4. Testar endpoint manualmente:

   ```powershell
   Invoke-RestMethod -Uri "http://localhost:9000/admin/companies/comp_01H8XYZ/approval-settings" -Headers @{ "Authorization" = "Bearer $token" }
   ```

---

## 📋 Resumo Final

### Checklist Geral

- [ ] **Fase 1**: Migrações geradas (4 arquivos)
- [ ] **Fase 2**: Migrações executadas, schema validado
- [ ] **Fase 3**: Testes unitários passando (12/12)
- [ ] **Fase 4**: Testes de integração passando (8/8)
- [ ] **Fase 5**: Validação funcional manual OK
- [ ] **Fase 6**: Auditoria validada (PII redacted, histórico imutável)
- [ ] **Fase 7**: Performance verificada (índices presentes)
- [ ] **Fase 8**: Documentação atualizada

### Próximos Passos (P2/P3)

- [ ] Implementar endpoints faltantes (`/escalate`, `/history`, CRUD rules)
- [ ] Criar scheduled job para escalonamento automático
- [ ] Implementar webhooks/eventos (requirement original)
- [ ] Criar UI Admin para gerenciar regras de aprovação
- [ ] Configurar métricas Prometheus
- [ ] Criar dashboard Grafana

### Sign-off

- [ ] **Desenvolvedor**: Validou testes localmente
- [ ] **Tech Lead**: Revisou código e documentação
- [ ] **DBA**: Aprovou migrações e índices
- [ ] **QA**: Validou fluxos críticos
- [ ] **Security**: Aprovou PII redaction

---

**Tempo Total Estimado**: 45 minutos  
**Tempo Real**: _______ minutos  
**Status Final**: [ ] ✅ PRONTO PARA PRODUÇÃO | [ ] ⚠️ PENDÊNCIAS

---

*Gerado via GitHub Copilot @ 2025-10-12*
