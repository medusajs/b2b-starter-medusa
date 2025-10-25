#!/usr/bin/env python3
"""
COMPLETE INVENTORY ENRICHER
============================

Adapts the enrichment engine to work with complete inventory (18 categories).
Reuses existing enrichment logic from enrich_schemas_with_llm.py

Author: YSH Medusa Data Team
Date: 2025-01-14
"""

import json
import sys
from pathlib import Path
from datetime import datetime
import importlib.util

def find_latest_inventory():
    """Find the latest complete inventory file."""
    inventory_dir = Path("complete-inventory")
    
    if not inventory_dir.exists():
        print("❌ No complete-inventory directory found!")
        return None
    
    # First try filtered file (preferred - has only valid products)
    filtered_file = inventory_dir / "valid_products_filtered.json"
    if filtered_file.exists():
        print("📂 Using filtered valid products")
        return filtered_file
    
    json_files = list(inventory_dir.glob("complete_products_*.json"))
    
    if not json_files:
        print("❌ No complete inventory files found!")
        return None
    
    latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
    return latest_file

def load_enrichment_module():
    """Load the enrichment module dynamically."""
    module_path = Path("enrich_schemas_with_llm.py")
    
    if not module_path.exists():
        print("❌ Enrichment module not found!")
        return None
    
    spec = importlib.util.spec_from_file_location("enrichment", module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    return module

def main():
    """Main execution."""
    print("="*80)
    print("  COMPLETE INVENTORY ENRICHMENT")
    print("="*80)
    
    # Find latest inventory
    print("\n📂 Finding latest inventory...")
    inventory_file = find_latest_inventory()
    
    if not inventory_file:
        sys.exit(1)
    
    print(f"  ✅ Found: {inventory_file.name}")
    
    # Load products
    print("\n📊 Loading products...")
    with open(inventory_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"  ✅ Loaded {len(products):,} products")
    
    # Load enrichment module
    print("\n🔧 Loading enrichment engine...")
    enrichment_module = load_enrichment_module()
    
    if not enrichment_module:
        sys.exit(1)
    
    print("  ✅ Enrichment engine loaded")
    
    # Run enrichment
    print("\n🔄 Starting enrichment process...")
    print("  This will take several minutes...")
    
    try:
        enricher = enrichment_module.SchemaEnricher(str(inventory_file))
        enricher.load_products()
        enricher.enrich_all_products()
        
        # Export enriched data
        output_dir = Path("enriched-complete")
        enricher.export_enriched_schemas(str(output_dir))
        
        print("\n✅ Enrichment complete!")
        print(f"📂 Output: {output_dir}/")
        
    except Exception as e:
        print(f"\n❌ Enrichment failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
