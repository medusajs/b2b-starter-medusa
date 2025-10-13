# Semantic Search Python Script

Este script Python implementa buscas semânticas e RAG (Retrieval-Augmented Generation) para o inventário YSH usando Ollama com modelos como Gemma3 e embeddings.

## Funcionalidades

- **Construção de Índice**: Coleta produtos dos arquivos JSON dos distribuidores e gera embeddings semânticos.
- **Busca Semântica**: Busca por similaridade de cosseno nos embeddings.
- **Filtros Estruturados**: Filtra por fabricante, categoria, modelo, preço, potência, distribuidor.
- **Re-ranking via LLM**: Usa Gemma3 para reordenar resultados por relevância técnica.
- **RAG**: Gera respostas consolidadas com citações usando contexto dos documentos.

## Requisitos

- Python 3.8+
- Ollama instalado e rodando
- Modelos: `nomic-embed-text` (embeddings), `gemma3:27b` (LLM)
- numpy: `pip install numpy`

## Configuração

Defina as variáveis de ambiente:

```bash
export OLLAMA_EMBED_COMMAND="ollama embed nomic-embed-text --stdin --json"
export OLLAMA_LLM_COMMAND="ollama generate gemma3:27b --temperature 0.0"
```

## Uso

### Construir Índice

```bash
python semantic_search.py build
```

### Busca Semântica

```bash
python semantic_search.py search "inversor 5kW residencial" --top 10
```

Com filtros:

```bash
python semantic_search.py search "painel solar" --manufacturer "Canadian Solar" --power-min 400 --price-max 500
```

Com re-ranking:

```bash
python semantic_search.py search "inversor híbrido" --rerank --candidates 50
```

### Busca RAG

```bash
python semantic_search.py rag "qual inversor escolher para casa de 5kW?"
```

## Estrutura

- `build_index()`: Constrói `index.json` com embeddings.
- `search()`: Busca básica por similaridade.
- `search_with_filters()`: Busca com filtros estruturados.
- `search_with_rerank()`: Busca com re-ranking via LLM.
- `rag_search()`: Gera resposta consolidada com fontes.

## Arquivos

- `semantic_search.py`: Script principal.
- `index.json`: Índice gerado com embeddings (não versionar, grande).

## Notas

- O script processa arquivos JSON em `../distributor_datasets/` (odex, solfacil, fotus).
- Embeddings são gerados via subprocess para Ollama.
- Re-ranking usa prompts em português para especialidade em fotovoltaicos.
- RAG retorna JSON estruturado com answer, sources e recommendations.</content>
<parameter name="filePath">c:\Users\fjuni\ysh_medusa\ysh-store\backend\data\distributor_datasets\semantic\README_PYTHON.md
