"""
NeoSolar Image Downloader
Downloads 548 real images from Zydon CDN
"""

import json
import requests
import time
from pathlib import Path
from typing import Dict, List


class NeoSolarImageDownloader:
    """Download images from NeoSolar Zydon CDN"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.neosolar_dir = base_path / "distributors" / "neosolar"
        self.output_dir = self.neosolar_dir / "images_downloaded_zydon"
        self.output_dir.mkdir(exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://portalb2b.neosolar.com.br/'
        })
    
    def download_images(self) -> Dict:
        """Download all NeoSolar images from URLs file"""
        
        # Load URLs
        urls_file = self.neosolar_dir / "real_image_urls.json"
        
        if not urls_file.exists():
            print("[NeoSolar] ⚠️  URLs file not found")
            return {'error': 'URLs file not found'}
        
        with open(urls_file, 'r', encoding='utf-8') as f:
            url_data = json.load(f)
        
        print(f"\n[NeoSolar] Starting download of {len(url_data)} images...")
        print(f"[NeoSolar] Output: {self.output_dir}")
        
        stats = {
            'total': len(url_data),
            'downloaded': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for idx, item in enumerate(url_data, 1):
            sku = item['sku']
            url = item['url']
            product_id = item['id']
            
            # Extract UUID from URL
            uuid_match = url.split('/files/')
            if len(uuid_match) > 1:
                uuid = uuid_match[1].split('/')[0]
            else:
                uuid = f"unknown-{idx}"
            
            # Filename: SKU-UUID.jpg
            filename = f"{sku}-{uuid}.jpg"
            output_path = self.output_dir / filename
            
            # Skip if already downloaded
            if output_path.exists():
                stats['skipped'] += 1
                if idx % 50 == 0:
                    print(f"[NeoSolar] [{idx}/{stats['total']}] Skipped (exists): {filename}")
                continue
            
            # Download
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                # Save image
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                stats['downloaded'] += 1
                
                if idx % 10 == 0:
                    print(f"[NeoSolar] [{idx}/{stats['total']}] ✅ {filename} ({len(response.content)/1024:.1f}KB)")
                
                # Rate limiting
                time.sleep(0.3)
                
            except requests.exceptions.RequestException as e:
                stats['failed'] += 1
                error_msg = f"Failed {filename}: {str(e)}"
                stats['errors'].append(error_msg)
                
                if idx % 10 == 0:
                    print(f"[NeoSolar] [{idx}/{stats['total']}] ❌ {error_msg}")
                
                # Continue on error
                time.sleep(0.5)
        
        # Summary
        print("\n" + "="*70)
        print("NEOSOLAR IMAGE DOWNLOAD COMPLETE")
        print("="*70)
        print(f"Total URLs: {stats['total']}")
        print(f"Downloaded: {stats['downloaded']}")
        print(f"Skipped (exists): {stats['skipped']}")
        print(f"Failed: {stats['failed']}")
        
        if stats['errors']:
            print(f"\nErrors ({len(stats['errors'])}):")
            for error in stats['errors'][:10]:
                print(f"  - {error}")
        
        print("="*70)
        
        # Save stats
        stats_file = self.neosolar_dir / "download_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        
        return stats


def main():
    """Run NeoSolar image downloader"""
    
    base_path = Path(__file__).parent.parent
    
    downloader = NeoSolarImageDownloader(base_path)
    stats = downloader.download_images()
    
    print(f"\n[NeoSolar] 📄 Stats saved to download_stats.json")


if __name__ == "__main__":
    main()
