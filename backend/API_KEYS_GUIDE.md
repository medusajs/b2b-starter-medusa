# 🔑 Guia de Chaves de API - YSH B2B Store

## 📋 Visão Geral

Este documento lista todas as chaves de API necessárias para o funcionamento completo do backend YSH, incluindo os endpoints RAG (Retrieval-Augmented Generation) com o copiloto solar Hélio.

## 🚀 Chaves de API Obrigatórias

### 1. **OpenAI API** (RAG & IA)

- **Variável**: `OPENAI_API_KEY`
- **Uso**: Geração de embeddings e completions GPT-4 para o copiloto Hélio
- **Onde obter**: <https://platform.openai.com/api-keys>
- **Endpoints que requerem**:
  - `/store/rag/ask-helio` (chat conversacional)
  - `/store/rag/recommend-products` (recomendação de produtos)
  - `/store/rag/search` (busca semântica)
- **Formato**: `sk-...` (string alfanumérica com prefixo `sk-`)

### 2. **Qdrant Vector Database** (RAG)

- **Variável**: `QDRANT_API_KEY`
- **Uso**: Busca vetorial para recomendações e contexto RAG
- **Onde obter**: <https://cloud.qdrant.io/> (ou self-hosted)
- **Endpoints que requerem**:
  - `/store/rag/ask-helio`
  - `/store/rag/recommend-products`
  - `/store/rag/search`
- **Formato**: String alfanumérica

### 3. **Qdrant URL**

- **Variável**: `QDRANT_URL`
- **Uso**: Endpoint do servidor Qdrant
- **Padrão**: `http://localhost:6333` (desenvolvimento local)
- **Cloud**: `https://<your-cluster>.qdrant.io`
- **Formato**: URL completa com protocolo

## 🔧 Configuração

### Passo 1: Copiar o template

```bash
cd backend
cp .env.template .env
```

### Passo 2: Adicionar as chaves no `.env`

```bash
# API Keys para RAG (Hélio Copiloto Solar)
OPENAI_API_KEY=sk-your-openai-key-here
QDRANT_API_KEY=your-qdrant-key-here
QDRANT_URL=https://your-cluster.qdrant.io

# Ou para desenvolvimento local com Qdrant
# QDRANT_URL=http://localhost:6333
```

### Passo 3: Reiniciar o servidor

```bash
yarn dev
```

## 🧪 Validação das Chaves

### Testar conexão OpenAI

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Testar conexão Qdrant

```bash
curl -X GET "https://your-cluster.qdrant.io/collections" \
  -H "api-key: $QDRANT_API_KEY"
```

### Testar endpoint do Hélio

```bash
curl -X POST http://localhost:9000/store/rag/ask-helio \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Como dimensionar um sistema fotovoltaico?",
    "context": {
      "consumo_kwh_mes": 500
    }
  }'
```

## 🛡️ Segurança das Chaves

### ✅ Boas Práticas

- ✅ **NUNCA** commite chaves no Git
- ✅ Use `.env` local (já está no `.gitignore`)
- ✅ Use variáveis de ambiente em produção (AWS Secrets, Azure Key Vault, etc.)
- ✅ Rotacione chaves periodicamente
- ✅ Use rate limiting (já implementado no código)

### ⚠️ Proteção Implementada

- ✅ Rate limiting: 10 requisições/minuto por IP
- ✅ Timeouts: 30 segundos em todas as chamadas externas
- ✅ Validação: Chaves obrigatórias verificadas no startup
- ✅ Logs: Erros não expõem chaves

## 📊 Uso e Limites

### OpenAI (Pay-as-you-go)

- **Embeddings** (`text-embedding-3-large`): $0.13/1M tokens
- **Chat** (`gpt-4o`): $2.50/1M input tokens, $10/1M output tokens
- **Rate limits**: 10,000 requests/min (tier 1)

### Qdrant Cloud (Free tier)

- **Armazenamento**: 1GB grátis
- **Requests**: Sem limite
- **Clusters**: 1 cluster grátis

## 🔍 Troubleshooting

### Erro: "OpenAI API key not configured"

**Solução**: Adicione `OPENAI_API_KEY` no `.env`

### Erro: "Qdrant API key not configured"

**Solução**: Adicione `QDRANT_API_KEY` no `.env`

### Erro: "Rate limit exceeded"

**Solução**: Aguarde 1 minuto ou ajuste o rate limit em:

- `backend/src/api/store/rag/*/route.ts` (linhas 14-17)

### Erro: "Request timeout"

**Solução**: Verifique conectividade com OpenAI/Qdrant ou aumente o timeout (linha ~110-115)

## 📚 Collections do Qdrant

### Collections Existentes

- `ysh-catalog`: Produtos (painéis, inversores, baterias)
- `ysh-regulations`: Regulamentações ANEEL
- `ysh-tariffs`: Tarifas e classes de consumo
- `ysh-technical`: Especificações técnicas

### Como Popular (seeding)

```bash
# Implementar script de seeding
node scripts/seed-qdrant-collections.js
```

## 🆘 Suporte

### Problemas com OpenAI

- Docs: <https://platform.openai.com/docs>
- Status: <https://status.openai.com/>

### Problemas com Qdrant

- Docs: <https://qdrant.tech/documentation/>
- Discord: <https://discord.gg/qdrant>

### Problemas com o Backend YSH

- Verificar logs: `docker logs ysh-backend` ou `yarn dev`
- Issues: GitHub do projeto
- Documentação: `/backend/docs/`

---

**Última atualização**: 2025-01-30
**Versão do Backend**: 1.0.0
**Medusa**: 2.4
