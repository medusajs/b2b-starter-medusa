#!/usr/bin/env python3
"""
semantic_search.py

Script Python para buscas semânticas e RAG usando Ollama com modelos como Gemma3 e GPT-like.

Funcionalidades:
- Construir índice semântico a partir de arquivos JSON dos distribuidores
- Busca semântica com similaridade de cosseno
- Filtros estruturados (categoria, fabricante, modelo, etc.)
- Re-ranking via LLM (Gemma3)
- RAG (Retrieval-Augmented Generation) para respostas consolidadas

Requisitos:
- Ollama instalado e rodando
- Modelos: nomic-embed-text (embeddings), gemma3:27b (LLM)
- Python 3.8+, numpy, json

Como usar:
export OLLAMA_EMBED_COMMAND="ollama embed nomic-embed-text --stdin --json"
export OLLAMA_LLM_COMMAND="ollama generate gemma3:27b --temperature 0.0"

python semantic_search.py build
python semantic_search.py search "inversor 5kW residencial" --top 10
python semantic_search.py rag "qual inversor escolher?" --top 5
"""

import os
import json
import argparse
import numpy as np
from pathlib import Path
import re

# Configurações
ROOT_DIR = Path(__file__).parent.parent  # distributor_datasets
INDEX_FILE = Path(__file__).parent / "index.json"

def collect_json_files(dir_path):
    """Coleta arquivos JSON recursivamente, excluindo a pasta semantic."""
    files = []
    for entry in dir_path.rglob("*.json"):
        if "semantic" not in str(entry.parent):
            files.append(entry)
    return files

def parse_price(raw):
    """Parse preço de string para float."""
    if raw is None:
        return None
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        cleaned = re.sub(r'[R$\s]', '', raw).replace('.', '').replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None

def extract_power(item):
    """Extrai potência de campos possíveis."""
    candidates = ['power_w', 'power', 'potencia', 'pmax_w', 'pmax', 'watts', 'w']
    for key in candidates:
        if key in item and item[key] is not None:
            return float(item[key])
    if 'technical_specs' in item and 'power_w' in item['technical_specs']:
        return float(item['technical_specs']['power_w'])
    return None

def safe_get(obj, *keys):
    """Obtém valor seguro de nested dict."""
    for key in keys:
        if isinstance(obj, dict) and key in obj:
            obj = obj[key]
        else:
            return None
    return obj

def normalize_product(item, source_file):
    """Normaliza produto para campos padronizados."""
    id_val = (safe_get(item, 'id') or safe_get(item, 'sku') or
              f"{source_file.stem}::{hash(str(item)) % 10000}")
    title = (safe_get(item, 'title') or safe_get(item, 'name') or
             safe_get(item, 'model') or id_val)
    category = (safe_get(item, 'category') or
                ('odex-unknown' if 'odex' in str(source_file)
                 else 'solfacil-unknown' if 'solfacil' in str(source_file)
                 else None))
    manufacturer = (safe_get(item, 'manufacturer') or
                    safe_get(item, 'fabricante') or
                    safe_get(item, 'brand') or
                    safe_get(item, 'metadata', 'manufacturer'))
    model = (safe_get(item, 'model') or safe_get(item, 'modelo') or
             safe_get(item, 'metadata', 'model'))
    series = (safe_get(item, 'series') or safe_get(item, 'serie') or
              safe_get(item, 'metadata', 'series'))
    price = parse_price(safe_get(item, 'pricing', 'price') or
                        safe_get(item, 'price') or
                        safe_get(item, 'preco'))
    power = extract_power(item)
    distributor = (safe_get(item, 'source') or
                   ('odex' if 'odex' in str(source_file)
                    else 'solfacil' if 'solfacil' in str(source_file)
                    else 'fotus' if 'fotus' in str(source_file)
                    else source_file.parent.name))
    description = (safe_get(item, 'description') or
                   safe_get(item, 'subtitle') or
                   safe_get(item, 'metadata', 'description') or '')

    # Texto para busca
    parts = []
    parts.append(f"TITLE: {title}")
    if manufacturer: parts.append(f"MANUFACTURER: {manufacturer}")
    if model: parts.append(f"MODEL: {model}")
    if series: parts.append(f"SERIES: {series}")
    if category: parts.append(f"CATEGORY: {category}")
    if distributor: parts.append(f"DISTRIBUTOR: {distributor}")
    if power: parts.append(f"POWER_W: {power}W")
    if price is not None: parts.append(f"PRICE_BRL: R$ {price}")
    if description: parts.append(f"DESCRIPTION: {description}")

    metadata = {
        'source_file': source_file.name,
        'id': id_val,
        'title': title,
        'category': category,
        'manufacturer': manufacturer,
        'model': model,
        'series': series,
        'price': price,
        'power': power,
        'distributor': distributor
    }

    text = ' \n'.join(parts) + '\n\n' + f"METADATA: {json.dumps(metadata)}"

    return {
        'id': id_val,
        'title': title,
        'category': category,
        'manufacturer': manufacturer,
        'model': model,
        'series': series,
        'price': price,
        'power': power,
        'distributor': distributor,
        'description': description,
        'metadata': metadata,
        'text': text,
        'raw': item
    }

def parse_embedding_output(output):
    """Parse saída do comando de embedding."""
    s = (output or '').strip()
    if not s:
        return None
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return parsed
        if 'embedding' in parsed and isinstance(parsed['embedding'], list):
            return parsed['embedding']
        if 'data' in parsed and isinstance(parsed['data'], list) and parsed['data'] and 'embedding' in parsed['data'][0]:
            return parsed['data'][0]['embedding']
    except json.JSONDecodeError:
        pass
    # Fallback: regex para números
    nums = re.findall(r'[+-]?\d*\.?\d+([eE][+-]?\d+)?', s)
    if nums:
        return [float(n) for n in nums]
    return None

def get_embedding_sync(text):
    """Gera embedding via API HTTP do Ollama."""
    import requests
    
    # Use Ollama API instead of CLI
    ollama_url = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
    model = os.getenv('OLLAMA_EMBED_MODEL', 'gemma3:4b')
    
    try:
        response = requests.post(
            f"{ollama_url}/api/embeddings",
            json={"model": model, "prompt": text},
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        return result.get('embedding')
    except Exception as e:
        raise RuntimeError(f"Erro ao gerar embedding via API: {e}")

def build_index():
    """Constrói o índice semântico."""
    print(f"🔎 Escaneando arquivos em {ROOT_DIR}")
    files = collect_json_files(ROOT_DIR)
    print(f"Encontrados {len(files)} arquivos JSON.")
    
    interesting = [f for f in files if any(x in str(f).lower() for x in ['odex', 'solfacil', 'fotus', 'unified'])]
    print(f"Indexando de {len(interesting)} arquivos candidatos")
    
    index = []
    total_docs = 0
    
    for file_path in interesting:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            items = data if isinstance(data, list) else [data]
            print(f"  • {file_path.name} => {len(items)} itens")
            
            for item in items:
                doc = normalize_product(item, file_path)
                if not doc['text'] or len(doc['text']) < 20:
                    continue
                
                try:
                    embedding = get_embedding_sync(doc['text'])
                except Exception as e:
                    print(f"❌ Erro embedding para {doc['id']}: {e}")
                    embedding = None
                
                index.append({
                    'id': doc['id'],
                    'title': doc['title'],
                    'metadata': doc['metadata'],
                    'text': doc['text'],
                    'embedding': embedding
                })
                total_docs += 1
                
        except Exception as e:
            print(f"⚠️  Pulando arquivo (erro parse): {file_path} - {e}")
    
    print(f"\n✅ Índice construído. Documentos: {total_docs}. Salvando em {INDEX_FILE}")
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump({'meta': {'generated_at': str(np.datetime64('now')), 'count': total_docs}, 'docs': index}, f, indent=2, ensure_ascii=False)

def load_index(index_file):
    """Carrega o índice."""
    if not index_file.exists():
        raise FileNotFoundError(f"Arquivo índice não encontrado: {index_file}")
    with open(index_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def cosine_similarity(a, b):
    """Calcula similaridade de cosseno."""
    if not isinstance(a, list) or not isinstance(b, list) or len(a) != len(b):
        return -1
    a = np.array(a)
    b = np.array(b)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return -1
    return dot / (norm_a * norm_b)

def get_query_embedding_sync(text):
    """Gera embedding para query via API HTTP do Ollama."""
    import requests
    
    ollama_url = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
    model = os.getenv('OLLAMA_EMBED_MODEL', 'gemma3:4b')
    
    try:
        response = requests.post(
            f"{ollama_url}/api/embeddings",
            json={"model": model, "prompt": text},
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        return result.get('embedding')
    except Exception as e:
        raise RuntimeError(f"Erro ao gerar embedding: {e}")

def search(index, query, top_k=10):
    """Busca semântica básica."""
    docs = index.get('docs', [])
    q_emb = get_query_embedding_sync(query)
    scores = []
    for doc in docs:
        if not doc.get('embedding'):
            continue
        sim = cosine_similarity(q_emb, doc['embedding'])
        scores.append({'id': doc['id'], 'score': sim, 'doc': doc})
    return sorted(scores, key=lambda x: x['score'], reverse=True)[:top_k]

def doc_matches_filters(doc, filters):
    """Verifica se doc combina com filtros."""
    if not filters:
        return True
    m = doc.get('metadata', {})
    if 'category' in filters and str(m.get('category', '')).lower() != str(filters['category']).lower():
        return False
    if 'manufacturer' in filters and str(m.get('manufacturer', '')).lower() != str(filters['manufacturer']).lower():
        return False
    if 'model' in filters and str(m.get('model', '')).lower() != str(filters['model']).lower():
        return False
    if 'series' in filters and str(m.get('series', '')).lower() != str(filters['series']).lower():
        return False
    if 'distributor' in filters and str(m.get('distributor', '')).lower() != str(filters['distributor']).lower():
        return False
    if 'price_min' in filters and (m.get('price') is None or m['price'] < filters['price_min']):
        return False
    if 'price_max' in filters and (m.get('price') is None or m['price'] > filters['price_max']):
        return False
    if 'power_min' in filters and (m.get('power') is None or m['power'] < filters['power_min']):
        return False
    if 'power_max' in filters and (m.get('power') is None or m['power'] > filters['power_max']):
        return False
    return True

def search_with_filters(index, query, filters, top_k=10):
    """Busca com filtros estruturados."""
    docs = [d for d in index.get('docs', []) if doc_matches_filters(d, filters)]
    if not docs:
        return []
    q_emb = get_query_embedding_sync(query)
    scores = []
    for doc in docs:
        if not doc.get('embedding'):
            continue
        sim = cosine_similarity(q_emb, doc['embedding'])
        scores.append({'id': doc['id'], 'score': sim, 'doc': doc})
    return sorted(scores, key=lambda x: x['score'], reverse=True)[:top_k]

def generate_with_llm_sync(prompt):
    """Gera resposta via API HTTP do Ollama."""
    import requests
    
    ollama_url = os.getenv('OLLAMA_HOST', 'http://localhost:11434')
    model = os.getenv('OLLAMA_LLM_MODEL', 'gemma3:4b')
    
    try:
        response = requests.post(
            f"{ollama_url}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=120
        )
        response.raise_for_status()
        result = response.json()
        return result.get('response', '')
    except Exception as e:
        print(f"Aviso: Erro ao gerar resposta LLM: {e}")
        return ''

def rerank_docs(hits, query):
    """Re-rank via LLM."""
    if not hits:
        return []
    
    docs_for_prompt = []
    for i, hit in enumerate(hits, 1):
        m = hit['doc'].get('metadata', {})
        snippet = (hit['doc'].get('text', '') or '')[:400]
        docs_for_prompt.append(f"{i}. ID: {hit['id']} | TITLE: {hit['doc']['title']} | MANUFACTURER: {m.get('manufacturer', '-')} | PRICE: {m.get('price', '-')} | POWER_W: {m.get('power', '-')} | DISTRIBUTOR: {m.get('distributor', '-')}\nSNIPPET: {snippet}")
    
    prompt = f"""Você é um engenheiro especialista em sistemas fotovoltaicos. Você receberá uma query de cliente e uma lista de documentos candidatos com informações resumidas. Para cada documento, avalie de 0 a 100 a adequação para responder a query.

Query: {query}

Documentos candidatos:

{chr(10).join(docs_for_prompt)}

RETORNE APENAS UM JSON ARRAY com objetos {{ "id": "docid", "score": number, "reason": "motivo curto" }} ordenado do mais relevante para o menos relevante."""
    
    out = generate_with_llm_sync(prompt)
    match = re.search(r'\[.*\]', out, re.DOTALL)
    if not match:
        return [{'id': h['id'], 'score': h['score'], 'reason': 'original-ranking'} for h in hits]
    try:
        parsed = json.loads(match.group(0))
        hit_ids = {h['id'] for h in hits}
        return [p for p in parsed if p and p.get('id') in hit_ids]
    except json.JSONDecodeError:
        return [{'id': h['id'], 'score': h['score'], 'reason': 'parse-error'} for h in hits]

def search_with_rerank(index, query, top_k=10, candidate_count=50):
    """Busca com re-rank."""
    candidates = search(index, query, candidate_count)
    if not candidates:
        return []
    reranked = rerank_docs(candidates, query)
    id_to_doc = {c['id']: c['doc'] for c in candidates}
    merged = [{'id': r['id'], 'score': r['score'], 'doc': id_to_doc[r['id']]} for r in reranked if r['id'] in id_to_doc]
    return merged[:top_k]

def build_context_from_docs(hit_docs, max_chars=4000):
    """Constrói contexto para RAG."""
    parts = []
    for hit in hit_docs:
        d = hit['doc']
        snippet = (d.get('text', '') or '')[:1000]
        parts.append(f"DOC_ID: {d['id']}\nTITLE: {d['title']}\nMANUFACTURER: {d['metadata']['manufacturer']}\nCATEGORY: {d['metadata']['category']}\nDISTRIBUTOR: {d['metadata']['distributor']}\nPRICE: {d['metadata']['price']}\nPOWER_W: {d['metadata']['power']}\n---\n{snippet}\n")
        if len('\n\n'.join(parts)) > max_chars:
            break
    return '\n\n'.join(parts)

def rag_search(index, query, top_k=5):
    """Busca RAG."""
    hits = search(index, query, top_k)
    context = build_context_from_docs(hits, 8000)
    
    prompt = f"""Você é um especialista em sistemas fotovoltaicos. Use os documentos abaixo para responder a pergunta do usuário de forma objetiva e técnica. Inclua referências (DOC_ID) quando mencionar produtos ou números.

DOCUMENTOS:
{context}

PERGUNTA: {query}

FORMATO DE SAÍDA: JSON com os campos: {{"answer": string, "sources": [{{"id": string, "title": string, "score": number, "distributor": string}}], "recommendations": [{{"id": string, "title": string, "why": string}}]}}

Responda APENAS o JSON.
"""
    
    llm_output = generate_with_llm_sync(prompt)
    json_match = re.search(r'\{.*\}', llm_output, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            return {'raw': llm_output, 'parsed': parsed}
        except json.JSONDecodeError:
            return {'raw': llm_output, 'error': 'Falha ao parsear JSON'}
    return {'raw': llm_output, 'error': 'Nenhum bloco JSON encontrado'}

def main():
    parser = argparse.ArgumentParser(description="Buscas semânticas e RAG com Ollama")
    subparsers = parser.add_subparsers(dest='command', help='Comandos')
    
    # Build
    subparsers.add_parser('build', help='Constrói o índice')
    
    # Search
    search_parser = subparsers.add_parser('search', help='Busca semântica')
    search_parser.add_argument('query', help='Query de busca')
    search_parser.add_argument('--top', type=int, default=10, help='Número de resultados')
    search_parser.add_argument('--rerank', action='store_true', help='Usar re-rank via LLM')
    search_parser.add_argument('--candidates', type=int, default=50, help='Candidatos para re-rank')
    # Filtros
    search_parser.add_argument('--manufacturer', help='Filtrar por fabricante')
    search_parser.add_argument('--category', help='Filtrar por categoria')
    search_parser.add_argument('--model', help='Filtrar por modelo')
    search_parser.add_argument('--series', help='Filtrar por série')
    search_parser.add_argument('--distributor', help='Filtrar por distribuidor')
    search_parser.add_argument('--price-min', type=float, help='Preço mínimo')
    search_parser.add_argument('--price-max', type=float, help='Preço máximo')
    search_parser.add_argument('--power-min', type=float, help='Potência mínima (W)')
    search_parser.add_argument('--power-max', type=float, help='Potência máxima (W)')
    
    # RAG
    rag_parser = subparsers.add_parser('rag', help='Busca RAG')
    rag_parser.add_argument('query', help='Query para RAG')
    rag_parser.add_argument('--top', type=int, default=5, help='Número de documentos para contexto')
    # Mesmo filtros que search
    
    args = parser.parse_args()
    
    if args.command == 'build':
        build_index()
    elif args.command == 'search':
        if not INDEX_FILE.exists():
            print("Índice não encontrado. Execute 'python semantic_search.py build' primeiro.")
            return
        index = load_index(INDEX_FILE)
        filters = {k: v for k, v in vars(args).items() if k in ['manufacturer', 'category', 'model', 'series', 'distributor', 'price_min', 'price_max', 'power_min', 'power_max'] and v is not None}
        if args.rerank:
            results = search_with_rerank(index, args.query, args.top, args.candidates)
        else:
            results = search_with_filters(index, args.query, filters, args.top) if filters else search(index, args.query, args.top)
        
        print(f"\nTop {len(results)} resultados para: {args.query}\n")
        for i, r in enumerate(results, 1):
            m = r['doc']['metadata']
            score = r.get('score', 0)
            print(f"{i}. [{score:.4f}] {r['doc']['title']} — {m.get('manufacturer', '-')} — {m.get('distributor', '-')} — R$ {m.get('price', '-')} — {m.get('power', '')}W (ID: {r['id']})")
    elif args.command == 'rag':
        if not INDEX_FILE.exists():
            print("Índice não encontrado. Execute 'python semantic_search.py build' primeiro.")
            return
        index = load_index(INDEX_FILE)
        out = rag_search(index, args.query, args.top)
        if 'parsed' in out:
            print('\nRAG JSON\n', json.dumps(out['parsed'], indent=2, ensure_ascii=False))
        else:
            print('\nRAG RAW OUTPUT\n', out['raw'])
            if 'error' in out:
                print('\nERRO:', out['error'])
    else:
        parser.print_help()

if __name__ == '__main__':
    main()