Foco: Busca Semântica de Produtos, Categorias e Fornecedores (Ollama)

Data: 13/10/2025
Versão: 1.0.0

Objetivo
--------

Implementar e validar um pipeline de busca semântica RAG (Retrieval Augmented Generation) específico para os campos que interessam ao YSH:

- produtos (title/name)
- categorias
- fabricantes
- modelos / séries
- preços
- potências (W)
- distribuidores

Requisitos
----------

- Ollama rodando localmente com modelos para embeddings e geração (gemma3 ou similar)
- Arquivos de catálogo JSON (odex/solfacil/fotus)
- Comandos configuráveis via variáveis de ambiente:
  - OLLAMA_EMBED_COMMAND
  - OLLAMA_LLM_COMMAND

Estratégia
---------

1. Indexar documentos (cada produto é um doc) com texto canônico contendo campos importantes.
2. Gerar embeddings via Ollama (modelo de embeddings local) e persistir em index.json.
3. Implementar busca semântica (cosine) sobre os embeddings.
4. Habilitar filtros estruturados (categoria, fabricante, modelo, série, faixa de preço, faixa de potência, distribuidor).
5. Implementar RAG: recuperar top-K, construir contexto e pedir ao Gemma3 (ou modelo preferido) para gerar resposta com citações.
6. Fornecer CLI simples para testes exploratórios e scripts para integração com Medusa.js.

Prompting e Reranking
---------------------

- Usar reranking leve: Gemma3 pode ser usado para re-rankear os top-50 documentos retornados pelo embedding search, pedindo ao modelo para ordenar e justificar escolhas com base em critérios técnicos (potência, tensão, compatibilidade de MPPT, preço e disponibilidade).
- Prompt de exemplo para reranking:

"Você é um engenheiro especialista. Ordene estes 10 documentos por adequação para a seguinte necessidade: {user_query}. Para cada documento retorne: id, adequacao_score (0-100), motivo curto. Retorne apenas JSON."

RAG Prompt (resposta final)
---------------------------

- Incluir apenas os textos resumidos dos documentos (title, manufacturer, price, power, distributor)
- Limitar contexto a ~6k tokens ou ~8k caracteres
- Requisito de saída: JSON com `answer`, `sources` (id + score + distributor), `recommended_products` (id + reason)

Teste rápido (passo a passo)
---------------------------

1. Configure comandos Ollama:
   PowerShell:
   $env:OLLAMA_EMBED_COMMAND = "ollama embed nomic-embed-text --stdin --json"
   $env:OLLAMA_LLM_COMMAND = "ollama generate gemma3:27b --temperature 0.0"

2. Construir índice:
   node semantic/build-index.js

3. Buscar (ex: inversor 5kW):
   node semantic/search-cli.js search "inversor 5kW residencial" --top 10 --manufacturer Growatt --price-max 8000

4. RAG:
   node semantic/search-cli.js rag "qual inversor 5kW escolher para residencia?" --top 5

Observações finais
------------------

- Este é um protótipo projetado para rodar localmente e permitir experimentação rápida com modelos Ollama. Para produção, recomenda-se usar um Vector DB (Chroma, Milvus) e um serviço LLM dimensionado.
- Se desejar, eu posso:
  1) Implementar re-ranking com Gemma3 explicitamente (função adicional)
  2) Gerar endpoints API (Next.js / Medusa custom routes) para expor a busca
  3) Criar um pipeline de ingestão incremental (watcher / CDC)

Quer que eu implemente re-ranking com Gemma3 e endpoints API agora?"
