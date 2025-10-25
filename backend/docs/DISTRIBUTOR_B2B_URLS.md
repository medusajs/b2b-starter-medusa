# URLs B2B Corretas - Distribuidores

**Última atualização**: 2025-10-21

---

## ✅ URLs Confirmadas (Funcionando)

### 1. NEOSOLAR
- **URL B2B**: https://portalb2b.neosolar.com.br/
- **Status**: ✅ Funcionando
- **Credenciais**: product@boldsbrain.ai / Rookie@010100
- **Observações**: 20-product limit, necessita contato para full access

### 2. ODEX
- **URL B2B**: https://odex.com.br/
- **Status**: ✅ Funcionando (parcial)
- **Credenciais**: fernando@yellosolarhub.com / Rookie@010100
- **Observações**: Retorna apenas categorias, necessita investigação

### 3. EDELTEC
- **URL B2B**: https://edeltecsolar.com.br/
- **Status**: ✅ Funcionando (MELHOR)
- **Credenciais**: fernando@yellosolarhub.com / 010100@Rookie
- **Observações**: 79 produtos extraídos, estrutura bem definida

---

## 🔍 URLs a Testar (Descobertas)

### 4. SOLFÁCIL
- **URL Atual (INCORRETA)**: https://solfacil.com.br/ (site institucional)
- **URLs B2B para testar**:
  - ✅ **https://integrador.solfacil.com.br/** ← Portal do Integrador (mais provável)
  - https://loja.solfacil.com.br/ ← Loja B2B
  - https://app.solfacil.com.br/ ← Plataforma (mencionado no site)
- **Credenciais**: fernando.teixeira@yello.cash / Rookie@010100
- **Fonte**: Encontrado no rodapé do site principal

### 5. FOTUS
- **URL Atual (INCORRETA)**: https://fotus.com.br/ (site institucional)
- **URLs B2B para testar**:
  - ✅ **https://app.fotus.com.br/** ← Plataforma Fotus (mais provável)
  - https://conteudo.fotus.com.br/acesso-plataforma ← Acesso direto
- **Credenciais**: fernando@yellosolarhub.com / Rookie@010100
- **Fonte**: Mencionado em "PLATAFORMA FOTUS" no site

### 6. FORTLEV
- **URL Atual (INCORRETA)**: https://b2b.fortlev.com.br/ (DNS não resolve)
- **URLs B2B para testar**:
  - ❓ Não identificado portal B2B no site principal
  - Atendimento via formulário: https://www.fortlev.com.br/atendimento/lojista/solicitar-orcamento-online/
  - Cadastro: https://www.fortlev.com.br/atendimento/lojista/cadastrar-para-vender-produtos/
- **Credenciais**: fernando.teixeira@yello.cash / @Botapragirar2025
- **Ação necessária**: 🔴 **Contatar suporte** para descobrir URL B2B

### 7. DYNAMIS
- **URL Atual (ERRO)**: https://dynamis.com.br/ (ERR_CERT_COMMON_NAME_INVALID)
- **URLs alternativas**:
  - https://www.dynamis.com.br/ (adicionar www)
  - ❓ Portal B2B desconhecido
- **Credenciais**: fernando@yellosolarhub.com / Rookie@010100
- **Ação necessária**: 🔴 **Contatar suporte** para verificar URL e SSL

---

## 📋 Próximas Ações

### PRIORIDADE 1: Testar URLs Descobertas

**Solfácil - Integrador**:
```bash
export SOLFACIL_EMAIL="fernando.teixeira@yello.cash"
export SOLFACIL_PASSWORD="Rookie@010100"
# Testar: https://integrador.solfacil.com.br/
```

**Fotus - App**:
```bash
export FOTUS_EMAIL="fernando@yellosolarhub.com"
export FOTUS_PASSWORD="Rookie@010100"
# Testar: https://app.fotus.com.br/
```

### PRIORIDADE 2: Contatar Suporte

**Fortlev**:
- Email: comercial@fortlev.com.br
- Assunto: "Portal B2B - URL de Acesso"
- Pergunta: "Qual URL do portal B2B para distribuidores?"

**Dynamis**:
- Email: suporte@dynamis.com.br
- Assunto: "Certificado SSL Inválido + URL B2B"
- Pergunta: "Certificado SSL expirado em https://dynamis.com.br. Qual URL B2B correta?"

---

## 🔄 Script Atualizado

Vou criar versão 2 do script com as URLs corretas:

```typescript
const DISTRIBUTORS: Distributor[] = [
  {
    name: 'neosolar',
    url: 'https://portalb2b.neosolar.com.br/',
    email: process.env.NEOSOLAR_EMAIL || '',
    password: process.env.NEOSOLAR_PASSWORD || '',
  },
  {
    name: 'solfacil',
    url: 'https://integrador.solfacil.com.br/', // ATUALIZADO
    email: process.env.SOLFACIL_EMAIL || '',
    password: process.env.SOLFACIL_PASSWORD || '',
  },
  {
    name: 'fotus',
    url: 'https://app.fotus.com.br/', // ATUALIZADO
    email: process.env.FOTUS_EMAIL || '',
    password: process.env.FOTUS_PASSWORD || '',
  },
  {
    name: 'odex',
    url: 'https://odex.com.br/',
    email: process.env.ODEX_EMAIL || '',
    password: process.env.ODEX_PASSWORD || '',
  },
  {
    name: 'edeltec',
    url: 'https://edeltecsolar.com.br/',
    email: process.env.EDELTEC_EMAIL || '',
    password: process.env.EDELTEC_PASSWORD || '',
  },
  // Fortlev e Dynamis: Aguardando resposta do suporte
];
```

---

## 📞 Contatos dos Distribuidores

| Distribuidor | Suporte Email | Telefone | Status |
|--------------|--------------|----------|--------|
| Neosolar | support@neosolar.com.br | - | ✅ Funcionando |
| Solfácil | contato@solfacil.com.br | - | 🔄 Testar app |
| Fotus | contato@fotus.com.br | (27) 2018-1818 | 🔄 Testar app |
| Odex | suporte@odex.com.br | - | ⚠️ Funcionando (parcial) |
| Edeltec | comercial@edeltecsolar.com.br | - | ✅ Funcionando |
| Fortlev | comercial@fortlev.com.br | - | ❌ URL B2B desconhecida |
| Dynamis | suporte@dynamis.com.br | - | ❌ SSL inválido |

---

**Gerado por**: Análise de web scraping  
**Próxima ação**: Testar https://integrador.solfacil.com.br/ e https://app.fotus.com.br/
