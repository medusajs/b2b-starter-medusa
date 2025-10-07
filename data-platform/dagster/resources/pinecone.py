"""
Pinecone Resource for Dagster
"""

from dagster import ConfigurableResource
from typing import List, Dict, Any
import os


class PineconeResource(ConfigurableResource):
    """
    Resource para conectar ao Pinecone (vector store).
    """
    
    api_key: str
    index_name: str
    environment: str = "us-east-1-aws"
    
    def get_index(self):
        """Retorna índice Pinecone."""
        try:
            from pinecone import Pinecone
            
            pc = Pinecone(api_key=self.api_key)
            return pc.Index(self.index_name)
        except ImportError:
            raise ImportError("pinecone-client não instalado. Instale com: pip install pinecone-client")
    
    def upsert(self, namespace: str, vectors: List[Dict[str, Any]]):
        """
        Upsert de vetores no Pinecone.
        
        Args:
            namespace: Namespace do índice (ex.: 'catalog', 'docs')
            vectors: Lista de dicts com keys: id, values, metadata
        """
        index = self.get_index()
        index.upsert(vectors=vectors, namespace=namespace)
    
    def query(self, namespace: str, vector: List[float], top_k: int = 5) -> Dict:
        """Query no Pinecone."""
        index = self.get_index()
        return index.query(namespace=namespace, vector=vector, top_k=top_k, include_metadata=True)
