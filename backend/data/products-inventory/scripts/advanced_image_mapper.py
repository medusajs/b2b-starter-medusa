"""
Advanced Image Mapper for NeoSolar and FOTUS
Resolves UUID mapping and extracts real image URLs
"""

import json
import shutil
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import csv


@dataclass
class MappingResult:
    distributor: str
    total_products: int
    with_real_images: int
    with_placeholder: int
    urls_to_download: List[str]
    mapped_images: int
    errors: List[str]


class AdvancedImageMapper:
    """Map images for NeoSolar and FOTUS"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.images_output = base_path / "images_catalog"
        self.images_output.mkdir(exist_ok=True)
    
    def analyze_neosolar(self) -> MappingResult:
        """Analyze NeoSolar image URLs and mapping strategy"""
        
        print("\n[NeoSolar] Analyzing image URLs...")
        
        # Load products
        products_path = (
            self.base_path / "distributors" / "neosolar" / 
            "neosolar-kits-with-skus.json"
        )
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        result = MappingResult(
            distributor="neosolar",
            total_products=len(products),
            with_real_images=0,
            with_placeholder=0,
            urls_to_download=[],
            mapped_images=0,
            errors=[]
        )
        
        # Analyze image URLs
        url_patterns = {
            'zydon': 0,
            'placeholder': 0,
            'missing': 0
        }
        
        real_image_urls = []
        
        for product in products:
            image_url = product.get('image_url', '')
            
            if not image_url:
                url_patterns['missing'] += 1
            elif 'b2b-noimage-white.svg' in image_url:
                url_patterns['placeholder'] += 1
                result.with_placeholder += 1
            elif 'portal.zydon.com.br' in image_url:
                url_patterns['zydon'] += 1
                result.with_real_images += 1
                real_image_urls.append({
                    'sku': product.get('sku'),
                    'id': product.get('id'),
                    'url': image_url
                })
        
        result.urls_to_download = real_image_urls
        
        print(f"[NeoSolar] URL Analysis:")
        print(f"  - Zydon CDN URLs: {url_patterns['zydon']}")
        print(f"  - Placeholder SVG: {url_patterns['placeholder']}")
        print(f"  - Missing URLs: {url_patterns['missing']}")
        print(f"  - Real images available: {result.with_real_images}")
        
        # Save URLs to download
        urls_file = self.base_path / "distributors" / "neosolar" / "real_image_urls.json"
        with open(urls_file, 'w', encoding='utf-8') as f:
            json.dump(real_image_urls, f, ensure_ascii=False, indent=2)
        
        print(f"[NeoSolar] ✅ Saved {len(real_image_urls)} URLs to {urls_file.name}")
        
        return result
    
    def analyze_fotus_csvs(self) -> Dict[str, str]:
        """Extract UUID to product mapping from FOTUS CSVs"""
        
        print("\n[FOTUS] Analyzing CSV files for image URLs...")
        
        fotus_dir = self.base_path / "distributors" / "fotus"
        csv_files = list(fotus_dir.glob("*.csv"))
        
        # Map: product_id -> image_urls
        product_images = {}
        
        for csv_file in csv_files:
            try:
                with open(csv_file, 'r', encoding='utf-8', errors='ignore') as f:
                    # Try to read CSV
                    content = f.read()
                    
                    # Extract image URLs (UUID-based from S3)
                    s3_pattern = r'(https://solaryum-public-assets\.s3\.sa-east-1\.amazonaws\.com/[a-f0-9\-]+\.webp)'
                    urls = re.findall(s3_pattern, content)
                    
                    if urls:
                        print(f"  Found {len(urls)} S3 URLs in {csv_file.name}")
                        
                        # Try to extract product IDs near the URLs
                        for url in urls:
                            uuid = re.search(r'([a-f0-9\-]+)\.webp', url)
                            if uuid:
                                uuid_str = uuid.group(1)
                                # Store for later matching
                                product_images[uuid_str] = url
            
            except Exception as e:
                print(f"  ⚠️  Error reading {csv_file.name}: {e}")
        
        print(f"[FOTUS] Found {len(product_images)} unique S3 image URLs")
        
        return product_images
    
    def map_fotus_images(self) -> MappingResult:
        """Map FOTUS images using local downloaded files"""
        
        print("\n[FOTUS] Mapping downloaded images to products...")
        
        # Load products
        products_path = (
            self.base_path / "distributors" / "fotus" / 
            "fotus-kits-with-skus.json"
        )
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        result = MappingResult(
            distributor="fotus",
            total_products=len(products),
            with_real_images=0,
            with_placeholder=0,
            urls_to_download=[],
            mapped_images=0,
            errors=[]
        )
        
        # Scan downloaded images
        images_dir = self.base_path / "distributors" / "fotus" / "images_downloaded"
        downloaded_images = {}
        
        if images_dir.exists():
            for img_file in images_dir.glob("*.webp"):
                # Extract UUID from filename
                uuid = img_file.stem
                downloaded_images[uuid] = img_file
        
        print(f"[FOTUS] Found {len(downloaded_images)} downloaded images")
        
        # Analyze product images
        for product in products:
            image_url = product.get('image_url', '')
            processed_images = product.get('processed_images', {})
            
            # Try to extract image reference
            if image_url:
                # Example: /images/FOTUS-KITS/FOTUS-KP04-kits.jpg
                match = re.search(r'FOTUS-([A-Z0-9]+)-kits', image_url)
                if match:
                    kit_code = match.group(1)
                    # Look for matching image by kit code
                    # This is a heuristic - we'll need to check CSV for actual mapping
                    result.with_real_images += 1
            
            if processed_images:
                result.with_real_images += 1
        
        # Create mapping report
        mapping_data = {
            'total_products': len(products),
            'products_with_image_url': sum(1 for p in products if p.get('image_url')),
            'products_with_processed_images': sum(1 for p in products if p.get('processed_images')),
            'downloaded_images': len(downloaded_images),
            'mapping_strategy': 'UUID extraction from CSV needed'
        }
        
        mapping_file = self.base_path / "distributors" / "fotus" / "image_mapping_analysis.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(mapping_data, f, ensure_ascii=False, indent=2)
        
        print(f"[FOTUS] ✅ Saved analysis to {mapping_file.name}")
        
        return result
    
    def extract_fotus_csv_data(self) -> Dict:
        """Extract complete product data from FOTUS CSVs"""
        
        print("\n[FOTUS] Extracting CSV data with image URLs...")
        
        fotus_dir = self.base_path / "distributors" / "fotus"
        csv_files = [
            "fotus-kits.csv",
            "fotus-kits-hibridos.csv"
        ]
        
        products_with_images = []
        
        for csv_filename in csv_files:
            csv_path = fotus_dir / csv_filename
            
            if not csv_path.exists():
                continue
            
            try:
                # Try reading as JSON first
                with open(csv_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    # Handle both list and dict formats
                    items = data if isinstance(data, list) else [data]
                    
                    for item in items:
                        # Look for image URLs in all fields
                        image_url = None
                        
                        # Check common fields
                        for field in ['image_url', 'images', 'thumbnail', 'photo']:
                            if field in item and item[field]:
                                value = item[field]
                                if isinstance(value, str) and ('solaryum' in value or 'amazonaws' in value):
                                    image_url = value
                                    break
                        
                        if image_url:
                            # Extract UUID from URL
                            uuid_match = re.search(r'([a-f0-9\-]{36})\.webp', image_url)
                            if uuid_match:
                                uuid = uuid_match.group(1)
                                
                                products_with_images.append({
                                    'kit_id': item.get('id', ''),
                                    'kit_code': item.get('code', ''),
                                    'name': item.get('name', ''),
                                    'image_url': image_url,
                                    'image_uuid': uuid
                                })
            
            except Exception as e:
                print(f"  ⚠️  Error reading {csv_filename}: {e}")
        
        print(f"[FOTUS] Extracted {len(products_with_images)} products with image URLs")
        
        # Save mapping
        mapping_file = fotus_dir / "csv_image_mapping.json"
        with open(mapping_file, 'w', encoding='utf-8') as f:
            json.dump(products_with_images, f, ensure_ascii=False, indent=2)
        
        print(f"[FOTUS] ✅ Saved to {mapping_file.name}")
        
        return {
            'total': len(products_with_images),
            'products': products_with_images
        }
    
    def sync_fotus_by_csv_mapping(self) -> MappingResult:
        """Sync FOTUS images using CSV mapping data"""
        
        print("\n[FOTUS] Syncing images using CSV mapping...")
        
        fotus_dir = self.base_path / "distributors" / "fotus"
        
        # Load CSV mapping
        mapping_file = fotus_dir / "csv_image_mapping.json"
        if not mapping_file.exists():
            print("[FOTUS] ⚠️  CSV mapping not found. Run extract_fotus_csv_data first.")
            return MappingResult("fotus", 0, 0, 0, [], 0, ["Mapping file not found"])
        
        with open(mapping_file, 'r', encoding='utf-8') as f:
            csv_mapping = json.load(f)
        
        # Load products
        products_path = fotus_dir / "fotus-kits-with-skus.json"
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Create UUID to kit mapping
        uuid_to_kit = {}
        # Handle both dict and list formats
        mapping_list = csv_mapping if isinstance(csv_mapping, list) else csv_mapping.get('products', [])
        for item in mapping_list:
            kit_id = item['kit_id']
            uuid = item['image_uuid']
            uuid_to_kit[kit_id] = uuid
        
        # Scan downloaded images
        images_dir = fotus_dir / "images_downloaded"
        available_images = {}
        
        if images_dir.exists():
            for img_file in images_dir.glob("*.webp"):
                uuid = img_file.stem
                available_images[uuid] = img_file
        
        print(f"[FOTUS] Available images: {len(available_images)}")
        print(f"[FOTUS] CSV mappings: {len(uuid_to_kit)}")
        
        # Create output directory
        output_dir = self.images_output / "fotus"
        output_dir.mkdir(exist_ok=True)
        
        result = MappingResult(
            distributor="fotus",
            total_products=len(products),
            with_real_images=0,
            with_placeholder=0,
            urls_to_download=[],
            mapped_images=0,
            errors=[]
        )
        
        # Map images to products
        for product in products:
            # Extract kit ID from product
            product_id = product.get('id', '')  # Format: FOTUS-KP04-kits
            
            # Try to find matching UUID
            uuid = None
            for kit_id, mapped_uuid in uuid_to_kit.items():
                if kit_id in product_id or product_id.split('-')[1] in kit_id:
                    uuid = mapped_uuid
                    break
            
            if uuid and uuid in available_images:
                # Found matching image!
                source_image = available_images[uuid]
                sku = product.get('sku', '')
                
                # Standardize filename
                new_filename = f"{sku}-kit-image.webp"
                dest_file = output_dir / new_filename
                
                try:
                    if not dest_file.exists():
                        shutil.copy2(source_image, dest_file)
                    
                    # Add to product
                    if 'images' not in product:
                        product['images'] = []
                    
                    product['images'].append({
                        "url": str(dest_file.relative_to(self.base_path)),
                        "type": "kit_image",
                        "alt": product.get('title', ''),
                        "format": "webp",
                        "source": "csv_download",
                        "standardized": True,
                        "original_uuid": uuid
                    })
                    
                    result.mapped_images += 1
                    result.with_real_images += 1
                
                except Exception as e:
                    result.errors.append(f"Error mapping {sku}: {e}")
        
        # Save updated products
        output_file = fotus_dir / "fotus-kits-synced-fixed.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[FOTUS] ✅ Mapped {result.mapped_images} images")
        print(f"[FOTUS] ✅ Saved to {output_file.name}")
        
        return result
    
    def generate_report(
        self,
        neosolar_result: MappingResult,
        fotus_result: MappingResult
    ) -> str:
        """Generate comprehensive mapping report"""
        
        report = []
        report.append("\n" + "="*70)
        report.append("ADVANCED IMAGE MAPPING ANALYSIS REPORT")
        report.append("="*70 + "\n")
        
        # NeoSolar
        report.append("📦 NEOSOLAR")
        report.append(f"   Total Products: {neosolar_result.total_products}")
        report.append(f"   With Real Images: {neosolar_result.with_real_images}")
        report.append(f"   With Placeholder: {neosolar_result.with_placeholder}")
        report.append(f"   URLs to Download: {len(neosolar_result.urls_to_download)}")
        
        if neosolar_result.with_real_images > 0:
            coverage = (neosolar_result.with_real_images / neosolar_result.total_products) * 100
            report.append(f"   Coverage: {coverage:.1f}%")
        
        report.append("")
        
        # FOTUS
        report.append("📦 FOTUS")
        report.append(f"   Total Products: {fotus_result.total_products}")
        report.append(f"   Mapped Images: {fotus_result.mapped_images}")
        report.append(f"   With Real Images: {fotus_result.with_real_images}")
        
        if fotus_result.total_products > 0:
            coverage = (fotus_result.mapped_images / fotus_result.total_products) * 100
            report.append(f"   Coverage: {coverage:.1f}%")
        
        if fotus_result.errors:
            report.append(f"   Errors: {len(fotus_result.errors)}")
        
        report.append("")
        report.append("="*70)
        
        return "\n".join(report)


def main():
    """Run advanced image mapping"""
    
    base_path = Path(__file__).parent.parent
    
    mapper = AdvancedImageMapper(base_path)
    
    # Analyze NeoSolar
    neosolar_result = mapper.analyze_neosolar()
    
    # Extract FOTUS CSV data
    fotus_csv_data = mapper.extract_fotus_csv_data()
    
    # Sync FOTUS images
    fotus_result = mapper.sync_fotus_by_csv_mapping()
    
    # Generate report
    report = mapper.generate_report(neosolar_result, fotus_result)
    print(report)
    
    # Save report
    report_file = base_path / "ADVANCED_IMAGE_MAPPING_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n[Mapper] 📄 Report saved to {report_file.name}")


if __name__ == "__main__":
    main()
