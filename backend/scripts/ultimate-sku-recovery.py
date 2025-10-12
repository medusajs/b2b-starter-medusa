"""
Ultimate SKU Recovery from Raw Sources

This script processes ALL raw data sources to recover SKU mappings:
1. NeoSolar CSV with image URLs
2. ODEX/Solfácil/FOTUS JSONs
3. IMAGE_MAP.json with 854 verified SKUs
4. Unified schemas
5. Root catalog files

Extracts product IDs from URLs and maps them to SKUs found in image paths.
"""

import json
import csv
import re
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse, parse_qs

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
CATALOG_DIR = PROJECT_ROOT / 'data' / 'catalog' / 'data' / 'catalog'
UNIFIED_DIR = PROJECT_ROOT / 'src' / 'data' / 'catalog' / 'unified_schemas'
IMAGE_MAP_PATH = PROJECT_ROOT / 'static' / 'images-catálogo_distribuidores' / 'IMAGE_MAP.json'
OUTPUT_FILE = PROJECT_ROOT / 'data' / 'catalog' / 'data' / 'SKU_MAPPING.json'

stats = defaultdict(int)

def extract_product_id_from_url(url):
    """Extract product ID from NeoSolar URLs like /produto/22916"""
    if not url:
        return None
    match = re.search(r'/produto/(\d+)', url)
    return match.group(1) if match else None

def extract_sku_from_text(text):
    """Extract numeric SKU from text"""
    if not text:
        return None
    
    patterns = [
        r'/(\d{6,})\.(?:jpg|png|webp)',  # From image paths
        r'files/([a-f0-9-]+)/',           # UUID from NeoSolar URLs
        r'[-_](\d{6,})(?:[-_.]|$)',      # With separators
        r'^(\d{6,})$',                   # Direct numeric
    ]
    
    for pattern in patterns:
        match = re.search(pattern, str(text))
        if match:
            sku = match.group(1)
            # Only return if it looks like a SKU (6+ digits, not UUID)
            if sku.isdigit() and len(sku) >= 6:
                return sku
    
    return None

def process_neosolar_csv():
    """Process NeoSolar CSV with URLs and image paths"""
    print("\n📦 Processing NeoSolar CSV...")
    
    csv_path = CATALOG_DIR / 'distributor_datasets' / 'neosolar' / 'neosolar_catalog.csv'
    if not csv_path.exists():
        print(f"   ⚠️  Not found: {csv_path}")
        return {}
    
    mappings = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        
        for row in reader:
            # First column has product URL
            url_col = headers[0] if headers else None
            img_col = headers[-1] if headers else None  # Last column has image URL
            
            if url_col and url_col in row:
                product_url = row[url_col]
                product_id = extract_product_id_from_url(product_url)
                
                if product_id:
                    unified_id = f"neosolar_inverters_{product_id}"
                    
                    # Try to get SKU from image URL
                    sku = None
                    if img_col and img_col in row:
                        image_url = row[img_col]
                        # NeoSolar images have UUID, not SKU
                        # We'll match these later with IMAGE_MAP
                        pass
                    
                    # For now, store the product ID mapping
                    mappings[unified_id] = {
                        'product_id': product_id,
                        'distributor': 'NeoSolar',
                        'source': 'csv',
                        'original_id': unified_id
                    }
                    stats['neosolar_csv'] += 1
    
    print(f"   ✅ Found {len(mappings)} NeoSolar product IDs")
    return mappings

def process_distributor_jsons():
    """Process ODEX, Solfácil, FOTUS JSON files"""
    print("\n📦 Processing distributor JSON files...")
    
    mappings = {}
    
    distributors = [
        ('ODEX', CATALOG_DIR / 'distributor_datasets' / 'odex'),
        ('Solfácil', CATALOG_DIR / 'distributor_datasets' / 'solfacil'),
        ('FOTUS', CATALOG_DIR / 'distributor_datasets' / 'fotus'),
    ]
    
    for distributor, dir_path in distributors:
        if not dir_path.exists():
            continue
        
        for json_file in dir_path.glob('*.json'):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    products = json.load(f)
                
                if not isinstance(products, list):
                    continue
                
                for product in products:
                    product_id = product.get('id')
                    if not product_id:
                        continue
                    
                    # Extract SKU from image or ID
                    sku = None
                    image = product.get('image') or product.get('image_url', '')
                    
                    if image:
                        sku = extract_sku_from_text(image)
                    
                    if not sku:
                        sku = extract_sku_from_text(product_id)
                    
                    if not sku and 'sku' in product:
                        sku = str(product['sku'])
                    
                    if sku:
                        mappings[product_id] = {
                            'sku': sku,
                            'distributor': distributor,
                            'image': image,
                            'source': 'distributor_json'
                        }
                        stats[f'{distributor.lower()}_json'] += 1
            
            except Exception as e:
                print(f"   ⚠️  Error in {json_file.name}: {e}")
    
    print(f"   ✅ Found {len(mappings)} products from distributor JSONs")
    return mappings

def load_image_map():
    """Load IMAGE_MAP.json with all verified SKU→image mappings"""
    print("\n📸 Loading IMAGE_MAP.json...")
    
    with open(IMAGE_MAP_PATH, 'r', encoding='utf-8') as f:
        image_map = json.load(f)
    
    mappings = {}
    for sku, data in image_map.get('mappings', {}).items():
        images = data.get('images', {})
        if isinstance(images, dict):
            image_path = images.get('original', '')
            if image_path:
                mappings[sku] = {
                    'sku': sku,
                    'image': image_path,
                    'distributor': data.get('distributor', 'UNKNOWN'),
                    'category': data.get('category', ''),
                    'source': 'image_map'
                }
                stats['image_map'] += 1
    
    print(f"   ✅ Loaded {len(mappings)} SKU→image mappings")
    return mappings

def process_unified_schemas():
    """Process unified schemas to get consolidated IDs"""
    print("\n📦 Processing unified schemas...")
    
    mappings = {}
    
    for schema_file in UNIFIED_DIR.glob('*_unified.json'):
        with open(schema_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            if not product_id:
                continue
            
            # Extract SKU
            sku = None
            image = product.get('image') or product.get('image_url', '')
            
            if image:
                sku = extract_sku_from_text(image)
            
            if not sku:
                sku = extract_sku_from_text(product_id)
            
            # Extract product number from NeoSolar IDs
            if not sku and 'neosolar' in product_id:
                match = re.search(r'neosolar_\w+_(\d+)', product_id)
                if match:
                    # This is the product ID, not SKU
                    # We'll use it to match with other sources
                    mappings[product_id] = {
                        'product_number': match.group(1),
                        'distributor': 'NeoSolar',
                        'image': image,
                        'source': 'unified_schema'
                    }
                    stats['unified_neosolar'] += 1
            
            elif sku:
                # Determine distributor
                distributor = 'UNKNOWN'
                if 'neosolar' in product_id.lower():
                    distributor = 'NeoSolar'
                elif 'odex' in product_id.lower():
                    distributor = 'ODEX'
                elif 'solfacil' in product_id.lower():
                    distributor = 'Solfácil'
                elif 'fotus' in product_id.lower():
                    distributor = 'FOTUS'
                
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': distributor,
                    'image': image,
                    'source': 'unified_schema'
                }
                stats['unified_with_sku'] += 1
    
    print(f"   ✅ Found {len(mappings)} products from unified schemas")
    return mappings

def merge_all_mappings(neosolar_csv, distributor_jsons, image_map_skus, unified):
    """Merge all mappings with intelligent matching"""
    print("\n🔀 Merging all mappings...")
    
    final_mappings = {}
    
    # 1. Start with IMAGE_MAP (most reliable - 854 verified SKUs)
    for sku, data in image_map_skus.items():
        final_mappings[sku] = {
            'sku': sku,
            'distributor': data['distributor'],
            'image': data['image'],
            'sources': ['image_map']
        }
    
    # 2. Add distributor JSON mappings (already have SKUs)
    for product_id, data in distributor_jsons.items():
        sku = data.get('sku')
        if sku:
            if sku not in final_mappings:
                final_mappings[product_id] = {
                    'sku': sku,
                    'distributor': data['distributor'],
                    'image': data.get('image', ''),
                    'sources': ['distributor_json']
                }
            else:
                # Link the product ID to existing SKU
                final_mappings[product_id] = {
                    'sku': sku,
                    'distributor': data['distributor'],
                    'image': data.get('image', ''),
                    'sources': ['distributor_json', 'image_map']
                }
    
    # 3. Add unified schema mappings with SKUs
    for product_id, data in unified.items():
        sku = data.get('sku')
        if sku:
            if product_id not in final_mappings:
                final_mappings[product_id] = {
                    'sku': sku,
                    'distributor': data['distributor'],
                    'image': data.get('image', ''),
                    'sources': ['unified_schema']
                }
        
        # Also add NeoSolar product numbers for future matching
        product_num = data.get('product_number')
        if product_num:
            final_mappings[product_id] = {
                'product_number': product_num,
                'distributor': 'NeoSolar',
                'sources': ['unified_schema']
            }
    
    print(f"   ✅ Merged into {len(final_mappings)} total mappings")
    return final_mappings

def main():
    print("🚀 Ultimate SKU Recovery Process\n")
    print("=" * 80)
    
    # Process all sources
    neosolar_csv = process_neosolar_csv()
    distributor_jsons = process_distributor_jsons()
    image_map_skus = load_image_map()
    unified = process_unified_schemas()
    
    # Merge everything
    final_mappings = merge_all_mappings(
        neosolar_csv,
        distributor_jsons,
        image_map_skus,
        unified
    )
    
    # Calculate statistics
    skus_count = len([m for m in final_mappings.values() if 'sku' in m])
    product_numbers = len([m for m in final_mappings.values() if 'product_number' in m])
    
    # Save output
    output = {
        'version': '4.0-ultimate',
        'generated_at': '2025-01-20T00:00:00Z',
        'total_mappings': len(final_mappings),
        'stats': {
            'with_sku': skus_count,
            'with_product_number': product_numbers,
            'by_source': dict(stats)
        },
        'mappings': final_mappings
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print(f"✅ Ultimate mapping saved to: {OUTPUT_FILE}")
    print(f"\n📊 Final Summary:")
    print(f"   - Total mappings: {len(final_mappings)}")
    print(f"   - With SKU: {skus_count}")
    print(f"   - With product number: {product_numbers}")
    print(f"\n📈 By Source:")
    for source, count in sorted(stats.items()):
        print(f"   - {source:25s}: {count:4d}")
    
    print(f"\n🎯 Recovery complete! Coverage should be significantly higher now.")

if __name__ == '__main__':
    main()
