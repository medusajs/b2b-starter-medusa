#!/usr/bin/env python3
"""
Integration Tests - Validate all pipeline components
Tests each component individually and the full pipeline
"""

import asyncio
import sys
from pathlib import Path
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ComponentTester:
    """Test all pipeline components"""
    
    def __init__(self):
        """Initialize tester"""
        self.results: Dict[str, bool] = {}
        self.errors: Dict[str, str] = {}
    
    async def test_aneel_fetcher(self) -> bool:
        """Test ANEEL data fetcher"""
        logger.info("Testing ANEEL Data Fetcher...")
        
        try:
            from aneel_data_fetcher import ANEELDataFetcher
            
            fetcher = ANEELDataFetcher()
            
            # Test RSS feed
            rss_data = await fetcher.fetch_rss_feed()
            assert rss_data is not None, "RSS fetch failed"
            
            # Test DCAT catalog
            dcat_data = await fetcher.fetch_dcat_catalog()
            assert dcat_data is not None, "DCAT fetch failed"
            
            logger.info("✅ ANEEL Fetcher: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  ANEEL Fetcher: SKIPPED (not installed)")
            self.errors['aneel_fetcher'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ ANEEL Fetcher: FAILED - {e}")
            self.errors['aneel_fetcher'] = str(e)
            return False
    
    async def test_crawlee_scraper(self) -> bool:
        """Test Crawlee scraper"""
        logger.info("Testing Crawlee Scraper...")
        
        try:
            from crawlee_scraper import UtilityPortalScraper
            
            scraper = UtilityPortalScraper()
            
            # Test scraper initialization
            assert scraper is not None, "Scraper init failed"
            assert hasattr(scraper, 'PORTALS'), "Missing PORTALS config"
            assert len(scraper.PORTALS) == 3, "Expected 3 portals"
            
            logger.info("✅ Crawlee Scraper: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  Crawlee Scraper: SKIPPED (not installed)")
            self.errors['crawlee_scraper'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ Crawlee Scraper: FAILED - {e}")
            self.errors['crawlee_scraper'] = str(e)
            return False
    
    async def test_realtime_processor(self) -> bool:
        """Test realtime processor"""
        logger.info("Testing Realtime Processor...")
        
        try:
            from realtime_processor import (
                GPTOSSProcessor,
                RealtimeStreamProcessor,
                IntegratedProcessor
            )
            
            # Test GPT-OSS processor
            gpt_oss = GPTOSSProcessor()
            assert gpt_oss is not None, "GPT-OSS init failed"
            
            # Test realtime processor
            realtime = RealtimeStreamProcessor()
            assert realtime is not None, "Realtime init failed"
            
            # Test integrated processor
            integrated = IntegratedProcessor()
            assert integrated is not None, "Integrated init failed"
            
            logger.info("✅ Realtime Processor: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  Realtime Processor: SKIPPED (not installed)")
            self.errors['realtime_processor'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ Realtime Processor: FAILED - {e}")
            self.errors['realtime_processor'] = str(e)
            return False
    
    async def test_pdf_extractor(self) -> bool:
        """Test PDF/LaTeX extractor"""
        logger.info("Testing PDF/LaTeX Extractor...")
        
        try:
            from pdf_latex_extractor import (
                LaTeXOCRExtractor,
                PDFMathTranslator,
                TechnicalDataExtractor,
                IntegratedPDFProcessor
            )
            
            # Test LaTeX-OCR
            latex_ocr = LaTeXOCRExtractor()
            assert latex_ocr is not None, "LaTeX-OCR init failed"
            
            # Test PDF translator
            translator = PDFMathTranslator()
            assert translator is not None, "PDF translator init failed"
            
            # Test technical extractor
            tech_extractor = TechnicalDataExtractor()
            assert tech_extractor is not None, "Tech extractor init failed"
            
            # Test integrated processor
            integrated = IntegratedPDFProcessor()
            assert integrated is not None, "Integrated PDF init failed"
            
            logger.info("✅ PDF Extractor: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  PDF Extractor: SKIPPED (not installed)")
            self.errors['pdf_extractor'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ PDF Extractor: FAILED - {e}")
            self.errors['pdf_extractor'] = str(e)
            return False
    
    async def test_enhanced_ollama(self) -> bool:
        """Test enhanced Ollama integration"""
        logger.info("Testing Enhanced Ollama...")
        
        try:
            from enhanced_ollama import (
                OllamaVectorStore,
                OllamaBatchProcessor,
                EnhancedOllamaIntegration
            )
            
            # Test vector store
            vector_store = OllamaVectorStore()
            assert vector_store is not None, "Vector store init failed"
            
            # Test batch processor
            batch_processor = OllamaBatchProcessor()
            assert batch_processor is not None, "Batch processor init failed"
            
            # Test integrated
            integrated = EnhancedOllamaIntegration()
            assert integrated is not None, "Integrated Ollama init failed"
            
            logger.info("✅ Enhanced Ollama: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  Enhanced Ollama: SKIPPED (not installed)")
            self.errors['enhanced_ollama'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ Enhanced Ollama: FAILED - {e}")
            self.errors['enhanced_ollama'] = str(e)
            return False
    
    async def test_integrated_pipeline(self) -> bool:
        """Test integrated pipeline orchestrator"""
        logger.info("Testing Integrated Pipeline...")
        
        try:
            from integrated_data_pipeline import DataPipelineOrchestrator
            
            # Test orchestrator
            orchestrator = DataPipelineOrchestrator(
                output_dir="./test_output",
                enable_realtime=True,
                enable_ollama=True
            )
            assert orchestrator is not None, "Orchestrator init failed"
            
            # Test stats
            stats = orchestrator.get_stats()
            assert stats is not None, "Stats failed"
            assert 'components' in stats, "Missing components in stats"
            assert 'features' in stats, "Missing features in stats"
            
            logger.info("✅ Integrated Pipeline: PASSED")
            return True
            
        except ImportError as e:
            logger.warning(f"⚠️  Integrated Pipeline: SKIPPED (not installed)")
            self.errors['integrated_pipeline'] = str(e)
            return False
        except Exception as e:
            logger.error(f"❌ Integrated Pipeline: FAILED - {e}")
            self.errors['integrated_pipeline'] = str(e)
            return False
    
    async def run_all_tests(self) -> Dict[str, bool]:
        """Run all component tests"""
        logger.info("\n" + "=" * 60)
        logger.info("RUNNING COMPONENT TESTS")
        logger.info("=" * 60 + "\n")
        
        tests = [
            ('aneel_fetcher', self.test_aneel_fetcher),
            ('crawlee_scraper', self.test_crawlee_scraper),
            ('realtime_processor', self.test_realtime_processor),
            ('pdf_extractor', self.test_pdf_extractor),
            ('enhanced_ollama', self.test_enhanced_ollama),
            ('integrated_pipeline', self.test_integrated_pipeline)
        ]
        
        for name, test_func in tests:
            try:
                result = await test_func()
                self.results[name] = result
            except Exception as e:
                logger.error(f"Unexpected error in {name}: {e}")
                self.results[name] = False
                self.errors[name] = str(e)
        
        return self.results
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "=" * 60)
        logger.info("TEST SUMMARY")
        logger.info("=" * 60)
        
        passed = sum(1 for v in self.results.values() if v)
        total = len(self.results)
        
        logger.info(f"\nResults: {passed}/{total} tests passed\n")
        
        for name, result in self.results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"  {name:25s} {status}")
            
            if not result and name in self.errors:
                logger.info(f"    Error: {self.errors[name]}")
        
        logger.info("\n" + "=" * 60)
        
        if passed == total:
            logger.info("🎉 ALL TESTS PASSED!")
        elif passed > 0:
            logger.info(f"⚠️  PARTIAL SUCCESS: {passed}/{total}")
        else:
            logger.info("❌ ALL TESTS FAILED")
        
        logger.info("=" * 60 + "\n")
        
        return passed == total


async def main():
    """Main test execution"""
    print("\n🧪 YSH DATA PIPELINE - INTEGRATION TESTS")
    print("=" * 60)
    
    # Create tester
    tester = ComponentTester()
    
    # Run tests
    await tester.run_all_tests()
    
    # Print summary
    all_passed = tester.print_summary()
    
    # Exit code
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    asyncio.run(main())
