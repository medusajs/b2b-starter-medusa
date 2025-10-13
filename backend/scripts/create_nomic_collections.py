#!/usr/bin/env python3
"""
Create 4 new Qdrant collections with Nomic embeddings (768d)
Part of Phase 1 implementation
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import os
from datetime import datetime

# Configuração
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "qdrant_dev_key_foss_2025")

# Collections specs
COLLECTIONS = [
    {
        "name": "ysh-local-catalog",
        "description": "Backup offline do catálogo completo (Nomic 768d)",
        "vector_size": 768,
        "distance": Distance.COSINE
    },
    {
        "name": "ysh-conversations",
        "description": "Histórico de conversas com Hélio (context long-term)",
        "vector_size": 768,
        "distance": Distance.COSINE
    },
    {
        "name": "ysh-user-behavior",
        "description": "Clickstream analytics para recomendações",
        "vector_size": 768,
        "distance": Distance.COSINE
    },
    {
        "name": "ysh-pvlib-database",
        "description": "19K módulos/inversores científicos PVLib",
        "vector_size": 768,
        "distance": Distance.COSINE
    }
]

def create_collections():
    """Create all new collections"""
    print(f"🚀 Connecting to Qdrant: {QDRANT_URL}")
    
    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY
    )
    
    # Health check
    try:
        collections_list = client.get_collections()
        print(f"✅ Connected! Existing collections: {len(collections_list.collections)}")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return
    
    # Create each collection
    for spec in COLLECTIONS:
        collection_name = spec["name"]
        
        # Check if exists
        existing = [c.name for c in collections_list.collections]
        if collection_name in existing:
            print(f"⚠️  Collection '{collection_name}' already exists - skipping")
            continue
        
        # Create
        try:
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=spec["vector_size"],
                    distance=spec["distance"]
                )
            )
            
            print(f"✅ Created: {collection_name}")
            print(f"   Description: {spec['description']}")
            print(f"   Vector size: {spec['vector_size']}")
            print(f"   Distance: {spec['distance']}")
            print()
            
        except Exception as e:
            print(f"❌ Failed to create {collection_name}: {e}")
            continue
    
    # Final summary
    collections_list = client.get_collections()
    print(f"\n📊 Total collections: {len(collections_list.collections)}")
    
    for collection in collections_list.collections:
        info = client.get_collection(collection.name)
        print(f"   - {collection.name}: {info.points_count} points, {info.vectors_count} vectors")

def seed_sample_data():
    """Seed sample data for testing"""
    print("\n🌱 Seeding sample data...")
    
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    
    # Sample conversation
    from datetime import datetime
    
    sample_conversation = [
        {
            "id": 1,
            "vector": [0.1] * 768,  # Mock embedding
            "payload": {
                "user_id": "emp_demo",
                "session_id": "sess_001",
                "turn": 1,
                "role": "user",
                "content": "Preciso de um inversor 10kW",
                "timestamp": datetime.now().isoformat()
            }
        },
        {
            "id": 2,
            "vector": [0.2] * 768,
            "payload": {
                "user_id": "emp_demo",
                "session_id": "sess_001",
                "turn": 2,
                "role": "assistant",
                "content": "Recomendo o Growatt SPF 10000-5G...",
                "products_shown": ["prod_145763"],
                "timestamp": datetime.now().isoformat()
            }
        }
    ]
    
    try:
        client.upsert(
            collection_name="ysh-conversations",
            points=sample_conversation
        )
        print("✅ Seeded 2 sample conversations")
    except Exception as e:
        print(f"⚠️  Could not seed conversations: {e}")
    
    # Sample user behavior
    sample_behavior = [
        {
            "id": 1,
            "vector": [0.3] * 768,
            "payload": {
                "user_id": "emp_demo",
                "event": "product_view",
                "product_id": "prod_145763",
                "category": "INVERTERS",
                "duration_seconds": 45,
                "timestamp": datetime.now().isoformat()
            }
        }
    ]
    
    try:
        client.upsert(
            collection_name="ysh-user-behavior",
            points=sample_behavior
        )
        print("✅ Seeded 1 sample user behavior event")
    except Exception as e:
        print(f"⚠️  Could not seed user behavior: {e}")

if __name__ == "__main__":
    print("=" * 70)
    print("🔷 Qdrant Collections Setup - Phase 1 (Nomic 768d)")
    print("=" * 70)
    print()
    
    create_collections()
    seed_sample_data()
    
    print()
    print("=" * 70)
    print("✅ Setup complete!")
    print("=" * 70)
    print()
    print("Next steps:")
    print("  1. Run: python scripts/populate_local_catalog.py")
    print("  2. Run: python scripts/ingest_pvlib_database.py")
    print("  3. Start using: import { EmbeddingCache } from '@/modules/rag/utils/embedding-cache-v2'")
