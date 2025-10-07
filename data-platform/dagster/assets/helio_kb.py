"""
Dagster Assets para Knowledge Bases do Hélio (RAG)
Indexa: regulations, catalog, tariffs, geospatial, finance
Embeddings: OpenAI text-embedding-3-large (3072 dims)
Vector Store: Qdrant
"""

from dagster import asset, AssetExecutionContext, AssetIn
from typing import Dict, List, Any
import json
import os
from datetime import datetime

# Importar resources
from ..resources.postgres import PostgresResource
from ..resources.qdrant import QdrantResource


# ==========================================
# KB 1: REGULATIONS (ANEEL, PRODIST, Lei 14.300)
# ==========================================

@asset(
    description="Indexar regulamentações ANEEL, PRODIST 3.A–3.C, Lei 14.300/2022, resoluções",
    group_name="helio_kb",
    compute_kind="qdrant"
)
def helio_kb_regulations(
    context: AssetExecutionContext,
    qdrant: QdrantResource
) -> Dict[str, Any]:
    """
    Processa documentos regulatórios e cria embeddings.
    
    Fontes:
    - /ysh-erp/data/regulations/*.pdf
    - ANEEL API (resoluções, tarifas homologadas)
    - Manuais de distribuidoras (Enel, Light, Cemig, etc.)
    
    Output: vectors no Qdrant collection 'ysh-regulations'
    """
    
    context.log.info("🏛️ Iniciando indexação de regulamentações...")
    
    # TODO: Implementar parsing de PDFs e crawling ANEEL
    # Exemplo de estrutura de documento
    documents = [
        {
            "id": "aneel-res-1000-2021",
            "title": "Resolução ANEEL 1.000/2021 - MMGD Alterações",
            "content": "Art. 1º - Altera os arts. 3º, 4º...",  # Conteúdo completo
            "source": "http://www2.aneel.gov.br/cedoc/...",
            "type": "regulation",
            "year": 2021,
            "tags": ["MMGD", "GD", "limites"]
        },
        {
            "id": "prodist-3a",
            "title": "PRODIST Módulo 3 Seção 3.A - Acesso Minigeração",
            "content": "Requisitos técnicos para conexão...",
            "source": "ANEEL",
            "type": "technical_standard",
            "tags": ["conexão", "requisitos", "minigeração"]
        },
        {
            "id": "lei-14300-2022",
            "title": "Lei 14.300/2022 - Marco Legal GD",
            "content": "Art. 6º - Componentes tarifários...",
            "source": "Planalto",
            "type": "law",
            "year": 2022,
            "tags": ["marco_legal", "transição", "tarifação"]
        }
    ]
    
    # Gerar embeddings (via OpenAI)
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    vectors = []
    for doc in documents:
        # Criar texto para embedding (título + conteúdo)
        text = f"{doc['title']}\n\n{doc['content']}"
        
        # Gerar embedding
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        embedding = response.data[0].embedding
        
        vectors.append({
            "id": doc["id"],
            "vector": embedding,
            "payload": {
                "title": doc["title"],
                "content": doc["content"][:1000],  # Limitar payload
                "source": doc["source"],
                "type": doc["type"],
                "tags": doc["tags"],
                "indexed_at": datetime.utcnow().isoformat()
            }
        })
    
    # Upsert no Qdrant
    qdrant.upsert(
        collection_name="ysh-regulations",
        vectors=vectors
    )
    
    context.log.info(f"✅ Indexados {len(vectors)} documentos regulatórios")
    
    return {
        "collection": "ysh-regulations",
        "vectors_count": len(vectors),
        "indexed_at": datetime.utcnow().isoformat()
    }


# ==========================================
# KB 2: CATALOG (Itens FV, Séries, Certificações)
# ==========================================

@asset(
    description="Indexar catálogo FV: painéis, inversores, baterias, acessórios com specs técnicas",
    group_name="helio_kb",
    compute_kind="qdrant"
)
def helio_kb_catalog(
    context: AssetExecutionContext,
    postgres: PostgresResource,
    qdrant: QdrantResource
) -> Dict[str, Any]:
    """
    Lê catálogo normalizado do Postgres/arquivos e cria embeddings semânticos.
    
    Fontes:
    - /ysh-erp/data/catalog/*.json
    - Postgres: ysh_catalog.products
    
    Output: vectors no Qdrant collection 'ysh-catalog'
    """
    
    context.log.info("📦 Iniciando indexação de catálogo...")
    
    # Ler catálogo do Postgres
    query = """
        SELECT 
            id, title, handle, description, 
            material, type_id, 
            variants::jsonb as variants,
            metadata::jsonb as metadata
        FROM product
        WHERE status = 'published'
        LIMIT 1000
    """
    
    products = postgres.execute_query(query)
    
    # Preparar documentos para embedding
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    vectors = []
    for product in products:
        # Criar texto rico para embedding
        text = f"""
Produto: {product['title']}
Categoria: {product['type_id'] or 'N/A'}
Material: {product['material'] or 'N/A'}
Descrição: {product['description'] or 'N/A'}

Especificações Técnicas:
{json.dumps(product.get('metadata', {}), indent=2, ensure_ascii=False)}

Variantes:
{json.dumps(product.get('variants', []), indent=2, ensure_ascii=False)}
        """.strip()
        
        # Gerar embedding
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        embedding = response.data[0].embedding
        
        vectors.append({
            "id": f"product_{product['id']}",
            "vector": embedding,
            "payload": {
                "product_id": product['id'],
                "title": product['title'],
                "handle": product['handle'],
                "type": product['type_id'],
                "material": product['material'],
                "description": (product['description'] or '')[:500],
                "metadata": product.get('metadata', {}),
                "indexed_at": datetime.utcnow().isoformat()
            }
        })
    
    # Upsert no Qdrant
    qdrant.upsert(
        collection_name="ysh-catalog",
        vectors=vectors
    )
    
    context.log.info(f"✅ Indexados {len(vectors)} produtos")
    
    return {
        "collection": "ysh-catalog",
        "vectors_count": len(vectors),
        "products_indexed": len(products),
        "indexed_at": datetime.utcnow().isoformat()
    }


# ==========================================
# KB 3: TARIFFS (Tarifas por UC, Distribuidora, Bandeiras)
# ==========================================

@asset(
    description="Indexar estruturas tarifárias ANEEL por classe/subgrupo/distribuidora + bandeiras",
    group_name="helio_kb",
    compute_kind="qdrant"
)
def helio_kb_tariffs(
    context: AssetExecutionContext,
    qdrant: QdrantResource
) -> Dict[str, Any]:
    """
    Processa tarifas vigentes da ANEEL e cria embeddings para busca semântica.
    
    Fontes:
    - ANEEL API (tarifas homologadas)
    - Bandeiras tarifárias (verde, amarela, vermelha P1/P2)
    - Histórico de reajustes
    
    Output: vectors no Qdrant collection 'ysh-tariffs'
    """
    
    context.log.info("💰 Iniciando indexação de tarifas...")
    
    # TODO: Integrar com API ANEEL real
    # Exemplo de estrutura
    tariffs = [
        {
            "id": "enel-sp-b1-mono-2024",
            "distribuidora": "ENEL SP",
            "classe": "B1",
            "subgrupo": "Residencial",
            "fase": "Monofásica",
            "tarifa_kwh": 0.72580,
            "tarifa_disponibilidade": 30.00,
            "bandeira_verde": 0.0,
            "bandeira_amarela": 0.01874,
            "bandeira_vermelha_p1": 0.04463,
            "bandeira_vermelha_p2": 0.07877,
            "vigencia_inicio": "2024-07-01",
            "reajuste_percentual": 4.52,
            "tributos": {
                "icms": 18.0,
                "pis": 1.65,
                "cofins": 7.60
            }
        },
        {
            "id": "light-rj-b3-tri-2024",
            "distribuidora": "Light RJ",
            "classe": "B3",
            "subgrupo": "Demais Classes",
            "fase": "Trifásica",
            "tarifa_kwh": 0.65432,
            "tarifa_disponibilidade": 100.00,
            "vigencia_inicio": "2024-06-15",
            "tributos": {
                "icms": 20.0,
                "pis": 1.65,
                "cofins": 7.60
            }
        }
    ]
    
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    vectors = []
    for tariff in tariffs:
        # Criar texto para embedding
        text = f"""
Distribuidora: {tariff['distribuidora']}
Classe: {tariff['classe']} - {tariff['subgrupo']}
Fase: {tariff.get('fase', 'N/A')}
Tarifa por kWh: R$ {tariff['tarifa_kwh']:.5f}
Disponibilidade: R$ {tariff.get('tarifa_disponibilidade', 0):.2f}
Bandeiras: Verde {tariff.get('bandeira_verde', 0):.5f} | Amarela {tariff.get('bandeira_amarela', 0):.5f}
Vigência: {tariff['vigencia_inicio']}
Tributos: ICMS {tariff['tributos']['icms']}%, PIS {tariff['tributos']['pis']}%, COFINS {tariff['tributos']['cofins']}%
        """.strip()
        
        # Gerar embedding
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        embedding = response.data[0].embedding
        
        vectors.append({
            "id": tariff["id"],
            "vector": embedding,
            "payload": {
                "distribuidora": tariff["distribuidora"],
                "classe": tariff["classe"],
                "subgrupo": tariff["subgrupo"],
                "tarifa_kwh": tariff["tarifa_kwh"],
                "vigencia": tariff["vigencia_inicio"],
                "tributos": tariff["tributos"],
                "indexed_at": datetime.utcnow().isoformat()
            }
        })
    
    qdrant.upsert(
        collection_name="ysh-tariffs",
        vectors=vectors
    )
    
    context.log.info(f"✅ Indexadas {len(vectors)} estruturas tarifárias")
    
    return {
        "collection": "ysh-tariffs",
        "vectors_count": len(vectors),
        "indexed_at": datetime.utcnow().isoformat()
    }


# ==========================================
# KB 4: GEOSPATIAL (Irradiância, PVGIS, NASA POWER)
# ==========================================

@asset(
    description="Indexar dados climáticos e geoespaciais: HSP, irradiância, temperatura por região",
    group_name="helio_kb",
    compute_kind="qdrant"
)
def helio_kb_geospatial(
    context: AssetExecutionContext,
    qdrant: QdrantResource
) -> Dict[str, Any]:
    """
    Processa dados climáticos por município/região e cria embeddings.
    
    Fontes:
    - PVGIS API (irradiância Europa + Brasil)
    - NASA POWER (dados históricos globais)
    - NREL NSRDB (quando disponível)
    
    Output: vectors no Qdrant collection 'ysh-geospatial'
    """
    
    context.log.info("🌍 Iniciando indexação de dados geoespaciais...")
    
    # TODO: Integrar com PVGIS/NASA POWER APIs
    # Exemplo de estrutura
    geo_data = [
        {
            "id": "sp-sao-paulo-01311",
            "municipio": "São Paulo",
            "uf": "SP",
            "regiao": "Sudeste",
            "cep_prefix": "01",
            "lat": -23.5505,
            "lon": -46.6333,
            "hsp_anual_medio": 4.68,  # kWh/m²·dia
            "temp_media_anual": 20.7,  # °C
            "temp_maxima_media": 26.4,
            "temp_minima_media": 15.8,
            "irradiancia_ghi_kwh_m2_ano": 1708,
            "fonte": "NASA POWER",
            "periodo": "2013-2023"
        },
        {
            "id": "pe-recife-50000",
            "municipio": "Recife",
            "uf": "PE",
            "regiao": "Nordeste",
            "cep_prefix": "50",
            "lat": -8.0476,
            "lon": -34.8770,
            "hsp_anual_medio": 5.42,
            "temp_media_anual": 25.8,
            "temp_maxima_media": 30.2,
            "temp_minima_media": 22.4,
            "irradiancia_ghi_kwh_m2_ano": 1978,
            "fonte": "PVGIS",
            "periodo": "2005-2020"
        }
    ]
    
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    vectors = []
    for geo in geo_data:
        text = f"""
Localização: {geo['municipio']} - {geo['uf']} ({geo['regiao']})
Coordenadas: {geo['lat']}, {geo['lon']}
CEP Prefix: {geo['cep_prefix']}
HSP Anual Médio: {geo['hsp_anual_medio']} kWh/m²·dia
Irradiância GHI: {geo['irradiancia_ghi_kwh_m2_ano']} kWh/m²·ano
Temperatura Média Anual: {geo['temp_media_anual']}°C
Fonte: {geo['fonte']} (período {geo['periodo']})
        """.strip()
        
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        embedding = response.data[0].embedding
        
        vectors.append({
            "id": geo["id"],
            "vector": embedding,
            "payload": {
                "municipio": geo["municipio"],
                "uf": geo["uf"],
                "regiao": geo["regiao"],
                "lat": geo["lat"],
                "lon": geo["lon"],
                "hsp": geo["hsp_anual_medio"],
                "irradiancia": geo["irradiancia_ghi_kwh_m2_ano"],
                "temp_media": geo["temp_media_anual"],
                "fonte": geo["fonte"],
                "indexed_at": datetime.utcnow().isoformat()
            }
        })
    
    qdrant.upsert(
        collection_name="ysh-geospatial",
        vectors=vectors
    )
    
    context.log.info(f"✅ Indexados {len(vectors)} pontos geoespaciais")
    
    return {
        "collection": "ysh-geospatial",
        "vectors_count": len(vectors),
        "indexed_at": datetime.utcnow().isoformat()
    }


# ==========================================
# KB 5: FINANCE (Crédito, Bancos, ROI)
# ==========================================

@asset(
    description="Indexar linhas de crédito, tabelas BACEN, taxas, condições de financiamento",
    group_name="helio_kb",
    compute_kind="qdrant"
)
def helio_kb_finance(
    context: AssetExecutionContext,
    qdrant: QdrantResource
) -> Dict[str, Any]:
    """
    Processa informações financeiras e cria embeddings.
    
    Fontes:
    - Tabelas BACEN (SELIC, taxas)
    - Bancos parceiros (BV, Santander, Sicredi)
    - Linhas de crédito específicas para energia solar
    
    Output: vectors no Qdrant collection 'ysh-finance'
    """
    
    context.log.info("💳 Iniciando indexação de dados financeiros...")
    
    # TODO: Integrar com APIs de bancos
    finance_data = [
        {
            "id": "bv-financiamento-solar-2024",
            "banco": "Banco BV",
            "produto": "Financiamento Energia Solar",
            "taxa_mensal": 1.29,
            "taxa_anual": 16.58,
            "prazo_max_meses": 120,
            "valor_min": 5000,
            "valor_max": 150000,
            "entrada_min_pct": 0,
            "carencia_meses": 3,
            "requisitos": [
                "Score mínimo 600",
                "Renda comprovada",
                "Não negativado"
            ],
            "diferenciais": [
                "Sem entrada",
                "Carência de 90 dias",
                "Aceita MEI"
            ]
        },
        {
            "id": "santander-van-gogh-2024",
            "banco": "Santander",
            "produto": "Van Gogh - Energia Solar",
            "taxa_mensal": 1.49,
            "taxa_anual": 19.35,
            "prazo_max_meses": 84,
            "valor_min": 10000,
            "valor_max": 200000,
            "entrada_min_pct": 20,
            "carencia_meses": 0,
            "requisitos": [
                "Score mínimo 650",
                "Entrada de 20%",
                "Imóvel próprio"
            ]
        }
    ]
    
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    vectors = []
    for finance in finance_data:
        text = f"""
Banco: {finance['banco']}
Produto: {finance['produto']}
Taxa: {finance['taxa_mensal']}% a.m. ({finance['taxa_anual']}% a.a.)
Prazo: até {finance['prazo_max_meses']} meses
Valor: R$ {finance['valor_min']:,.2f} a R$ {finance['valor_max']:,.2f}
Entrada: {finance['entrada_min_pct']}%
Carência: {finance['carencia_meses']} meses

Requisitos:
{chr(10).join(f"- {req}" for req in finance['requisitos'])}

{f"Diferenciais:{chr(10)}{chr(10).join(f'- {dif}' for dif in finance.get('diferenciais', []))}" if finance.get('diferenciais') else ''}
        """.strip()
        
        response = openai.embeddings.create(
            model="text-embedding-3-large",
            input=text
        )
        embedding = response.data[0].embedding
        
        vectors.append({
            "id": finance["id"],
            "vector": embedding,
            "payload": {
                "banco": finance["banco"],
                "produto": finance["produto"],
                "taxa_mensal": finance["taxa_mensal"],
                "taxa_anual": finance["taxa_anual"],
                "prazo_max": finance["prazo_max_meses"],
                "valor_min": finance["valor_min"],
                "valor_max": finance["valor_max"],
                "requisitos": finance["requisitos"],
                "indexed_at": datetime.utcnow().isoformat()
            }
        })
    
    qdrant.upsert(
        collection_name="ysh-finance",
        vectors=vectors
    )
    
    context.log.info(f"✅ Indexados {len(vectors)} produtos financeiros")
    
    return {
        "collection": "ysh-finance",
        "vectors_count": len(vectors),
        "indexed_at": datetime.utcnow().isoformat()
    }


# ==========================================
# Asset de Consolidação (Aggregator)
# ==========================================

@asset(
    description="Consolida estatísticas de todas as KBs do Hélio",
    group_name="helio_kb",
    ins={
        "regulations": AssetIn("helio_kb_regulations"),
        "catalog": AssetIn("helio_kb_catalog"),
        "tariffs": AssetIn("helio_kb_tariffs"),
        "geospatial": AssetIn("helio_kb_geospatial"),
        "finance": AssetIn("helio_kb_finance")
    }
)
def helio_kb_summary(
    context: AssetExecutionContext,
    regulations: Dict[str, Any],
    catalog: Dict[str, Any],
    tariffs: Dict[str, Any],
    geospatial: Dict[str, Any],
    finance: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Consolida métricas de todas as Knowledge Bases do Hélio.
    """
    
    summary = {
        "total_vectors": sum([
            regulations["vectors_count"],
            catalog["vectors_count"],
            tariffs["vectors_count"],
            geospatial["vectors_count"],
            finance["vectors_count"]
        ]),
        "collections": {
            "regulations": regulations,
            "catalog": catalog,
            "tariffs": tariffs,
            "geospatial": geospatial,
            "finance": finance
        },
        "updated_at": datetime.utcnow().isoformat(),
        "status": "ready"
    }
    
    context.log.info(f"📊 Total de vetores indexados: {summary['total_vectors']}")
    
    return summary
