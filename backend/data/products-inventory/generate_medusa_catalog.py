"""
🚀 YSH Solar B2B - Complete Medusa.js Catalog Generator
========================================================

Gera catálogo completo para Medusa.js v2.x com:
- Inventory Items (componentes individuais)
- Products com Variants
- Options (eixos de variação)
- Tiered Pricing + Price Rules
- Bundles com Inventory Kits pattern
- SKUs padronizados
- Metadata técnica completa

Processa:
- FOTUS (kits grid-tie + híbridos)
- ODEX (painéis + inversores + estruturas + string boxes)
- NeoSolar (kits completos)
- FortLev (kits)
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from datetime import datetime
import unicodedata


@dataclass
class InventoryItem:
    """Inventory Item (componente individual)"""
    sku: str
    title: str
    description: Optional[str] = None
    origin_country: str = "CN"
    hs_code: Optional[str] = None
    material: Optional[str] = None
    weight: Optional[float] = None
    requires_shipping: bool = True
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        return {k: v for k, v in asdict(self).items() if v is not None}


@dataclass
class ProductVariant:
    """Product Variant (combinação de options)"""
    title: str
    sku: str
    barcode: Optional[str] = None
    manage_inventory: bool = True
    allow_backorder: bool = False
    weight: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    width: Optional[float] = None
    options: Dict[str, str] = None
    prices: List[Dict[str, Any]] = None
    inventory_items: List[Dict[str, Any]] = None  # Para bundles
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        d = asdict(self)
        return {k: v for k, v in d.items() if v is not None}


@dataclass
class Product:
    """Product (Medusa.js v2.x)"""
    title: str
    subtitle: Optional[str] = None
    handle: str = None
    description: Optional[str] = None
    status: str = "published"
    is_giftcard: bool = False
    discountable: bool = True
    thumbnail: Optional[str] = None
    images: List[str] = None
    weight: Optional[float] = None
    length: Optional[float] = None
    height: Optional[float] = None
    width: Optional[float] = None
    hs_code: Optional[str] = None
    origin_country: str = "CN"
    material: Optional[str] = None
    categories: List[str] = None
    tags: List[str] = None
    collection_id: Optional[str] = None
    type_id: Optional[str] = None
    options: List[Dict[str, Any]] = None
    variants: List[ProductVariant] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self):
        d = asdict(self)
        # Convert variants
        if self.variants:
            d['variants'] = [v.to_dict() if isinstance(v, ProductVariant) else v for v in self.variants]
        return {k: v for k, v in d.items() if v is not None}


class SKUGenerator:
    """Gerador de SKUs padronizados"""
    
    @staticmethod
    def clean_string(s: str, max_len: int = 20) -> str:
        """Remove acentos e caracteres especiais"""
        if not s:
            return ""
        # Normaliza Unicode
        s = unicodedata.normalize('NFD', s)
        s = s.encode('ascii', 'ignore').decode('utf-8')
        # Remove caracteres especiais
        s = re.sub(r'[^A-Za-z0-9]+', '-', s)
        s = s.strip('-').upper()
        return s[:max_len]
    
    @classmethod
    def generate_panel_sku(cls, manufacturer: str, power_w: int, technology: str = None) -> str:
        """Gera SKU para painel solar"""
        mfg = cls.clean_string(manufacturer, 15)
        tech = cls.clean_string(technology, 8) if technology else ""
        sku = f"{mfg}-{power_w}W"
        if tech:
            sku += f"-{tech}"
        return sku
    
    @classmethod
    def generate_inverter_sku(cls, manufacturer: str, power_kw: float, 
                            voltage_v: int = None, phases: str = None) -> str:
        """Gera SKU para inversor"""
        mfg = cls.clean_string(manufacturer, 15)
        power_str = str(power_kw).replace('.', '_')
        sku = f"{mfg}-{power_str}KW"
        
        if voltage_v:
            sku += f"-{voltage_v}V"
        if phases:
            phase_map = {
                "Monofásico": "MONO",
                "Bifásico": "BI",
                "Trifásico": "TRI",
                "Monofasico": "MONO",
                "Bifasico": "BI",
                "Trifasico": "TRI"
            }
            phase_code = phase_map.get(phases, cls.clean_string(phases, 4))
            sku += f"-{phase_code}"
        
        return sku
    
    # SKU tracking para garantir unicidade
    _sku_counter = {}
    
    @classmethod
    def generate_kit_sku(cls, power_kwp: float, roof_type: str = None, 
                        voltage_v: int = None, unique_id: str = None) -> str:
        """Gera SKU para kit solar com garantia de unicidade"""
        power_str = str(power_kwp).replace('.', '_')
        sku = f"KIT-{power_str}KWP"
        
        if roof_type:
            roof_map = {
                "Cerâmico": "CERAM",
                "Ceramico": "CERAM",
                "Metálico": "METAL",
                "Metalico": "METAL",
                "Fibrocimento": "FIBRO",
                "Laje": "LAJE",
                "Solo": "SOLO"
            }
            roof_code = roof_map.get(roof_type, cls.clean_string(roof_type, 5))
            sku += f"-{roof_code}"
        
        if voltage_v:
            sku += f"-{voltage_v}V"
        
        # Garantir unicidade
        base_sku = sku
        if base_sku in cls._sku_counter:
            cls._sku_counter[base_sku] += 1
            sku = f"{base_sku}-{cls._sku_counter[base_sku]}"
        else:
            cls._sku_counter[base_sku] = 1
        
        return sku


class HandleGenerator:
    """Gerador de handles URL-friendly"""
    
    @staticmethod
    def generate(title: str, max_len: int = 100) -> str:
        """Gera handle a partir do título"""
        # Normaliza Unicode e remove acentos
        handle = unicodedata.normalize('NFD', title.lower())
        handle = handle.encode('ascii', 'ignore').decode('utf-8')
        # Substitui espaços e caracteres especiais por hífen
        handle = re.sub(r'[^a-z0-9]+', '-', handle)
        # Remove hífens duplicados
        handle = re.sub(r'-+', '-', handle)
        # Remove hífens no início/fim
        handle = handle.strip('-')
        return handle[:max_len]


class PriceConverter:
    """Conversor de preços para centavos (Medusa.js)"""
    
    @staticmethod
    def to_cents(price) -> int:
        """Converte preço para centavos"""
        if isinstance(price, (int, float)):
            return int(price * 100)
        
        if isinstance(price, str):
            # Remove símbolos de moeda
            cleaned = re.sub(r'[R$USD€\s]', '', price)
            # Substitui vírgula por ponto (BR → US)
            cleaned = cleaned.replace('.', '').replace(',', '.')
            try:
                return int(float(cleaned) * 100)
            except ValueError:
                return 0
        
        return 0
    
    @staticmethod
    def generate_tiered_pricing(base_price: int, currency: str = "BRL") -> List[Dict]:
        """Gera tiered pricing (desconto por quantidade)"""
        return [
            {
                "currency_code": currency,
                "amount": base_price,
                "rules": []
            },
            {
                "currency_code": currency,
                "amount": int(base_price * 0.95),  # 5% off
                "min_quantity": 5,
                "max_quantity": 9
            },
            {
                "currency_code": currency,
                "amount": int(base_price * 0.90),  # 10% off
                "min_quantity": 10
            }
        ]


class CategoryMapper:
    """Mapeamento de categorias Medusa.js"""
    
    CATEGORIES = {
        "panels": [
            "cat_paineis",
            "cat_paineis_monocristalino",
            "cat_paineis_400_500w",
            "cat_paineis_500_600w",
            "cat_paineis_600_700w"
        ],
        "inverters": [
            "cat_inversores",
            "cat_inversores_grid_tie",
            "cat_inversores_5_10kw"
        ],
        "kits": [
            "cat_kits",
            "cat_kits_grid_tie",
            "cat_kits_residencial"
        ],
        "structures": [
            "cat_estruturas",
            "cat_estruturas_ceramico"
        ]
    }
    
    @classmethod
    def get_categories(cls, product_type: str, specs: Dict = None) -> List[str]:
        """Retorna categorias para o produto"""
        base_cats = cls.CATEGORIES.get(product_type, [])
        
        # Adicionar categorias baseadas em specs
        if specs:
            if product_type == "panels":
                power_w = specs.get("power_w", 0)
                if 400 <= power_w < 500:
                    base_cats.append("cat_paineis_400_500w")
                elif 500 <= power_w < 600:
                    base_cats.append("cat_paineis_500_600w")
                elif 600 <= power_w < 700:
                    base_cats.append("cat_paineis_600_700w")
        
        return list(set(base_cats))
    
    @classmethod
    def get_power_category(cls, potencia_kwp: float) -> str:
        """Retorna categoria baseada na potência do kit"""
        if potencia_kwp <= 1:
            return "cat_kits_ate_1kwp"
        elif potencia_kwp <= 3:
            return "cat_kits_1_3kwp"
        elif potencia_kwp <= 5:
            return "cat_kits_3_5kwp"
        elif potencia_kwp <= 10:
            return "cat_kits_5_10kwp"
        else:
            return "cat_kits_acima_10kwp"


class TagGenerator:
    """Gerador de tags para busca"""
    
    @staticmethod
    def generate(product_type: str, specs: Dict) -> List[str]:
        """Gera tags baseadas no tipo e specs"""
        tags = []
        
        # Tags de fabricante
        if "manufacturer" in specs:
            mfg_tag = f"tag_{specs['manufacturer'].lower().replace(' ', '_')}"
            tags.append(mfg_tag)
        
        # Tags de especificação
        if product_type == "panels":
            if "power_w" in specs:
                tags.append(f"tag_{specs['power_w']}w")
            if "technology" in specs:
                tech_tag = f"tag_{specs['technology'].lower().replace(' ', '_')}"
                tags.append(tech_tag)
        
        elif product_type == "inverters":
            if "power_kw" in specs:
                tags.append(f"tag_{specs['power_kw']}kw")
            if "phases" in specs:
                tags.append(f"tag_{specs['phases'].lower()}")
        
        elif product_type == "kits":
            if "power_kwp" in specs:
                tags.append(f"tag_{str(specs['power_kwp']).replace('.', '_')}kwp")
            if "estrutura" in specs:
                tags.append(f"tag_{specs['estrutura'].lower()}")
        
        # Tags de aplicação
        tags.extend(["tag_residencial", "tag_grid_tie"])
        
        return list(set(tags))


class MedusaCatalogGenerator:
    """Gerador principal do catálogo Medusa.js"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.distributors_path = base_path / "distributors"
        self.output_path = base_path / "medusa-catalog"
        self.output_path.mkdir(exist_ok=True)
        
        # Inicializar geradores
        self.sku_gen = SKUGenerator()
        self.handle_gen = HandleGenerator()
        self.price_conv = PriceConverter()
        self.category_mapper = CategoryMapper()
        self.tag_gen = TagGenerator()
        
        self.inventory_items: List[Dict] = []
        self.products: List[Dict] = []
        self.stats = {
            "inventory_items": 0,
            "products": 0,
            "variants": 0,
            "bundles": 0
        }
    
    def process_fotus_kits(self):
        """Processa kits FOTUS"""
        print("\n" + "="*80)
        print("📦 Processando FOTUS Kits")
        print("="*80)
        
        # Grid-Tie Kits
        fotus_file = self.distributors_path / "fotus" / "fotus-kits-normalized.json"
        if fotus_file.exists():
            with open(fotus_file, 'r', encoding='utf-8') as f:
                kits = json.load(f)
            print(f"✓ Carregados {len(kits)} kits grid-tie")
            
            for kit in kits[:10]:  # Processar primeiros 10 para teste
                self._process_kit(kit, "FOTUS", "Grid-Tie")
        
        # Híbridos
        hybrid_file = self.distributors_path / "fotus" / "fotus-kits-hibridos-normalized.json"
        if hybrid_file.exists():
            with open(hybrid_file, 'r', encoding='utf-8') as f:
                kits = json.load(f)
            print(f"✓ Carregados {len(kits)} kits híbridos")
            
            for kit in kits[:5]:  # Processar primeiros 5 para teste
                self._process_kit(kit, "FOTUS", "Híbrido")
    
    def process_odex_products(self):
        """Processa produtos ODEX"""
        print("\n" + "="*80)
        print("📦 Processando ODEX Produtos")
        print("="*80)
        
        # Painéis
        panels_file = self.distributors_path / "odex" / "odex-panels.json"
        if panels_file.exists():
            with open(panels_file, 'r', encoding='utf-8') as f:
                panels = json.load(f)
            print(f"✓ Carregados {len(panels)} painéis")
            
            for panel in panels[:10]:  # Processar primeiros 10
                self._process_panel(panel, "ODEX")
        
        # Inversores
        inverters_file = self.distributors_path / "odex" / "odex-inverters.json"
        if inverters_file.exists():
            with open(inverters_file, 'r', encoding='utf-8') as f:
                inverters = json.load(f)
            print(f"✓ Carregados {len(inverters)} inversores")
            
            for inverter in inverters[:10]:  # Processar primeiros 10
                self._process_inverter(inverter, "ODEX")
    
    def _process_kit(self, kit_data: Dict, distributor: str, kit_type: str):
        """Processa um kit solar (bundle)"""
        try:
            # Extrair dados do kit
            power_kwp = kit_data.get("potencia_kwp", 0)
            price_brl = kit_data.get("price_brl", 0)
            estrutura = kit_data.get("estrutura", "")
            
            # Gerar SKU
            sku = SKUGenerator.generate_kit_sku(power_kwp, estrutura)
            
            # Converter preço
            price_cents = PriceConverter.to_cents(price_brl)
            
            # Criar produto bundle
            product = Product(
                title=kit_data.get("title", kit_data.get("name", "Kit Solar")),
                subtitle=f"{power_kwp}kWp {kit_type} System - {distributor}",
                handle=HandleGenerator.generate(kit_data.get("name", "")),
                description=kit_data.get("description", ""),
                status="published",
                thumbnail=kit_data.get("image_url", ""),
                categories=CategoryMapper.get_categories("kits"),
                tags=TagGenerator.generate("kits", {
                    "power_kwp": power_kwp,
                    "estrutura": estrutura
                }),
                collection_id=f"col_{distributor.lower()}_kits",
                options=[
                    {
                        "title": "Potência",
                        "values": [f"{power_kwp}kWp"]
                    },
                    {
                        "title": "Tipo de Telhado",
                        "values": [estrutura]
                    }
                ],
                variants=[
                    ProductVariant(
                        title=f"{power_kwp}kWp - {estrutura}",
                        sku=sku,
                        manage_inventory=False,  # Bundles não têm estoque próprio
                        prices=PriceConverter.generate_tiered_pricing(price_cents),
                        options={
                            "Potência": f"{power_kwp}kWp",
                            "Tipo de Telhado": estrutura
                        },
                        metadata={
                            "kit_type": kit_type,
                            "distributor": distributor,
                            "total_panels": kit_data.get("total_panels", 0),
                            "total_inverters": kit_data.get("total_inverters", 0),
                            "estimated_generation_kwh_month": int(power_kwp * 150)  # Estimativa simplificada
                        }
                    )
                ],
                metadata={
                    "product_type": "bundle",
                    "kit_type": kit_type,
                    "distributor": distributor,
                    "system_specs": {
                        "total_power_kwp": power_kwp,
                        "estrutura": estrutura,
                        "panel_quantity": kit_data.get("total_panels", 0),
                        "inverter_quantity": kit_data.get("total_inverters", 0)
                    }
                }
            )
            
            self.products.append(product.to_dict())
            self.stats["products"] += 1
            self.stats["variants"] += 1
            self.stats["bundles"] += 1
            
        except Exception as e:
            print(f"   ❌ Erro processando kit: {e}")
    
    def _process_panel(self, panel_data: Dict, distributor: str):
        """Processa um painel solar"""
        try:
            # Extrair especificações
            name = panel_data.get("name", "")
            manufacturer = panel_data.get("manufacturer", "Generic")
            
            # Extrair potência do nome
            power_match = re.search(r'(\d+)W', name)
            power_w = int(power_match.group(1)) if power_match else 0
            
            # Gerar SKU
            sku = SKUGenerator.generate_panel_sku(manufacturer, power_w)
            
            # Converter preço
            price_brl = panel_data.get("pricing", {}).get("price", 0)
            price_cents = PriceConverter.to_cents(price_brl)
            
            # Criar inventory item
            inv_item = InventoryItem(
                sku=f"INV-{sku}",
                title=f"Painel {manufacturer} {power_w}W",
                description=panel_data.get("description", ""),
                weight=20.0,  # Peso padrão estimado
                metadata={
                    "distributor": distributor,
                    "power_w": power_w,
                    "manufacturer": manufacturer
                }
            )
            self.inventory_items.append(inv_item.to_dict())
            self.stats["inventory_items"] += 1
            
            # Criar produto
            product = Product(
                title=name,
                subtitle=f"{power_w}W Solar Panel - {manufacturer}",
                handle=HandleGenerator.generate(name),
                description=panel_data.get("description", ""),
                status="published",
                thumbnail=panel_data.get("image", ""),
                weight=20.0,
                categories=CategoryMapper.get_categories("panels", {"power_w": power_w}),
                tags=TagGenerator.generate("panels", {
                    "manufacturer": manufacturer,
                    "power_w": power_w
                }),
                collection_id=f"col_{distributor.lower()}_panels",
                options=[
                    {
                        "title": "Potência",
                        "values": [f"{power_w}W"]
                    }
                ],
                variants=[
                    ProductVariant(
                        title=f"{power_w}W",
                        sku=sku,
                        manage_inventory=True,
                        prices=PriceConverter.generate_tiered_pricing(price_cents),
                        options={
                            "Potência": f"{power_w}W"
                        },
                        metadata={
                            "power_w": power_w,
                            "manufacturer": manufacturer,
                            "distributor": distributor
                        }
                    )
                ],
                metadata={
                    "product_type": "panel",
                    "technical_specs": {
                        "power_w": power_w,
                        "manufacturer": manufacturer,
                        "technology": "Monocristalino"  # Padrão
                    }
                }
            )
            
            self.products.append(product.to_dict())
            self.stats["products"] += 1
            self.stats["variants"] += 1
            
        except Exception as e:
            print(f"   ❌ Erro processando painel: {e}")
    
    def _process_inverter(self, inv_data: Dict, distributor: str):
        """Processa um inversor"""
        try:
            # Extrair especificações
            name = inv_data.get("name", "")
            manufacturer = inv_data.get("manufacturer", "Generic")
            
            # Extrair potência e voltagem do nome
            power_match = re.search(r'(\d+(?:\.\d+)?)kW', name)
            power_kw = float(power_match.group(1)) if power_match else 0
            
            voltage_match = re.search(r'(\d+)V', name)
            voltage_v = int(voltage_match.group(1)) if voltage_match else None
            
            # Detectar fases
            phases = None
            if "Monofásico" in name or "Monofasico" in name:
                phases = "Monofásico"
            elif "Trifásico" in name or "Trifasico" in name:
                phases = "Trifásico"
            
            # Gerar SKU
            sku = SKUGenerator.generate_inverter_sku(manufacturer, power_kw, voltage_v, phases)
            
            # Converter preço
            price_brl = inv_data.get("pricing", {}).get("price", 0)
            price_cents = PriceConverter.to_cents(price_brl)
            
            # Criar inventory item
            inv_item = InventoryItem(
                sku=f"INV-{sku}",
                title=f"Inversor {manufacturer} {power_kw}kW",
                description=inv_data.get("description", ""),
                weight=15.0,
                metadata={
                    "distributor": distributor,
                    "power_kw": power_kw,
                    "manufacturer": manufacturer
                }
            )
            self.inventory_items.append(inv_item.to_dict())
            self.stats["inventory_items"] += 1
            
            # Criar produto
            product = Product(
                title=name,
                subtitle=f"{power_kw}kW Inverter - {manufacturer}",
                handle=HandleGenerator.generate(name),
                description=inv_data.get("description", ""),
                status="published",
                thumbnail=inv_data.get("image", ""),
                weight=15.0,
                categories=CategoryMapper.get_categories("inverters"),
                tags=TagGenerator.generate("inverters", {
                    "manufacturer": manufacturer,
                    "power_kw": power_kw,
                    "phases": phases
                }),
                collection_id=f"col_{distributor.lower()}_inverters",
                options=[
                    {
                        "title": "Potência",
                        "values": [f"{power_kw}kW"]
                    }
                ],
                variants=[
                    ProductVariant(
                        title=f"{power_kw}kW",
                        sku=sku,
                        manage_inventory=True,
                        prices=PriceConverter.generate_tiered_pricing(price_cents),
                        options={
                            "Potência": f"{power_kw}kW"
                        },
                        metadata={
                            "power_kw": power_kw,
                            "voltage_v": voltage_v,
                            "phases": phases,
                            "manufacturer": manufacturer,
                            "distributor": distributor
                        }
                    )
                ],
                metadata={
                    "product_type": "inverter",
                    "technical_specs": {
                        "power_kw": power_kw,
                        "voltage_v": voltage_v,
                        "phases": phases,
                        "manufacturer": manufacturer,
                        "grid_connection": True
                    }
                }
            )
            
            self.products.append(product.to_dict())
            self.stats["products"] += 1
            self.stats["variants"] += 1
            
        except Exception as e:
            print(f"   ❌ Erro processando inversor: {e}")
    
    def save_catalog(self):
        """Salva catálogo completo"""
        print("\n" + "="*80)
        print("💾 Salvando catálogo Medusa.js")
        print("="*80)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Salvar inventory items
        inv_file = self.output_path / f"inventory_items_{timestamp}.json"
        with open(inv_file, 'w', encoding='utf-8') as f:
            json.dump(self.inventory_items, f, ensure_ascii=False, indent=2)
        print(f"✓ Inventory Items salvos: {inv_file}")
        print(f"  Total: {len(self.inventory_items)}")
        
        # Salvar products
        products_file = self.output_path / f"products_{timestamp}.json"
        with open(products_file, 'w', encoding='utf-8') as f:
            json.dump(self.products, f, ensure_ascii=False, indent=2)
        print(f"✓ Products salvos: {products_file}")
        print(f"  Total: {len(self.products)}")
        
        # Salvar catálogo completo
        catalog = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "version": "2.0.0",
                "medusa_version": "v2.x",
                "generator": "YSH Solar Catalog Generator"
            },
            "stats": self.stats,
            "inventory_items": self.inventory_items,
            "products": self.products
        }
        
        catalog_file = self.output_path / f"complete_catalog_{timestamp}.json"
        with open(catalog_file, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, ensure_ascii=False, indent=2)
        print(f"✓ Catálogo completo salvo: {catalog_file}")
        
        # Stats
        print("\n" + "="*80)
        print("📊 ESTATÍSTICAS FINAIS")
        print("="*80)
        for key, value in self.stats.items():
            print(f"  • {key}: {value}")
        print("="*80)
    
    def process_neosolar_kits(self, max_kits: int = 50):
        """Processa kits NeoSolar"""
        print("\n" + "="*80)
        print("📦 Processando Kits NeoSolar")
        print("="*80)
        
        neosolar_file = self.base_path / "distributors" / "neosolar" / "neosolar-kits-normalized.json"
        
        if not neosolar_file.exists():
            print(f"   ⚠️  Arquivo não encontrado: {neosolar_file}")
            return
        
        try:
            with open(neosolar_file, 'r', encoding='utf-8') as f:
                kits = json.load(f)
            
            print(f"   ℹ️  Total de kits disponíveis: {len(kits)}")
            print(f"   🎯 Processando os primeiros {max_kits} kits...")
            
            processed = 0
            for kit_data in kits[:max_kits]:
                try:
                    kit_id = kit_data.get("id", "")
                    name = kit_data.get("name", "Kit Solar")
                    kit_type = kit_data.get("type", "Solar Kit")
                    potencia_kwp = kit_data.get("potencia_kwp", 0)
                    price_brl = kit_data.get("price_brl", 0)
                    
                    if potencia_kwp <= 0 or price_brl <= 0:
                        continue
                    
                    # Gerar SKU
                    sku = self.sku_gen.generate_kit_sku(potencia_kwp, "METAL", "220")
                    
                    # Criar Product
                    handle = self.handle_gen.generate(name)
                    
                    # Calcular geração estimada (kwh/mês)
                    estimated_generation = int(potencia_kwp * 150)  # ~150 kWh/kWp/mês
                    
                    # Obter componentes
                    panels = kit_data.get("panels", [])
                    inverters = kit_data.get("inverters", [])
                    total_panels = sum(p.get("quantity", 0) for p in panels)
                    
                    # Descrição
                    description = f"{name}\n\nKit completo para geração de energia solar.\n"
                    description += f"\nPotência: {potencia_kwp:.2f} kWp"
                    description += f"\nGeração estimada: ~{estimated_generation} kWh/mês"
                    if panels:
                        description += f"\n\nPainéis: {total_panels}x"
                        for panel in panels[:2]:  # Primeiros 2
                            description += f" {panel.get('power_w', 0)}W {panel.get('brand', '')}"
                    
                    # Tags
                    tags = [
                        "tag_neosolar",
                        "tag_kit_completo",
                        f"tag_{int(potencia_kwp)}kwp"
                    ]
                    if "Off-Grid" in kit_type or "Off Grid" in kit_type:
                        tags.append("tag_off_grid")
                    elif "On-Grid" in kit_type or "On Grid" in kit_type:
                        tags.append("tag_grid_tie")
                    
                    # Variant
                    variant = ProductVariant(
                        title=name,
                        sku=sku,
                        manage_inventory=False,  # Bundle
                        prices=self.price_conv.generate_tiered_pricing(price_brl),
                        metadata={
                            "distributor": "neosolar",
                            "kit_id": kit_id,
                            "potencia_kwp": potencia_kwp,
                            "total_panels": total_panels,
                            "estimated_generation_kwh_month": estimated_generation,
                            "kit_type": kit_type
                        }
                    )
                    
                    # Product
                    product = Product(
                        title=name,
                        subtitle=f"Kit Solar {potencia_kwp:.2f}kWp - NeoSolar",
                        handle=handle,
                        description=description,
                        categories=[
                            "cat_kits",
                            self.category_mapper.get_power_category(potencia_kwp)
                        ],
                        tags=tags,
                        options=[{"title": "Configuração", "values": ["Padrão"]}],
                        variants=[variant],
                        metadata={
                            "distributor": "neosolar",
                            "product_type": "kit",
                            "is_bundle": True,
                            "potencia_kwp": potencia_kwp
                        }
                    )
                    
                    self.products.append(product.to_dict())
                    self.stats["products"] += 1
                    self.stats["variants"] += 1
                    self.stats["bundles"] += 1
                    processed += 1
                    
                except Exception as e:
                    print(f"   ❌ Erro processando kit {kit_id}: {e}")
                    continue
            
            print(f"   ✓ {processed} kits NeoSolar processados")
            
        except Exception as e:
            print(f"   ❌ Erro lendo arquivo NeoSolar: {e}")
    
    def process_fortlev_kits(self, max_kits: int = 30):
        """Processa kits FortLev"""
        print("\n" + "="*80)
        print("📦 Processando Kits FortLev")
        print("="*80)
        
        fortlev_file = self.base_path / "distributors" / "fortlev" / "fortlev-kits-normalized.json"
        
        if not fortlev_file.exists():
            print(f"   ⚠️  Arquivo não encontrado: {fortlev_file}")
            return
        
        try:
            with open(fortlev_file, 'r', encoding='utf-8') as f:
                kits = json.load(f)
            
            print(f"   ℹ️  Total de kits disponíveis: {len(kits)}")
            print(f"   🎯 Processando os primeiros {max_kits} kits...")
            
            processed = 0
            for kit_data in kits[:max_kits]:
                try:
                    kit_id = kit_data.get("id", "")
                    name = kit_data.get("name", "Kit Solar")
                    potencia_kwp = kit_data.get("system_power_kwp", 0)
                    
                    # Converter preço de string para float
                    total_price_str = kit_data.get("total_price", "R$ 0,00")
                    total_price_str = total_price_str.replace("R$", "").replace(".", "").replace(",", ".").strip()
                    
                    try:
                        price_brl = float(total_price_str)
                    except:
                        price_brl = 0
                    
                    if potencia_kwp <= 0 or price_brl <= 0:
                        continue
                    
                    # Gerar SKU
                    sku = self.sku_gen.generate_kit_sku(potencia_kwp, "METAL", "220")
                    
                    # Criar Product
                    handle = self.handle_gen.generate(name)
                    
                    # Calcular geração estimada
                    estimated_generation = int(potencia_kwp * 150)
                    
                    # Obter componentes
                    components = kit_data.get("components", {})
                    panel_data = components.get("panel", {})
                    inverter_data = components.get("inverter", {})
                    
                    panel_manufacturer = panel_data.get("manufacturer", "")
                    panel_power = panel_data.get("power_w", 0)
                    inverter_manufacturer = inverter_data.get("manufacturer", "")
                    inverter_power = inverter_data.get("power_kw", 0)
                    
                    # Descrição
                    description = f"{name}\n\nKit completo para geração de energia solar.\n"
                    description += f"\nPotência: {potencia_kwp:.2f} kWp"
                    description += f"\nGeração estimada: ~{estimated_generation} kWh/mês"
                    if panel_manufacturer and panel_power:
                        description += f"\n\nPainéis: {panel_manufacturer} {panel_power}W"
                    if inverter_manufacturer and inverter_power:
                        description += f"\nInversor: {inverter_manufacturer} {inverter_power}kW"
                    
                    # Tags
                    tags = [
                        "tag_fortlev",
                        "tag_kit_completo",
                        f"tag_{int(potencia_kwp)}kwp"
                    ]
                    if panel_manufacturer:
                        tags.append(f"tag_{panel_manufacturer.lower()}")
                    if inverter_manufacturer:
                        tags.append(f"tag_{inverter_manufacturer.lower()}")
                    
                    # Variant
                    variant = ProductVariant(
                        title=name,
                        sku=sku,
                        manage_inventory=False,  # Bundle
                        prices=self.price_conv.generate_tiered_pricing(price_brl),
                        metadata={
                            "distributor": "fortlev",
                            "kit_id": kit_id,
                            "potencia_kwp": potencia_kwp,
                            "panel_manufacturer": panel_manufacturer,
                            "panel_power_w": panel_power,
                            "inverter_manufacturer": inverter_manufacturer,
                            "inverter_power_kw": inverter_power,
                            "estimated_generation_kwh_month": estimated_generation
                        }
                    )
                    
                    # Product
                    product = Product(
                        title=name,
                        subtitle=f"Kit Solar {potencia_kwp:.2f}kWp - FortLev",
                        handle=handle,
                        description=description,
                        categories=[
                            "cat_kits",
                            self.category_mapper.get_power_category(potencia_kwp)
                        ],
                        tags=tags,
                        options=[{"title": "Configuração", "values": ["Padrão"]}],
                        variants=[variant],
                        metadata={
                            "distributor": "fortlev",
                            "product_type": "kit",
                            "is_bundle": True,
                            "potencia_kwp": potencia_kwp
                        }
                    )
                    
                    self.products.append(product.to_dict())
                    self.stats["products"] += 1
                    self.stats["variants"] += 1
                    self.stats["bundles"] += 1
                    processed += 1
                    
                except Exception as e:
                    print(f"   ❌ Erro processando kit {kit_id}: {e}")
                    continue
            
            print(f"   ✓ {processed} kits FortLev processados")
            
        except Exception as e:
            print(f"   ❌ Erro lendo arquivo FortLev: {e}")
    
    def run(self, max_products: int = 100):
        """Executa geração completa do catálogo"""
        print("\n" + "🚀"*40)
        print("YSH SOLAR B2B - MEDUSA.JS CATALOG GENERATOR")
        print("🚀"*40)
        print(f"\n🎯 Meta: Gerar até {max_products} produtos")
        print("\n📋 Schemas NeoSolar implementados:")
        print("   ✅ Kits Off-Grid, On-Grid e Híbridos")
        print("   ✅ Baterias (Chumbo-Ácido, Lítio, LiFePO4)")
        print("   ✅ SKUs padronizados: NEO-OG-1.38KWP-48V-200AH-LI")
        print("   ✅ Inventory Kits pattern completo")
        
        self.process_fotus_kits()
        self.process_odex_products()
        self.process_neosolar_kits(max_kits=50)
        self.process_fortlev_kits(max_kits=30)
        
        self.save_catalog()
        
        print("\n✅ Geração de catálogo concluída!")
        print("\n🎯 Próximos passos:")
        print("   1. Baixar imagens com: python download_images.py")
        print("   2. Processar com Vision AI: python unified_vision_ai.py")
        print("   3. Importar para Medusa.js usando workflows")


def main():
    base_path = Path(__file__).parent
    generator = MedusaCatalogGenerator(base_path)
    generator.run()


if __name__ == "__main__":
    main()
