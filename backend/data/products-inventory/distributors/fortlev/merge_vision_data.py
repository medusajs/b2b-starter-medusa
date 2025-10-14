#!/usr/bin/env python3
"""
Merge vision analysis results back into original kit data.
Updates manufacturer fields with vision-extracted data.
"""

import json
from pathlib import Path
from typing import Dict, List, Any


def merge_vision_data(enhanced_kit: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge vision analysis data into kit components.
    
    Args:
        enhanced_kit: Kit with vision_analysis fields
    
    Returns:
        Kit with updated manufacturer and specs
    """
    merged = enhanced_kit.copy()
    
    # Process panel
    panel = merged['components']['panel']
    panel_vision = panel.get('vision_analysis', {})
    
    if panel_vision:
        gemma_panel = panel_vision.get('gemma3', {})
        gpt_panel = panel_vision.get('gpt_oss_ocr', {})
        
        # Update manufacturer (prioritize Gemma3)
        if gemma_panel.get('manufacturer'):
            panel['manufacturer'] = gemma_panel['manufacturer']
        
        # Update model
        if gemma_panel.get('model'):
            panel['model'] = gemma_panel['model']
        elif gpt_panel.get('model'):
            panel['model'] = gpt_panel['model']
        
        # Update power rating
        if gemma_panel.get('power_w'):
            panel['power_w'] = gemma_panel['power_w']
        elif gpt_panel.get('power_w'):
            panel['power_w'] = gpt_panel['power_w']
        
        # Add technology info
        if gemma_panel.get('technology'):
            panel['technology'] = gemma_panel['technology']
        
        if gemma_panel.get('cells'):
            panel['cells'] = gemma_panel['cells']
        
        # Add additional specs
        if gemma_panel.get('additional_specs'):
            panel.setdefault('specs', {}).update(
                gemma_panel['additional_specs']
            )
    
    # Process inverter
    inverter = merged['components']['inverter']
    inverter_vision = inverter.get('vision_analysis', {})
    
    if inverter_vision:
        gemma_inv = inverter_vision.get('gemma3', {})
        gpt_inv = inverter_vision.get('gpt_oss_ocr', {})
        
        # Update manufacturer (prioritize Gemma3)
        if gemma_inv.get('manufacturer'):
            inverter['manufacturer'] = gemma_inv['manufacturer']
        
        # Update model
        if gemma_inv.get('model'):
            inverter['model'] = gemma_inv['model']
        elif gpt_inv.get('model'):
            inverter['model'] = gpt_inv['model']
        
        # Update power rating
        if gemma_inv.get('power_kw'):
            inverter['power_kw'] = gemma_inv['power_kw']
        elif gpt_inv.get('power_kw'):
            inverter['power_kw'] = gpt_inv['power_kw']
        
        # Add type info
        if gemma_inv.get('type'):
            inverter['type'] = gemma_inv['type']
        
        # Add voltage
        if gemma_inv.get('voltage'):
            inverter['voltage'] = gemma_inv['voltage']
        elif gpt_inv.get('voltage'):
            inverter['voltage'] = gpt_inv['voltage']
        
        # Add MPPT info
        if gemma_inv.get('mppt'):
            inverter['mppt'] = gemma_inv['mppt']
        elif gpt_inv.get('mppt'):
            inverter['mppt'] = gpt_inv['mppt']
        
        # Add additional specs
        if gemma_inv.get('additional_specs'):
            inverter.setdefault('specs', {}).update(
                gemma_inv['additional_specs']
            )
    
    return merged


def generate_statistics(kits: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate statistics about vision-enhanced data."""
    stats = {
        'total_kits': len(kits),
        'panel_stats': {
            'manufacturers_identified': 0,
            'models_identified': 0,
            'power_ratings_extracted': 0,
            'unknown_remaining': 0
        },
        'inverter_stats': {
            'manufacturers_identified': 0,
            'models_identified': 0,
            'power_ratings_extracted': 0,
            'unknown_remaining': 0
        },
        'manufacturers': {
            'panels': {},
            'inverters': {}
        }
    }
    
    for kit in kits:
        panel = kit['components']['panel']
        inverter = kit['components']['inverter']
        
        # Panel stats
        if panel.get('manufacturer') and panel['manufacturer'] != 'Unknown':
            stats['panel_stats']['manufacturers_identified'] += 1
            mfr = panel['manufacturer']
            stats['manufacturers']['panels'][mfr] = \
                stats['manufacturers']['panels'].get(mfr, 0) + 1
        else:
            stats['panel_stats']['unknown_remaining'] += 1
        
        if panel.get('model'):
            stats['panel_stats']['models_identified'] += 1
        
        if panel.get('power_w'):
            stats['panel_stats']['power_ratings_extracted'] += 1
        
        # Inverter stats
        if inverter.get('manufacturer') and inverter['manufacturer'] != 'Unknown':
            stats['inverter_stats']['manufacturers_identified'] += 1
            mfr = inverter['manufacturer']
            stats['manufacturers']['inverters'][mfr] = \
                stats['manufacturers']['inverters'].get(mfr, 0) + 1
        else:
            stats['inverter_stats']['unknown_remaining'] += 1
        
        if inverter.get('model'):
            stats['inverter_stats']['models_identified'] += 1
        
        if inverter.get('power_kw'):
            stats['inverter_stats']['power_ratings_extracted'] += 1
    
    return stats


def main():
    """Main execution."""
    print("=== Vision Data Merge Tool ===\n")
    
    # Paths
    base_dir = Path(__file__).parent
    enhanced_file = base_dir / "fortlev-kits-enhanced.json"
    output_file = base_dir / "fortlev-kits-final.json"
    stats_file = base_dir / "vision-stats.json"
    
    if not enhanced_file.exists():
        print(f"Error: {enhanced_file} not found")
        print("Run vision_processor.py first to generate enhanced data.")
        return
    
    # Load enhanced kits
    print("Loading enhanced kit data...")
    with open(enhanced_file, 'r', encoding='utf-8') as f:
        enhanced_kits = json.load(f)
    
    print(f"Loaded {len(enhanced_kits)} kits\n")
    
    # Merge vision data
    print("Merging vision analysis into kit data...")
    merged_kits = []
    for kit in enhanced_kits:
        merged = merge_vision_data(kit)
        merged_kits.append(merged)
    
    # Generate statistics
    print("Generating statistics...")
    stats = generate_statistics(merged_kits)
    
    # Save merged kits
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_kits, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved merged kits to {output_file}")
    
    # Save statistics
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    print(f"✓ Saved statistics to {stats_file}")
    
    # Display statistics
    print("\n=== Vision Enhancement Statistics ===\n")
    print(f"Total Kits: {stats['total_kits']}")
    
    print("\nPanels:")
    print(f"  Manufacturers Identified: {stats['panel_stats']['manufacturers_identified']}")
    print(f"  Models Identified: {stats['panel_stats']['models_identified']}")
    print(f"  Power Ratings Extracted: {stats['panel_stats']['power_ratings_extracted']}")
    print(f"  Unknown Remaining: {stats['panel_stats']['unknown_remaining']}")
    
    print("\nInverters:")
    print(f"  Manufacturers Identified: {stats['inverter_stats']['manufacturers_identified']}")
    print(f"  Models Identified: {stats['inverter_stats']['models_identified']}")
    print(f"  Power Ratings Extracted: {stats['inverter_stats']['power_ratings_extracted']}")
    print(f"  Unknown Remaining: {stats['inverter_stats']['unknown_remaining']}")
    
    print("\nPanel Manufacturers:")
    for mfr, count in sorted(stats['manufacturers']['panels'].items()):
        print(f"  {mfr}: {count}")
    
    print("\nInverter Manufacturers:")
    for mfr, count in sorted(stats['manufacturers']['inverters'].items()):
        print(f"  {mfr}: {count}")
    
    # Calculate improvement
    original_unknown_panels = 73
    original_unknown_inverters = 165
    
    identified_panels = original_unknown_panels - stats['panel_stats']['unknown_remaining']
    identified_inverters = original_unknown_inverters - stats['inverter_stats']['unknown_remaining']
    
    if identified_panels > 0 or identified_inverters > 0:
        print("\n=== Improvement from Vision AI ===")
        if identified_panels > 0:
            improvement_pct = (identified_panels / original_unknown_panels) * 100
            print(f"Panels: {identified_panels} unknown resolved ({improvement_pct:.1f}% improvement)")
        if identified_inverters > 0:
            improvement_pct = (identified_inverters / original_unknown_inverters) * 100
            print(f"Inverters: {identified_inverters} unknown resolved ({improvement_pct:.1f}% improvement)")


if __name__ == "__main__":
    main()
