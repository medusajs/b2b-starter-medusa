#!/usr/bin/env python3
"""
Integrated Data Pipeline - Connects all components
Complete real-time Brazilian energy data processing system
"""

import asyncio
import os
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import logging
from logging.handlers import RotatingFileHandler

# Configure structured logging with rotation
LOG_DIR = os.getenv('LOG_DIR', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# Create logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Rotating file handler (10MB max, keep 5 backups)
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, 'integrated_pipeline.log'),
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5,
    encoding='utf-8'
)
file_handler.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

# Add handlers
if not logger.handlers:
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

# Import all pipeline components
try:
    from aneel_data_fetcher import ANEELDataFetcher
    from crawlee_scraper import UtilityPortalScraper
    from realtime_processor import IntegratedProcessor, RealtimeStreamProcessor
    from pdf_latex_extractor import IntegratedPDFProcessor
    from enhanced_ollama import EnhancedOllamaIntegration
    COMPONENTS_AVAILABLE = True
except ImportError as e:
    COMPONENTS_AVAILABLE = False
    logger.warning(f"Some components not available: {e}")


class DataPipelineOrchestrator:
    """Orchestrates the complete data pipeline"""
    
    def __init__(
        self,
        output_dir: str = "./pipeline_output",
        enable_realtime: bool = True,
        enable_ollama: bool = True
    ):
        """
        Initialize pipeline orchestrator
        
        Args:
            output_dir: Output directory for processed data
            enable_realtime: Enable real-time processing
            enable_ollama: Enable Ollama enrichment
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.enable_realtime = enable_realtime
        self.enable_ollama = enable_ollama
        
        # Initialize components
        self._init_components()
        
        logger.info("Data Pipeline Orchestrator initialized")
    
    def _init_components(self):
        """Initialize all pipeline components"""
        if not COMPONENTS_AVAILABLE:
            logger.warning("Components not fully available - running in demo mode")
            self.aneel_fetcher = None
            self.scraper = None
            self.realtime_processor = None
            self.pdf_processor = None
            self.ollama = None
            return
        
        try:
            self.aneel_fetcher = ANEELDataFetcher()
            self.scraper = UtilityPortalScraper()
            self.realtime_processor = IntegratedProcessor() if self.enable_realtime else None
            self.pdf_processor = IntegratedPDFProcessor()
            self.ollama = EnhancedOllamaIntegration() if self.enable_ollama else None
            
            logger.info("All components initialized successfully")
        except Exception as e:
            logger.error(f"Component initialization error: {e}")
    
    async def run_full_ingestion(self) -> Dict:
        """
        Run complete data ingestion cycle
        
        Returns:
            Summary of ingestion results
        """
        logger.info("Starting full data ingestion cycle...")
        start_time = datetime.now()
        
        results = {
            'timestamp': start_time.isoformat(),
            'stages': {}
        }
        
        # Stage 1: Fetch ANEEL data
        logger.info("Stage 1: Fetching ANEEL data...")
        aneel_data = await self._fetch_aneel_data()
        results['stages']['aneel_fetch'] = {
            'items': len(aneel_data.get('datasets', [])),
            'status': 'success'
        }
        
        # Stage 2: Scrape utility portals
        logger.info("Stage 2: Scraping utility portals...")
        utility_data = await self._scrape_utilities()
        results['stages']['utility_scrape'] = {
            'portals': len(utility_data),
            'status': 'success'
        }
        
        # Stage 3: Process with AI
        if self.enable_realtime:
            logger.info("Stage 3: Processing with AI...")
            processed_data = await self._process_with_ai(aneel_data)
            results['stages']['ai_processing'] = {
                'processed_items': len(processed_data),
                'status': 'success'
            }
        
        # Stage 4: Index in vector store
        if self.enable_ollama:
            logger.info("Stage 4: Indexing in vector store...")
            indexed_count = await self._index_documents(aneel_data)
            results['stages']['vector_indexing'] = {
                'indexed': indexed_count,
                'status': 'success'
            }
        
        # Calculate duration
        duration = (datetime.now() - start_time).total_seconds()
        results['duration_seconds'] = duration
        
        # Save results
        await self._save_results(results, 'ingestion_summary.json')
        
        logger.info(f"Full ingestion completed in {duration:.2f}s")
        return results
    
    async def _fetch_aneel_data(self) -> Dict:
        """Fetch data from ANEEL"""
        if not self.aneel_fetcher:
            return {'datasets': [], 'status': 'demo'}
        
        try:
            data = await self.aneel_fetcher.fetch_all_data()
            return data
        except Exception as e:
            logger.error(f"ANEEL fetch error: {e}")
            return {'datasets': [], 'error': str(e)}
    
    async def _scrape_utilities(self) -> List[Dict]:
        """Scrape utility portals"""
        if not self.scraper:
            return []
        
        try:
            results = await self.scraper.scrape_all_utilities()
            return results
        except Exception as e:
            logger.error(f"Utility scrape error: {e}")
            return []
    
    async def _process_with_ai(self, data: Dict) -> List[Dict]:
        """Process data with AI processors"""
        if not self.realtime_processor:
            return []
        
        try:
            datasets = data.get('datasets', [])
            if not datasets:
                return []
            
            processed = await self.realtime_processor.process_aneel_feed(datasets)
            return processed
        except Exception as e:
            logger.error(f"AI processing error: {e}")
            return []
    
    async def _index_documents(self, data: Dict) -> int:
        """Index documents in vector store"""
        if not self.ollama:
            return 0
        
        try:
            datasets = data.get('datasets', [])
            if not datasets:
                return 0
            
            count = await self.ollama.index_documents(datasets)
            return count
        except Exception as e:
            logger.error(f"Indexing error: {e}")
            return 0
    
    async def _save_results(self, results: Dict, filename: str):
        """Log results summary"""
        logger.info(
            f"Pipeline results summary: {filename}",
            extra={
                'filename': filename,
                'stages': len(results.get('stages', {})),
                'duration_seconds': results.get('duration_seconds', 0),
                'timestamp': results.get('timestamp', datetime.now().isoformat())
            }
        )
    
    async def monitor_realtime(self, duration_minutes: int = 60):
        """
        Monitor real-time data streams
        
        Args:
            duration_minutes: How long to monitor
        """
        if not self.enable_realtime or not self.realtime_processor:
            logger.warning("Real-time monitoring not available")
            return
        
        logger.info(f"Starting real-time monitoring for {duration_minutes} minutes...")
        
        await self.realtime_processor.monitor_realtime_updates(
            duration_seconds=duration_minutes * 60
        )
    
    async def process_pdfs(self, pdf_directory: Path) -> List[Dict]:
        """
        Process PDFs from directory
        
        Args:
            pdf_directory: Directory containing PDFs
            
        Returns:
            List of extraction results
        """
        if not self.pdf_processor:
            logger.warning("PDF processor not available")
            return []
        
        logger.info(f"Processing PDFs from: {pdf_directory}")
        
        results = await self.pdf_processor.process_directory(pdf_directory)
        
        logger.info(f"Processed {len(results)} PDFs")
        return results
    
    async def semantic_search(self, query: str, top_k: int = 5) -> List[Dict]:
        """
        Semantic search across indexed documents
        
        Args:
            query: Search query
            top_k: Number of results
            
        Returns:
            Search results
        """
        if not self.enable_ollama or not self.ollama:
            logger.warning("Semantic search not available")
            return []
        
        logger.info(f"Semantic search: '{query}'")
        
        results = await self.ollama.search_similar(query, top_k)
        
        return results
    
    def get_stats(self) -> Dict:
        """Get pipeline statistics"""
        stats = {
            'components': {
                'aneel_fetcher': self.aneel_fetcher is not None,
                'scraper': self.scraper is not None,
                'realtime_processor': self.realtime_processor is not None,
                'pdf_processor': self.pdf_processor is not None,
                'ollama': self.ollama is not None
            },
            'features': {
                'realtime_monitoring': self.enable_realtime,
                'vector_search': self.enable_ollama
            },
            'output_directory': str(self.output_dir)
        }
        
        return stats


async def main():
    """Main execution"""
    print("\n🚀 YSH DATA PIPELINE - INTEGRATED SYSTEM")
    print("=" * 60)
    
    # Initialize orchestrator
    pipeline = DataPipelineOrchestrator(
        output_dir="./pipeline_output",
        enable_realtime=True,
        enable_ollama=True
    )
    
    # Show stats
    stats = pipeline.get_stats()
    print("\n📊 Pipeline Status:")
    print("\nComponents:")
    for component, available in stats['components'].items():
        status = "✅" if available else "❌"
        print(f"   {status} {component}")
    
    print("\nFeatures:")
    for feature, enabled in stats['features'].items():
        status = "✅" if enabled else "❌"
        print(f"   {status} {feature}")
    
    # Run full ingestion
    print("\n🔄 Running full data ingestion...")
    results = await pipeline.run_full_ingestion()
    
    print("\n📈 Ingestion Results:")
    print(f"   Duration: {results['duration_seconds']:.2f}s")
    
    for stage, result in results['stages'].items():
        print(f"\n   {stage}:")
        for key, value in result.items():
            print(f"      {key}: {value}")
    
    # Example semantic search
    if stats['features']['vector_search']:
        print("\n🔍 Example Semantic Search:")
        query = "requisitos para certificação de inversores"
        search_results = await pipeline.semantic_search(query, top_k=3)
        
        print(f"   Query: '{query}'")
        print(f"   Results: {len(search_results)} matches")
    
    print(f"\n✅ Pipeline execution completed!")
    print(f"   Output directory: {pipeline.output_dir}")
    print("\n📝 Next Steps:")
    print("   1. Review results in output directory")
    print("   2. Configure monitoring dashboards")
    print("   3. Set up scheduled ingestion")
    print("   4. Enable real-time alerts")


if __name__ == "__main__":
    asyncio.run(main())
