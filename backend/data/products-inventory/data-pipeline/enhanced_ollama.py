#!/usr/bin/env python3
"""
Enhanced Ollama Integration - Vector embeddings and semantic search
Advanced features for large-scale data pipeline processing
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Check for ollama
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    logger.warning("ollama package not found. Install: pip install ollama")


@dataclass
class EmbeddingResult:
    """Vector embedding result"""
    text: str
    embedding: List[float]
    model: str
    timestamp: str


@dataclass
class SemanticMatch:
    """Semantic search match"""
    text: str
    similarity: float
    metadata: Dict
    source: str


class OllamaVectorStore:
    """Vector store using Ollama embeddings"""
    
    def __init__(self, model: str = "llama3.2"):
        """
        Initialize vector store
        
        Args:
            model: Ollama model for embeddings
        """
        self.model = model
        self.vectors: Dict[str, EmbeddingResult] = {}
        self.metadata: Dict[str, Dict] = {}
        
        logger.info(f"Ollama Vector Store initialized with model: {model}")
    
    async def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding for text
        
        Args:
            text: Text to embed
            
        Returns:
            Embedding vector
        """
        if not OLLAMA_AVAILABLE:
            # Return mock embedding
            return [0.1] * 384
        
        try:
            response = ollama.embeddings(model=self.model, prompt=text)
            return response['embedding']
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return [0.0] * 384
    
    async def add_document(self, doc_id: str, text: str, metadata: Dict):
        """
        Add document to vector store
        
        Args:
            doc_id: Document identifier
            text: Document text
            metadata: Document metadata
        """
        logger.info(f"Adding document: {doc_id}")
        
        embedding = await self.embed_text(text)
        
        self.vectors[doc_id] = EmbeddingResult(
            text=text,
            embedding=embedding,
            model=self.model,
            timestamp=datetime.now().isoformat()
        )
        
        self.metadata[doc_id] = metadata
    
    async def semantic_search(
        self,
        query: str,
        top_k: int = 5
    ) -> List[SemanticMatch]:
        """
        Semantic search in vector store
        
        Args:
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of semantic matches
        """
        logger.info(f"Semantic search: '{query}'")
        
        # Generate query embedding
        query_embedding = await self.embed_text(query)
        
        # Calculate similarities
        similarities = []
        for doc_id, vec_result in self.vectors.items():
            similarity = self._cosine_similarity(
                query_embedding,
                vec_result.embedding
            )
            
            similarities.append((doc_id, similarity))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Create matches
        matches = []
        for doc_id, similarity in similarities[:top_k]:
            vec_result = self.vectors[doc_id]
            metadata = self.metadata.get(doc_id, {})
            
            match = SemanticMatch(
                text=vec_result.text[:200] + "...",
                similarity=similarity,
                metadata=metadata,
                source=doc_id
            )
            
            matches.append(match)
        
        logger.info(f"Found {len(matches)} matches")
        return matches
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between vectors"""
        if len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = sum(a * a for a in vec1) ** 0.5
        norm2 = sum(b * b for b in vec2) ** 0.5
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)
    
    async def save_to_file(self, filepath: Path):
        """Save vector store to file"""
        data = {
            'model': self.model,
            'vectors': {
                doc_id: asdict(result)
                for doc_id, result in self.vectors.items()
            },
            'metadata': self.metadata
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Vector store saved: {filepath}")
    
    async def load_from_file(self, filepath: Path):
        """Load vector store from file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.model = data['model']
        self.metadata = data['metadata']
        
        # Reconstruct vectors
        for doc_id, vec_data in data['vectors'].items():
            self.vectors[doc_id] = EmbeddingResult(**vec_data)
        
        logger.info(f"Vector store loaded: {len(self.vectors)} documents")


class OllamaBatchProcessor:
    """Batch processing with Ollama for large datasets"""
    
    def __init__(self, model: str = "llama3.2", batch_size: int = 10):
        """
        Initialize batch processor
        
        Args:
            model: Ollama model name
            batch_size: Number of items per batch
        """
        self.model = model
        self.batch_size = batch_size
        
        logger.info(f"Batch Processor: {model}, batch size: {batch_size}")
    
    async def process_batch(
        self,
        items: List[Dict],
        task: str = "analyze"
    ) -> List[Dict]:
        """
        Process batch of items
        
        Args:
            items: Items to process
            task: Processing task (analyze, classify, summarize)
            
        Returns:
            Processed results
        """
        logger.info(f"Processing batch of {len(items)} items - Task: {task}")
        
        results = []
        
        for i in range(0, len(items), self.batch_size):
            batch = items[i:i + self.batch_size]
            
            batch_results = await self._process_single_batch(batch, task)
            results.extend(batch_results)
            
            logger.info(f"Processed batch {i//self.batch_size + 1}")
        
        logger.info(f"Batch processing completed: {len(results)} results")
        return results
    
    async def _process_single_batch(
        self,
        batch: List[Dict],
        task: str
    ) -> List[Dict]:
        """Process single batch"""
        results = []
        
        for item in batch:
            try:
                result = await self._process_item(item, task)
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing item: {e}")
                results.append({
                    'item': item,
                    'error': str(e),
                    'status': 'failed'
                })
        
        return results
    
    async def _process_item(self, item: Dict, task: str) -> Dict:
        """Process single item with Ollama"""
        if not OLLAMA_AVAILABLE:
            return self._mock_process(item, task)
        
        try:
            prompt = self._build_prompt(item, task)
            
            response = ollama.chat(
                model=self.model,
                messages=[
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            )
            
            return {
                'item': item,
                'result': response['message']['content'],
                'task': task,
                'status': 'success'
            }
        
        except Exception as e:
            logger.error(f"Ollama processing failed: {e}")
            return self._mock_process(item, task)
    
    def _build_prompt(self, item: Dict, task: str) -> str:
        """Build prompt for Ollama"""
        task_prompts = {
            'analyze': f"Analise os dados técnicos: {json.dumps(item)}",
            'classify': f"Classifique o equipamento: {json.dumps(item)}",
            'summarize': f"Resuma as informações: {json.dumps(item)}"
        }
        
        return task_prompts.get(task, f"Processe: {json.dumps(item)}")
    
    def _mock_process(self, item: Dict, task: str) -> Dict:
        """Mock processing when Ollama unavailable"""
        return {
            'item': item,
            'result': f"Mock result for {task}",
            'task': task,
            'status': 'mock'
        }


class EnhancedOllamaIntegration:
    """Enhanced Ollama integration for data pipeline"""
    
    def __init__(self, model: str = "llama3.2"):
        """
        Initialize enhanced integration
        
        Args:
            model: Ollama model name
        """
        self.model = model
        self.vector_store = OllamaVectorStore(model)
        self.batch_processor = OllamaBatchProcessor(model)
        
        self.output_dir = Path("./ollama_processed")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def index_documents(self, documents: List[Dict]) -> int:
        """
        Index documents in vector store
        
        Args:
            documents: Documents to index
            
        Returns:
            Number of documents indexed
        """
        logger.info(f"Indexing {len(documents)} documents...")
        
        for doc in documents:
            doc_id = doc.get('id', str(hash(doc.get('title', ''))))
            text = f"{doc.get('title', '')} {doc.get('description', '')}"
            
            await self.vector_store.add_document(
                doc_id=doc_id,
                text=text,
                metadata=doc
            )
        
        # Save vector store
        store_file = self.output_dir / "vector_store.json"
        await self.vector_store.save_to_file(store_file)
        
        logger.info(f"Indexed {len(documents)} documents")
        return len(documents)
    
    async def search_similar(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Search similar documents
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            Similar documents
        """
        matches = await self.vector_store.semantic_search(query, top_k)
        
        results = [
            {
                'text': match.text,
                'similarity': match.similarity,
                'source': match.source,
                'metadata': match.metadata
            }
            for match in matches
        ]
        
        return results
    
    async def batch_analyze(self, items: List[Dict]) -> List[Dict]:
        """
        Batch analyze items
        
        Args:
            items: Items to analyze
            
        Returns:
            Analysis results
        """
        results = await self.batch_processor.process_batch(
            items,
            task='analyze'
        )
        
        # Save results
        output_file = self.output_dir / \
            f"batch_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Batch analysis saved: {output_file}")
        
        return results


async def main():
    """Main execution"""
    print("\n🚀 ENHANCED OLLAMA INTEGRATION")
    print("=" * 60)
    
    # Initialize integration
    integration = EnhancedOllamaIntegration()
    
    # Example documents
    documents = [
        {
            'id': 'inv_001',
            'title': 'Inversor 5kW Monofásico',
            'description': 'Inversor solar on-grid com eficiência 98%',
            'category': 'inverter',
            'power': 5000
        },
        {
            'id': 'panel_001',
            'title': 'Painel Solar 550Wp',
            'description': 'Módulo fotovoltaico monocristalino',
            'category': 'panel',
            'power': 550
        }
    ]
    
    # Index documents
    print("\n📚 Indexing documents...")
    indexed = await integration.index_documents(documents)
    print(f"   Indexed: {indexed} documents")
    
    # Semantic search
    print("\n🔍 Semantic search...")
    query = "inversor solar eficiente"
    results = await integration.search_similar(query, top_k=2)
    
    print(f"   Query: '{query}'")
    for i, result in enumerate(results, 1):
        print(f"\n   Result {i}:")
        print(f"   Similarity: {result['similarity']:.3f}")
        print(f"   Text: {result['text']}")
    
    # Batch processing
    print("\n⚙️  Batch processing...")
    batch_items = [
        {'name': 'Inversor A', 'power': 3000},
        {'name': 'Inversor B', 'power': 5000}
    ]
    
    batch_results = await integration.batch_analyze(batch_items)
    print(f"   Processed: {len(batch_results)} items")
    
    print(f"\n✅ Output directory: {integration.output_dir}")


if __name__ == "__main__":
    asyncio.run(main())
