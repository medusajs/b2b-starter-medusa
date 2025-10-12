# 🎯 Task v12 Status - DATABASE_SSL Configuration

**Data:** 12 de outubro de 2025, 18:20 BRT  
**Task Definition:** v12  
**Imagem:** v1.0.2  

---

## ❌ STATUS: TASKS FALHANDO

### Configuração Aplicada (v12)

**Environment Variables Adicionadas:**

```json
{
  "DATABASE_SSL": "true",
  "DATABASE_SSL_REJECT_UNAUTHORIZED": "true",
  "DATABASE_SSL_CA_FILE": "/tmp/rds-ca-bundle.pem",
  "NODE_EXTRA_CA_CERTS": "/tmp/rds-ca-bundle.pem"
}
```

**Objetivo:** Configurar SSL do PostgreSQL usando o util `resolveDatabaseSslConfig()`

---

## 📊 Tasks v12 Identificadas

### Task 1: `192aa85d0d6349438d4b2c4405b0a5d0`

- **Criada:** 15:11:05
- **Iniciada:** 15:12:08
- **Status:** DEPROVISIONING
- **Health:** UNKNOWN
- **Duração:** ~1 minuto antes de falhar

### Task 2: `9d9f144aef0d4ed8b753aaa7723fe047`

- **Criada:** 15:12:17
- **Iniciada:** 15:13:22
- **Status:** DEPROVISIONING
- **Health:** UNKNOWN
- **Duração:** ~1 minuto antes de falhar
- **Ação:** Registrada no target group (15:12:05)

**Padrão:** Ambas tasks iniciam mas falham após ~1 minuto

---

## 🔍 EVOLUÇÃO DOS ERROS

### v8 → Medusa Module SSL ✅ RESOLVIDO

- **Erro:** `Cannot find package '@medusajs/medusa/product'`
- **Fix:** Adicionado `ca-certificates` ao Alpine

### v9/v11 → RDS PostgreSQL SSL ❌ PERSISTENTE

- **Erro:** `SELF_SIGNED_CERT_IN_CHAIN`
- **Tentativa 1:** NODE_EXTRA_CA_CERTS (v11) - **FALHOU**
- **Tentativa 2:** DATABASE_SSL env vars (v12) - **STATUS PENDENTE**

---

## 🛠️ PRÓXIMA AÇÃO CRÍTICA

### Obter Logs Task v12

**Script CloudShell:**

```bash
bash docs/logs/get-v12-logs.sh
```

**Task ID:** `9d9f144aef0d4ed8b753aaa7723fe047`

**Validações Necessárias:**

1. ✅ Verificar se DATABASE_SSL config foi lida
2. ✅ Confirmar se CA file foi carregado
3. ✅ Validar se erro SSL persiste
4. ✅ Identificar qualquer novo erro

---

## 🤔 HIPÓTESES

### Se Logs Mostrarem Mesmo Erro SSL

#### Hipótese A: `resolveDatabaseSslConfig()` não está sendo aplicado

- **Causa Possível:** Medusa não usa `databaseDriverOptions.ssl`
- **Solução:** Adicionar SSL diretamente na DATABASE_URL

**Hipótese B:** Certificado não está sendo lido corretamente

- **Causa Possível:** Permissões do arquivo /tmp/rds-ca-bundle.pem
- **Solução:** Validar ownership e permissions no Dockerfile

**Hipótese C:** PostgreSQL requer configuração específica

- **Causa Possível:** Parâmetros SSL adicionais necessários
- **Solução:** Adicionar `sslmode=verify-ca` na connection string

### Se Logs Mostrarem Erro Diferente

**Investigar novo erro e ajustar estratégia**

---

## 📝 CONFIGURAÇÕES ATUAIS

### Dockerfile v1.0.2

```dockerfile
# Download RDS CA bundle
RUN curl -o /tmp/rds-ca-bundle.pem \
  https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Permissions
RUN chown medusa:medusa /tmp/rds-ca-bundle.pem
```

### medusa-config.ts

```typescript
databaseDriverOptions: {
  ssl: resolveDatabaseSslConfig(process.env),
}
```

### database-ssl.ts

```typescript
export const resolveDatabaseSslConfig = (env: Env): DatabaseSslConfig => {
  const shouldEnable = /^true$/i.test(env.DATABASE_SSL ?? "");
  if (!shouldEnable) return false;
  
  const caFile = env.DATABASE_SSL_CA_FILE;
  const ca = caFile && existsSync(caFile) 
    ? readFileSync(caFile, "utf8") 
    : undefined;
  
  return {
    rejectUnauthorized: true,
    ca,
  };
};
```

---

## 🚨 POSSÍVEL SOLUÇÃO ALTERNATIVA

Se DATABASE_SSL config falhar, próxima tentativa:

### Abordagem: SSL na Connection String

**Modificar DATABASE_URL no Secrets Manager:**

```tsx
postgresql://user:pass@host:5432/db?sslmode=require&sslrootcert=/tmp/rds-ca-bundle.pem
```

**Vantagens:**

- PostgreSQL nativo reconhece parâmetros SSL
- Bypassa configuração Medusa
- Mais direto e confiável

**Desvantagens:**

- Requer update do secret
- Menos flexível

---

## 📊 DEPLOYMENT TIMELINE v12

| Timestamp | Evento |
|-----------|--------|
| 15:10:55 | Service updated para v12 |
| 15:11:05 | Task 192aa... started |
| 15:12:05 | Task 9d9... registered no target group |
| 15:12:08 | Task 192aa... iniciada |
| 15:12:17 | Task 9d9... started |
| 15:12:26 | Task 192aa... draining connections (falha) |
| 15:13:22 | Task 9d9... iniciada |
| ~15:14:00 | Task 9d9... presumível falha |

**Observação:** Tasks conseguem iniciar e registrar no target group, mas falham no health check

---

## ✅ CHECKLIST PRÉ-FIX v1.0.3

- [ ] Obter e analisar logs task v12
- [ ] Confirmar se SSL error persiste
- [ ] Validar se ca-bundle está acessível
- [ ] Verificar permissions do arquivo
- [ ] Decidir estratégia: config vs connection string
- [ ] Implementar fix
- [ ] Build v1.0.3
- [ ] Deploy task v13

---

**Última Atualização:** 2025-10-12 18:20 BRT  
**Status:** Aguardando logs CloudShell  
**Próxima Revisão:** Após análise logs v12
