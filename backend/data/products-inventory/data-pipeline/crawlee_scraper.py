#!/usr/bin/env python3
"""
Crawlee Web Scraper - Intelligent utility portal scraping
Scrapes Brazilian utility company portals for homologation data
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import logging

# Note: crawlee-python integration
# Install with: pip install crawlee

try:
    from crawlee.playwright_crawler import PlaywrightCrawler, PlaywrightCrawlingContext
    from crawlee.storages import Dataset
    CRAWLEE_AVAILABLE = True
except ImportError:
    CRAWLEE_AVAILABLE = False
    print("⚠️  Crawlee not installed. Run: pip install crawlee")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class UtilityPortalScraper:
    """Scrape utility company portals for homologation data"""
    
    # Utility portal configurations
    PORTALS = {
        'cpfl': {
            'url': 'https://servicosonline.cpfl.com.br',
            'name': 'CPFL Energia',
            'state': 'SP',
            'selectors': {
                'login': '#login-form',
                'documents': '.document-list',
                'requirements': '.requirements-section'
            }
        },
        'enel_sp': {
            'url': 'https://www.enel.com.br/pt-saopaulo.html',
            'name': 'Enel SP',
            'state': 'SP',
            'selectors': {
                'gd_section': '.distributed-generation',
                'forms': '.forms-download'
            }
        },
        'cemig': {
            'url': 'https://www.cemig.com.br',
            'name': 'Cemig',
            'state': 'MG',
            'selectors': {
                'gd_portal': '.geracao-distribuida',
                'documents': '.documentos'
            }
        }
    }
    
    def __init__(self, output_dir: Optional[Path] = None):
        """Initialize scraper"""
        self.output_dir = output_dir or Path("./scraped_data")
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        if not CRAWLEE_AVAILABLE:
            raise RuntimeError("Crawlee is not installed. Run: pip install crawlee")
    
    async def scrape_cpfl_portal(self) -> Dict:
        """
        Scrape CPFL portal for homologation requirements
        
        Returns:
            Scraped data dict
        """
        logger.info("Scraping CPFL portal...")
        
        portal = self.PORTALS['cpfl']
        scraped_data = {
            'utility': portal['name'],
            'state': portal['state'],
            'url': portal['url'],
            'scrape_date': datetime.now().isoformat(),
            'documents': [],
            'requirements': []
        }
        
        # Create crawler
        crawler = PlaywrightCrawler(
            max_requests_per_crawl=50,
            headless=True
        )
        
        # Define request handler
        @crawler.router.default_handler
        async def request_handler(context: PlaywrightCrawlingContext) -> None:
            """Handle page scraping"""
            page = context.page
            
            # Wait for page to load
            await page.wait_for_load_state('networkidle')
            
            # Extract documents
            documents = await page.query_selector_all('.document-item')
            for doc in documents:
                title = await doc.query_selector('.title')
                link = await doc.query_selector('a')
                
                if title and link:
                    scraped_data['documents'].append({
                        'title': await title.text_content(),
                        'url': await link.get_attribute('href'),
                        'type': 'document'
                    })
            
            # Extract requirements
            requirements = await page.query_selector_all('.requirement-item')
            for req in requirements:
                text = await req.text_content()
                scraped_data['requirements'].append({
                    'description': text.strip(),
                    'mandatory': 'obrigatório' in text.lower()
                })
        
        # Run crawler
        await crawler.run([portal['url']])
        
        # Save results
        output_file = self.output_dir / f"cpfl_scraped_{datetime.now().strftime('%Y%m%d')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"CPFL scraping completed. Saved to: {output_file}")
        
        return scraped_data
    
    async def scrape_enel_portal(self) -> Dict:
        """
        Scrape Enel SP portal for homologation forms
        
        Returns:
            Scraped data dict
        """
        logger.info("Scraping Enel SP portal...")
        
        portal = self.PORTALS['enel_sp']
        scraped_data = {
            'utility': portal['name'],
            'state': portal['state'],
            'url': portal['url'],
            'scrape_date': datetime.now().isoformat(),
            'forms': [],
            'procedures': []
        }
        
        crawler = PlaywrightCrawler(
            max_requests_per_crawl=30,
            headless=True
        )
        
        @crawler.router.default_handler
        async def request_handler(context: PlaywrightCrawlingContext) -> None:
            """Handle page scraping"""
            page = context.page
            await page.wait_for_load_state('networkidle')
            
            # Extract downloadable forms
            forms = await page.query_selector_all('.form-download')
            for form in forms:
                title_elem = await form.query_selector('.form-title')
                download_elem = await form.query_selector('a[download]')
                
                if title_elem and download_elem:
                    scraped_data['forms'].append({
                        'title': await title_elem.text_content(),
                        'url': await download_elem.get_attribute('href'),
                        'filename': await download_elem.get_attribute('download')
                    })
        
        await crawler.run([portal['url']])
        
        # Save results
        output_file = self.output_dir / f"enel_scraped_{datetime.now().strftime('%Y%m%d')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(scraped_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Enel scraping completed. Saved to: {output_file}")
        
        return scraped_data
    
    async def scrape_all_utilities(self) -> Dict[str, Dict]:
        """
        Scrape all configured utility portals
        
        Returns:
            Dict mapping utility code to scraped data
        """
        logger.info("Starting scraping of all utility portals...")
        
        results = {}
        
        # Scrape in parallel
        tasks = [
            self.scrape_cpfl_portal(),
            self.scrape_enel_portal()
        ]
        
        scraped = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, data in enumerate(scraped):
            if isinstance(data, Exception):
                logger.error(f"Error scraping portal {i}: {data}")
            else:
                utility_code = list(self.PORTALS.keys())[i]
                results[utility_code] = data
        
        # Save combined results
        output_file = self.output_dir / f"all_utilities_{datetime.now().strftime('%Y%m%d')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info(f"All utilities scraped. Results: {output_file}")
        
        return results


class TariffScraper:
    """Scrape electricity tariff tables"""
    
    def __init__(self, output_dir: Optional[Path] = None):
        """Initialize scraper"""
        self.output_dir = output_dir or Path("./scraped_data/tariffs")
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def scrape_tariff_table(self, utility_code: str, url: str) -> List[Dict]:
        """
        Scrape tariff table from utility website
        
        Args:
            utility_code: Utility identifier
            url: URL to tariff table
            
        Returns:
            List of tariff records
        """
        logger.info(f"Scraping tariff table for {utility_code}...")
        
        tariffs = []
        
        crawler = PlaywrightCrawler(max_requests_per_crawl=5)
        
        @crawler.router.default_handler
        async def handler(context: PlaywrightCrawlingContext) -> None:
            """Extract tariff table"""
            page = context.page
            await page.wait_for_load_state('networkidle')
            
            # Find tariff tables
            tables = await page.query_selector_all('table.tariff-table')
            
            for table in tables:
                rows = await table.query_selector_all('tr')
                
                for row in rows:
                    cells = await row.query_selector_all('td')
                    
                    if len(cells) >= 3:
                        tariff = {
                            'consumer_class': await cells[0].text_content(),
                            'tariff_brl_kwh': await cells[1].text_content(),
                            'effective_date': await cells[2].text_content()
                        }
                        tariffs.append(tariff)
        
        await crawler.run([url])
        
        # Save results
        output_file = self.output_dir / f"{utility_code}_tariffs_{datetime.now().strftime('%Y%m%d')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(tariffs, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Scraped {len(tariffs)} tariff records")
        
        return tariffs


async def main():
    """Main execution"""
    print("\n🕷️  UTILITY PORTAL SCRAPER")
    print("=" * 60)
    
    if not CRAWLEE_AVAILABLE:
        print("\n❌ Crawlee is not installed!")
        print("   Install with: pip install crawlee")
        return
    
    # Initialize scraper
    scraper = UtilityPortalScraper()
    
    # Scrape all utilities
    results = await scraper.scrape_all_utilities()
    
    # Print summary
    print("\n📊 SCRAPING SUMMARY:")
    for utility_code, data in results.items():
        print(f"\n   • {data.get('utility', utility_code)}")
        print(f"     Documents: {len(data.get('documents', []))}")
        print(f"     Forms: {len(data.get('forms', []))}")
        print(f"     Requirements: {len(data.get('requirements', []))}")
    
    print(f"\n✅ Scraping completed!")
    print(f"   Output directory: {scraper.output_dir}")


if __name__ == "__main__":
    asyncio.run(main())
