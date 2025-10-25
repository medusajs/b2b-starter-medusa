"""
Qdrant Resource for Dagster (FOSS Vector Store)
"""

from dagster import ConfigurableResource
from typing import List, Dict, Any, Optional
import os


class QdrantResource(ConfigurableResource):
    """
    Resource para conectar ao Qdrant (vector store open source).
    """
    
    url: str
    api_key: Optional[str] = None
    collection_name: str = "ysh-rag"
    
    def get_client(self):
        """Retorna cliente Qdrant."""
        try:
            from qdrant_client import QdrantClient
            
            return QdrantClient(
                url=self.url,
                api_key=self.api_key,
                timeout=30,
            )
        except ImportError:
            raise ImportError(
                "qdrant-client não instalado. "
                "Instale com: pip install qdrant-client"
            )
    
    def upsert(self, vectors: List[Dict[str, Any]]):
        """
        Upsert de vetores no Qdrant.
        
        Args:
            vectors: Lista de dicts com keys: id, vector, payload
        """
        client = self.get_client()
        from qdrant_client.models import PointStruct
        
        points = [
            PointStruct(
                id=v["id"],
                vector=v["values"],
                payload=v.get("metadata", {}),
            )
            for v in vectors
        ]
        
        client.upsert(
            collection_name=self.collection_name,
            points=points,
        )
    
    def query(
        self,
        vector: List[float],
        top_k: int = 5,
        filter_: Optional[Dict] = None,
    ) -> List[Dict]:
        """Query no Qdrant."""
        client = self.get_client()
        
        results = client.search(
            collection_name=self.collection_name,
            query_vector=vector,
            limit=top_k,
            query_filter=filter_,
        )
        
        return [
            {
                "id": hit.id,
                "score": hit.score,
                "metadata": hit.payload,
            }
            for hit in results
        ]
