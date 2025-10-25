# Obter Logs Migrations Task - EXECUTAR NO CLOUDSHELL

## Task ID: 0b5e76c3e35c4e7b9aa8ed683ff134f2

**Status**: STOPPED com exitCode 1 (FAILED)

**Timeline**:

- Created: 2025-10-12T15:28:05
- Started: 2025-10-12T15:28:58 (53 segundos para provisionar)
- Stopped: 2025-10-12T15:29:36 (38 segundos rodando)

## Comando CloudShell

```bash
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations" \
  --log-stream-name "ecs/migrations/0b5e76c3e35c4e7b9aa8ed683ff134f2" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

## O que Procurar

**Possíveis erros**:

1. **SSL Error** (mesmo com NODE_EXTRA_CA_CERTS):

```tsx
error: self-signed certificate in certificate chain
code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

1. **Connection Refused**:

```tsx
error: connect ECONNREFUSED
```

3. **Missing Tables** (esperado na primeira execução):

```tsx
Running migrations...
✅ Migration completed: xxx.ts
```

4. **Command Not Found**:

```tsx
/bin/sh: medusa: not found
```

## Análise Esperada

Como v11 **provou que SSL funciona** mas migrations task falhou, possíveis causas:

1. **Comando incorreto**: `npx medusa db:migrate` vs `npm run medusa-db-migrate`
2. **SSL ainda falhando**: NODE_EXTRA_CA_CERTS não suficiente sem DATABASE_SSL vars
3. **Network issue**: Security group bloqueando PostgreSQL 5432

## Próximos Passos Baseado nos Logs

### Se mostrar SSL error

→ Adicionar DATABASE_SSL environment variables na migrations task definition

### Se mostrar command not found

→ Ajustar command para usar script npm correto

### Se mostrar connection refused

→ Verificar security group permite acesso PostgreSQL

Cole a saída completa dos logs aqui para diagnóstico! 🔍
