"""
UX Strategy + Medusa.js Optimization
Transforms enriched data into perfect Medusa.js structure

Focus:
- Product hierarchy (Collections > Categories > Products > Variants)
- Search optimization (tags, metadata, searchable fields)
- Variant options (configurable attributes)
- Pricing strategies (tiered pricing, customer group pricing)
- Inventory kit configuration (multi-part products)
"""

import json
from pathlib import Path
from typing import Dict, List
from datetime import datetime


class MedusaUXOptimizer:
    """Optimize product data for Medusa.js with UX best practices."""
    
    # Collection structure
    COLLECTIONS = {
        "fortlev-solar-kits": {
            "title": "Kits Solares FortLev",
            "handle": "fortlev-solar-kits",
            "metadata": {
                "distributor": "FortLev",
                "category": "Solar Energy Systems"
            }
        }
    }
    
    # Category hierarchy
    CATEGORIES = {
        "residential_small": {
            "name": "Residencial Pequeno",
            "handle": "residencial-pequeno",
            "description": "Kits até 3kWp ideais para casas pequenas",
            "parent": None,
            "metadata": {
                "power_range": "0-3kWp",
                "target": "small homes",
                "monthly_consumption": "0-500kWh"
            }
        },
        "residential_medium": {
            "name": "Residencial Médio",
            "handle": "residencial-medio",
            "description": "Kits 3-6kWp para residências médias",
            "parent": None,
            "metadata": {
                "power_range": "3-6kWp",
                "target": "medium homes",
                "monthly_consumption": "500-1000kWh"
            }
        },
        "residential_large": {
            "name": "Residencial Grande",
            "handle": "residencial-grande",
            "description": "Kits 6-10kWp para alto consumo",
            "parent": None,
            "metadata": {
                "power_range": "6-10kWp",
                "target": "large homes",
                "monthly_consumption": "1000-1500kWh"
            }
        },
        "commercial": {
            "name": "Comercial",
            "handle": "comercial",
            "description": "Kits acima de 10kWp para empresas",
            "parent": None,
            "metadata": {
                "power_range": ">10kWp",
                "target": "businesses",
                "monthly_consumption": ">1500kWh"
            }
        }
    }
    
    def __init__(self):
        self.stats = {
            "products": 0,
            "variants": 0,
            "inventory_kits": 0,
            "price_rules": 0
        }
    
    def get_category(self, power_kwp: float) -> str:
        """Determine category from power."""
        if power_kwp <= 3:
            return "residential_small"
        elif power_kwp <= 6:
            return "residential_medium"
        elif power_kwp <= 10:
            return "residential_large"
        else:
            return "commercial"
    
    def create_product_options(self, kit: Dict) -> List[Dict]:
        """
        Create Medusa.js ProductOption structure.
        Options define configurable attributes.
        """
        power = kit.get("system_power_kwp", 0)
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        options = []
        
        # Option 1: System Power
        options.append({
            "title": "Potência do Sistema",
            "values": [f"{power}kWp"]
        })
        
        # Option 2: Panel Configuration
        panel_power = panel.get("power_w", 0)
        panel_qty = panel.get("quantity", 0)
        if panel_power and panel_qty:
            options.append({
                "title": "Configuração de Painéis",
                "values": [f"{panel_power}W x{panel_qty}"]
            })
        
        # Option 3: Inverter Power
        inv_power = inverter.get("power_kw", 0)
        if inv_power:
            options.append({
                "title": "Potência do Inversor",
                "values": [f"{inv_power}kW"]
            })
        
        return options
    
    def create_variant(self, kit: Dict, vision: Dict) -> Dict:
        """
        Create Medusa.js ProductVariant structure.
        Each kit becomes a single variant (for now).
        """
        power = kit.get("system_power_kwp", 0)
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        pricing = kit.get("pricing", {})
        
        # Build variant title
        panel_mfg = vision.get("panel_manufacturer", "Panel")
        inv_mfg = vision.get("inverter_manufacturer", "Inverter")
        variant_title = f"{power}kWp | {panel_mfg} + {inv_mfg}"
        
        # Generate SKU
        panel_code = panel_mfg[:3].upper() if panel_mfg else "UNK"
        inv_code = inv_mfg[:3].upper() if inv_mfg else "UNK"
        sku = f"FLV-{power}KWP-{panel_code}{inv_code}-{kit.get('id', 0):03d}"
        
        # Variant metadata (technical specs)
        metadata = {
            "panel_manufacturer": panel_mfg,
            "panel_power_w": panel.get("power_w"),
            "panel_quantity": panel.get("quantity"),
            "panel_technology": vision.get("panel_technology", "monocristalino"),
            "inverter_manufacturer": inv_mfg,
            "inverter_power_kw": inverter.get("power_kw"),
            "inverter_model": vision.get("inverter_model"),
            "system_power_kwp": power,
            "system_type": "grid-tie",
            "estimated_area_m2": int(power * 7),
            "monthly_generation_kwh": int(power * 4.5 * 30),
            "price_per_wp": pricing.get("per_wp"),
            "distributor": "FortLev",
            "vision_confidence": {
                "panel": vision.get("panel_confidence", "unknown"),
                "inverter": vision.get("inverter_confidence", "unknown")
            }
        }
        
        # Build variant options (match product options)
        option_values = []
        option_values.append({
            "option": "Potência do Sistema",
            "value": f"{power}kWp"
        })
        
        panel_power = panel.get("power_w", 0)
        panel_qty = panel.get("quantity", 0)
        if panel_power and panel_qty:
            option_values.append({
                "option": "Configuração de Painéis",
                "value": f"{panel_power}W x{panel_qty}"
            })
        
        inv_power = inverter.get("power_kw", 0)
        if inv_power:
            option_values.append({
                "option": "Potência do Inversor",
                "value": f"{inv_power}kW"
            })
        
        return {
            "title": variant_title,
            "sku": sku,
            "barcode": kit.get("gtin"),
            "hs_code": "85414090",  # Solar inverters HS code
            "origin_country": "br",
            "material": "Aluminum, Glass, Silicon",
            "weight": int(panel_qty * 25 + 15) if panel_qty else 100,
            "length": 200,
            "width": 100,
            "height": 20,
            "options": option_values,
            "prices": [
                {
                    "amount": int(pricing.get("final", 0) * 100),
                    "currency_code": "brl"
                }
            ],
            "metadata": metadata
        }
    
    def create_inventory_kit(self, kit: Dict, variant_sku: str) -> Dict:
        """
        Create Inventory Kit structure.
        Kits are composed of panels + inverter as separate inventory items.
        """
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        # Generate component SKUs
        panel_sku = f"PANEL-{panel.get('power_w', 0)}W"
        inv_sku = f"INV-{inverter.get('power_kw', 0)}KW"
        
        items = []
        
        # Panel inventory item
        if panel.get("quantity"):
            items.append({
                "inventory_item_sku": panel_sku,
                "required_quantity": panel.get("quantity"),
                "title": f"Painel Solar {panel.get('power_w')}W",
                "metadata": {
                    "type": "panel",
                    "manufacturer": panel.get("manufacturer"),
                    "power_w": panel.get("power_w"),
                    "technology": "monocristalino"
                }
            })
        
        # Inverter inventory item
        items.append({
            "inventory_item_sku": inv_sku,
            "required_quantity": 1,
            "title": f"Inversor {inverter.get('power_kw')}kW",
            "metadata": {
                "type": "inverter",
                "manufacturer": inverter.get("manufacturer"),
                "power_kw": inverter.get("power_kw"),
                "grid_type": "grid-tie"
            }
        })
        
        return {
            "variant_sku": variant_sku,
            "kit_items": items
        }
    
    def create_price_rules(self, kit: Dict) -> List[Dict]:
        """
        Create tiered pricing rules for quantity discounts.
        """
        base_price = kit.get("pricing", {}).get("final", 0)
        
        rules = []
        
        # Volume discount tiers
        tiers = [
            {"min": 2, "max": 4, "discount": 0.05},
            {"min": 5, "max": 9, "discount": 0.10},
            {"min": 10, "max": None, "discount": 0.15}
        ]
        
        for tier in tiers:
            rules.append({
                "type": "quantity_discount",
                "min_quantity": tier["min"],
                "max_quantity": tier["max"],
                "discount_percentage": tier["discount"] * 100,
                "price": int(base_price * (1 - tier["discount"]) * 100)
            })
        
        return rules
    
    def transform_to_medusa_product(self, enriched_kit: Dict) -> Dict:
        """
        Transform enriched kit to complete Medusa.js Product structure.
        """
        vision = enriched_kit.get("vision_analysis", {})
        titles = enriched_kit.get("titles", {})
        seo = enriched_kit.get("seo", {})
        
        power = enriched_kit.get("system_power_kwp", 0)
        category = self.get_category(power)
        
        # Create handle
        panel_mfg = vision.get("panel_manufacturer", "panel")
        inv_mfg = vision.get("inverter_manufacturer", "inverter")
        handle = (
            f"solar-kit-{power}kwp-{panel_mfg}-{inv_mfg}"
            .lower()
            .replace(" ", "-")
            .replace(".", "")
        )
        
        # Create variant
        variant = self.create_variant(enriched_kit, vision)
        
        # Create inventory kit
        inventory_kit = self.create_inventory_kit(enriched_kit, variant["sku"])
        
        # Create price rules
        price_rules = self.create_price_rules(enriched_kit)
        
        # Build complete product
        product = {
            # Core fields
            "title": titles.get("ux_optimized", f"Kit Solar {power}kWp"),
            "subtitle": titles.get("marketing", ""),
            "handle": handle,
            "description": enriched_kit.get("description_long", ""),
            "status": "published",
            "external_id": enriched_kit.get("id"),
            
            # Images
            "thumbnail": enriched_kit.get("images", {}).get("combination"),
            "images": [
                img for img in [
                    enriched_kit.get("images", {}).get("combination"),
                    enriched_kit.get("images", {}).get("panel"),
                    enriched_kit.get("images", {}).get("inverter")
                ] if img
            ],
            
            # SEO
            "metadata": {
                "seo_title": titles.get("seo_optimized"),
                "seo_description": seo.get("meta_description"),
                "primary_keyword": seo.get("primary_keyword"),
                "secondary_keywords": seo.get("secondary_keywords", []),
                "target_audience": enriched_kit.get(
                    "ux_metadata", {}
                ).get("target_audience"),
                "value_proposition": enriched_kit.get(
                    "ux_metadata", {}
                ).get("value_proposition"),
                "original_name": enriched_kit.get("name")
            },
            
            # Organization
            "type": {
                "value": "Solar Kit",
                "metadata": {"category": "Energy Systems"}
            },
            "collection_id": "fortlev-solar-kits",
            "categories": [
                {"handle": self.CATEGORIES[category]["handle"]}
            ],
            "tags": [
                {"value": tag} for tag in seo.get("tags", [])
            ],
            
            # Variants
            "options": self.create_product_options(enriched_kit),
            "variants": [variant],
            
            # Inventory Kit
            "inventory_kit": inventory_kit,
            
            # Pricing Rules
            "price_rules": price_rules,
            
            # Timestamps
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        self.stats["products"] += 1
        self.stats["variants"] += 1
        self.stats["inventory_kits"] += 1
        self.stats["price_rules"] += len(price_rules)
        
        return product
    
    def process_all(self, input_file: Path, output_file: Path):
        """Process all enriched kits to Medusa.js format."""
        print(f"\n{'='*80}")
        print(f"🎨 UX + MEDUSA.JS OPTIMIZATION")
        print(f"{'='*80}")
        
        # Load enriched kits
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"\n📊 Total kits: {len(kits)}")
        
        # Transform all kits
        medusa_products = []
        for kit in kits:
            product = self.transform_to_medusa_product(kit)
            medusa_products.append(product)
        
        # Create complete structure with collections and categories
        medusa_structure = {
            "collections": list(self.COLLECTIONS.values()),
            "categories": [
                {
                    "name": cat["name"],
                    "handle": cat["handle"],
                    "description": cat["description"],
                    "metadata": cat["metadata"]
                }
                for cat in self.CATEGORIES.values()
            ],
            "products": medusa_products,
            "metadata": {
                "total_products": len(medusa_products),
                "generated_at": datetime.utcnow().isoformat(),
                "source": "vision_enrich_titles.py + ux_medusa_optimizer.py",
                "distributor": "FortLev"
            }
        }
        
        # Save
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(medusa_structure, f, ensure_ascii=False, indent=2)
        
        # Print stats
        print(f"\n{'='*80}")
        print(f"✅ OPTIMIZATION COMPLETE")
        print(f"{'='*80}")
        print(f"\n📊 Statistics:")
        print(f"   • Products: {self.stats['products']}")
        print(f"   • Variants: {self.stats['variants']}")
        print(f"   • Inventory Kits: {self.stats['inventory_kits']}")
        print(f"   • Price Rules: {self.stats['price_rules']}")
        print(f"   • Collections: {len(self.COLLECTIONS)}")
        print(f"   • Categories: {len(self.CATEGORIES)}")
        
        print(f"\n💾 Output saved to:")
        print(f"   {output_file}")
        
        print(f"\n🎯 Ready for Medusa.js import!")


def main():
    """Main execution."""
    script_dir = Path(__file__).parent
    
    input_file = script_dir / "fortlev-kits-vision-enriched.json"
    output_file = script_dir / "fortlev-kits-medusa-ready.json"
    
    # Fallback to normalized if enriched not available
    if not input_file.exists():
        print(f"⚠️  Enriched file not found, using normalized...")
        input_file = script_dir / "fortlev-kits-normalized.json"
    
    if not input_file.exists():
        print(f"❌ No input file found!")
        print("   Run normalize_titles.py first.")
        return
    
    optimizer = MedusaUXOptimizer()
    optimizer.process_all(input_file, output_file)
    
    print(f"\n🎉 COMPLETE!")


if __name__ == "__main__":
    main()
