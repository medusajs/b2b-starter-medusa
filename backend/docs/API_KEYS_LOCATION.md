# 📍 Localização e Status das Chaves de API - YSH Backend

**Data**: 2025-01-30  
**Versão**: 1.0.0

## 🗺️ Mapa de Localização

### 1️⃣ Arquivos de Configuração

| Arquivo | Tipo | Status | Localização |
|---------|------|--------|-------------|
| `.env` | Ambiente Local | ✅ Atualizado | `backend/.env` |
| `.env.template` | Template | ✅ Atualizado | `backend/.env.template` |
| `.env.build` | Build | ⚠️ Verificar | `backend/.env.build` |
| `.env.test` | Testes | ⚠️ Verificar | `backend/.env.test` |

### 2️⃣ Endpoints que Usam as Chaves

#### 🤖 RAG Endpoints (Hélio Copiloto Solar)

| Endpoint | Método | Chaves Requeridas | Arquivo |
|----------|--------|-------------------|---------|
| `/store/rag/ask-helio` | POST | `OPENAI_API_KEY`, `QDRANT_API_KEY`, `QDRANT_URL` | `src/api/store/rag/ask-helio/route.ts` |
| `/store/rag/recommend-products` | POST | `OPENAI_API_KEY`, `QDRANT_API_KEY`, `QDRANT_URL` | `src/api/store/rag/recommend-products/route.ts` |
| `/store/rag/search` | POST | `OPENAI_API_KEY`, `QDRANT_API_KEY`, `QDRANT_URL` | `src/api/store/rag/search/route.ts` |
| `/store/rag/search` | GET | `QDRANT_API_KEY`, `QDRANT_URL` | `src/api/store/rag/search/route.ts` |

### 3️⃣ Chaves de API Necessárias

#### 🔑 OpenAI API

```bash
# Variável de ambiente
OPENAI_API_KEY=sk-your-key-here

# Onde obter
https://platform.openai.com/api-keys

# Padrão esperado
sk-[a-zA-Z0-9\-_]{20,}

# Uso
- Geração de embeddings (text-embedding-3-large)
- Chat completions (gpt-4o)
```

#### 🔑 Qdrant API Key

```bash
# Variável de ambiente
QDRANT_API_KEY=your-qdrant-key-here

# Onde obter
https://cloud.qdrant.io/

# Padrão esperado
[a-zA-Z0-9\-_]{10,}

# Uso
- Busca vetorial
- Armazenamento de embeddings
```

#### 🔑 Qdrant URL

```bash
# Variável de ambiente (desenvolvimento)
QDRANT_URL=http://localhost:6333

# Variável de ambiente (produção)
QDRANT_URL=https://your-cluster.qdrant.io

# Padrão esperado
https?:\/\/.+

# Uso
- Endpoint do servidor Qdrant
```

## 🛡️ Segurança Implementada

### ✅ Validações no Código

| Proteção | Status | Localização |
|----------|--------|-------------|
| API Key Validation | ✅ Implementado | Linhas ~50-65 em cada endpoint RAG |
| Rate Limiting (10 req/min) | ✅ Implementado | Linhas ~14-35 em cada endpoint RAG |
| Request Validation | ✅ Implementado | Linhas ~75-120 em cada endpoint RAG |
| Timeout Controls (30s) | ✅ Implementado | Linhas ~110-115 em cada endpoint RAG |
| Proper Error Handling | ✅ Implementado | Blocos catch em cada endpoint |

### 🔒 Proteção de Credenciais

```bash
# ✅ Arquivo .env já está no .gitignore
backend/.env

# ✅ Template não contém chaves reais
backend/.env.template

# ⚠️ NUNCA commite chaves reais no Git!
```

## 🧪 Como Testar

### 1. Validar Configuração

```bash
cd backend
yarn validate:api-keys
```

### 2. Testar Endpoints RAG

#### Chat Hélio

```bash
curl -X POST http://localhost:9000/store/rag/ask-helio \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Como dimensionar um sistema de 10kWp?",
    "context": {
      "cep": "01310-100",
      "consumo_kwh_mes": 800
    }
  }'
```

#### Recomendação de Produtos

```bash
curl -X POST http://localhost:9000/store/rag/recommend-products \
  -H "Content-Type: application/json" \
  -d '{
    "kwp_target": 10,
    "tipo_sistema": "on-grid",
    "fase": "tri",
    "budget_max": 50000
  }'
```

#### Busca Semântica

```bash
curl -X POST http://localhost:9000/store/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "ysh-catalog",
    "query": "painel solar 550W monocristalino",
    "top_k": 5
  }'
```

## 📊 Status Atual

| Item | Status | Nota |
|------|--------|------|
| Documentação | ✅ Criada | `API_KEYS_GUIDE.md` |
| Templates Atualizados | ✅ Completo | `.env.template` com seção RAG |
| Arquivo .env Local | ✅ Atualizado | Variáveis adicionadas (vazias) |
| Script de Validação | ✅ Criado | `scripts/validate-api-keys.js` |
| Comando yarn | ✅ Adicionado | `yarn validate:api-keys` |
| Proteções de Segurança | ✅ Implementadas | Rate limiting, timeouts, validation |

## ⚠️ Próximos Passos

1. **Obter Chaves de API**
   - [ ] Criar conta OpenAI: <https://platform.openai.com/signup>
   - [ ] Criar conta Qdrant: <https://cloud.qdrant.io/>
   - [ ] Gerar chaves e adicionar no `.env`

2. **Validar Configuração**

   ```bash
   yarn validate:api-keys
   ```

3. **Testar Endpoints**

   ```bash
   yarn dev
   # Em outro terminal:
   curl -X POST http://localhost:9000/store/rag/ask-helio \
     -H "Content-Type: application/json" \
     -d '{"question": "teste"}'
   ```

4. **Popular Collections Qdrant**
   - [ ] Criar script de seeding para coleções
   - [ ] Popular `ysh-catalog`, `ysh-regulations`, `ysh-tariffs`

5. **Documentar para Equipe**
   - [ ] Compartilhar `API_KEYS_GUIDE.md`
   - [ ] Adicionar ao onboarding

## 📚 Recursos

- **Guia Completo**: `backend/API_KEYS_GUIDE.md`
- **Template**: `backend/.env.template`
- **Validação**: `yarn validate:api-keys`
- **OpenAI Docs**: <https://platform.openai.com/docs>
- **Qdrant Docs**: <https://qdrant.tech/documentation/>

## 🆘 Troubleshooting

### Erro: "OpenAI API key not configured"

1. Verifique se `OPENAI_API_KEY` está no `.env`
2. Reinicie o servidor: `yarn dev`
3. Valide: `yarn validate:api-keys`

### Erro: "Rate limit exceeded"

- Aguarde 1 minuto (limite: 10 req/min por IP)
- Ou ajuste o limite em `src/api/store/rag/*/route.ts`

### Erro: "Request timeout"

- Verifique conectividade com OpenAI/Qdrant
- Verifique status: <https://status.openai.com/>
- Aumente timeout se necessário (linha ~110-115 nos endpoints)

---

**Última atualização**: 2025-01-30  
**Responsável**: DevOps Team  
**Contato**: <tech@yellosolarhub.com>
