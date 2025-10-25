#!/usr/bin/env python3
"""
ANEEL Data Fetcher - Real-time Brazilian Energy Data Pipeline
Fetches data from ANEEL Open Data platform (ArcGIS Hub)
"""

import asyncio
import aiohttp
import feedparser
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime
import logging
import os
from logging.handlers import RotatingFileHandler

# Configure structured logging with rotation
LOG_DIR = os.getenv('LOG_DIR', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# Create logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Rotating file handler (10MB max, keep 5 backups)
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, 'aneel_fetcher.log'),
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


@dataclass
class ANEELDataset:
    """ANEEL dataset metadata"""
    id: str
    title: str
    description: str
    url: str
    modified: str
    format: str
    category: str


@dataclass
class GenerationUnit:
    """Distributed generation unit"""
    unit_id: str
    consumer_class: str
    utility_company: str
    municipality: str
    state: str
    installed_power_kw: float
    source_type: str
    compensation_modality: str
    connection_date: str


class ANEELDataFetcher:
    """Fetch data from ANEEL Open Data platform"""
    
    BASE_URL = "https://dadosabertos-aneel.opendata.arcgis.com"
    
    # API Endpoints
    RSS_FEED = f"{BASE_URL}/api/feed/rss/2.0"
    DCAT_US = f"{BASE_URL}/api/feed/dcat-us/1.1"
    DCAT_AP_2 = f"{BASE_URL}/api/feed/dcat-ap/2.1.1"
    DCAT_AP_3 = f"{BASE_URL}/api/feed/dcat-ap/3.0.0"
    SEARCH_API = f"{BASE_URL}/api/search/v1"
    
    def __init__(self, cache_dir: Optional[Path] = None):
        """Initialize fetcher"""
        self.cache_dir = cache_dir or Path("./cache/aneel")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = None
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def fetch_rss_feed(self) -> List[ANEELDataset]:
        """
        Fetch RSS feed for latest datasets
        
        Returns:
            List of ANEEL datasets
        """
        logger.info("Fetching ANEEL RSS feed...")
        
        try:
            async with self.session.get(self.RSS_FEED) as response:
                content = await response.text()
                
            # Parse RSS feed
            feed = feedparser.parse(content)
            
            datasets = []
            for entry in feed.entries:
                dataset = ANEELDataset(
                    id=entry.get('id', ''),
                    title=entry.get('title', ''),
                    description=entry.get('summary', ''),
                    url=entry.get('link', ''),
                    modified=entry.get('updated', ''),
                    format='Unknown',
                    category='Unknown'
                )
                datasets.append(dataset)
            
            logger.info(
                f"Found {len(datasets)} datasets in RSS feed",
                extra={
                    'count': len(datasets),
                    'timestamp': datetime.now().isoformat(),
                    'source': 'rss_feed'
                }
            )
            
            return datasets
            
        except Exception as e:
            logger.error(f"Error fetching RSS feed: {e}")
            return []
    
    async def fetch_dcat_catalog(self, version: str = "2.1.1") -> Dict:
        """
        Fetch DCAT catalog metadata
        
        Args:
            version: DCAT version (2.1.1 or 3.0.0)
            
        Returns:
            DCAT catalog as dict
        """
        url = self.DCAT_AP_2 if version == "2.1.1" else self.DCAT_AP_3
        logger.info(f"Fetching DCAT AP {version} catalog...")
        
        try:
            async with self.session.get(url) as response:
                catalog = await response.json()
            
            dataset_count = len(catalog.get('dataset', []))
            logger.info(
                f"Fetched DCAT catalog with {dataset_count} datasets",
                extra={
                    'version': version,
                    'count': dataset_count,
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            return catalog
            
        except Exception as e:
            logger.error(f"Error fetching DCAT catalog: {e}")
            return {}
    
    async def search_datasets(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Search ANEEL datasets
        
        Args:
            query: Search query
            limit: Maximum results
            
        Returns:
            List of matching datasets
        """
        logger.info(f"Searching datasets for: {query}")
        
        params = {
            'q': query,
            'limit': limit,
            'sort': 'modified desc'
        }
        
        try:
            async with self.session.get(self.SEARCH_API, params=params) as response:
                results = await response.json()
            
            datasets = results.get('data', [])
            logger.info(f"Found {len(datasets)} datasets matching '{query}'")
            
            return datasets
            
        except Exception as e:
            logger.error(f"Error searching datasets: {e}")
            return []
    
    async def fetch_generation_data(self, utility_code: str = "6585") -> List[GenerationUnit]:
        """
        Fetch distributed generation data
        
        Args:
            utility_code: Utility company code (default: 6585 - Energisa)
            
        Returns:
            List of generation units
        """
        logger.info(f"Fetching generation data for utility {utility_code}...")
        
        # This is a placeholder - actual API endpoint depends on dataset structure
        # Example using ArcGIS REST API
        dataset_url = f"{self.BASE_URL}/datasets/b7ad164d258245e79c1b8e0593d65cc0_0"
        
        try:
            # Fetch dataset metadata
            async with self.session.get(f"{dataset_url}.json") as response:
                metadata = await response.json()
            
            # Fetch actual data (simplified)
            query_url = f"{dataset_url}/query"
            params = {
                'where': '1=1',
                'outFields': '*',
                'f': 'json'
            }
            
            async with self.session.get(query_url, params=params) as response:
                data = await response.json()
            
            # Parse features
            units = []
            for feature in data.get('features', []):
                attrs = feature.get('attributes', {})
                
                unit = GenerationUnit(
                    unit_id=str(attrs.get('OBJECTID', '')),
                    consumer_class=attrs.get('CONSUMER_CLASS', ''),
                    utility_company=attrs.get('UTILITY', ''),
                    municipality=attrs.get('MUNICIPALITY', ''),
                    state=attrs.get('STATE', ''),
                    installed_power_kw=float(attrs.get('POWER_KW', 0)),
                    source_type=attrs.get('SOURCE_TYPE', ''),
                    compensation_modality=attrs.get('MODALITY', ''),
                    connection_date=attrs.get('CONNECTION_DATE', '')
                )
                units.append(unit)
            
            logger.info(
                f"Fetched {len(units)} generation units",
                extra={
                    'utility_code': utility_code,
                    'count': len(units),
                    'timestamp': datetime.now().isoformat()
                }
            )
            
            return units
            
        except Exception as e:
            logger.error(f"Error fetching generation data: {e}")
            return []
    
    async def fetch_tariffs(self) -> Dict[str, List[Dict]]:
        """
        Fetch electricity tariffs by utility
        
        Returns:
            Dict mapping utility to tariffs
        """
        logger.info("Fetching electricity tariffs...")
        
        # Search for tariff datasets
        datasets = await self.search_datasets("tarifa energia", limit=20)
        
        tariffs_by_utility = {}
        
        for dataset in datasets:
            utility_name = dataset.get('source', 'Unknown')
            
            if utility_name not in tariffs_by_utility:
                tariffs_by_utility[utility_name] = []
            
            tariff_info = {
                'title': dataset.get('title', ''),
                'description': dataset.get('description', ''),
                'url': dataset.get('url', ''),
                'modified': dataset.get('modified', ''),
            }
            
            tariffs_by_utility[utility_name].append(tariff_info)
        
        logger.info(
            f"Fetched tariffs for {len(tariffs_by_utility)} utilities",
            extra={
                'utilities_count': len(tariffs_by_utility),
                'total_tariffs': sum(len(t) for t in tariffs_by_utility.values()),
                'timestamp': datetime.now().isoformat()
            }
        )
        
        return tariffs_by_utility
    
    async def fetch_certifications(self) -> List[Dict]:
        """
        Fetch equipment certifications (inverters, panels)
        
        Returns:
            List of certified equipment
        """
        logger.info("Fetching equipment certifications...")
        
        # Search for certification datasets
        datasets = await self.search_datasets("certificação equipamentos fotovoltaicos", limit=10)
        
        certifications = []
        
        for dataset in datasets:
            cert = {
                'id': dataset.get('id', ''),
                'title': dataset.get('title', ''),
                'equipment_type': self._extract_equipment_type(dataset.get('title', '')),
                'url': dataset.get('url', ''),
                'modified': dataset.get('modified', ''),
                'description': dataset.get('description', '')
            }
            certifications.append(cert)
        
        logger.info(
            f"Fetched {len(certifications)} certification datasets",
            extra={
                'count': len(certifications),
                'timestamp': datetime.now().isoformat()
            }
        )
        
        return certifications
    
    def _extract_equipment_type(self, title: str) -> str:
        """Extract equipment type from title"""
        title_lower = title.lower()
        
        if 'inversor' in title_lower:
            return 'inverter'
        elif 'painel' in title_lower or 'módulo' in title_lower:
            return 'panel'
        elif 'bateria' in title_lower:
            return 'battery'
        else:
            return 'unknown'
    
    async def fetch_all_data(self) -> Dict[str, any]:
        """
        Fetch all available data from ANEEL
        
        Returns:
            Dict with all fetched data
        """
        logger.info("Starting comprehensive ANEEL data fetch...")
        
        # Fetch all data in parallel
        results = await asyncio.gather(
            self.fetch_rss_feed(),
            self.fetch_dcat_catalog(),
            self.fetch_generation_data(),
            self.fetch_tariffs(),
            self.fetch_certifications(),
            return_exceptions=True
        )
        
        data = {
            'rss_feed': results[0] if not isinstance(results[0], Exception) else [],
            'dcat_catalog': results[1] if not isinstance(results[1], Exception) else {},
            'generation_units': results[2] if not isinstance(results[2], Exception) else [],
            'tariffs': results[3] if not isinstance(results[3], Exception) else {},
            'certifications': results[4] if not isinstance(results[4], Exception) else [],
            'fetch_date': datetime.now().isoformat(),
            'status': 'success'
        }
        
        # Log comprehensive summary
        logger.info(
            "Complete ANEEL data fetch completed",
            extra={
                'rss_feed_count': len(data['rss_feed']),
                'dcat_datasets': len(data['dcat_catalog'].get('dataset', [])),
                'generation_units': len(data['generation_units']),
                'utilities_with_tariffs': len(data['tariffs']),
                'certifications': len(data['certifications']),
                'timestamp': data['fetch_date'],
                'status': data['status']
            }
        )
        
        return data


async def main():
    """Main execution"""
    print("\n🏢 ANEEL DATA FETCHER")
    print("=" * 60)
    
    async with ANEELDataFetcher() as fetcher:
        # Fetch all data
        data = await fetcher.fetch_all_data()
        
        # Print summary
        print("\n📊 FETCH SUMMARY:")
        print(f"   • RSS Feed: {len(data['rss_feed'])} datasets")
        print(f"   • DCAT Catalog: {len(data['dcat_catalog'].get('dataset', []))} datasets")
        print(f"   • Generation Units: {len(data['generation_units'])} units")
        print(f"   • Utilities with Tariffs: {len(data['tariffs'])} utilities")
        print(f"   • Certifications: {len(data['certifications'])} datasets")
        print(f"\n✅ Data fetch completed!")
        print(f"   Cache directory: {fetcher.cache_dir}")


if __name__ == "__main__":
    asyncio.run(main())
