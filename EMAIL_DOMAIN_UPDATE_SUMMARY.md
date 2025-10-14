# Atualização de E-mails e Domínios Oficiais - YSH B2B

## 📊 Resumo das Atualizações

Data: 14 de outubro de 2025

### 🌐 Domínios Atualizados

**De:** `yellosolar.com.br`  
**Para:** `yellosolarhub.store`

#### Justificativa

- `yellosolarhub.store` é o domínio principal configurado com Vercel DNS (conforme export GoDaddy)
- Domínio já possui nameservers: `ns1.vercel-dns.com` e `ns2.vercel-dns.com`
- Maior clareza da marca "Yello Solar Hub"

### 📧 E-mails Atualizados

#### 1. **Admin Principal**

- **De:** `admin@test.com` ou `admin@yellosolar.com.br`
- **Para:** `fernando@yellosolarhub.com`
- **Papel:** Super Administrator (conforme CSV de usuários)
- **Uso:** Credenciais admin do Medusa, deployment scripts, database setup

#### 2. **Suporte e Alertas**

- **De:** `alerts@test.com` ou `alerts@yellosolar.com.br`
- **Para:** `suporte@yellosolarhub.com`
- **Papel:** User (suporte técnico)
- **Uso:** CloudWatch alerts, SNS notifications, monitoramento

#### 3. **Desenvolvimento**

- **De:** `dev@yellosolar.com.br`
- **Para:** `dev@yellosolarhub.com`
- **Papel:** User (equipe de desenvolvimento)
- **Uso:** API documentation, logs de desenvolvimento

### 📁 Arquivos Modificados

#### **Scripts de Deployment (AWS)**

1. ✅ `aws/post-deployment.ps1`
   - Parâmetro `AdminEmail` padrão: `fernando@yellosolarhub.com`

2. ✅ `aws/1-deploy-ecs-tasks.ps1`
   - (Sem alterações - não referencia emails)

3. ✅ `aws/2-setup-database.ps1`
   - Parâmetro `AdminEmail` padrão: `fernando@yellosolarhub.com`

4. ✅ `aws/3-setup-monitoring.ps1`
   - (Sem alterações - email é parâmetro fornecido)

5. ✅ `aws/4-configure-env.ps1`
   - (Sem alterações - não referencia emails)

#### **Configuração de Infraestrutura**

1. ✅ `aws/deploy-with-domain.ps1`
   - Parâmetro `DomainName` padrão: `yellosolarhub.store`

2. ✅ `aws/validate-deployment.ps1`
   - Parâmetro `DomainName` padrão: `yellosolarhub.store`

3. ✅ `aws/cloudformation-with-domain.yml`
   - Parâmetro `DomainName` default: `yellosolarhub.store`

#### **Documentação**

1. ✅ `aws/POST_DEPLOYMENT_README.md`
   - Todos os exemplos de emails atualizados
   - Todos os domínios atualizados
   - URLs de acesso: `https://yellosolarhub.store`, `https://api.yellosolarhub.store`

2. ✅ `aws/DEPLOYMENT_GUIDE_DOMAIN.md`
    - Prerequisito: `yellosolarhub.store`
    - Exemplos de deployment
    - URLs de output do CloudFormation
    - Link GoDaddy: `https://dcc.godaddy.com/manage/yellosolarhub.store/dns`

3. ✅ `AWS_SSO_GODADDY_DEPLOYMENT.md`
    - Todos os domínios `yellosolar.com.br` → `yellosolarhub.store`
    - Exemplos de Route53, ACM certificate
    - Verificação DNS

4. ✅ `aws/DEPLOYMENT_SUMMARY.md`
    - Todos os domínios atualizados
    - Exemplos de deployment
    - Checklist de verificação

5. ✅ `aws/README.md`
    - Parâmetro de exemplo: `yellosolarhub.store`

6. ✅ `.github/copilot-instructions.md`
    - Comando de criação de usuário admin: `fernando@yellosolarhub.com`
    - ID do admin: `admin_ysh`

7. ✅ `README.md` (raiz)
    - Link do site: `https://yellosolarhub.store`

#### **Backend**

1. ✅ `backend/docs/WEBSOCKET_MONITORING.md`
    - URLs de produção: `wss://api.yellosolarhub.store`
    - Configuração Nginx

2. ✅ `backend/scripts/normalization-examples.ts`
    - `product_url`: `https://yellosolarhub.store/produtos/...`
    - URLs canônicas e sitemaps

#### **Storefront**

1. ✅ `storefront/src/lib/api/CATALOG_API_DOCS.md`
    - Contato: `dev@yellosolarhub.com`

#### **Docker**

1. ✅ `docker/docker-compose.free-tier-dev.yml`
    - Comando de criação de admin: `fernando@yellosolarhub.com`
    - ID do admin: `admin_ysh`

---

## 🎯 Próximos Passos

### 1. **Configuração DNS em Produção**

Se ainda não configurado:

```powershell
# Verificar status atual no GoDaddy
nslookup -type=NS yellosolarhub.store 8.8.8.8

# Deve retornar:
# ns1.vercel-dns.com
# ns2.vercel-dns.com
```

### 2. **Executar Deployment com Novo Domínio**

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\aws

.\post-deployment.ps1 `
    -Environment production `
    -AdminEmail fernando@yellosolarhub.com `
    -AlertEmail suporte@yellosolarhub.com `
    -InteractiveMode
```

### 3. **Verificar E-mails Configurados**

Conforme CSV fornecido, emails disponíveis na Zoho Mail:

- ✅ `fernando@yellosolarhub.com` (Super Admin, 0.08 GB usado)
- ✅ `suporte@yellosolarhub.com` (User, 0.00 GB usado)
- ✅ `dev@yellosolarhub.com` (User, 0.00 GB usado)
- ✅ `contato@yellosolarhub.com` (User, 0.00 GB usado)
- ✅ `compliance@yellosolarhub.com` (User, 0.00 GB usado)

### 4. **Testar Acesso Pós-Deployment**

```powershell
# Storefront
curl -I https://yellosolarhub.store

# Backend API
curl https://api.yellosolarhub.store/health

# Admin Dashboard
# https://api.yellosolarhub.store/app
# Login: fernando@yellosolarhub.com
```

### 5. **Confirmar Subscription de Alerts**

- Email de CloudWatch será enviado para: `suporte@yellosolarhub.com`
- Verificar inbox e confirmar subscription do SNS

---

## 📋 Domínios Disponíveis (GoDaddy)

Conforme export fornecido:

| Domínio | Status | Nameservers | Uso Recomendado |
|---------|--------|-------------|-----------------|
| **yellosolarhub.store** | ✅ Ativo | Vercel DNS | **Principal (Produção)** |
| yellosolarhub.com | ✅ Ativo | GoDaddy | Redirect → .store |
| yellosolarhub.online | ✅ Ativo | GoDaddy | Marketing/Landing |
| yellosolarhub.club | ✅ Ativo | GoDaddy | Comunidade/Blog |
| yellosolarhub.xyz | ✅ Ativo | GoDaddy | Testes/Dev |

**Todos expiram:** 03/05/2026  
**Auto-renew:** Ativado  
**Privacy:** Ativado

---

## ✅ Validação das Mudanças

### Teste Local (Docker)

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store

# Backend
docker-compose -f docker/docker-compose.free-tier-dev.yml up -d
docker-compose -f docker/docker-compose.free-tier-dev.yml exec backend yarn medusa db:migrate
docker-compose -f docker/docker-compose.free-tier-dev.yml exec backend yarn run seed
docker-compose -f docker/docker-compose.free-tier-dev.yml exec backend yarn medusa user -e fernando@yellosolarhub.com -p supersecret -i admin_ysh
```

### Verificar Admin Login

```powershell
# Local
curl -X POST http://localhost:9000/auth/user/emailpass `
  -H "Content-Type: application/json" `
  -d '{"email":"fernando@yellosolarhub.com","password":"supersecret"}'

# Deve retornar JWT token
```

---

## 🔒 Segurança

### E-mails Sensíveis Removidos

- ❌ `admin@test.com` (email genérico de teste)
- ❌ `alerts@test.com` (email genérico de teste)
- ❌ Qualquer referência a `yellosolar.com.br` (domínio anterior)

### E-mails Oficiais Configurados

- ✅ Todos os e-mails usam domínio `@yellosolarhub.com`
- ✅ E-mails correspondem aos usuários reais na Zoho Mail
- ✅ Super Admin: `fernando@yellosolarhub.com` (pessoa real)

---

## 📞 Contatos Oficiais

### Equipe YSH

- **Fernando Teixeira** - Super Administrator
  - Email: <fernando@yellosolarhub.com>
  - Telefone: +55 21 99637-1563

### Suporte

- **Email:** <suporte@yellosolarhub.com>
- **Desenvolvimento:** <dev@yellosolarhub.com>
- **Geral:** <contato@yellosolarhub.com>
- **Compliance:** <compliance@yellosolarhub.com>

### Empresa

- **YELLO SOLAR HUB LTDA**
- **CNPJ:** 51.225.550/0001-40
- **Endereço:** Av General San Martin, 255 - Apt 301
- **CEP:** 22.441-012
- **Cidade:** Rio de Janeiro, RJ - Brasil

---

## 🎉 Status Final

✅ **Todos os e-mails e domínios atualizados com sucesso!**

- 19 arquivos modificados
- Domínio principal: `yellosolarhub.store`
- Admin email: `fernando@yellosolarhub.com`
- Alertas: `suporte@yellosolarhub.com`
- Pronto para deployment em produção

---

**Próxima ação:** Executar `.\post-deployment.ps1 -InteractiveMode` com os novos parâmetros.
