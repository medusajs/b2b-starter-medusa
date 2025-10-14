"""
Download product images for all distributors
Handles FortLev, FOTUS, and NeoSolar kits with retry logic
"""

import json
import requests
import time
from pathlib import Path
from typing import List, Dict
import hashlib
from urllib.parse import urlparse
import os


class ImageDownloader:
    """Download and organize product images."""
    
    def __init__(self, output_base: Path):
        self.output_base = output_base
        self.downloaded = 0
        self.failed = 0
        self.skipped = 0
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def get_image_filename(self, url: str, kit_id: str) -> str:
        """Generate unique filename from URL and kit ID."""
        parsed = urlparse(url)
        ext = Path(parsed.path).suffix or '.jpg'
        
        # Use kit ID + hash for uniqueness
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        return f"{kit_id}_{url_hash}{ext}"
    
    def download_image(self, url: str, output_path: Path, max_retries: int = 3) -> bool:
        """Download single image with retry logic."""
        if not url or url == "":
            return False
        
        # Skip if already exists
        if output_path.exists():
            self.skipped += 1
            return True
        
        for attempt in range(max_retries):
            try:
                response = self.session.get(url, timeout=30, stream=True)
                response.raise_for_status()
                
                # Save image
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                self.downloaded += 1
                return True
                
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"      ❌ Failed after {max_retries} attempts: {e}")
                    self.failed += 1
                    return False
                time.sleep(2 ** attempt)  # Exponential backoff
        
        return False
    
    def process_distributor(self, 
                          json_file: Path, 
                          distributor_name: str,
                          image_field: str = "image_url") -> Dict:
        """Process all kits from one distributor."""
        print(f"\n{'='*80}")
        print(f"📦 Processing {distributor_name}")
        print(f"{'='*80}")
        
        # Load kits
        with open(json_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"✓ Loaded {len(kits)} kits")
        
        # Create output directory
        output_dir = self.output_base / distributor_name.lower() / "images"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📂 Output: {output_dir}")
        print(f"🔄 Downloading images...\n")
        
        # Download images
        results = []
        for i, kit in enumerate(kits, 1):
            kit_id = kit.get('id', f'kit-{i:04d}')
            image_url = kit.get(image_field, '')
            
            # Handle multiple images if stored as array
            if isinstance(image_url, list):
                image_urls = image_url
            else:
                image_urls = [image_url] if image_url else []
            
            kit_images = []
            for img_idx, url in enumerate(image_urls):
                if not url:
                    continue
                
                filename = self.get_image_filename(url, f"{kit_id}-{img_idx}")
                output_path = output_dir / filename
                
                if i % 50 == 0:
                    print(f"   Progress: {i}/{len(kits)} kits...")
                
                success = self.download_image(url, output_path)
                if success:
                    kit_images.append({
                        "url": url,
                        "local_path": str(output_path.relative_to(self.output_base)),
                        "filename": filename
                    })
            
            results.append({
                "kit_id": kit_id,
                "images": kit_images
            })
            
            # Rate limiting
            if i % 10 == 0:
                time.sleep(0.5)
        
        print(f"\n✓ Complete!")
        print(f"   • Downloaded: {self.downloaded}")
        print(f"   • Skipped (exists): {self.skipped}")
        print(f"   • Failed: {self.failed}")
        
        # Save mapping
        mapping_file = output_dir.parent / "image_mapping.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Saved mapping: {mapping_file}")
        
        return {
            "distributor": distributor_name,
            "total_kits": len(kits),
            "downloaded": self.downloaded,
            "skipped": self.skipped,
            "failed": self.failed,
            "output_dir": str(output_dir)
        }


def main():
    """Main execution."""
    print("\n" + "="*80)
    print("🖼️  IMAGE DOWNLOADER - ALL DISTRIBUTORS")
    print("="*80)
    
    script_dir = Path(__file__).parent
    downloader = ImageDownloader(script_dir)
    
    stats = []
    
    # 1. FortLev
    fortlev_json = script_dir / "fortlev" / "fortlev-kits-normalized.json"
    if fortlev_json.exists():
        result = downloader.process_distributor(
            fortlev_json, 
            "FortLev",
            image_field="imagem_principal"
        )
        stats.append(result)
    else:
        print(f"⚠️  FortLev file not found: {fortlev_json}")
    
    # Reset counters
    downloader.downloaded = 0
    downloader.skipped = 0
    downloader.failed = 0
    
    # 2. FOTUS
    fotus_json = script_dir / "fotus" / "fotus-kits-normalized.json"
    if fotus_json.exists():
        result = downloader.process_distributor(
            fotus_json,
            "FOTUS",
            image_field="imagem_principal"
        )
        stats.append(result)
    else:
        print(f"⚠️  FOTUS file not found: {fotus_json}")
    
    # Reset counters
    downloader.downloaded = 0
    downloader.skipped = 0
    downloader.failed = 0
    
    # 3. FOTUS Hybrid
    fotus_hybrid_json = script_dir / "fotus" / "fotus-kits-hibridos-normalized.json"
    if fotus_hybrid_json.exists():
        result = downloader.process_distributor(
            fotus_hybrid_json,
            "FOTUS-Hybrid",
            image_field="imagem_principal"
        )
        stats.append(result)
    else:
        print(f"⚠️  FOTUS Hybrid file not found: {fotus_hybrid_json}")
    
    # Reset counters
    downloader.downloaded = 0
    downloader.skipped = 0
    downloader.failed = 0
    
    # 4. NeoSolar
    neosolar_json = script_dir / "neosolar" / "neosolar-kits-normalized.json"
    if neosolar_json.exists():
        result = downloader.process_distributor(
            neosolar_json,
            "NeoSolar",
            image_field="image_url"
        )
        stats.append(result)
    else:
        print(f"⚠️  NeoSolar file not found: {neosolar_json}")
    
    # Summary
    print("\n" + "="*80)
    print("📊 DOWNLOAD SUMMARY")
    print("="*80)
    
    total_kits = sum(s['total_kits'] for s in stats)
    total_downloaded = sum(s['downloaded'] for s in stats)
    total_skipped = sum(s['skipped'] for s in stats)
    total_failed = sum(s['failed'] for s in stats)
    
    for stat in stats:
        print(f"\n{stat['distributor']}:")
        print(f"   • Kits: {stat['total_kits']}")
        print(f"   • Downloaded: {stat['downloaded']}")
        print(f"   • Skipped: {stat['skipped']}")
        print(f"   • Failed: {stat['failed']}")
    
    print(f"\n{'='*80}")
    print(f"TOTALS:")
    print(f"   • Total kits: {total_kits}")
    print(f"   • Downloaded: {total_downloaded}")
    print(f"   • Skipped: {total_skipped}")
    print(f"   • Failed: {total_failed}")
    print(f"   • Success rate: {(total_downloaded + total_skipped) / total_kits * 100:.1f}%")
    print(f"{'='*80}\n")
    
    print("✅ Image download complete!")
    print("\n🎯 Next steps:")
    print("   1. Review downloaded images")
    print("   2. Run Vision AI enrichment with Gemma3")
    print("   3. Generate enhanced schemas and SKUs")


if __name__ == "__main__":
    main()
