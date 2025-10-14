"""
FOTUS Image URL Extractor from Extracted Schemas
Extracts S3 URLs embedded in product names/descriptions
"""

import json
import re
import requests
import time
from pathlib import Path
from typing import Dict, List, Set


class FotusImageExtractor:
    """Extract and download FOTUS images from extracted schemas"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.fotus_dir = base_path / "distributors" / "fotus"
        self.extracted_dir = self.fotus_dir / "extracted"
        self.output_dir = self.fotus_dir / "images_downloaded_s3"
        self.output_dir.mkdir(exist_ok=True)
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Accept': 'image/webp,image/*,*/*;q=0.8'
        })
    
    def extract_urls_from_schemas(self) -> Dict[str, List[Dict]]:
        """Extract all image URLs from schema files"""
        
        print("\n[FOTUS] Extracting image URLs from schemas...")
        
        schema_files = [
            "fotus-kits-extracted.json",
            "fotus-kits-hibridos-extracted.json"
        ]
        
        all_urls = {}
        url_pattern = r'https://solaryum-public-assets\.s3\.sa-east-1\.amazonaws\.com/[^\s\)]+\.webp(?:\?t=\d+)?'
        
        for schema_file in schema_files:
            schema_path = self.extracted_dir / schema_file
            
            if not schema_path.exists():
                print(f"[FOTUS] ⚠️  Schema not found: {schema_file}")
                continue
            
            print(f"[FOTUS] Reading {schema_file}...")
            
            with open(schema_path, 'r', encoding='utf-8') as f:
                products = json.load(f)
            
            for product in products:
                product_id = product.get('id', '')
                name_field = product.get('name', '')
                
                # Extract all URLs from the name field
                urls = re.findall(url_pattern, name_field)
                
                if urls:
                    # Clean URLs (remove query params for deduplication)
                    for url in urls:
                        clean_url = url.split('?')[0]
                        uuid = clean_url.split('/')[-1].replace('.webp', '')
                        
                        if uuid not in all_urls:
                            all_urls[uuid] = {
                                'uuid': uuid,
                                'url': url,
                                'clean_url': clean_url,
                                'products': []
                            }
                        
                        all_urls[uuid]['products'].append({
                            'id': product_id,
                            'potencia_kwp': product.get('potencia_kwp'),
                            'estrutura': product.get('estrutura'),
                            'schema_file': schema_file
                        })
        
        print(f"[FOTUS] Found {len(all_urls)} unique image URLs")
        
        return all_urls
    
    def download_images(self, url_data: Dict) -> Dict:
        """Download all extracted images"""
        
        print(f"\n[FOTUS] Starting download of {len(url_data)} images...")
        
        stats = {
            'total': len(url_data),
            'downloaded': 0,
            'failed': 0,
            'skipped': 0,
            'errors': []
        }
        
        for idx, (uuid, data) in enumerate(url_data.items(), 1):
            url = data['url']
            filename = f"{uuid}.webp"
            output_path = self.output_dir / filename
            
            # Skip if exists
            if output_path.exists():
                stats['skipped'] += 1
                if idx % 50 == 0:
                    print(f"[FOTUS] [{idx}/{stats['total']}] Skipped: {filename}")
                continue
            
            # Download
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                stats['downloaded'] += 1
                
                if idx % 10 == 0 or idx <= 5:
                    size_kb = len(response.content) / 1024
                    print(f"[FOTUS] [{idx}/{stats['total']}] ✅ {filename} ({size_kb:.1f}KB)")
                
                time.sleep(0.2)
                
            except requests.exceptions.RequestException as e:
                stats['failed'] += 1
                error_msg = f"Failed {filename}: {str(e)}"
                stats['errors'].append(error_msg)
                
                if idx % 10 == 0:
                    print(f"[FOTUS] [{idx}/{stats['total']}] ❌ {error_msg}")
                
                time.sleep(0.3)
        
        return stats
    
    def create_mapping(self, url_data: Dict) -> None:
        """Create UUID to product mapping"""
        
        print("\n[FOTUS] Creating image-product mapping...")
        
        mapping = []
        
        for uuid, data in url_data.items():
            mapping.append({
                'uuid': uuid,
                'url': data['clean_url'],
                'filename': f"{uuid}.webp",
                'used_in_products': data['products'],
                'product_count': len(data['products'])
            })
        
        # Save mapping
        mapping_file = self.fotus_dir / "image_uuid_mapping.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, ensure_ascii=False, indent=2)
        
        print(f"[FOTUS] ✅ Saved mapping to {mapping_file.name}")
        
        # Statistics
        multi_use = sum(1 for item in mapping if item['product_count'] > 1)
        single_use = sum(1 for item in mapping if item['product_count'] == 1)
        
        print(f"[FOTUS] Image Usage Statistics:")
        print(f"  - Single-use images: {single_use}")
        print(f"  - Multi-use images: {multi_use}")
        print(f"  - Total unique images: {len(mapping)}")
    
    def generate_report(self, url_data: Dict, stats: Dict) -> str:
        """Generate extraction report"""
        
        report = []
        report.append("\n" + "="*70)
        report.append("FOTUS IMAGE EXTRACTION FROM SCHEMAS - REPORT")
        report.append("="*70 + "\n")
        
        report.append(f"📁 Source Files:")
        report.append(f"   - fotus-kits-extracted.json")
        report.append(f"   - fotus-kits-hibridos-extracted.json\n")
        
        report.append(f"🔍 URLs Extracted: {len(url_data)}")
        report.append(f"📥 Download Statistics:")
        report.append(f"   - Total: {stats['total']}")
        report.append(f"   - Downloaded: {stats['downloaded']}")
        report.append(f"   - Skipped (exists): {stats['skipped']}")
        report.append(f"   - Failed: {stats['failed']}\n")
        
        if stats['errors']:
            report.append(f"❌ Errors ({len(stats['errors'])}):")
            for error in stats['errors'][:5]:
                report.append(f"   - {error}")
            report.append("")
        
        # Sample URLs
        report.append("📋 Sample URLs:")
        for idx, (uuid, data) in enumerate(list(url_data.items())[:3], 1):
            report.append(f"\n{idx}. UUID: {uuid}")
            report.append(f"   URL: {data['clean_url']}")
            report.append(f"   Used in {len(data['products'])} products")
            for prod in data['products'][:2]:
                report.append(f"      - {prod['id']} ({prod['potencia_kwp']}kWp)")
        
        report.append("\n" + "="*70)
        report.append("✅ FOTUS IMAGE EXTRACTION COMPLETE")
        report.append("="*70)
        
        return "\n".join(report)


def main():
    """Run FOTUS image extraction"""
    
    base_path = Path(__file__).parent.parent
    
    extractor = FotusImageExtractor(base_path)
    
    # Extract URLs
    url_data = extractor.extract_urls_from_schemas()
    
    if not url_data:
        print("[FOTUS] ❌ No URLs found in schemas")
        return
    
    # Create mapping
    extractor.create_mapping(url_data)
    
    # Download images
    stats = extractor.download_images(url_data)
    
    # Generate report
    report = extractor.generate_report(url_data, stats)
    print(report)
    
    # Save report
    report_file = base_path / "distributors" / "fotus" / "IMAGE_EXTRACTION_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n[FOTUS] 📄 Report saved to {report_file.name}")


if __name__ == "__main__":
    main()
