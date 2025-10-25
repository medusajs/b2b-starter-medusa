# 🔐 Secrets Management - README

Este diretório (vazio por padrão) é reservado para scripts e arquivos relacionados ao gerenciamento de secrets.

## ⚠️ IMPORTANTE

**NUNCA commit arquivos com secrets reais neste diretório!**

## 📁 Estrutura Recomendada

```
secrets/
├── README.md                    # Este arquivo
├── .gitignore                   # Ignora arquivos sensíveis
└── (arquivos temporários locais apenas para desenvolvimento)
```

## 🎯 Como Usar

### Para Desenvolvimento Local

1. Crie um arquivo `.env` na raiz do backend:
   ```bash
   cp .env.template .env
   ```

2. Preencha com seus secrets locais

### Para Staging/Production

**Use AWS Secrets Manager!**

1. **Criar secrets:**
   ```bash
   cd scripts/
   ./create-aws-secrets.sh
   ```

2. **Carregar secrets no EC2:**
   ```bash
   source scripts/load-aws-secrets.sh
   ```

3. **Verificar secrets:**
   ```bash
   ./scripts/verify-secrets.sh
   ```

## 📚 Documentação

Veja o guia completo em: `docs/SECRETS_MANAGEMENT_GUIDE.md`

## 🔗 Referências Rápidas

- **Gerar JWT Secret:**
  ```bash
  openssl rand -base64 64
  ```

- **Gerar Database Password:**
  ```bash
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
  ```

- **Listar secrets no AWS:**
  ```bash
  aws secretsmanager list-secrets \
    --filters Key=name,Values=ysh-backend/ \
    --region us-east-1
  ```

## ✅ Checklist de Segurança

- [ ] `.env` em `.gitignore`
- [ ] Secrets diferentes por ambiente
- [ ] Produção usa AWS Secrets Manager
- [ ] IAM roles com least privilege
- [ ] Rotação periódica de secrets
- [ ] Auditoria com CloudTrail

---

**Última atualização:** 13/10/2025
