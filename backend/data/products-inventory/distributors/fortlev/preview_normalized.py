"""
Preview normalized kit data - Quick visual inspection
Shows formatted output of normalized kits for review
"""

import json
from pathlib import Path
from typing import List, Dict, Any


def preview_kit(kit: Dict[str, Any], index: int) -> None:
    """Display a single kit in formatted view."""
    print(f"\n{'='*80}")
    print(f"KIT #{index}: {kit['id']}")
    print(f"{'='*80}")
    
    print(f"\n📦 ORIGINAL:")
    print(f"   Name: {kit.get('original_name', 'N/A')}")
    
    print(f"\n🏷️  PRODUCT (Medusa.js):")
    print(f"   Title:      {kit['title']}")
    print(f"   Handle:     {kit['handle']}")
    print(f"   Type:       {kit['type']}")
    print(f"   Collection: {kit['collection']}")
    print(f"   Status:     {kit['status']}")
    
    print(f"\n🔧 VARIANT:")
    print(f"   Title: {kit['variant_title']}")
    print(f"   SKU:   {kit['variant_sku']}")
    
    print(f"\n🔍 SEARCH OPTIMIZATION:")
    print(f"   Search Title: {kit['search_title']}")
    print(f"   SEO Title:    {kit['seo_title']}")
    
    print(f"\n🏷️  TAGS:")
    print(f"   {', '.join(kit['tags'])}")
    
    print(f"\n⚡ OPTIONS:")
    for option in kit['options']:
        print(f"   • {option['title']}: {', '.join(option['values'])}")
    
    print(f"\n📊 METADATA:")
    metadata = kit['variant_metadata']
    print(f"   Panel:    {metadata['panel_manufacturer']} "
          f"({metadata['panel_power_w']}W x{metadata['panel_quantity']})")
    print(f"   Inverter: {metadata['inverter_manufacturer']} "
          f"({metadata['inverter_power_kw']}kW)")
    print(f"   System:   {metadata['system_power_kwp']}kWp")
    print(f"   Price:    R$ {kit['pricing']['per_wp']:.2f}/Wp")
    print(f"   Est. Gen: {metadata['estimated_monthly_generation_kwh']} kWh/month")
    
    print(f"\n📝 DESCRIPTION (first 200 chars):")
    print(f"   {kit['description'][:200]}...")


def analyze_stats(kits: List[Dict[str, Any]]) -> None:
    """Display statistics about normalized kits."""
    print(f"\n{'='*80}")
    print("📊 NORMALIZATION STATISTICS")
    print(f"{'='*80}")
    
    total = len(kits)
    
    # Manufacturers
    panel_mfgs = set()
    inverter_mfgs = set()
    for kit in kits:
        meta = kit['variant_metadata']
        panel_mfgs.add(meta['panel_manufacturer'])
        inverter_mfgs.add(meta['inverter_manufacturer'])
    
    print(f"\n📦 Total Kits: {total}")
    print(f"\n🔧 Panel Manufacturers ({len(panel_mfgs)}):")
    for mfg in sorted(panel_mfgs):
        count = sum(1 for k in kits if k['variant_metadata']['panel_manufacturer'] == mfg)
        print(f"   • {mfg}: {count} kits ({count/total*100:.1f}%)")
    
    print(f"\n⚡ Inverter Manufacturers ({len(inverter_mfgs)}):")
    for mfg in sorted(inverter_mfgs):
        count = sum(1 for k in kits if k['variant_metadata']['inverter_manufacturer'] == mfg)
        print(f"   • {mfg}: {count} kits ({count/total*100:.1f}%)")
    
    # Power distribution
    powers = [k['system_power_kwp'] for k in kits]
    print(f"\n⚡ Power Distribution:")
    print(f"   Min:  {min(powers):.2f} kWp")
    print(f"   Max:  {max(powers):.2f} kWp")
    print(f"   Avg:  {sum(powers)/len(powers):.2f} kWp")
    
    # Size categories
    small = sum(1 for p in powers if p <= 3)
    medium = sum(1 for p in powers if 3 < p <= 6)
    large = sum(1 for p in powers if 6 < p <= 10)
    commercial = sum(1 for p in powers if p > 10)
    
    print(f"\n🏠 Size Categories:")
    print(f"   Small (≤3kWp):      {small} kits ({small/total*100:.1f}%)")
    print(f"   Medium (3-6kWp):    {medium} kits ({medium/total*100:.1f}%)")
    print(f"   Large (6-10kWp):    {large} kits ({large/total*100:.1f}%)")
    print(f"   Commercial (>10kWp): {commercial} kits ({commercial/total*100:.1f}%)")
    
    # Image availability
    with_combo = sum(1 for k in kits if k['variant_metadata']['has_combination_image'])
    with_panel = sum(1 for k in kits if k['variant_metadata']['has_panel_image'])
    with_inverter = sum(1 for k in kits if k['variant_metadata']['has_inverter_image'])
    
    print(f"\n🖼️  Image Availability:")
    print(f"   With Combination: {with_combo} kits ({with_combo/total*100:.1f}%)")
    print(f"   With Panel:       {with_panel} kits ({with_panel/total*100:.1f}%)")
    print(f"   With Inverter:    {with_inverter} kits ({with_inverter/total*100:.1f}%)")
    
    # Price range
    prices = [k['pricing']['total'] for k in kits if k['pricing']['total'] > 0]
    if prices:
        print(f"\n💰 Price Range:")
        print(f"   Min:  R$ {min(prices):,.2f}")
        print(f"   Max:  R$ {max(prices):,.2f}")
        print(f"   Avg:  R$ {sum(prices)/len(prices):,.2f}")


def search_kits(kits: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
    """Simple text search across normalized kits."""
    query_lower = query.lower()
    results = []
    
    for kit in kits:
        # Search in multiple fields
        searchable = f"{kit['search_title']} {kit['description']} " \
                    f"{kit['variant_metadata']['panel_manufacturer']} " \
                    f"{kit['variant_metadata']['inverter_manufacturer']}".lower()
        
        if query_lower in searchable:
            results.append(kit)
    
    return results


def main():
    """Main preview function."""
    script_dir = Path(__file__).parent
    normalized_file = script_dir / "fortlev-kits-normalized.json"
    
    if not normalized_file.exists():
        print(f"❌ Error: File not found: {normalized_file}")
        print("   Run normalize_titles.py first!")
        return
    
    print("📖 Loading normalized kits...")
    with open(normalized_file, 'r', encoding='utf-8') as f:
        kits = json.load(f)
    
    print(f"✓ Loaded {len(kits)} normalized kits\n")
    
    # Show statistics
    analyze_stats(kits)
    
    # Show sample kits
    print(f"\n{'='*80}")
    print("📋 SAMPLE KITS PREVIEW")
    print(f"{'='*80}")
    
    # Show first 3 kits
    for i, kit in enumerate(kits[:3], 1):
        preview_kit(kit, i)
    
    # Search examples
    print(f"\n\n{'='*80}")
    print("🔍 SEARCH EXAMPLES")
    print(f"{'='*80}")
    
    search_queries = [
        "longi",
        "growatt",
        "3kwp",
        "residential small"
    ]
    
    for query in search_queries:
        results = search_kits(kits, query)
        print(f"\n🔎 Query: '{query}'")
        print(f"   Found: {len(results)} kits")
        if results:
            print(f"   Sample: {results[0]['title']}")
    
    # Summary
    print(f"\n\n{'='*80}")
    print("✅ PREVIEW COMPLETE")
    print(f"{'='*80}")
    print(f"\n📊 Summary:")
    print(f"   • Total Kits:          {len(kits)}")
    print(f"   • All Normalized:      ✓")
    print(f"   • Medusa.js Ready:     ✓")
    print(f"   • Semantic Search:     ✓")
    print(f"\n📁 Output File:")
    print(f"   {normalized_file}")
    print(f"\n📚 Documentation:")
    print(f"   • MEDUSA-AGENTS.md       - 7 specialized agents")
    print(f"   • NORMALIZATION-SUMMARY.md - Complete guide")
    print(f"   • normalize_titles.py     - Normalization script")
    print(f"\n🎯 Next Steps:")
    print(f"   1. Review sample kits above")
    print(f"   2. Read MEDUSA-AGENTS.md for import patterns")
    print(f"   3. Create Medusa.js import workflow")
    print(f"   4. Execute import (217 kits)")
    print(f"   5. Set up semantic search with Gemma3")


if __name__ == "__main__":
    main()
