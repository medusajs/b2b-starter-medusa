"""
Title Normalization for FOTUS Solar Kits
Adapted from FortLev normalization strategy
"""

import json
from pathlib import Path
from typing import Dict, List
import re


class FotusNormalizer:
    """Normalize FOTUS kit titles for semantic search and Medusa.js."""
    
    # Manufacturer name standardization
    MANUFACTURER_MAP = {
        # Panels
        "SOLAR N PLUS": "Solar N Plus",
        "ASTRONERGY": "Astronergy",
        "CANADIAN": "Canadian Solar",
        "JINKO": "JinkoSolar",
        "LONGI": "LONGi",
        "TRINA": "Trina Solar",
        "JA SOLAR": "JA Solar",
        "RISEN": "Risen",
        "BYD": "BYD",
        
        # Inverters/Microinverters
        "DEYE": "Deye",
        "TSUNESS": "Tsuness",
        "GROWATT": "Growatt",
        "HOYMILES": "Hoymiles",
        "ENPHASE": "Enphase",
        "APSystems": "APSystems",
        "GOODWE": "GoodWe",
        "FRONIUS": "Fronius",
        "SMA": "SMA"
    }
    
    def __init__(self):
        self.processed = 0
    
    def normalize_manufacturer(self, name: str) -> str:
        """Standardize manufacturer name."""
        if not name:
            return "Unknown"
        
        name_upper = name.upper()
        for key, value in self.MANUFACTURER_MAP.items():
            if key in name_upper:
                return value
        
        return name.title()
    
    def extract_power_from_kit(self, kit: Dict) -> float:
        """Extract power from kit data."""
        return kit.get("potencia_kwp", 0) or 0
    
    def get_panel_info(self, kit: Dict) -> Dict:
        """Extract panel information."""
        panels = kit.get("panels", [])
        if panels:
            panel = panels[0]
            return {
                "manufacturer": self.normalize_manufacturer(panel.get("brand", "")),
                "power_w": panel.get("power_w", 0),
                "quantity": panel.get("quantity", 0),
                "description": panel.get("description", "")
            }
        return {
            "manufacturer": "Unknown",
            "power_w": 0,
            "quantity": 0,
            "description": ""
        }
    
    def get_inverter_info(self, kit: Dict) -> Dict:
        """Extract inverter information."""
        inverters = kit.get("inverters", [])
        if inverters:
            inv = inverters[0]
            brand = self.normalize_manufacturer(inv.get("brand", ""))
            power = inv.get("power_kw", 0)
            desc = inv.get("description", "")
            
            # Detect if it's a microinverter
            is_micro = "MICROINVERSOR" in desc.upper() or "MICRO" in desc.upper()
            
            return {
                "manufacturer": brand,
                "power_kw": power,
                "quantity": inv.get("quantity", 0),
                "description": desc,
                "is_microinverter": is_micro
            }
        return {
            "manufacturer": "Unknown",
            "power_kw": 0,
            "quantity": 0,
            "description": "",
            "is_microinverter": False
        }
    
    def create_product_title(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """
        Create main product title (UX optimized).
        Format: Kit Solar {power}kWp - {panel_brand} + {inverter_brand}
        """
        power = self.extract_power_from_kit(kit)
        panel_brand = panel["manufacturer"]
        inv_brand = inverter["manufacturer"]
        
        inv_type = "Microinversor" if inverter.get("is_microinverter") else "Inversor"
        
        return f"Kit Solar {power}kWp - {panel_brand} + {inv_type} {inv_brand}"
    
    def create_variant_title(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """
        Create variant title with configuration details.
        Format: {panel_power}W x{qty} / {inv_type} {inv_power}kW
        """
        panel_power = panel["power_w"]
        panel_qty = panel["quantity"]
        inv_power = inverter["power_kw"]
        inv_type = "Micro" if inverter.get("is_microinverter") else "Inv"
        
        return f"{panel_power}W x{panel_qty} Painéis / {inv_type} {inv_power}kW"
    
    def create_search_title(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """
        Create search-optimized title for semantic search (Gemma3).
        Format: {power}kWp Solar Kit {panel} Panel {inverter} Microinverter Grid-Tie
        """
        power = self.extract_power_from_kit(kit)
        panel_brand = panel["manufacturer"]
        inv_brand = inverter["manufacturer"]
        
        inv_type = "Microinverter" if inverter.get("is_microinverter") else "Inverter"
        system_type = "Grid-Tie Microinverter System" if inverter.get("is_microinverter") else "Grid-Tie System"
        
        return f"{power}kWp Solar Energy Kit {panel_brand} Panel {inv_brand} {inv_type} {system_type}"
    
    def create_seo_title(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """
        Create SEO-optimized title (50-60 chars).
        Format: Kit Solar {power}kWp {panel} + {inverter} | FOTUS
        """
        power = self.extract_power_from_kit(kit)
        panel_brand = panel["manufacturer"]
        inv_brand = inverter["manufacturer"]
        
        return f"Kit Solar {power}kWp {panel_brand} + {inv_brand} | FOTUS"
    
    def create_handle(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """Create URL-safe handle."""
        power = self.extract_power_from_kit(kit)
        panel_brand = panel["manufacturer"].lower().replace(" ", "-")
        inv_brand = inverter["manufacturer"].lower().replace(" ", "-")
        
        handle = f"solar-kit-{power}kwp-{panel_brand}-{inv_brand}"
        
        # Clean special characters
        handle = re.sub(r'[^a-z0-9\-]', '', handle)
        handle = re.sub(r'\-+', '-', handle)
        
        return handle
    
    def generate_sku(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """
        Generate unique SKU.
        Format: FTS-{power}KWP-{panel_code}{inv_code}-{id}
        """
        power = self.extract_power_from_kit(kit)
        
        # Extract codes from manufacturers
        panel_code = panel["manufacturer"][:3].upper().replace(" ", "")
        inv_code = inverter["manufacturer"][:3].upper().replace(" ", "")
        
        # Extract numeric ID from kit ID
        kit_id = kit.get("id", "")
        id_match = re.search(r'KP(\d+)', kit_id)
        id_num = id_match.group(1) if id_match else "001"
        
        return f"FTS-{power}KWP-{panel_code}{inv_code}-{id_num}"
    
    def generate_tags(self, kit: Dict, panel: Dict, inverter: Dict) -> List[str]:
        """Generate strategic tags."""
        power = self.extract_power_from_kit(kit)
        
        tags = [
            "Kit Solar",
            "Energia Solar",
            "Sistema Fotovoltaico"
        ]
        
        # Size category
        if power <= 3:
            tags.extend(["Residencial Pequeno", "Até 3kWp"])
        elif power <= 6:
            tags.extend(["Residencial Médio", "3-6kWp"])
        elif power <= 10:
            tags.extend(["Residencial Grande", "6-10kWp"])
        else:
            tags.extend(["Comercial", "Acima 10kWp"])
        
        # Power tag
        tags.append(f"{power}kWp")
        
        # Brand tags
        if panel["manufacturer"] != "Unknown":
            tags.append(f"Painel {panel['manufacturer']}")
        
        if inverter["manufacturer"] != "Unknown":
            inv_type = "Microinversor" if inverter.get("is_microinverter") else "Inversor"
            tags.append(f"{inv_type} {inverter['manufacturer']}")
        
        # System type
        if inverter.get("is_microinverter"):
            tags.extend(["Microinversor", "Sistema Modular"])
        else:
            tags.extend(["Grid-Tie", "On-Grid"])
        
        # Structure type
        estrutura = kit.get("estrutura", "")
        if estrutura:
            tags.append(f"Estrutura {estrutura}")
        
        # Monthly generation
        monthly_gen = int(power * 4.5 * 30)
        if monthly_gen < 500:
            tags.append("Até 500kWh/mês")
        elif monthly_gen < 1000:
            tags.append("500-1000kWh/mês")
        else:
            tags.append("Acima 1000kWh/mês")
        
        # Distribution center
        cd = kit.get("centro_distribuicao", "")
        if cd:
            tags.append(cd)
        
        return tags
    
    def create_description(self, kit: Dict, panel: Dict, inverter: Dict) -> str:
        """Create product description."""
        power = self.extract_power_from_kit(kit)
        monthly_gen = int(power * 4.5 * 30)
        panel_brand = panel["manufacturer"]
        inv_brand = inverter["manufacturer"]
        inv_type = "microinversor" if inverter.get("is_microinverter") else "inversor"
        
        desc = f"""# Kit Solar {power}kWp - Sistema Completo FOTUS

## Gere até {monthly_gen}kWh por mês

**Kit completo pronto para instalação** com componentes de alta qualidade.

### Componentes Incluídos

**Painéis Solares {panel_brand}**
- Potência: {panel["power_w"]}W por painel
- Quantidade: {panel["quantity"]} unidades
- Potência total: {power}kWp

**{inv_type.title()} {inv_brand}**
- Potência: {inverter["power_kw"]}kW
- Quantidade: {inverter["quantity"]} unidade(s)
- {panel["description"]}

### Características do Sistema

- Sistema {"modular com microinversor" if inverter.get("is_microinverter") else "grid-tie on-grid"}
- Estrutura: {kit.get("estrutura", "Não especificada")}
- Centro de Distribuição: {kit.get("centro_distribuicao", "Consultar")}
- Distribuidor: FOTUS

### Ideal Para

"""
        
        if power <= 3:
            desc += """- Residências pequenas e apartamentos
- Consumo até 500kWh/mês
- Redução significativa na conta de luz"""
        elif power <= 6:
            desc += """- Residências médias
- Famílias de 3-5 pessoas
- Consumo moderado"""
        else:
            desc += """- Residências grandes ou estabelecimentos comerciais
- Alto consumo de energia
- Máxima economia"""
        
        return desc
    
    def normalize_kit(self, kit: Dict) -> Dict:
        """Normalize a single kit."""
        panel = self.get_panel_info(kit)
        inverter = self.get_inverter_info(kit)
        power = self.extract_power_from_kit(kit)
        
        normalized = {
            # Original data
            **kit,
            
            # Normalized fields
            "title": self.create_product_title(kit, panel, inverter),
            "subtitle": self.create_search_title(kit, panel, inverter),
            "description": self.create_description(kit, panel, inverter),
            "handle": self.create_handle(kit, panel, inverter),
            "status": "published",
            "type": "Solar Kit",
            "collection": "FOTUS Solar Kits",
            
            # Variant data
            "variant_title": self.create_variant_title(kit, panel, inverter),
            "variant_sku": self.generate_sku(kit, panel, inverter),
            
            # SEO
            "search_title": self.create_search_title(kit, panel, inverter),
            "seo_title": self.create_seo_title(kit, panel, inverter),
            "seo_description": f"Kit Solar {power}kWp completo com painéis {panel['manufacturer']} e {inverter['manufacturer']}. Gere até {int(power * 4.5 * 30)}kWh/mês. Sistema {'modular' if inverter.get('is_microinverter') else 'grid-tie'}. FOTUS.",
            
            # Tags
            "tags": self.generate_tags(kit, panel, inverter),
            
            # Metadata
            "original_name": kit.get("name"),
            "panel_info": panel,
            "inverter_info": inverter,
            "system_power_kwp": power
        }
        
        self.processed += 1
        return normalized
    
    def process_file(self, input_path: Path, output_path: Path):
        """Process entire file."""
        print(f"\n📖 Reading: {input_path}")
        
        with open(input_path, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"✓ Loaded {len(kits)} kits")
        print(f"🔄 Normalizing titles for semantic search optimization...")
        
        normalized_kits = []
        for kit in kits:
            normalized = self.normalize_kit(kit)
            normalized_kits.append(normalized)
        
        print(f"💾 Saving to: {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(normalized_kits, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Normalization complete!")
        print(f"📊 Statistics:")
        print(f"   - Processed: {len(kits)} kits")
        print(f"   - Normalized: {len(normalized_kits)} kits")
        
        # Show samples
        print(f"\n📝 Sample normalized titles:\n")
        for i, kit in enumerate(normalized_kits[:3], 1):
            print(f"   Kit {i}:")
            print(f"   • Original: {kit['original_name'][:70]}...")
            print(f"   • Product Title: {kit['title']}")
            print(f"   • Variant Title: {kit['variant_title']}")
            print(f"   • Search Title: {kit['search_title'][:70]}...")
            print(f"   • SKU: {kit['variant_sku']}")
            print(f"   • Handle: {kit['handle']}")
            print()
        
        print(f"✅ Complete! Normalized kits saved to:")
        print(f"   {output_path}")
        print(f"\n🎯 Ready for:")
        print(f"   • Medusa.js product import")
        print(f"   • Gemma3 semantic search indexing")
        print(f"   • ChromaDB vector store")


def main():
    """Main execution."""
    script_dir = Path(__file__).parent
    
    # Process regular kits
    print("\n" + "="*80)
    print("🚀 FOTUS KITS NORMALIZATION")
    print("="*80)
    
    input_file = script_dir / "fotus-kits.json"
    output_file = script_dir / "fotus-kits-normalized.json"
    
    if input_file.exists():
        normalizer = FotusNormalizer()
        normalizer.process_file(input_file, output_file)
    else:
        print(f"❌ File not found: {input_file}")
    
    # Process hybrid kits
    print("\n" + "="*80)
    print("🚀 FOTUS HYBRID KITS NORMALIZATION")
    print("="*80)
    
    input_file_hibridos = script_dir / "fotus-kits-hibridos.json"
    output_file_hibridos = script_dir / "fotus-kits-hibridos-normalized.json"
    
    if input_file_hibridos.exists():
        normalizer_hibridos = FotusNormalizer()
        normalizer_hibridos.process_file(input_file_hibridos, output_file_hibridos)
    else:
        print(f"❌ File not found: {input_file_hibridos}")
    
    print("\n\n🎉 FOTUS NORMALIZATION COMPLETE!")


if __name__ == "__main__":
    main()
