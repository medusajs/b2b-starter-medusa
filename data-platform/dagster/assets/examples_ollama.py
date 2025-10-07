# ==========================================
# Example Asset — Hybrid LLM Usage
# Demonstra uso de Ollama + OpenAI fallback
# ==========================================

from dagster import asset, AssetExecutionContext, Output, MetadataValue
from ..resources.ollama import HybridLLMResource
from ..resources.qdrant import QdrantResource
from ..resources.postgres import PostgresResource
from typing import Dict, Any, List


@asset(
    group_name="examples",
    description="Exemplo de RAG com fallback local (Ollama)"
)
def example_hybrid_rag(
    context: AssetExecutionContext,
    llm: HybridLLMResource,
    qdrant: QdrantResource,
    postgres: PostgresResource
) -> Output[Dict[str, Any]]:
    """
    Demonstra uso do Hybrid LLM com fallback automático
    
    Fluxo:
    1. Busca produtos solares do Postgres
    2. Gera embeddings (OpenAI ou Ollama fallback)
    3. Upsert no Qdrant
    4. Query RAG: "Qual melhor painel para residencial?"
    5. LLM gera resposta com contexto
    
    Returns:
        Dict com métricas e exemplo de response
    """
    
    context.log.info(f"🤖 LLM Provider ativo: {llm.get_active_provider()}")
    
    # 1. Buscar produtos (mock)
    products = [
        {
            "id": "prod_1",
            "name": "Painel Canadian Solar 550W Mono",
            "description": "Painel solar monocristalino 550W, eficiência 21.2%, ideal para projetos residenciais e comerciais.",
            "price_b1": 850.00,
            "category": "panel"
        },
        {
            "id": "prod_2",
            "name": "Inversor Growatt MIC 3000TL-X",
            "description": "Inversor grid-tie 3kW, monofásico, 2 MPPT, compatível com painéis de alta potência.",
            "price_b1": 2100.00,
            "category": "inverter"
        },
        {
            "id": "prod_3",
            "name": "Kit Solar Residencial 5kWp",
            "description": "Kit completo: 10x painéis 550W + inversor 5kW + estrutura + cabos + conectores.",
            "price_b1": 12500.00,
            "category": "kit"
        }
    ]
    
    context.log.info(f"📦 {len(products)} produtos para embeddings")
    
    # 2. Gerar embeddings (com fallback automático)
    texts = [
        f"{p['name']}: {p['description']} | Preço B1: R$ {p['price_b1']}" 
        for p in products
    ]
    
    try:
        embeddings = llm.embed(texts)
        context.log.info(f"✅ {len(embeddings)} embeddings gerados")
        
        # Detectar dimensão (OpenAI: 3072, Ollama nomic: 768)
        embedding_dim = len(embeddings[0]) if embeddings else 0
        context.log.info(f"📊 Dimensão dos embeddings: {embedding_dim}")
        
        provider_used = "openai" if embedding_dim == 3072 else "ollama"
        
    except Exception as e:
        context.log.error(f"❌ Erro ao gerar embeddings: {e}")
        embeddings = []
        provider_used = "error"
        embedding_dim = 0
    
    # 3. Upsert no Qdrant (mock - não implementado ainda)
    # vectors = [
    #     {
    #         "id": p["id"],
    #         "vector": emb,
    #         "payload": {
    #             "name": p["name"],
    #             "description": p["description"],
    #             "price": p["price_b1"],
    #             "category": p["category"]
    #         }
    #     }
    #     for p, emb in zip(products, embeddings)
    # ]
    # qdrant.upsert(vectors)
    
    # 4. Query RAG (exemplo)
    user_query = "Qual o melhor painel solar para um projeto residencial de 5kWp?"
    
    try:
        # Gerar embedding da query
        query_embedding = llm.embed([user_query])[0]
        
        # Buscar no Qdrant (mock - retorna top 2)
        # results = qdrant.query(query_embedding, top_k=2)
        
        # Mock de resultados
        context_chunks = [
            products[0]["description"],  # Painel Canadian
            products[2]["description"]   # Kit 5kWp
        ]
        
        # 5. LLM gera resposta com contexto
        system_prompt = """Você é Hélio, assistente de vendas especializado em energia solar.
        Responda de forma técnica mas acessível, focando em ROI e benefícios."""
        
        prompt = f"""
        Contexto (produtos disponíveis):
        {chr(10).join(f'- {chunk}' for chunk in context_chunks)}
        
        Pergunta do cliente: {user_query}
        
        Forneça uma recomendação técnica com justificativa.
        """
        
        response = llm.chat(
            prompt=prompt,
            system=system_prompt,
            temperature=0.7,
            max_tokens=500
        )
        
        context.log.info(f"💬 Response Hélio: {response[:200]}...")
        
    except Exception as e:
        context.log.error(f"❌ Erro no RAG: {e}")
        response = "Erro ao processar consulta"
    
    # Resultado
    result = {
        "provider_used": provider_used,
        "embedding_dimensions": embedding_dim,
        "products_processed": len(products),
        "embeddings_generated": len(embeddings),
        "query": user_query,
        "response_preview": response[:200] if response else "",
        "status": "success" if embeddings else "error"
    }
    
    return Output(
        value=result,
        metadata={
            "provider": MetadataValue.text(provider_used),
            "dimensions": MetadataValue.int(embedding_dim),
            "products": MetadataValue.int(len(products)),
            "response": MetadataValue.md(response if response else "N/A")
        }
    )


@asset(
    group_name="examples",
    description="Benchmark OpenAI vs Ollama (latência + custo)"
)
def benchmark_llm_providers(
    context: AssetExecutionContext,
    llm: HybridLLMResource
) -> Output[Dict[str, Any]]:
    """
    Compara performance OpenAI vs Ollama
    
    Métricas:
    - Latência embeddings
    - Latência chat completion
    - Custo estimado (OpenAI)
    - Qualidade resposta (subjetivo)
    """
    import time
    
    test_texts = [
        "Painel solar monocristalino 550W alta eficiência",
        "Inversor grid-tie 5kW monofásico 2 MPPT",
        "Kit solar residencial completo 10kWp"
    ]
    
    test_prompt = "Explique em 50 palavras o que é irradiação solar."
    
    results = {
        "openai": {},
        "ollama": {}
    }
    
    # Teste OpenAI (se disponível)
    if llm._openai_available:
        try:
            # Embeddings
            start = time.time()
            embeddings_openai = llm.embed(test_texts, force_local=False)
            openai_embed_time = time.time() - start
            
            # Chat
            start = time.time()
            response_openai = llm.chat(test_prompt, force_local=False, max_tokens=100)
            openai_chat_time = time.time() - start
            
            results["openai"] = {
                "embed_latency_ms": round(openai_embed_time * 1000, 2),
                "chat_latency_ms": round(openai_chat_time * 1000, 2),
                "embed_dimensions": len(embeddings_openai[0]),
                "cost_estimate_usd": round(len(test_texts) * 0.00013 + 0.015, 4),  # text-embedding-3-large + gpt-4o
                "response_quality": "high"
            }
            
            context.log.info(f"✅ OpenAI: embed={openai_embed_time:.2f}s, chat={openai_chat_time:.2f}s")
            
        except Exception as e:
            context.log.error(f"❌ OpenAI error: {e}")
            results["openai"]["error"] = str(e)
    else:
        results["openai"]["error"] = "API key not configured"
    
    # Teste Ollama (se disponível)
    if llm._ollama.health_check():
        try:
            # Embeddings
            start = time.time()
            embeddings_ollama = llm.embed(test_texts, force_local=True)
            ollama_embed_time = time.time() - start
            
            # Chat
            start = time.time()
            response_ollama = llm.chat(test_prompt, force_local=True, max_tokens=100)
            ollama_chat_time = time.time() - start
            
            results["ollama"] = {
                "embed_latency_ms": round(ollama_embed_time * 1000, 2),
                "chat_latency_ms": round(ollama_chat_time * 1000, 2),
                "embed_dimensions": len(embeddings_ollama[0]),
                "cost_estimate_usd": 0.0,  # Local, zero cost
                "response_quality": "medium-high"
            }
            
            context.log.info(f"✅ Ollama: embed={ollama_embed_time:.2f}s, chat={ollama_chat_time:.2f}s")
            
        except Exception as e:
            context.log.error(f"❌ Ollama error: {e}")
            results["ollama"]["error"] = str(e)
    else:
        results["ollama"]["error"] = "Ollama not running"
    
    # Comparação
    comparison = {}
    if "embed_latency_ms" in results["openai"] and "embed_latency_ms" in results["ollama"]:
        comparison["embed_speedup"] = round(
            results["openai"]["embed_latency_ms"] / results["ollama"]["embed_latency_ms"],
            2
        )
        comparison["chat_speedup"] = round(
            results["openai"]["chat_latency_ms"] / results["ollama"]["chat_latency_ms"],
            2
        )
        comparison["monthly_cost_savings_usd"] = round(
            results["openai"]["cost_estimate_usd"] * 1000,  # 1000 queries/month
            2
        )
    
    results["comparison"] = comparison
    
    return Output(
        value=results,
        metadata={
            "openai_embed_ms": MetadataValue.float(results["openai"].get("embed_latency_ms", 0)),
            "ollama_embed_ms": MetadataValue.float(results["ollama"].get("embed_latency_ms", 0)),
            "cost_savings_monthly": MetadataValue.float(comparison.get("monthly_cost_savings_usd", 0)),
            "recommendation": MetadataValue.md(
                "**Recomendação**: Use Ollama para dev/staging (zero custo) e OpenAI para produção (melhor qualidade)"
                if comparison else "Execute benchmark completo"
            )
        }
    )
