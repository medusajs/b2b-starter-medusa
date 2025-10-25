"""
Download Images from CSV URLs
Extracts image URLs from distributor CSV files and downloads them
"""

import json
import csv
import re
import requests
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from urllib.parse import urlparse
import time


class ImageDownloader:
    """Download images from CSV URLs"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def extract_urls_from_csv(self, csv_file: Path) -> List[Tuple[str, str]]:
        """Extract image URLs from CSV file"""
        urls = []
        
        try:
            with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
                # Find all image URLs - complete URL including extension
                url_pattern = r'(https?://[^\s,"\'\)]+\.(?:jpg|jpeg|png|webp|svg)(?:\?[^\s,"\'\)]*)?)'
                matches = re.findall(url_pattern, content, re.IGNORECASE)
                
                for match in matches:
                    full_url = match if isinstance(match, str) else match[0]
                    
                    if full_url and full_url not in [u[0] for u in urls]:
                        # Try to find associated product ID
                        # Search backwards in content for ID
                        idx = content.find(full_url)
                        if idx > 0:
                            before = content[max(0, idx-200):idx]
                            id_match = re.search(r'([A-Z]{3,}-\d+)', before)
                            product_id = id_match.group(1) if id_match else ''
                        else:
                            product_id = ''
                        
                        urls.append((full_url, product_id))
        
        except Exception as e:
            print(f"[Download] ❌ Error reading {csv_file.name}: {e}")
        
        return urls
    
    def download_image(
        self, 
        url: str, 
        output_dir: Path, 
        filename: Optional[str] = None
    ) -> Optional[Path]:
        """Download single image"""
        
        try:
            # Get filename from URL if not provided
            if not filename:
                parsed = urlparse(url)
                filename = Path(parsed.path).name
                if not filename:
                    filename = f"image_{hash(url)}.jpg"
            
            output_file = output_dir / filename
            
            # Skip if already exists
            if output_file.exists():
                return output_file
            
            # Download
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Save
            with open(output_file, 'wb') as f:
                f.write(response.content)
            
            print(f"[Download] ✅ Downloaded: {filename}")
            return output_file
        
        except Exception as e:
            print(f"[Download] ❌ Failed {url}: {e}")
            return None
    
    def process_distributor(
        self,
        distributor: str,
        csv_pattern: str
    ) -> Dict[str, List[str]]:
        """Process all CSVs for a distributor"""
        
        print(f"\n[Download] Processing {distributor}...")
        
        dist_path = self.base_path / distributor
        csv_files = list(dist_path.glob(csv_pattern))
        
        print(f"[Download] Found {len(csv_files)} CSV files")
        
        # Extract all URLs
        all_urls = []
        for csv_file in csv_files:
            urls = self.extract_urls_from_csv(csv_file)
            all_urls.extend(urls)
        
        # Remove duplicates
        unique_urls = {}
        for url, product_id in all_urls:
            if url not in unique_urls:
                unique_urls[url] = product_id
        
        print(f"[Download] Found {len(unique_urls)} unique image URLs")
        
        # Create output directory
        output_dir = dist_path / "images_downloaded"
        output_dir.mkdir(exist_ok=True)
        
        # Download images
        downloaded = {}
        failed = []
        
        for idx, (url, product_id) in enumerate(unique_urls.items(), 1):
            print(f"[Download] [{idx}/{len(unique_urls)}] Downloading...")
            
            # Generate filename
            parsed = urlparse(url)
            original_name = Path(parsed.path).name
            
            if product_id:
                filename = f"{product_id}_{original_name}"
            else:
                filename = original_name
            
            # Download
            result = self.download_image(url, output_dir, filename)
            
            if result:
                if product_id not in downloaded:
                    downloaded[product_id] = []
                downloaded[product_id].append(str(result.relative_to(self.base_path)))
            else:
                failed.append(url)
            
            # Rate limiting
            time.sleep(0.5)
        
        print(f"\n[Download] ✅ Downloaded: {len(downloaded)} products")
        print(f"[Download] ❌ Failed: {len(failed)} images")
        
        return downloaded
    
    def map_images_to_products(
        self,
        distributor: str,
        products_file: str,
        image_mapping: Dict[str, List[str]]
    ):
        """Map downloaded images to products"""
        
        products_path = self.base_path / distributor / products_file
        
        if not products_path.exists():
            print(f"[Download] ⚠️  Products file not found: {products_file}")
            return
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"\n[Download] Mapping images to {len(products)} products...")
        
        mapped_count = 0
        
        for product in products:
            kit_id = product.get('kit_id', '')
            sku = product.get('sku', '')
            
            # Try to find images by kit_id or SKU
            images = []
            
            for search_key in [kit_id, sku]:
                if search_key and search_key in image_mapping:
                    images.extend(image_mapping[search_key])
            
            # Also try partial matches
            if not images:
                for mapped_id, mapped_images in image_mapping.items():
                    if mapped_id and (
                        mapped_id in kit_id or 
                        mapped_id in sku or
                        kit_id in mapped_id or
                        sku in mapped_id
                    ):
                        images.extend(mapped_images)
                        break
            
            if images:
                if 'images' not in product:
                    product['images'] = []
                
                for img_path in images:
                    product['images'].append({
                        "url": img_path,
                        "type": "primary",
                        "alt": product.get('title', ''),
                        "source": "csv_download"
                    })
                
                mapped_count += 1
        
        # Save updated products
        output_file = products_path.parent / f"{distributor}-kits-with-images.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[Download] ✅ Mapped images to {mapped_count} products")
        print(f"[Download] 📄 Saved to {output_file.name}")


def main():
    """Download images from all distributors"""
    
    base_path = Path(__file__).parent.parent / "distributors"
    downloader = ImageDownloader(base_path)
    
    # Process FortLev
    print("\n" + "="*60)
    print("FORTLEV")
    print("="*60)
    
    fortlev_mapping = downloader.process_distributor(
        'fortlev',
        'https___fortlevsolar.app_*.csv'
    )
    
    downloader.map_images_to_products(
        'fortlev',
        'fortlev-kits-with-skus.json',
        fortlev_mapping
    )
    
    # Process NeoSolar
    print("\n" + "="*60)
    print("NEOSOLAR")
    print("="*60)
    
    neosolar_mapping = downloader.process_distributor(
        'neosolar',
        'https___portalb2b.neosolar.com*.csv'
    )
    
    downloader.map_images_to_products(
        'neosolar',
        'neosolar-kits-with-skus.json',
        neosolar_mapping
    )
    
    # Process FOTUS
    print("\n" + "="*60)
    print("FOTUS")
    print("="*60)
    
    fotus_mapping = downloader.process_distributor(
        'fotus',
        'https___app.fotus.com.br*.csv'
    )
    
    downloader.map_images_to_products(
        'fotus',
        'fotus-kits-with-skus.json',
        fotus_mapping
    )
    
    print("\n" + "="*60)
    print("✅ IMAGE DOWNLOAD COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
