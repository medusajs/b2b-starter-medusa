"""
NeoSolar CSV Parser and Normalizer
Extracts kits from multiple CSV files and normalizes for Medusa.js
"""

import pandas as pd
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple
import glob


class NeoSolarParser:
    """Parse and normalize NeoSolar kit data."""
    
    MANUFACTURER_MAP = {
        # Panels
        "ZTROON": "Ztroon",
        "SUNOVA": "Sunova",
        "CANADIAN": "Canadian Solar",
        "JINKO": "JinkoSolar",
        "LONGI": "LONGi",
        "TRINA": "Trina Solar",
        "JA SOLAR": "JA Solar",
        "RISEN": "Risen",
        "BYD": "BYD",
        "ASTRONERGY": "Astronergy",
        
        # Inverters/Controllers
        "EPEVER": "Epever",
        "VICTRON": "Victron Energy",
        "GROWATT": "Growatt",
        "DEYE": "Deye",
        "GOODWE": "GoodWe",
        "FRONIUS": "Fronius",
        "SMA": "SMA",
        
        # Batteries
        "FREEDOM": "Freedom",
        "UNIPOWER": "Unipower",
        "MOURA": "Moura",
        "HELIAR": "Heliar"
    }
    
    def __init__(self):
        self.kits = []
        self.stats = {
            "total_files": 0,
            "total_rows": 0,
            "kits_found": 0,
            "errors": 0
        }
    
    def normalize_manufacturer(self, text: str) -> str:
        """Standardize manufacturer name."""
        if not text:
            return "Unknown"
        
        text_upper = text.upper()
        for key, value in self.MANUFACTURER_MAP.items():
            if key in text_upper:
                return value
        
        # Try to extract brand from text
        words = text.split()
        if words:
            return words[0].title()
        
        return "Unknown"
    
    def extract_power_from_text(self, text: str) -> float:
        """Extract power in kWp from text."""
        if not text:
            return 0
        
        # Try kWp format
        kwp_match = re.search(r'(\d+\.?\d*)\s*kWp', text, re.IGNORECASE)
        if kwp_match:
            return float(kwp_match.group(1))
        
        # Try Wp format
        wp_match = re.search(r'(\d+)\s*Wp', text, re.IGNORECASE)
        if wp_match:
            return float(wp_match.group(1)) / 1000
        
        return 0
    
    def extract_price(self, text: str) -> float:
        """Extract price from Brazilian format."""
        if not text or pd.isna(text):
            return 0
        
        # Remove R$ and convert
        text = str(text).replace('R$', '').replace('.', '').replace(',', '.').strip()
        try:
            return float(text)
        except:
            return 0
    
    def parse_components(self, description: str) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        """
        Parse component description into panels, inverters/controllers, and batteries.
        Format: "3x 460Wp Sunova | 1x 100Ah/48V Lítio Unipower | 1x 30A MPPT Epever"
        """
        panels = []
        inverters = []
        batteries = []
        
        if not description or pd.isna(description):
            return panels, inverters, batteries
        
        # Split by pipe
        parts = [p.strip() for p in description.split('|')]
        
        for part in parts:
            # Extract quantity and specs
            qty_match = re.search(r'(\d+)x?\s+', part)
            quantity = int(qty_match.group(1)) if qty_match else 1
            
            # Panel detection (Wp)
            if 'Wp' in part.upper():
                power_match = re.search(r'(\d+)\s*Wp', part, re.IGNORECASE)
                power = int(power_match.group(1)) if power_match else 0
                
                # Extract manufacturer
                remaining = part.split('Wp', 1)[1] if 'Wp' in part else part
                manufacturer = self.normalize_manufacturer(remaining)
                
                panels.append({
                    "brand": manufacturer,
                    "power_w": power,
                    "quantity": quantity,
                    "description": part.strip()
                })
            
            # Battery detection (Ah)
            elif 'Ah' in part.upper():
                ah_match = re.search(r'(\d+)\s*Ah', part, re.IGNORECASE)
                capacity = int(ah_match.group(1)) if ah_match else 0
                
                voltage_match = re.search(r'(\d+)\s*V', part, re.IGNORECASE)
                voltage = int(voltage_match.group(1)) if voltage_match else 12
                
                tech = "Lítio" if "LÍTIO" in part.upper() else "Chumbo-Ácido"
                
                manufacturer = self.normalize_manufacturer(part)
                
                batteries.append({
                    "brand": manufacturer,
                    "capacity_ah": capacity,
                    "voltage_v": voltage,
                    "technology": tech,
                    "quantity": quantity,
                    "description": part.strip()
                })
            
            # Inverter/Controller detection (A MPPT/PWM or kW)
            elif any(x in part.upper() for x in ['MPPT', 'PWM', 'INVERSOR', 'CONTROLADOR']):
                # Check for current rating (charge controllers)
                current_match = re.search(r'(\d+)\s*A\s+(MPPT|PWM)', part, re.IGNORECASE)
                if current_match:
                    rating = f"{current_match.group(1)}A"
                    inv_type = current_match.group(2).upper()
                else:
                    # Check for power rating (inverters)
                    kw_match = re.search(r'(\d+\.?\d*)\s*kW', part, re.IGNORECASE)
                    rating = f"{kw_match.group(1)}kW" if kw_match else "Unknown"
                    inv_type = "Inversor"
                
                manufacturer = self.normalize_manufacturer(part)
                
                inverters.append({
                    "brand": manufacturer,
                    "rating": rating,
                    "type": inv_type,
                    "quantity": quantity,
                    "description": part.strip()
                })
            
            # Handle "Sem Inversor" case
            elif "SEM INVERSOR" in part.upper():
                inverters.append({
                    "brand": "None",
                    "rating": "0kW",
                    "type": "Sem Inversor",
                    "quantity": 0,
                    "description": "Sem Inversor"
                })
        
        return panels, inverters, batteries
    
    def detect_kit_type(self, title: str, panels: List, inverters: List, batteries: List) -> str:
        """Detect if kit is off-grid, hybrid, or grid-tie."""
        title_upper = title.upper()
        
        if "OFF GRID" in title_upper or "OFF-GRID" in title_upper:
            return "off-grid"
        elif "HYBRID" in title_upper or "HÍBRIDO" in title_upper:
            return "hybrid"
        elif len(batteries) > 0:
            return "off-grid"  # Has batteries = probably off-grid
        else:
            return "grid-tie"
    
    def parse_csv_file(self, file_path: Path) -> List[Dict]:
        """Parse single CSV file."""
        try:
            df = pd.read_csv(file_path, encoding='utf-8')
            self.stats["total_files"] += 1
            self.stats["total_rows"] += len(df)
            
            kits = []
            
            for idx, row in df.iterrows():
                try:
                    # Extract data
                    title = row.get('MuiTypography-root', '')
                    description = row.get('MuiTypography-root 2', '')
                    price_text = row.get('MuiTypography-root 4', '')
                    image_url = row.get('MuiBox-root src', '')
                    product_url = row.get('MuiStack-root href', '')
                    status = row.get('MuiButtonBase-root 3', 'Disponível')
                    
                    # Skip if not a kit
                    if not title or pd.isna(title) or 'Kit' not in str(title):
                        continue
                    
                    # Extract product ID from URL
                    product_id = ""
                    if product_url:
                        id_match = re.search(r'produto/(\d+)', product_url)
                        if id_match:
                            product_id = f"NEO-{id_match.group(1)}"
                    
                    if not product_id:
                        product_id = f"NEO-{idx+1:05d}"
                    
                    # Parse components
                    panels, inverters, batteries = self.parse_components(description)
                    
                    # Extract power
                    power_kwp = self.extract_power_from_text(title)
                    if power_kwp == 0 and panels:
                        # Calculate from panels
                        total_wp = sum(p['power_w'] * p['quantity'] for p in panels)
                        power_kwp = total_wp / 1000
                    
                    # Extract price
                    price = self.extract_price(price_text)
                    
                    # Detect kit type
                    kit_type = self.detect_kit_type(title, panels, inverters, batteries)
                    
                    # Build kit object
                    kit = {
                        "id": product_id,
                        "name": str(title).strip(),
                        "type": kit_type,
                        "potencia_kwp": round(power_kwp, 2),
                        "price_brl": price,
                        "status": status,
                        "panels": panels,
                        "inverters": inverters,
                        "batteries": batteries,
                        "total_panels": sum(p['quantity'] for p in panels),
                        "total_inverters": sum(i['quantity'] for i in inverters),
                        "total_batteries": sum(b['quantity'] for b in batteries),
                        "total_power_w": int(sum(p['power_w'] * p['quantity'] for p in panels)),
                        "distributor": "NeoSolar",
                        "image_url": image_url if image_url and not pd.isna(image_url) else "",
                        "product_url": product_url if product_url and not pd.isna(product_url) else "",
                        "description_short": str(description).strip() if description and not pd.isna(description) else "",
                        "pricing": {
                            "price": price,
                            "currency": "BRL",
                            "per_wp": round(price / (power_kwp * 1000), 2) if power_kwp > 0 else 0
                        }
                    }
                    
                    kits.append(kit)
                    self.stats["kits_found"] += 1
                    
                except Exception as e:
                    print(f"   ⚠️  Error processing row {idx}: {e}")
                    self.stats["errors"] += 1
            
            return kits
            
        except Exception as e:
            print(f"   ❌ Error reading file {file_path}: {e}")
            self.stats["errors"] += 1
            return []
    
    def parse_all_files(self, directory: Path) -> List[Dict]:
        """Parse all CSV files in directory."""
        csv_files = glob.glob(str(directory / "https___portalb2b.neosolar.com*.csv"))
        
        print(f"\n📂 Found {len(csv_files)} CSV files")
        print(f"🔄 Processing files...\n")
        
        all_kits = []
        
        for csv_file in sorted(csv_files):
            file_path = Path(csv_file)
            print(f"   📄 {file_path.name}...")
            kits = self.parse_csv_file(file_path)
            all_kits.extend(kits)
            print(f"      ✓ Found {len(kits)} kits")
        
        return all_kits
    
    def save_kits(self, kits: List[Dict], output_path: Path):
        """Save parsed kits to JSON."""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(kits, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Saved {len(kits)} kits to: {output_path}")


class NeoSolarNormalizer:
    """Normalize NeoSolar kits for Medusa.js."""
    
    def __init__(self):
        self.processed = 0
    
    def normalize_manufacturer(self, name: str) -> str:
        """Standardize manufacturer name."""
        parser = NeoSolarParser()
        return parser.normalize_manufacturer(name)
    
    def create_product_title(self, kit: Dict) -> str:
        """Create main product title."""
        power = kit.get("potencia_kwp", 0)
        kit_type = kit.get("type", "grid-tie")
        
        panels = kit.get("panels", [])
        panel_brand = panels[0]["brand"] if panels else "Panel"
        
        inverters = kit.get("inverters", [])
        batteries = kit.get("batteries", [])
        
        if kit_type == "off-grid":
            battery_info = f"{batteries[0]['capacity_ah']}Ah" if batteries else "Battery"
            return f"Kit Solar Off-Grid {power}kWp - {panel_brand} + {battery_info}"
        elif kit_type == "hybrid":
            return f"Kit Solar Híbrido {power}kWp - {panel_brand}"
        else:
            inv_brand = inverters[0]["brand"] if inverters else "Inverter"
            return f"Kit Solar {power}kWp - {panel_brand} + {inv_brand}"
    
    def create_variant_title(self, kit: Dict) -> str:
        """Create variant title."""
        panels = kit.get("panels", [])
        inverters = kit.get("inverters", [])
        batteries = kit.get("batteries", [])
        
        parts = []
        
        if panels:
            p = panels[0]
            parts.append(f"{p['power_w']}W x{p['quantity']} Painéis")
        
        if batteries:
            b = batteries[0]
            parts.append(f"{b['capacity_ah']}Ah/{b['voltage_v']}V")
        
        if inverters:
            i = inverters[0]
            parts.append(f"{i['rating']} {i['type']}")
        
        return " / ".join(parts)
    
    def create_search_title(self, kit: Dict) -> str:
        """Create search-optimized title."""
        power = kit.get("potencia_kwp", 0)
        kit_type = kit.get("type", "grid-tie")
        
        panels = kit.get("panels", [])
        panel_brand = panels[0]["brand"] if panels else "Panel"
        
        batteries = kit.get("batteries", [])
        
        if kit_type == "off-grid":
            battery_tech = batteries[0]["technology"] if batteries else ""
            return f"{power}kWp Off-Grid Solar Kit {panel_brand} Panel {battery_tech} Battery System"
        elif kit_type == "hybrid":
            return f"{power}kWp Hybrid Solar Energy Kit {panel_brand} Panel Battery Backup System"
        else:
            inverters = kit.get("inverters", [])
            inv_brand = inverters[0]["brand"] if inverters else "Inverter"
            return f"{power}kWp Solar Energy Kit {panel_brand} Panel {inv_brand} Inverter Grid-Tie System"
    
    def create_seo_title(self, kit: Dict) -> str:
        """Create SEO title."""
        power = kit.get("potencia_kwp", 0)
        kit_type_label = {
            "off-grid": "Off-Grid",
            "hybrid": "Híbrido",
            "grid-tie": "Grid-Tie"
        }.get(kit.get("type", "grid-tie"), "")
        
        panels = kit.get("panels", [])
        panel_brand = panels[0]["brand"] if panels else ""
        
        return f"Kit Solar {kit_type_label} {power}kWp {panel_brand} | NeoSolar"
    
    def create_handle(self, kit: Dict) -> str:
        """Create URL-safe handle."""
        power = kit.get("potencia_kwp", 0)
        kit_type = kit.get("type", "grid-tie")
        
        panels = kit.get("panels", [])
        panel_brand = panels[0]["brand"].lower().replace(" ", "-") if panels else "panel"
        
        handle = f"solar-kit-{kit_type}-{power}kwp-{panel_brand}"
        
        # Clean
        handle = re.sub(r'[^a-z0-9\-]', '', handle)
        handle = re.sub(r'\-+', '-', handle)
        
        return handle
    
    def generate_sku(self, kit: Dict) -> str:
        """Generate unique SKU."""
        power = kit.get("potencia_kwp", 0)
        
        panels = kit.get("panels", [])
        panel_code = panels[0]["brand"][:3].upper() if panels else "UNK"
        
        kit_type_code = {
            "off-grid": "OG",
            "hybrid": "HY",
            "grid-tie": "GT"
        }.get(kit.get("type", "grid-tie"), "GT")
        
        # Extract ID number
        kit_id = kit.get("id", "")
        id_match = re.search(r'(\d+)', kit_id)
        id_num = id_match.group(1) if id_match else "00001"
        
        return f"NEO-{kit_type_code}-{power}KWP-{panel_code}-{id_num}"
    
    def generate_tags(self, kit: Dict) -> List[str]:
        """Generate strategic tags."""
        power = kit.get("potencia_kwp", 0)
        kit_type = kit.get("type", "grid-tie")
        
        tags = ["Kit Solar", "Energia Solar", "Sistema Fotovoltaico"]
        
        # Type tags
        if kit_type == "off-grid":
            tags.extend(["Off-Grid", "Autônomo", "Sistema Isolado"])
        elif kit_type == "hybrid":
            tags.extend(["Híbrido", "Bateria", "Backup"])
        else:
            tags.extend(["Grid-Tie", "On-Grid", "Conectado à Rede"])
        
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
        
        # Component brands
        panels = kit.get("panels", [])
        if panels and panels[0]["brand"] != "Unknown":
            tags.append(f"Painel {panels[0]['brand']}")
        
        batteries = kit.get("batteries", [])
        if batteries:
            tags.append(f"Bateria {batteries[0]['brand']}")
            tags.append(batteries[0]["technology"])
        
        # Status
        if kit.get("status") == "Disponível":
            tags.append("Em Estoque")
        
        return tags
    
    def create_description(self, kit: Dict) -> str:
        """Create comprehensive description."""
        power = kit.get("potencia_kwp", 0)
        kit_type = kit.get("type", "grid-tie")
        monthly_gen = int(power * 4.5 * 30)
        
        panels = kit.get("panels", [])
        inverters = kit.get("inverters", [])
        batteries = kit.get("batteries", [])
        
        type_desc = {
            "off-grid": "autônomo (off-grid) com armazenamento em bateria",
            "hybrid": "híbrido com backup de bateria e conexão à rede",
            "grid-tie": "conectado à rede elétrica (grid-tie)"
        }.get(kit_type, "fotovoltaico")
        
        desc = f"""# Kit Solar {power}kWp - Sistema {type_desc.title()}

## {"Sistema Autônomo" if kit_type == "off-grid" else f"Gere até {monthly_gen}kWh por mês"}

**Kit completo NeoSolar** com componentes selecionados para máxima eficiência.

### Componentes Incluídos

"""
        
        # Panels
        if panels:
            for p in panels:
                desc += f"""**Painéis Solares {p['brand']}**
- Potência: {p['power_w']}W por painel
- Quantidade: {p['quantity']} unidades
- Total: {p['power_w'] * p['quantity']}Wp

"""
        
        # Batteries
        if batteries:
            for b in batteries:
                desc += f"""**Bateria {b['brand']} {b['technology']}**
- Capacidade: {b['capacity_ah']}Ah
- Tensão: {b['voltage_v']}V
- Quantidade: {b['quantity']} unidade(s)
- Tecnologia: {b['technology']}

"""
        
        # Inverters/Controllers
        if inverters:
            for i in inverters:
                if i['brand'] != "None":
                    desc += f"""**{i['type']} {i['brand']}**
- Capacidade: {i['rating']}
- Quantidade: {i['quantity']} unidade(s)

"""
        
        desc += f"""### Ideal Para

"""
        
        if kit_type == "off-grid":
            desc += """- Locais sem acesso à rede elétrica
- Sítios, fazendas e casas de campo
- Sistemas autônomos com autonomia energética
- Alimentação de equipamentos essenciais"""
        elif kit_type == "hybrid":
            desc += """- Residências com backup de energia
- Proteção contra quedas de energia
- Uso otimizado de energia solar e bateria
- Economia com autoconsumo"""
        else:
            if power <= 3:
                desc += """- Residências pequenas
- Consumo até 500kWh/mês
- Redução da conta de luz"""
            elif power <= 6:
                desc += """- Residências médias
- Consumo moderado
- Famílias de 3-5 pessoas"""
            else:
                desc += """- Residências grandes ou comércio
- Alto consumo
- Máxima economia"""
        
        desc += f"""

### Fornecedor

**NeoSolar** - Distribuidor nacional de equipamentos fotovoltaicos
- Produtos certificados
- Garantia de fábrica
- Suporte técnico especializado
"""
        
        return desc
    
    def normalize_kit(self, kit: Dict) -> Dict:
        """Normalize complete kit."""
        power = kit.get("potencia_kwp", 0)
        
        normalized = {
            **kit,
            
            # Medusa.js fields
            "title": self.create_product_title(kit),
            "subtitle": self.create_search_title(kit),
            "description": self.create_description(kit),
            "handle": self.create_handle(kit),
            "status": "published" if kit.get("status") == "Disponível" else "draft",
            "type": f"Solar Kit {kit.get('type', 'grid-tie').title()}",
            "collection": "NeoSolar Solar Kits",
            
            # Variant
            "variant_title": self.create_variant_title(kit),
            "variant_sku": self.generate_sku(kit),
            
            # SEO
            "search_title": self.create_search_title(kit),
            "seo_title": self.create_seo_title(kit),
            "seo_description": f"Kit Solar {kit.get('type', 'grid-tie').title()} {power}kWp completo NeoSolar. {kit.get('description_short', '')[:100]}...",
            
            # Tags
            "tags": self.generate_tags(kit),
            
            # Metadata
            "original_name": kit.get("name"),
            "system_power_kwp": power
        }
        
        self.processed += 1
        return normalized
    
    def process_file(self, input_path: Path, output_path: Path):
        """Process and normalize file."""
        print(f"\n📖 Reading: {input_path}")
        
        with open(input_path, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"✓ Loaded {len(kits)} kits")
        print(f"🔄 Normalizing...")
        
        normalized = [self.normalize_kit(kit) for kit in kits]
        
        print(f"💾 Saving to: {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(normalized, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Complete! {len(normalized)} kits normalized")
        
        # Show samples
        print(f"\n📝 Sample normalized kits:\n")
        for i, kit in enumerate(normalized[:3], 1):
            print(f"   Kit {i}:")
            print(f"   • Type: {kit['type']}")
            print(f"   • Power: {kit['potencia_kwp']}kWp")
            print(f"   • Title: {kit['title']}")
            print(f"   • SKU: {kit['variant_sku']}")
            print(f"   • Handle: {kit['handle']}")
            print(f"   • Tags: {len(kit['tags'])} tags")
            print()


def main():
    """Main execution."""
    script_dir = Path(__file__).parent
    
    print("\n" + "="*80)
    print("🚀 NEOSOLAR KITS PARSER & NORMALIZER")
    print("="*80)
    
    # Step 1: Parse CSV files
    print("\n📋 STEP 1: Parsing CSV files...")
    parser = NeoSolarParser()
    kits = parser.parse_all_files(script_dir)
    
    print(f"\n📊 Parsing Statistics:")
    print(f"   • Files processed: {parser.stats['total_files']}")
    print(f"   • Total rows: {parser.stats['total_rows']}")
    print(f"   • Kits found: {parser.stats['kits_found']}")
    print(f"   • Errors: {parser.stats['errors']}")
    
    # Save parsed data
    parsed_file = script_dir / "neosolar-kits-parsed.json"
    parser.save_kits(kits, parsed_file)
    
    # Step 2: Normalize
    print("\n" + "="*80)
    print("📋 STEP 2: Normalizing kits...")
    print("="*80)
    
    normalizer = NeoSolarNormalizer()
    output_file = script_dir / "neosolar-kits-normalized.json"
    normalizer.process_file(parsed_file, output_file)
    
    print(f"\n✅ NEOSOLAR COMPLETE!")
    print(f"\n📁 Output files:")
    print(f"   • Parsed: {parsed_file}")
    print(f"   • Normalized: {output_file}")
    print(f"\n🎯 Ready for Medusa.js import!")


if __name__ == "__main__":
    main()
