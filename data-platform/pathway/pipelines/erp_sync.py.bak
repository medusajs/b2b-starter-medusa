# ==========================================
# Pathway Pipeline — ERP Sync (CDC)
# Sincronização bidirecional Medusa ↔ ERP
# ==========================================

import pathway as pw
import os
import json
import requests
from datetime import datetime
from typing import Dict, Any

# ==========================================
# Configuração
# ==========================================

MEDUSA_DB_HOST = os.getenv("MEDUSA_DB_HOST", "postgres")
MEDUSA_DB_PORT = int(os.getenv("MEDUSA_DB_PORT", "5432"))
MEDUSA_DB_NAME = os.getenv("MEDUSA_DB_NAME", "medusa_db")
MEDUSA_DB_USER = os.getenv("MEDUSA_DB_USER", "medusa_user")
MEDUSA_DB_PASSWORD = os.getenv("MEDUSA_DB_PASSWORD", "medusa_password")

ERP_API_URL = os.getenv("ERP_API_URL", "http://ysh-erp:3001")
ERP_API_KEY = os.getenv("ERP_API_KEY", "")

KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "kafka:9092")

# ==========================================
# Schema de Eventos ERP
# ==========================================

class ErpOrderEvent(pw.Schema):
    """Evento de ordem do ERP"""
    event_id: str
    event_type: str  # "order.created", "order.updated", "order.shipped"
    order_id: str
    medusa_order_id: str | None
    distributor: str
    status: str
    items: str  # JSON serializado
    total: float
    tracking_code: str | None
    timestamp: datetime


class ErpPriceUpdate(pw.Schema):
    """Atualização de preços do ERP"""
    event_id: str
    distributor: str
    product_sku: str
    medusa_product_id: str | None
    price_b1: float
    price_b3: float
    stock_quantity: int
    last_updated: datetime


class ErpInventoryUpdate(pw.Schema):
    """Atualização de estoque do ERP"""
    event_id: str
    distributor: str
    product_sku: str
    medusa_product_id: str | None
    quantity: int
    location: str
    timestamp: datetime


# ==========================================
# Pipeline 1: ERP Orders → Medusa
# ==========================================

def sync_erp_orders_to_medusa():
    """
    Captura eventos de ordens do ERP e sincroniza com Medusa
    
    Fluxo:
    1. Kafka topic "ysh-erp.orders" → Pathway
    2. Enriquece com dados Medusa (customer, address)
    3. Atualiza status da ordem no Medusa
    4. Registra tracking code
    """
    
    # Input: Kafka topic do ERP
    erp_orders = pw.io.kafka.read(
        rdkafka_settings={
            "bootstrap.servers": KAFKA_BROKERS,
            "group.id": "pathway-erp-orders",
            "auto.offset.reset": "earliest"
        },
        topic="ysh-erp.orders",
        schema=ErpOrderEvent,
        format="json"
    )
    
    # Transformação: Preparar payload para Medusa
    def prepare_medusa_update(row: Dict[str, Any]) -> Dict[str, Any]:
        """Converte evento ERP para formato Medusa"""
        
        # Mapear status ERP → Medusa
        status_map = {
            "pending": "pending",
            "processing": "processing",
            "shipped": "shipped",
            "delivered": "completed",
            "cancelled": "cancelled"
        }
        
        return {
            "medusa_order_id": row["medusa_order_id"],
            "metadata": {
                "erp_order_id": row["order_id"],
                "erp_distributor": row["distributor"],
                "erp_status": row["status"],
                "erp_sync_timestamp": row["timestamp"].isoformat()
            },
            "fulfillment_status": status_map.get(row["status"], "pending"),
            "tracking_code": row["tracking_code"]
        }
    
    medusa_updates = erp_orders.select(
        update_payload=pw.apply(prepare_medusa_update, pw.this)
    )
    
    # Output: HTTP POST para Medusa API
    def post_to_medusa(update: Dict[str, Any]):
        """Envia atualização para Medusa via API"""
        try:
            response = requests.post(
                f"{MEDUSA_DB_HOST}:9000/admin/orders/{update['medusa_order_id']}",
                json={
                    "metadata": update["metadata"],
                    "fulfillment_status": update["fulfillment_status"]
                },
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {os.getenv('MEDUSA_ADMIN_TOKEN')}"
                },
                timeout=10
            )
            response.raise_for_status()
            return {"status": "success", "order_id": update["medusa_order_id"]}
        except Exception as e:
            return {"status": "error", "error": str(e), "order_id": update["medusa_order_id"]}
    
    # Aplicar sink HTTP (mock)
    pw.io.null.write(medusa_updates)
    
    print("[ERP→Medusa] Pipeline de ordens ativo")


# ==========================================
# Pipeline 2: ERP Prices → Medusa
# ==========================================

def sync_erp_prices_to_medusa():
    """
    Sincroniza preços do ERP com Medusa em tempo real
    
    Fluxo:
    1. Kafka topic "ysh-erp.prices" → Pathway
    2. Lookup medusa_product_id via SKU
    3. Atualiza price_list no Medusa (B1/B3)
    """
    
    # Input: Kafka topic de preços
    erp_prices = pw.io.kafka.read(
        rdkafka_settings={
            "bootstrap.servers": KAFKA_BROKERS,
            "group.id": "pathway-erp-prices",
            "auto.offset.reset": "earliest"
        },
        topic="ysh-erp.prices",
        schema=ErpPriceUpdate,
        format="json"
    )
    
    # Lookup: SKU → Medusa Product ID (via Postgres)
    def lookup_product_id(sku: str, distributor: str) -> str | None:
        """Busca product_id no Medusa via SKU"""
        # TODO: Implementar query Postgres
        # SELECT id FROM product WHERE metadata->>'sku' = sku
        return None
    
    enriched_prices = erp_prices.select(
        product_id=pw.apply(lambda row: lookup_product_id(row["product_sku"], row["distributor"]), pw.this),
        **pw.this
    )
    
    # Filter: Apenas produtos que existem no Medusa
    valid_prices = enriched_prices.filter(pw.this.product_id.is_not_none())
    
    # Output: Upsert em Postgres (price_list)
    pw.io.postgres.write(
        valid_prices,
        postgres_settings={
            "host": MEDUSA_DB_HOST,
            "port": MEDUSA_DB_PORT,
            "dbname": MEDUSA_DB_NAME,
            "user": MEDUSA_DB_USER,
            "password": MEDUSA_DB_PASSWORD
        },
        table_name="price_list",
        # TODO: Definir colunas corretas
    )
    
    print("[ERP→Medusa] Pipeline de preços ativo")


# ==========================================
# Pipeline 3: Medusa Orders → ERP
# ==========================================

def sync_medusa_orders_to_erp():
    """
    Captura novas ordens do Medusa e envia para ERP
    
    Fluxo:
    1. Postgres CDC (Medusa orders table) → Kafka → Pathway
    2. Enriquece com dados de company, distributor
    3. POST para API do ERP
    """
    
    # Input: Debezium CDC do Postgres Medusa
    medusa_orders = pw.io.kafka.read(
        rdkafka_settings={
            "bootstrap.servers": KAFKA_BROKERS,
            "group.id": "pathway-medusa-orders",
            "auto.offset.reset": "earliest"
        },
        topic="medusa.public.order",
        schema=pw.Schema,  # TODO: Definir schema completo
        format="json"
    )
    
    # Transformação: Preparar payload para ERP
    def prepare_erp_payload(order: Dict[str, Any]) -> Dict[str, Any]:
        """Converte ordem Medusa para formato ERP"""
        
        return {
            "medusa_order_id": order["id"],
            "customer": {
                "company_id": order["metadata"].get("company_id"),
                "email": order["email"],
                "shipping_address": order["shipping_address"]
            },
            "items": [
                {
                    "sku": item["metadata"].get("sku"),
                    "quantity": item["quantity"],
                    "unit_price": item["unit_price"],
                    "distributor": item["metadata"].get("distributor")
                }
                for item in order["items"]
            ],
            "distributor": order["metadata"].get("preferred_distributor", "neosolar"),
            "payment_status": order["payment_status"],
            "total": order["total"]
        }
    
    erp_payloads = medusa_orders.select(
        payload=pw.apply(prepare_erp_payload, pw.this)
    )
    
    # Output: HTTP POST para API do ERP
    def post_to_erp(payload: Dict[str, Any]):
        """Envia ordem para ERP"""
        try:
            response = requests.post(
                f"{ERP_API_URL}/api/orders/from-medusa",
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "X-API-Key": ERP_API_KEY
                },
                timeout=30
            )
            response.raise_for_status()
            return {"status": "success", "erp_order_id": response.json().get("order_id")}
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    # Mock output
    pw.io.null.write(erp_payloads)
    
    print("[Medusa→ERP] Pipeline de ordens ativo")


# ==========================================
# Pipeline 4: Homologação Status Sync
# ==========================================

def sync_homologacao_status():
    """
    Sincroniza status de homologação entre Medusa e ERP
    
    Fluxo:
    1. Kafka topic "ysh-erp.homologacao" → Pathway
    2. Atualiza metadata da ordem no Medusa
    3. Notifica customer via webhook
    """
    
    class HomologacaoEvent(pw.Schema):
        event_id: str
        medusa_order_id: str
        status: str  # "pending", "vistoria_agendada", "aprovado", "reprovado"
        parecer: str | None
        vistoria_date: datetime | None
        documents: str  # JSON
        timestamp: datetime
    
    # Input: Kafka topic de homologação
    homologacao_events = pw.io.kafka.read(
        rdkafka_settings={
            "bootstrap.servers": KAFKA_BROKERS,
            "group.id": "pathway-homologacao",
            "auto.offset.reset": "earliest"
        },
        topic="ysh-erp.homologacao",
        schema=HomologacaoEvent,
        format="json"
    )
    
    # Transformação: Preparar update Medusa
    def prepare_homologacao_update(event: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "order_id": event["medusa_order_id"],
            "metadata_update": {
                "homologacao_status": event["status"],
                "homologacao_parecer": event["parecer"],
                "homologacao_vistoria_date": event["vistoria_date"].isoformat() if event["vistoria_date"] else None,
                "homologacao_last_update": event["timestamp"].isoformat()
            }
        }
    
    updates = homologacao_events.select(
        update=pw.apply(prepare_homologacao_update, pw.this)
    )
    
    # Output: Mock (substituir por API Medusa)
    pw.io.null.write(updates)
    
    print("[Homologação] Pipeline de sincronização ativo")


# ==========================================
# Main
# ==========================================

if __name__ == "__main__":
    print("🔄 Iniciando Pathway ERP Sync...")
    
    # Iniciar todos os pipelines
    sync_erp_orders_to_medusa()
    sync_erp_prices_to_medusa()
    sync_medusa_orders_to_erp()
    sync_homologacao_status()
    
    # Executar
    pw.run()
