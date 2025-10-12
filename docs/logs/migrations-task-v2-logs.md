# Logs Migrations Task v2 - EXECUTAR NO CLOUDSHELL

## Task ID: 203b3e01e7114cf3a3303a9bc32757e1

**Status**: STOPPED com exitCode 1 (FAILED)

**Mudança**: Corrigido comando de `npx medusa db:migrate` para `npm run migrate`

**Resultado**: Task rodou (RUNNING status alcançado) mas ainda falhou

## Comando CloudShell

```bash
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations" \
  --log-stream-name "ecs/migrations/203b3e01e7114cf3a3303a9bc32757e1" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

## Análise Esperada

Desta vez o container iniciou (chegou a RUNNING), então **deve ter logs**!

Possíveis erros nos logs:

1. **SSL Error** (mais provável):

```
error: self-signed certificate in certificate chain
code: 'SELF_SIGNED_CERT_IN_CHAIN'
```

**Causa**: Migrations task só tem `NODE_EXTRA_CA_CERTS=/tmp/rds-ca-bundle.pem` mas **NÃO tem** `DATABASE_SSL*` environment variables que backend v12 tem.

**Solução**: Adicionar mesmas vars SSL que v12:

- `DATABASE_SSL=true`
- `DATABASE_SSL_REJECT_UNAUTHORIZED=true`  
- `DATABASE_SSL_CA_FILE=/tmp/rds-ca-bundle.pem`

2. **Connection Error**:

```
error: connect ECONNREFUSED
```

**Causa**: Security group bloqueando PostgreSQL 5432

**Solução**: Verificar inbound rules do RDS security group

3. **Migration Failure**:

```
Migration failed: [specific migration file]
```

**Causa**: Alguma migration com erro SQL

**Solução**: Investigar migration específica

## Próximo Passo

Cole a saída dos logs aqui. Baseado no comportamento (task chegou a RUNNING mas falhou), **alta probabilidade de ser SSL error** que v11 backend também teve.

Se confirmar SSL error → Adicionar `DATABASE_SSL*` vars na migrations task definition v3 e executar novamente.
