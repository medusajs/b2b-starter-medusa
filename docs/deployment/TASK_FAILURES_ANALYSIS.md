# Análise de Falhas das Tasks ECS - Backend Medusa

## 🔍 Diagnóstico Completo via CloudShell

### Task v9 (9a2162ef9a9645faa68e8fa1fbbf51e0) - SSL ERROR ❌

**Image**: v1.0.1 (com ca-certificates)

**Erro Principal**: PostgreSQL SSL Certificate Chain

```tsx
{"level":"warn","message":"Pg connection failed to connect to the database. Retrying...\n{\"code\":\"SELF_SIGNED_CERT_IN_CHAIN\"}","timestamp":"2025-10-12 17:20:19"}
{"level":"error","message":"self-signed certificate in certificate chain","stack":[{"columnNumber":34,"fileName":"node:_tls_wrap","functionName":"TLSSocket.onConnectSecure","lineNumber":1677,...
```

**Conclusão**: `ca-certificates` do Alpine **NÃO FOI SUFICIENTE** para validar certificado RDS AWS.

---

### Task v11 (b802e5ac6a444e4bb134848af3192b67) - DATABASE NOT MIGRATED ❌

**Image**: v1.0.2 (com RDS CA bundle + NODE_EXTRA_CA_CERTS)

**Erro Principal**: Tabelas do banco não existem

```json
{
  "level":"error",
  "message":"Loaders for module Tax failed: select \"t0\".* from \"public\".\"tax_provider\" as \"t0\" where ... - relation \"public.tax_provider\" does not exist",
  "timestamp":"2025-10-12 18:00:45"
}
```

**Tabelas Faltando**:

- `public.currency`
- `public.region_country`
- `public.tax_provider`
- `public.payment_provider`
- `public.notification_provider`

**Conclusão**: SSL foi **RESOLVIDO** na v1.0.2! Mas o banco de dados **não foi migrado** (`medusa db:migrate` não foi executado).

---

### Task v12 (9d9f144aef0d4ed8b753aaa7723fe047) - LOG STREAM NOT FOUND ⚠️

**Error**: `ResourceNotFoundException: The specified log stream does not exist`

**Possíveis Razões**:

1. Task nunca iniciou (falhou antes de criar log stream)
2. Task ID incorreto
3. Task foi desprovisionada antes de criar logs

**Task Alternativa v12**: `192aa85d0d6349438d4b2c4405b0a5d0` (stopped 2025-10-12T15:17:34)

---

## 📊 Comparação das Versões

| Task Definition | Image | SSL Status | Database Status | Result |
|-----------------|-------|------------|-----------------|--------|
| v8 | v1.0.0 | ❌ SSL Error | Unknown | FAILED |
| v9 | v1.0.1 | ❌ SSL Error (SELF_SIGNED_CERT_IN_CHAIN) | Not Reached | FAILED |
| v11 | v1.0.2 | ✅ **SSL OK!** | ❌ Not Migrated | FAILED |
| v12 | v1.0.2 | Unknown (no logs) | Unknown | FAILED |

---

## 🎯 Root Cause Identificado

### Problema Primário: Database Migrations

**Task v11 prova que:**

1. ✅ SSL foi resolvido (NODE_EXTRA_CA_CERTS funcionou)
2. ❌ Banco não tem tabelas do Medusa
3. Container tenta iniciar servidor antes de executar migrations

### Problema Secundário: ECS Fargate Workflow

**Medusa requer migrations antes de iniciar**:

```bash
# Ordem correta:
1. medusa db:migrate  # Criar/atualizar tabelas
2. medusa start       # Iniciar servidor
```

**Container atual executa apenas**:

```dockerfile
CMD ["npm", "start"]  # = medusa start (sem migrations)
```

---

## 🔧 Soluções Possíveis

### Opção 1: ECS Task Separada para Migrations (Recomendado)

**Criar segunda task definition** para executar migrations uma vez:

```json
{
  "family": "ysh-b2b-backend-migrations",
  "containerDefinitions": [{
    "name": "migrations",
    "image": "773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend:v1.0.2",
    "command": ["npx", "medusa", "db:migrate"],
    "essential": true,
    ...
  }]
}
```

**Executar manualmente**:

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations \
  --launch-type FARGATE \
  --network-configuration "..."
```

**Vantagens**:

- Separação de concerns (migrations vs. server)
- Não afeta deployment contínuo
- Padrão comum em ECS/Fargate

**Desvantagens**:

- Requer step manual antes de primeiro deploy
- Migrations futuras precisam de re-execução manual

---

### Opção 2: Entrypoint Script com Check Condicional

**Criar `backend/entrypoint.sh`**:

```bash
#!/bin/sh
set -e

echo "Checking if database is migrated..."

# Check se tabela core existe
if npx medusa db:check 2>/dev/null; then
  echo "Database already migrated, starting server..."
else
  echo "Database not migrated, running migrations first..."
  npx medusa db:migrate
fi

echo "Starting Medusa server..."
exec npm start
```

**Modificar Dockerfile**:

```dockerfile
COPY --chown=medusa:medusa entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
```

**Vantagens**:

- Auto-migração em primeiro deploy
- Migrations futuras executam automaticamente
- Zero intervenção manual

**Desvantagens**:

- Container startup mais lento
- Race condition se múltiplas tasks iniciarem simultaneamente
- `medusa db:check` pode não existir (depende da versão)

---

### Opção 3: Init Container Pattern (ECS Sidecar)

**Usar dependsOn** para ordenar containers:

```json
{
  "containerDefinitions": [
    {
      "name": "migrations",
      "command": ["npx", "medusa", "db:migrate"],
      "essential": false
    },
    {
      "name": "backend",
      "dependsOn": [{"containerName": "migrations", "condition": "SUCCESS"}],
      "command": ["npm", "start"],
      "essential": true
    }
  ]
}
```

**Vantagens**:

- Migrations sempre executam antes do servidor
- Garante ordem correta
- Suporta rollbacks

**Desvantagens**:

- Mais complexo
- Aumenta custos (2 containers por task)
- Pode causar timeouts em grandes migrations

---

## 📋 Plano de Ação Recomendado

### Fase 1: Executar Migrations Manualmente (IMEDIATO)

```bash
# 1. Registrar task definition de migrations
aws ecs register-task-definition \
  --cli-input-json file://aws/backend-migrations-task-definition.json

# 2. Executar task de migrations uma vez
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...],assignPublicIp=ENABLED}"

# 3. Aguardar completar e verificar logs

# 4. Atualizar serviço para usar task definition v11 (já tem SSL fix)
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:11 \
  --force-new-deployment
```

### Fase 2: Implementar Entrypoint Script (PRÓXIMO SPRINT)

```bash
# 1. Criar backend/entrypoint.sh
# 2. Modificar Dockerfile para usar entrypoint
# 3. Build v1.0.3 com auto-migrations
# 4. Deploy v1.0.3
```

---

## 🚨 Notas Importantes

### Por que v12 não tem logs?

Task `9d9f144aef0d4ed8b753aaa7723fe047` provavelmente:

- Falhou na fase de provisionamento (antes de criar log stream)
- Ou foi desprovisionada muito rapidamente
- Devemos tentar logs da task alternativa: `192aa85d0d6349438d4b2c4405b0a5d0`

### Por que v11 é melhor que v12?

**v11 já provou** que SSL está funcionando. v12 pode ter introduzido novos problemas com as environment variables adicionais (`DATABASE_SSL`, etc.).

**Recomendação**: Usar v11 após executar migrations.

### Security Groups e Network

Migrations task **DEVE** usar:

- Mesmas subnets que serviço
- Mesmos security groups (permitir PostgreSQL 5432)
- `assignPublicIp=ENABLED` para baixar dependências npm (se necessário)

---

## 📈 Estado Atual vs. Desejado

### Estado Atual (v11)

```
Container Start → medusa start → Error (tables don't exist) → Exit Code 1
```

### Estado Desejado

```
One-time: medusa db:migrate → Success
Every Deploy: medusa start → Success (tables exist)
```

---

## 🎯 Próximo Passo IMEDIATO

**Criar `aws/backend-migrations-task-definition.json`** e executar migrations manualmente.

Após confirmar que migrations completaram, deploy do serviço com v11 deve funcionar! ✅
