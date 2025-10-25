#!/bin/bash
# Script para inicializar collections Qdrant - YSH B2B
# Uso: ./init-qdrant-collections.sh

set -e

# Configuração
QDRANT_URL="${QDRANT_URL:-http://localhost:6333}"
QDRANT_API_KEY="${QDRANT_API_KEY:-qdrant_dev_key_foss_2025}"

echo "🚀 Inicializando Qdrant Collections para YSH B2B"
echo "   URL: $QDRANT_URL"
echo ""

# Função auxiliar para criar collection
create_collection() {
    local name=$1
    local description=$2
    
    echo "📦 Criando collection: $name"
    echo "   Descrição: $description"
    
    curl -X PUT "$QDRANT_URL/collections/$name" \
        -H "api-key: $QDRANT_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"vectors\": {
                \"size\": 3072,
                \"distance\": \"Cosine\"
            },
            \"optimizers_config\": {
                \"indexing_threshold\": 20000
            },
            \"hnsw_config\": {
                \"m\": 16,
                \"ef_construct\": 100
            }
        }"
    
    echo ""
    echo "✅ Collection $name criada com sucesso!"
    echo ""
}

# Criar collections
create_collection "ysh-catalog" "Catálogo de produtos (painéis, inversores, baterias)"
create_collection "ysh-regulations" "Regulamentações ANEEL e normas técnicas"
create_collection "ysh-tariffs" "Tarifas de energia por região e classe"
create_collection "ysh-technical" "Especificações técnicas e guias de instalação"

echo "🎉 Todas as collections foram criadas!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Popular collections com dados reais (ver backend/scripts/seed-qdrant-collections.js)"
echo "   2. Testar endpoints RAG (ver backend/API_KEYS_GUIDE.md)"
echo ""
echo "🔍 Para verificar as collections:"
echo "   curl -H \"api-key: $QDRANT_API_KEY\" $QDRANT_URL/collections"
echo ""
