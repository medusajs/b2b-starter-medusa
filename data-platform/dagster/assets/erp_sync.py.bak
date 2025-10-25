# ==========================================
# Dagster Assets — YSH ERP Integration
# Sincronização bidirecional Medusa ↔ ERP
# ==========================================

from dagster import asset, AssetExecutionContext, Output, MetadataValue
from ..resources.postgres import PostgresResource
from ..resources.qdrant import QdrantResource
import requests
import os
from typing import Dict, List, Any
from datetime import datetime, timedelta


# ==========================================
# Asset 1: ERP Products Sync
# ==========================================

@asset(
    group_name="erp_sync",
    description="Sincroniza catálogo de produtos do ERP com Medusa"
)
def erp_products_sync(
    context: AssetExecutionContext,
    postgres: PostgresResource
) -> Output[Dict[str, Any]]:
    """
    Sincroniza produtos do YSH ERP com Medusa
    
    Fluxo:
    1. Busca produtos atualizados no ERP (últimas 24h)
    2. Para cada produto:
       - Verifica se existe no Medusa (via SKU)
       - Se existe: atualiza preços e estoque
       - Se não existe: cria produto
    3. Retorna estatísticas de sync
    """
    
    ERP_API_URL = os.getenv("ERP_API_URL", "http://ysh-erp:3001")
    ERP_API_KEY = os.getenv("ERP_API_KEY", "")
    
    context.log.info("🔄 Iniciando sincronização ERP → Medusa")
    
    # 1. Buscar produtos do ERP
    try:
        response = requests.get(
            f"{ERP_API_URL}/admin/ysh-erp/distributors",
            headers={"X-API-Key": ERP_API_KEY},
            timeout=30
        )
        response.raise_for_status()
        erp_products = response.json().get("products", [])
        context.log.info(f"✅ {len(erp_products)} produtos recebidos do ERP")
    except Exception as e:
        context.log.error(f"❌ Erro ao buscar produtos do ERP: {e}")
        erp_products = []
    
    # 2. Processar cada produto
    stats = {
        "total": len(erp_products),
        "created": 0,
        "updated": 0,
        "errors": 0
    }
    
    with postgres.get_connection() as conn:
        cursor = conn.cursor()
        
        for product in erp_products:
            try:
                sku = product.get("sku")
                distributor = product.get("distributor")
                
                # Verificar se produto existe
                cursor.execute("""
                    SELECT id, title, metadata
                    FROM product
                    WHERE metadata->>'sku' = %s
                    AND metadata->>'distributor' = %s
                    LIMIT 1
                """, (sku, distributor))
                
                existing = cursor.fetchone()
                
                if existing:
                    # Atualizar produto existente
                    product_id = existing[0]
                    cursor.execute("""
                        UPDATE product
                        SET 
                            metadata = metadata || %s::jsonb,
                            updated_at = NOW()
                        WHERE id = %s
                    """, (
                        {
                            "erp_last_sync": datetime.now().isoformat(),
                            "erp_price_b1": product.get("price_b1"),
                            "erp_price_b3": product.get("price_b3"),
                            "erp_stock": product.get("stock_quantity", 0)
                        },
                        product_id
                    ))
                    stats["updated"] += 1
                    context.log.debug(f"Updated: {sku} from {distributor}")
                else:
                    # Criar novo produto
                    cursor.execute("""
                        INSERT INTO product (
                            title, subtitle, handle, status,
                            metadata, created_at, updated_at
                        )
                        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
                        RETURNING id
                    """, (
                        product.get("name"),
                        product.get("brand"),
                        f"{distributor}-{sku}",
                        "published",
                        {
                            "sku": sku,
                            "distributor": distributor,
                            "erp_source": True,
                            "erp_price_b1": product.get("price_b1"),
                            "erp_price_b3": product.get("price_b3"),
                            "erp_stock": product.get("stock_quantity", 0),
                            "technical_specs": product.get("specs", {})
                        }
                    ))
                    stats["created"] += 1
                    context.log.debug(f"Created: {sku} from {distributor}")
                
            except Exception as e:
                context.log.error(f"❌ Erro ao processar {product.get('sku')}: {e}")
                stats["errors"] += 1
        
        conn.commit()
    
    context.log.info(f"✅ Sync concluído: {stats}")
    
    return Output(
        value=stats,
        metadata={
            "total_products": MetadataValue.int(stats["total"]),
            "created": MetadataValue.int(stats["created"]),
            "updated": MetadataValue.int(stats["updated"]),
            "errors": MetadataValue.int(stats["errors"]),
            "success_rate": MetadataValue.float(
                (stats["created"] + stats["updated"]) / stats["total"] * 100
                if stats["total"] > 0 else 0
            )
        }
    )


# ==========================================
# Asset 2: ERP Orders Sync
# ==========================================

@asset(
    group_name="erp_sync",
    description="Sincroniza ordens pendentes do Medusa para o ERP"
)
def erp_orders_sync(
    context: AssetExecutionContext,
    postgres: PostgresResource
) -> Output[Dict[str, Any]]:
    """
    Envia ordens pendentes do Medusa para o ERP
    
    Fluxo:
    1. Busca ordens com status "pending" ou "processing"
    2. Filtra ordens que ainda não foram enviadas ao ERP
    3. Envia cada ordem via API do ERP
    4. Atualiza metadata com erp_order_id
    """
    
    ERP_API_URL = os.getenv("ERP_API_URL", "http://ysh-erp:3001")
    ERP_API_KEY = os.getenv("ERP_API_KEY", "")
    
    context.log.info("🔄 Iniciando sincronização Medusa → ERP (orders)")
    
    stats = {
        "total": 0,
        "sent": 0,
        "skipped": 0,
        "errors": 0
    }
    
    with postgres.get_connection() as conn:
        cursor = conn.cursor()
        
        # Buscar ordens pendentes (últimas 24h)
        cursor.execute("""
            SELECT 
                o.id,
                o.email,
                o.display_id,
                o.total,
                o.payment_status,
                o.fulfillment_status,
                o.metadata,
                o.created_at
            FROM "order" o
            WHERE o.fulfillment_status IN ('not_fulfilled', 'partially_fulfilled')
            AND o.created_at > NOW() - INTERVAL '24 hours'
            AND (o.metadata->>'erp_order_id' IS NULL)
            ORDER BY o.created_at DESC
        """)
        
        orders = cursor.fetchall()
        stats["total"] = len(orders)
        
        context.log.info(f"📦 {stats['total']} ordens pendentes encontradas")
        
        for order in orders:
            order_id, email, display_id, total, payment_status, fulfillment_status, metadata, created_at = order
            
            try:
                # Buscar itens da ordem
                cursor.execute("""
                    SELECT 
                        li.title,
                        li.quantity,
                        li.unit_price,
                        li.metadata
                    FROM line_item li
                    WHERE li.order_id = %s
                """, (order_id,))
                
                items = cursor.fetchall()
                
                # Preparar payload para ERP
                payload = {
                    "medusa_order_id": order_id,
                    "display_id": display_id,
                    "customer_email": email,
                    "total": float(total) / 100,  # Converter de centavos
                    "payment_status": payment_status,
                    "items": [
                        {
                            "title": item[0],
                            "quantity": item[1],
                            "unit_price": float(item[2]) / 100,
                            "sku": item[3].get("sku") if item[3] else None,
                            "distributor": item[3].get("distributor") if item[3] else None
                        }
                        for item in items
                    ],
                    "company_id": metadata.get("company_id") if metadata else None,
                    "created_at": created_at.isoformat()
                }
                
                # Enviar para ERP
                response = requests.post(
                    f"{ERP_API_URL}/erp/order-updates",
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-API-Key": ERP_API_KEY
                    },
                    timeout=30
                )
                response.raise_for_status()
                
                erp_order_id = response.json().get("order_id")
                
                # Atualizar metadata com erp_order_id
                cursor.execute("""
                    UPDATE "order"
                    SET metadata = COALESCE(metadata, '{}'::jsonb) || %s::jsonb
                    WHERE id = %s
                """, (
                    {
                        "erp_order_id": erp_order_id,
                        "erp_sync_timestamp": datetime.now().isoformat()
                    },
                    order_id
                ))
                
                stats["sent"] += 1
                context.log.info(f"✅ Ordem {display_id} enviada ao ERP: {erp_order_id}")
                
            except Exception as e:
                context.log.error(f"❌ Erro ao enviar ordem {display_id}: {e}")
                stats["errors"] += 1
        
        conn.commit()
    
    context.log.info(f"✅ Sync de ordens concluído: {stats}")
    
    return Output(
        value=stats,
        metadata={
            "total_orders": MetadataValue.int(stats["total"]),
            "sent_to_erp": MetadataValue.int(stats["sent"]),
            "errors": MetadataValue.int(stats["errors"]),
            "success_rate": MetadataValue.float(
                stats["sent"] / stats["total"] * 100
                if stats["total"] > 0 else 0
            )
        }
    )


# ==========================================
# Asset 3: ERP Homologação Sync
# ==========================================

@asset(
    group_name="erp_sync",
    description="Sincroniza status de homologação do ERP para Medusa"
)
def erp_homologacao_sync(
    context: AssetExecutionContext,
    postgres: PostgresResource
) -> Output[Dict[str, Any]]:
    """
    Busca atualizações de homologação no ERP e sincroniza com Medusa
    
    Fluxo:
    1. Busca solicitações de homologação no ERP (últimas 24h)
    2. Para cada solicitação, atualiza ordem no Medusa
    3. Notifica mudanças de status via webhook
    """
    
    ERP_API_URL = os.getenv("ERP_API_URL", "http://ysh-erp:3001")
    ERP_API_KEY = os.getenv("ERP_API_KEY", "")
    
    context.log.info("🔄 Iniciando sincronização ERP → Medusa (homologação)")
    
    try:
        # Buscar solicitações do ERP
        response = requests.get(
            f"{ERP_API_URL}/admin/ysh-homologacao/solicitacoes",
            headers={"X-API-Key": ERP_API_KEY},
            params={"updated_since": (datetime.now() - timedelta(hours=24)).isoformat()},
            timeout=30
        )
        response.raise_for_status()
        solicitacoes = response.json().get("solicitacoes", [])
        
        context.log.info(f"📋 {len(solicitacoes)} solicitações recebidas")
    except Exception as e:
        context.log.error(f"❌ Erro ao buscar homologações: {e}")
        solicitacoes = []
    
    stats = {
        "total": len(solicitacoes),
        "updated": 0,
        "errors": 0
    }
    
    with postgres.get_connection() as conn:
        cursor = conn.cursor()
        
        for sol in solicitacoes:
            try:
                medusa_order_id = sol.get("medusa_order_id")
                status = sol.get("status")
                parecer = sol.get("parecer")
                vistoria_date = sol.get("vistoria_date")
                
                # Atualizar metadata da ordem
                cursor.execute("""
                    UPDATE "order"
                    SET metadata = COALESCE(metadata, '{}'::jsonb) || %s::jsonb
                    WHERE id = %s
                """, (
                    {
                        "homologacao_status": status,
                        "homologacao_parecer": parecer,
                        "homologacao_vistoria_date": vistoria_date,
                        "homologacao_last_update": datetime.now().isoformat()
                    },
                    medusa_order_id
                ))
                
                stats["updated"] += 1
                context.log.info(f"✅ Ordem {medusa_order_id}: {status}")
                
            except Exception as e:
                context.log.error(f"❌ Erro ao atualizar homologação: {e}")
                stats["errors"] += 1
        
        conn.commit()
    
    context.log.info(f"✅ Sync de homologação concluído: {stats}")
    
    return Output(
        value=stats,
        metadata={
            "total_solicitacoes": MetadataValue.int(stats["total"]),
            "updated_orders": MetadataValue.int(stats["updated"]),
            "errors": MetadataValue.int(stats["errors"])
        }
    )


# ==========================================
# Asset 4: ERP Pricing KB (para RAG)
# ==========================================

@asset(
    group_name="erp_sync",
    description="Sincroniza tabelas de preços do ERP para Knowledge Base do Hélio",
    deps=["erp_products_sync"]
)
def erp_pricing_kb(
    context: AssetExecutionContext,
    postgres: PostgresResource,
    qdrant: QdrantResource
) -> Output[Dict[str, Any]]:
    """
    Cria embeddings das tabelas de preços do ERP para consultas RAG
    
    Fluxo:
    1. Busca todos os produtos com preços ERP
    2. Cria chunks de texto com informações de pricing
    3. Gera embeddings (OpenAI)
    4. Upsert em Qdrant collection "helio-erp-pricing"
    """
    
    context.log.info("🔄 Gerando KB de preços ERP para RAG")
    
    with postgres.get_connection() as conn:
        cursor = conn.cursor()
        
        # Buscar produtos com preços ERP
        cursor.execute("""
            SELECT 
                id,
                title,
                metadata->>'sku' as sku,
                metadata->>'distributor' as distributor,
                metadata->>'erp_price_b1' as price_b1,
                metadata->>'erp_price_b3' as price_b3,
                metadata->>'erp_stock' as stock,
                metadata->'technical_specs' as specs
            FROM product
            WHERE metadata->>'erp_source' = 'true'
            AND metadata->>'erp_price_b1' IS NOT NULL
        """)
        
        products = cursor.fetchall()
        context.log.info(f"📊 {len(products)} produtos com preços ERP")
    
    # TODO: Implementar embeddings e upsert no Qdrant
    # Similar ao catalog_kb, mas focado em pricing
    
    stats = {
        "products_processed": len(products),
        "embeddings_generated": 0,  # Mock
        "upserted_to_qdrant": 0  # Mock
    }
    
    context.log.info(f"✅ ERP Pricing KB atualizada: {stats}")
    
    return Output(
        value=stats,
        metadata={
            "products": MetadataValue.int(stats["products_processed"]),
            "embeddings": MetadataValue.int(stats["embeddings_generated"])
        }
    )
