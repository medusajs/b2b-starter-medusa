"""
Rebuild SKU Mapping from Unified Schemas

This script extracts SKUs from the unified product files and maps them to
the consolidated product IDs. It handles all categories and ensures maximum coverage.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
UNIFIED_SCHEMAS_DIR = PROJECT_ROOT / 'src' / 'data' / 'catalog' / 'unified_schemas'
OUTPUT_FILE = PROJECT_ROOT / 'data' / 'catalog' / 'data' / 'SKU_MAPPING.json'

def extract_sku_from_text(text):
    """Extract numeric SKU from text (image paths, IDs, etc.)"""
    if not text:
        return None
    
    # Try to find numeric SKU patterns
    patterns = [
        r'/(\d{6,})\.(?:jpg|png|webp)',  # From image paths
        r'[-_](\d{6,})(?:[-_.]|$)',      # From IDs with separators
        r'^(\d{6,})$',                   # Direct numeric
    ]
    
    for pattern in patterns:
        match = re.search(pattern, str(text))
        if match:
            return match.group(1)
    
    return None

def process_unified_file(filepath):
    """Process a unified schema file and extract SKU mappings"""
    mappings = {}
    stats = {'total': 0, 'with_sku': 0, 'with_image': 0}
    
    print(f"📄 Processing {filepath.name}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    for product in products:
        stats['total'] += 1
        product_id = product.get('id')
        
        if not product_id:
            continue
        
        # Try to extract SKU from multiple sources
        sku = None
        image_path = None
        
        # 1. Try from image field
        image = product.get('image') or product.get('image_url', '')
        if image:
            sku = extract_sku_from_text(image)
            if sku:
                image_path = image
                stats['with_image'] += 1
        
        # 2. Try from product ID
        if not sku:
            sku = extract_sku_from_text(product_id)
        
        # 3. Try from metadata
        if not sku and 'metadata' in product:
            source_file = product['metadata'].get('source_file', '')
            sku = extract_sku_from_text(source_file)
        
        # 4. Try from sku field directly
        if not sku and 'sku' in product:
            sku = str(product['sku'])
        
        if sku:
            stats['with_sku'] += 1
            
            # Determine distributor from ID
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
                'image': image_path or '',
                'name': product.get('name', '')[:100]  # Truncate long names
            }
    
    print(f"   ✅ Found {stats['with_sku']}/{stats['total']} products with SKUs ({stats['with_sku']/stats['total']*100:.1f}%)")
    
    return mappings, stats

def main():
    print("🚀 Rebuilding SKU Mapping from Unified Schemas...\n")
    
    all_mappings = {}
    total_stats = defaultdict(int)
    category_stats = {}
    
    # Process all unified schema files
    unified_files = sorted(UNIFIED_SCHEMAS_DIR.glob('*_unified.json'))
    
    for filepath in unified_files:
        category = filepath.stem.replace('_unified', '')
        mappings, stats = process_unified_file(filepath)
        
        all_mappings.update(mappings)
        total_stats['total'] += stats['total']
        total_stats['with_sku'] += stats['with_sku']
        total_stats['with_image'] += stats['with_image']
        
        category_stats[category] = stats
    
    # Save mappings
    output_data = {
        'version': '2.0',
        'generated_at': '2025-01-20T00:00:00Z',
        'total_mappings': len(all_mappings),
        'total_products': total_stats['total'],
        'coverage_percent': round(len(all_mappings) / total_stats['total'] * 100, 2) if total_stats['total'] > 0 else 0,
        'stats': {
            'total_products': total_stats['total'],
            'with_sku': total_stats['with_sku'],
            'with_image': total_stats['with_image'],
            'by_category': category_stats
        },
        'mappings': all_mappings
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ SKU mapping saved to: {OUTPUT_FILE}")
    print(f"\n📊 Summary:")
    print(f"   - Total products processed: {total_stats['total']}")
    print(f"   - Products with SKUs: {total_stats['with_sku']} ({total_stats['with_sku']/total_stats['total']*100:.1f}%)")
    print(f"   - Products with images: {total_stats['with_image']} ({total_stats['with_image']/total_stats['total']*100:.1f}%)")
    print(f"   - Total mappings: {len(all_mappings)}")
    print(f"   - Coverage: {output_data['coverage_percent']}%")
    
    print(f"\n📦 By Category:")
    for category, stats in sorted(category_stats.items()):
        coverage = stats['with_sku'] / stats['total'] * 100 if stats['total'] > 0 else 0
        print(f"   - {category:20s}: {stats['with_sku']:4d}/{stats['total']:4d} ({coverage:5.1f}%)")
    
    print(f"\n🎯 SKU mapping rebuilt successfully!")

if __name__ == '__main__':
    main()
