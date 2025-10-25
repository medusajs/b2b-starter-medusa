"""
Filter out invalid products (FOTUS and others with bad data)
Create a clean inventory for enrichment
"""
import json
from pathlib import Path
from typing import Dict, List, Any

def is_valid_product(product: Dict[str, Any]) -> bool:
    """Check if product has valid data for enrichment"""
    
    # Skip FOTUS (data is completely broken)
    if product.get('distributor') == 'FOTUS':
        return False
    
    # Must have valid manufacturer
    manufacturer = product.get('manufacturer', '').strip()
    if not manufacturer or manufacturer in ['Unknown', 'PARAFUSO', 'CABO', 'KIT', 'DUTO', 'GRAMPO']:
        return False
    
    # Must have valid price
    price = product.get('price', '').strip()
    if not price or price == 'R$ 0,00':
        return False
    
    # Must have category
    if not product.get('category'):
        return False
    
    return True

def main():
    print("🔍 Filtering valid products...\n")
    
    # Find latest complete inventory
    inventory_dir = Path('complete-inventory')
    if not inventory_dir.exists():
        print("❌ No complete-inventory directory found!")
        return
    
    inventory_files = list(inventory_dir.glob('complete_products_*.json'))
    if not inventory_files:
        print("❌ No inventory files found!")
        return
    
    latest_file = max(inventory_files, key=lambda p: p.stat().st_mtime)
    print(f"📂 Loading: {latest_file.name}")
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"  Total products: {len(products):,}")
    
    # Filter valid products
    valid_products = []
    stats = {
        'fotus': 0,
        'invalid_manufacturer': 0,
        'invalid_price': 0,
        'missing_category': 0
    }
    
    for product in products:
        if product.get('distributor') == 'FOTUS':
            stats['fotus'] += 1
            continue
        
        manufacturer = product.get('manufacturer', '').strip()
        if not manufacturer or manufacturer in ['Unknown', 'PARAFUSO', 'CABO', 'KIT', 'DUTO', 'GRAMPO']:
            stats['invalid_manufacturer'] += 1
            continue
        
        price = product.get('price', '').strip()
        if not price or price == 'R$ 0,00':
            stats['invalid_price'] += 1
            continue
        
        if not product.get('category'):
            stats['missing_category'] += 1
            continue
        
        valid_products.append(product)
    
    print(f"\n📊 Filtering Results:")
    print(f"  ✅ Valid: {len(valid_products):,}")
    print(f"  ❌ Skipped:")
    print(f"     - FOTUS (broken data): {stats['fotus']:,}")
    print(f"     - Invalid manufacturer: {stats['invalid_manufacturer']:,}")
    print(f"     - Invalid price: {stats['invalid_price']:,}")
    print(f"     - Missing category: {stats['missing_category']:,}")
    
    # Save valid products
    output_file = inventory_dir / 'valid_products_filtered.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(valid_products, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Saved: {output_file.name}")
    print(f"   {len(valid_products):,} valid products ready for enrichment")
    
    # Distribution stats
    distributors = {}
    categories = {}
    for p in valid_products:
        dist = p.get('distributor', 'Unknown')
        distributors[dist] = distributors.get(dist, 0) + 1
        cat = p.get('category', 'Unknown')
        categories[cat] = categories.get(cat, 0) + 1
    
    print(f"\n📊 Valid Products by Distributor:")
    for dist, count in sorted(distributors.items(), key=lambda x: x[1], reverse=True):
        pct = count / len(valid_products) * 100
        print(f"  - {dist}: {count:,} ({pct:.1f}%)")
    
    print(f"\n📊 Valid Products by Category:")
    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True)[:10]:
        pct = count / len(valid_products) * 100
        print(f"  - {cat}: {count:,} ({pct:.1f}%)")

if __name__ == "__main__":
    main()
