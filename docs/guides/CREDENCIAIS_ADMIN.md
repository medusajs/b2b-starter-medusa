# 🔐 Credenciais de Acesso - Yello Solar Hub (YSH)

**Data:** 08/10/2025  
**Ambiente:** Desenvolvimento Local

---

## 👤 Usuário Admin

| Campo | Valor |
|-------|-------|
| **Email** | `admin@ysh.solar` |
| **Senha** | `Ysh2025Admin!` |
| **URL Admin** | <http://localhost:9000/app> |
| **ID Usuário** | `user_01K729HPWXDWJHVE4ZQABSK8JG` |
| **Criado em** | 2025-10-08 16:12:56 UTC |

---

## 🔑 API Keys

### Publishable API Key (Storefront)

```
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
```

**Observação:** Esta key está configurada no arquivo `.env` do storefront e permite que o frontend acesse a API do Medusa.

---

## 🌐 URLs do Sistema

| Serviço | URL | Status |
|---------|-----|--------|
| **Storefront (Next.js)** | <http://localhost:8000> | ✅ Rodando (porta 8000) |
| **Backend API** | <http://localhost:9000> | ✅ Rodando |
| **Admin Dashboard** | <http://localhost:9000/app> | ✅ Rodando |
| **PostgreSQL** | localhost:15432 | ✅ Healthy |
| **Redis** | localhost:16379 | ✅ Healthy |

---

## 🗄️ Database

| Campo | Valor |
|-------|-------|
| **Host** | localhost:15432 |
| **Database** | medusa_db |
| **Usuário** | medusa_user |
| **Senha** | medusa_password |
| **Engine** | PostgreSQL 16 Alpine |

---

## 🎨 Logo Yello Solar Hub

O logo foi atualizado com o design oficial da Yello Solar Hub:

- **Arquivo SVG:** `/storefront/public/logo.svg`
- **Componente React:** `/storefront/src/modules/common/icons/logo.tsx`
- **Design:** Sol radiante com 16 raios em gradiente amarelo-laranja-vermelho
- **Cores:**
  - Centro: `#FFC107` (Amarelo)
  - Meio: `#FF9800` (Laranja)
  - Bordas: `#FF5722` (Vermelho-laranja)

---

## 📦 Status do Backend

### Dados Iniciais (Seed)

- ✅ Usuário admin criado
- ⚠️ Seed completo pendente (conflito de regiões existentes)
- ✅ Sales Channels: Default, YSH-B2C, YSH-Integradores, YSH-Marketplace

### Produtos

- **Status:** Banco vazio (0 produtos)
- **Ação necessária:** Executar seed de catálogo ou importar produtos

---

## 🔧 Troubleshooting

### Se o storefront não carregar produtos

1. **Verificar backend:**

   ```powershell
   curl http://localhost:9000/health
   ```

2. **Verificar publishable key:**
   - Confirmar que está no `.env` do storefront
   - Key deve começar com `pk_`

3. **Verificar produtos no banco:**

   ```powershell
   docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -c "SELECT COUNT(*) FROM product;"
   ```

4. **Executar seed (se necessário):**

   ```powershell
   docker exec ysh-b2b-backend-dev npm run seed
   ```

### Se houver erro de região no seed

O seed já foi parcialmente executado. Para limpar e recriar:

```powershell
# Limpar regiões existentes
docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -c "TRUNCATE TABLE region CASCADE;"

# Executar seed novamente
docker exec ysh-b2b-backend-dev npm run seed
```

---

## 📝 Próximos Passos

1. ✅ Logo da Yello aplicado
2. ⏳ Importar catálogo de produtos solares
3. ⏳ Configurar regiões brasileiras (BR, estados)
4. ⏳ Adicionar produtos fotovoltaicos (painéis, inversores, kits)
5. ⏳ Configurar métodos de pagamento
6. ⏳ Integrar sistema de frete brasileiro

---

## 🛡️ Segurança

⚠️ **IMPORTANTE:** Estas credenciais são para **ambiente de desenvolvimento local**.

Para produção:

- Alterar todas as senhas
- Gerar novas API keys
- Configurar HTTPS
- Habilitar autenticação 2FA
- Revisar permissões de usuários

---

**Última atualização:** 08/10/2025 13:20 BRT
