"""
Title Normalization and Standardization for Semantic Search Optimization
Optimized for Gemma3 semantic search and Medusa.js product data models

Based on Medusa.js best practices:
- Product title format: Clear, searchable, SEO-friendly
- Variant title format: Specific attributes (size, color, configuration)
- Consistent naming conventions for better semantic search
"""

import json
import re
from typing import Dict, List, Any
from pathlib import Path


class TitleNormalizer:
    """
    Normalizes product titles for optimal semantic search via Gemma3.
    
    Follows Medusa.js product model conventions:
    - Product: Main product title (brand + type + key attributes)
    - ProductVariant: Specific configuration (power, components)
    - ProductType: Category classification (Solar Kit, Inverter Kit, etc.)
    """
    
    # Manufacturer normalization mapping
    MANUFACTURER_MAP = {
        # Panel manufacturers
        "longi": "LONGi",
        "lon gi": "LONGi", 
        "long i": "LONGi",
        "risen": "Risen",
        "trina": "Trina Solar",
        "trina solar": "Trina Solar",
        "jinko": "JinkoSolar",
        "jinko solar": "JinkoSolar",
        "canadian": "Canadian Solar",
        "canadian solar": "Canadian Solar",
        "ja solar": "JA Solar",
        "jasolar": "JA Solar",
        "yingli": "Yingli",
        "hanwha": "Hanwha Q CELLS",
        "q cells": "Hanwha Q CELLS",
        
        # Inverter manufacturers
        "growatt": "Growatt",
        "deye": "Deye",
        "fronius": "Fronius",
        "sma": "SMA",
        "huawei": "Huawei",
        "sungrow": "Sungrow",
        "solaredge": "SolarEdge",
        "goodwe": "GoodWe",
        "saj": "SAJ",
        "solis": "Solis",
    }
    
    # Component type patterns
    COMPONENT_PATTERNS = {
        "panel": r"(?:panel|módulo|placa)",
        "inverter": r"(?:inversor|inverter)",
        "kit": r"kit",
    }
    
    def __init__(self):
        self.stats = {
            "processed": 0,
            "normalized": 0,
            "manufacturer_fixed": 0,
            "power_extracted": 0,
        }
    
    def normalize_manufacturer(self, text: str) -> str:
        """Normalize manufacturer name to standard format."""
        if not text:
            return "Unknown"
        
        text_lower = text.lower().strip()
        
        # Check direct mapping
        for key, standard_name in self.MANUFACTURER_MAP.items():
            if key in text_lower:
                return standard_name
        
        # Return title case if no match
        return text.strip().title()
    
    def extract_power_from_name(self, name: str) -> float:
        """Extract power rating from kit name (kWp format)."""
        # Match patterns like "2.44kWp", "2.52 kWp", "3kWp"
        power_match = re.search(r'(\d+\.?\d*)\s*kwp', name.lower())
        if power_match:
            return float(power_match.group(1))
        return 0.0
    
    def extract_component_info(self, name: str) -> Dict[str, str]:
        """
        Extract manufacturer information from kit name.
        Returns dict with panel and inverter manufacturers.
        """
        parts = name.split(" - ")
        
        info = {
            "panel_manufacturer": "Unknown",
            "inverter_manufacturer": "Unknown",
        }
        
        if len(parts) >= 2:
            # Second part usually contains manufacturers
            component_part = parts[1]
            
            # Split by "+" or "&" or "and"
            manufacturers = re.split(r'[+&]|\band\b', component_part, flags=re.IGNORECASE)
            
            if len(manufacturers) >= 2:
                info["panel_manufacturer"] = self.normalize_manufacturer(manufacturers[0].strip())
                info["inverter_manufacturer"] = self.normalize_manufacturer(manufacturers[1].strip())
            elif len(manufacturers) == 1:
                # Try to identify if it's panel or inverter
                mfg = self.normalize_manufacturer(manufacturers[0].strip())
                # Common inverter brands
                if mfg.lower() in ["growatt", "deye", "fronius", "sma"]:
                    info["inverter_manufacturer"] = mfg
                else:
                    info["panel_manufacturer"] = mfg
        
        return info
    
    def create_medusa_title(self, kit: Dict[str, Any]) -> Dict[str, str]:
        """
        Create normalized titles following Medusa.js conventions.
        
        Returns:
            dict with:
            - product_title: Main product title (for Product model)
            - variant_title: Specific variant title (for ProductVariant model)
            - search_title: Optimized for semantic search
            - seo_title: SEO-friendly title
        """
        power_kwp = kit.get("system_power_kwp", 0)
        
        # Extract component information
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        panel_mfg = self.normalize_manufacturer(panel.get("manufacturer") or "Unknown")
        inverter_mfg = self.normalize_manufacturer(inverter.get("manufacturer") or "Unknown")
        
        # If manufacturers are Unknown, try to extract from original name
        if panel_mfg == "Unknown" or inverter_mfg == "Unknown":
            extracted = self.extract_component_info(kit.get("name", ""))
            if panel_mfg == "Unknown":
                panel_mfg = extracted["panel_manufacturer"]
            if inverter_mfg == "Unknown":
                inverter_mfg = extracted["inverter_manufacturer"]
        
        # Panel power (if available)
        panel_power = panel.get("power_w", 0) or 0
        panel_qty = panel.get("quantity", 0) or 0
        
        # Inverter power
        inverter_power = inverter.get("power_kw", 0) or 0
        
        # PRODUCT TITLE: Main product identifier
        # Format: "Solar Kit {power}kWp - {panel_brand} + {inverter_brand}"
        product_title = f"Solar Kit {power_kwp}kWp - {panel_mfg} + {inverter_mfg}"
        
        # VARIANT TITLE: Specific configuration
        # Format: "{panel_power}W x{qty} Panels / {inverter_power}kW Inverter"
        if panel_power and panel_qty:
            variant_title = f"{panel_power}W x{panel_qty} Panels / {inverter_power}kW Inverter"
        else:
            variant_title = f"{power_kwp}kWp System / {inverter_power}kW Inverter"
        
        # SEARCH TITLE: Optimized for semantic search (all key terms)
        # Format: "{power}kWp Solar Energy Kit {panel} Panel {inverter} Inverter"
        search_title = (
            f"{power_kwp}kWp Solar Energy Kit "
            f"{panel_mfg} Panel "
            f"{inverter_mfg} Inverter "
            f"Grid-Tie System"
        )
        
        # SEO TITLE: SEO-friendly with long-tail keywords
        # Format: "{power}kWp Solar Kit - {panel} Panels + {inverter} Inverter | Complete System"
        seo_title = (
            f"{power_kwp}kWp Solar Kit - "
            f"{panel_mfg} Panels + {inverter_mfg} Inverter | "
            f"Complete Photovoltaic System"
        )
        
        return {
            "product_title": product_title,
            "variant_title": variant_title,
            "search_title": search_title,
            "seo_title": seo_title,
        }
    
    def create_product_description(self, kit: Dict[str, Any]) -> str:
        """
        Create detailed product description for Medusa.js Product.description.
        Optimized for semantic search and customer understanding.
        """
        power_kwp = kit.get("system_power_kwp", 0)
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        panel_mfg = self.normalize_manufacturer(panel.get("manufacturer") or "Unknown")
        inverter_mfg = self.normalize_manufacturer(inverter.get("manufacturer") or "Unknown")
        panel_power = panel.get("power_w", 0) or 0
        panel_qty = panel.get("quantity", 0) or 0
        inverter_power = inverter.get("power_kw", 0) or 0
        
        price_per_wp = kit.get("pricing", {}).get("per_wp", 0)
        total_price = kit.get("pricing", {}).get("total", 0)
        
        description_parts = [
            f"Complete {power_kwp}kWp solar energy kit for grid-tie residential or commercial installation.",
            "",
            "**Components Included:**",
            f"- Solar Panels: {panel_mfg}" + (f" {panel_power}W" if panel_power else "") + (f" (Quantity: {panel_qty})" if panel_qty else ""),
            f"- Inverter: {inverter_mfg}" + (f" {inverter_power}kW" if inverter_power else ""),
            "",
            "**Technical Specifications:**",
            f"- System Power: {power_kwp}kWp",
            f"- Configuration: Grid-tie photovoltaic system",
            f"- Estimated Energy Generation: ~{int(power_kwp * 4.5 * 30)}kWh/month (average)",
            "",
            "**Pricing:**",
            f"- Total Kit Price: R$ {total_price:,.2f}" if total_price else "- Price: Contact for quote",
            f"- Cost per Watt-peak: R$ {price_per_wp:.2f}/Wp" if price_per_wp else "",
            "",
            "**Ideal For:**",
            f"- Residential properties consuming ~{int(power_kwp * 135)}kWh/month",
            "- Small commercial installations",
            "- Offsetting electricity bills with clean solar energy",
            "",
            "**Installation Notes:**",
            "- Professional installation recommended",
            "- Includes all core components (panels + inverter)",
            "- Mounting structure and cables sold separately",
            "- Check local regulations for grid connection requirements",
        ]
        
        return "\n".join(description_parts)
    
    def create_variant_metadata(self, kit: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create metadata for ProductVariant following Medusa.js patterns.
        Includes all technical specifications for filtering and search.
        """
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        return {
            "system_power_kwp": kit.get("system_power_kwp", 0),
            "panel_manufacturer": self.normalize_manufacturer(panel.get("manufacturer")),
            "panel_power_w": panel.get("power_w", 0) or 0,
            "panel_quantity": panel.get("quantity", 0) or 0,
            "panel_component_id": panel.get("component_id"),
            "inverter_manufacturer": self.normalize_manufacturer(inverter.get("manufacturer")),
            "inverter_power_kw": inverter.get("power_kw", 0) or 0,
            "inverter_quantity": inverter.get("quantity", 0) or 0,
            "inverter_component_id": inverter.get("component_id"),
            "price_per_wp": kit.get("pricing", {}).get("per_wp", 0),
            "estimated_monthly_generation_kwh": int(kit.get("system_power_kwp", 0) * 4.5 * 30),
            "system_type": "grid-tie",
            "distributor": kit.get("distributor", "fortlev"),
            "has_panel_image": panel.get("image_available", False),
            "has_inverter_image": inverter.get("image_available", False),
            "has_combination_image": kit.get("combination_available", False),
        }
    
    def normalize_kit(self, kit: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize a single kit with Medusa.js-compatible structure.
        """
        self.stats["processed"] += 1
        
        # Generate normalized titles
        titles = self.create_medusa_title(kit)
        
        # Create description
        description = self.create_product_description(kit)
        
        # Create variant metadata
        variant_metadata = self.create_variant_metadata(kit)
        
        # Update kit structure
        normalized_kit = {
            **kit,
            # Medusa.js Product fields
            "title": titles["product_title"],
            "subtitle": None,
            "description": description,
            "handle": self.create_handle(titles["product_title"]),
            "status": "published",
            "type": "Solar Kit",
            "collection": "FortLev Solar Kits",
            "tags": self.generate_tags(kit, variant_metadata),
            
            # Original name kept for reference
            "original_name": kit.get("name"),
            
            # Medusa.js ProductVariant fields
            "variant_title": titles["variant_title"],
            "variant_sku": self.generate_sku(kit),
            "variant_barcode": None,
            "variant_metadata": variant_metadata,
            
            # Search optimization fields
            "search_title": titles["search_title"],
            "seo_title": titles["seo_title"],
            "seo_description": description[:160],  # Meta description limit
            
            # Medusa.js ProductOption (for variants)
            "options": self.generate_options(kit),
        }
        
        self.stats["normalized"] += 1
        
        return normalized_kit
    
    def create_handle(self, title: str) -> str:
        """
        Create URL-friendly handle from title (Medusa.js Product.handle).
        Format: lowercase, hyphens, no special chars
        """
        handle = title.lower()
        handle = re.sub(r'[^\w\s-]', '', handle)
        handle = re.sub(r'[-\s]+', '-', handle)
        return handle.strip('-')
    
    def generate_sku(self, kit: Dict[str, Any]) -> str:
        """
        Generate SKU for variant.
        Format: FLV-{power}KWP-{panel_initial}{inverter_initial}-{id_suffix}
        """
        power = kit.get("system_power_kwp", 0)
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        panel_mfg = self.normalize_manufacturer(panel.get("manufacturer", "Unknown"))
        inverter_mfg = self.normalize_manufacturer(inverter.get("manufacturer", "Unknown"))
        
        # Get first 3 letters of each manufacturer
        panel_code = panel_mfg[:3].upper() if panel_mfg != "Unknown" else "UNK"
        inverter_code = inverter_mfg[:3].upper() if inverter_mfg != "Unknown" else "UNK"
        
        # Extract ID number from kit ID
        id_match = re.search(r'(\d+)$', kit.get("id", "000"))
        id_num = id_match.group(1) if id_match else "000"
        
        return f"FLV-{power:.2f}KWP-{panel_code}{inverter_code}-{id_num}"
    
    def generate_tags(self, kit: Dict[str, Any], metadata: Dict[str, Any]) -> List[str]:
        """
        Generate product tags for filtering and search.
        Follows Medusa.js ProductTag model.
        """
        tags = [
            "Solar Kit",
            "Grid-Tie",
            "Photovoltaic System",
            f"{kit.get('system_power_kwp', 0)}kWp",
            metadata["panel_manufacturer"],
            metadata["inverter_manufacturer"],
        ]
        
        # Add power range tags
        power = kit.get("system_power_kwp", 0)
        if power <= 3:
            tags.append("Residential Small")
        elif power <= 5:
            tags.append("Residential Medium")
        elif power <= 10:
            tags.append("Residential Large")
        else:
            tags.append("Commercial")
        
        # Add availability tags
        if metadata.get("has_combination_image"):
            tags.append("Full Images Available")
        
        return tags
    
    def generate_options(self, kit: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate ProductOption for variants.
        Medusa.js uses options to define variant attributes.
        """
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        options = []
        
        # Option 1: System Power
        options.append({
            "title": "System Power",
            "values": [f"{kit.get('system_power_kwp', 0)}kWp"]
        })
        
        # Option 2: Panel Configuration
        panel_power = panel.get("power_w", 0)
        panel_qty = panel.get("quantity", 0)
        if panel_power and panel_qty:
            options.append({
                "title": "Panel Configuration",
                "values": [f"{panel_power}W x{panel_qty}"]
            })
        
        # Option 3: Inverter Power
        inverter_power = inverter.get("power_kw", 0)
        if inverter_power:
            options.append({
                "title": "Inverter Power",
                "values": [f"{inverter_power}kW"]
            })
        
        return options
    
    def process_file(self, input_file: Path, output_file: Path) -> Dict[str, Any]:
        """
        Process entire JSON file with kits normalization.
        """
        print(f"📖 Reading: {input_file}")
        
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"✓ Loaded {len(kits)} kits")
        print(f"🔄 Normalizing titles for semantic search optimization...")
        
        normalized_kits = []
        for kit in kits:
            normalized_kit = self.normalize_kit(kit)
            normalized_kits.append(normalized_kit)
        
        # Save normalized data
        print(f"💾 Saving to: {output_file}")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(normalized_kits, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Normalization complete!")
        print(f"📊 Statistics:")
        print(f"   - Processed: {self.stats['processed']} kits")
        print(f"   - Normalized: {self.stats['normalized']} kits")
        
        # Sample normalized titles
        print(f"\n📝 Sample normalized titles:")
        for i, kit in enumerate(normalized_kits[:3], 1):
            print(f"\n   Kit {i}:")
            print(f"   • Original: {kit.get('original_name')}")
            print(f"   • Product Title: {kit.get('title')}")
            print(f"   • Variant Title: {kit.get('variant_title')}")
            print(f"   • Search Title: {kit.get('search_title')}")
            print(f"   • SKU: {kit.get('variant_sku')}")
            print(f"   • Handle: {kit.get('handle')}")
        
        return {
            "total_kits": len(normalized_kits),
            "output_file": str(output_file),
            "stats": self.stats,
        }


def main():
    """Main execution function."""
    script_dir = Path(__file__).parent
    
    input_file = script_dir / "fortlev-kits-synced.json"
    output_file = script_dir / "fortlev-kits-normalized.json"
    
    if not input_file.exists():
        print(f"❌ Error: Input file not found: {input_file}")
        return
    
    normalizer = TitleNormalizer()
    result = normalizer.process_file(input_file, output_file)
    
    print(f"\n✅ Complete! Normalized kits saved to:")
    print(f"   {result['output_file']}")
    print(f"\n🎯 Ready for:")
    print(f"   • Medusa.js product import")
    print(f"   • Gemma3 semantic search indexing")
    print(f"   • ChromaDB vector store")


if __name__ == "__main__":
    main()
