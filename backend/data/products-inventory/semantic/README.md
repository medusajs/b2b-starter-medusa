YSH Semantic Search (Ollama)
=============================

Resumo rápido
-------------

Este diretório contém scripts mínimos para construir um índice semântico a partir dos arquivos JSON dos distribuidores e executar buscas semânticas e RAG usando modelos locais via Ollama.

Arquivos
-------

- `build-index.js` - Constrói `index.json` contendo documentos e embeddings (usa `OLLAMA_EMBED_COMMAND`)
- `semantic-search.js` - Funções para busca por similaridade e RAG (usa `OLLAMA_LLM_COMMAND`)
- `search-cli.js` - CLI simples: `build`, `search`, `rag`

Pré-requisitos
--------------

1. Ollama instalado localmente e modelos carregados (ex: `gemma3`, `nomic-embed-text`)
2. Definir variáveis de ambiente para os comandos Ollama que seu sistema local aceita.

Exemplos (PowerShell)
---------------------

# comando para gerar embeddings (deve ler stdin e imprimir JSON array)

$env:OLLAMA_EMBED_COMMAND = "ollama embed nomic-embed-text --stdin --json"

# comando para geração de texto (escrever prompt no stdin)

$env:OLLAMA_LLM_COMMAND = "ollama generate gemma3:27b --temperature 0.0"

# construir índice

node build-index.js

# busca semântica

node search-cli.js search "inversor 5kW residencial" --top 10

# RAG (resposta gerada com contexto)

node search-cli.js rag "qual inversor 5kW escolher para casa?" --top 5

Observações importantes
-----------------------

- Os comandos `OLLAMA_EMBED_COMMAND` e `OLLAMA_LLM_COMMAND` variam conforme a versão do Ollama e dos modelos instalados. Ajuste-os conforme seu ambiente.
- Como fallback, você pode apontar `OLLAMA_EMBED_COMMAND` para um script Python que executa embeddings (ex: usando `sentence-transformers`) se não quiser usar embeddings via Ollama.
- O índice resultante `index.json` é um JSON simples contendo todos os documentos e embeddings. Para produção, recomenda-se usar um Vector DB (ChromaDB, Milvus, Pinecone, etc.).

Campos indexados (padrão)
-------------------------

Para cada produto o índice captura e normaliza (quando disponível):

- id, title/name
- category
- manufacturer
- model
- series
- price (BRL)
- power_w (W)
- distributor (source field)
- description
- metadata

Melhorias possíveis
-------------------

- Re-ordenação / reranking com modelo (usar Gemma3 para re-rank com prompt específico)
- Extração e normalização de mais campos (tensão, MPPT, garantia) com um pipeline de NER técnico
- Indexação incremental (watcher de arquivos)
- Substituir o JSON local por ChromaDB / Milvus para escalabilidade

Próximos passos recomendados
---------------------------

1. Ajustar `OLLAMA_EMBED_COMMAND` e `OLLAMA_LLM_COMMAND` conforme seus modelos locais
2. Executar `node build-index.js` para criar `index.json`
3. Testar queries com `search-cli.js` e melhorar prompts de RAG conforme necessidade
4. Validar resultados e, se necessário, migrar para um VectorDB
