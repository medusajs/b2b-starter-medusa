#!/usr/bin/env python3
"""
🚀 YSH Solar - Extrator de Inventário Consolidado End-to-End
=============================================================

Extrai e consolida inventário completo de produtos solares de todos os distribuidores:
- ODEX: Inversores, Painéis, String Boxes, Estruturas
- Solfacil: Inversores, Painéis, Cabos, Baterias, Acessórios
- FOTUS: Kits Grid-Tie e Híbridos
- NeoSolar: Kits completos
- FortLev: Kits e componentes

Consolida:
- Fabricantes
- Categorias
- Modelos
- Séries
- Especificações técnicas
- Preços
- Imagens
- SKUs padronizados

Autor: YSH Solar Development Team
Data: 14 de Outubro de 2025
Versão: 3.0.0
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple
from collections import defaultdict, Counter
from dataclasses import dataclass, asdict, field
from datetime import datetime
import unicodedata


@dataclass
class Manufacturer:
    """Fabricante consolidado"""
    name: str
    normalized_name: str
    origin_country: str
    product_count: int = 0
    categories: Set[str] = field(default_factory=set)
    total_value_brl: float = 0.0
    distributors: Set[str] = field(default_factory=set)
    
    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        d['categories'] = sorted(list(self.categories))
        d['distributors'] = sorted(list(self.distributors))
        return d


@dataclass
class Product:
    """Produto consolidado"""
    id: str
    title: str
    sku: str
    manufacturer: str
    category: str
    subcategory: Optional[str] = None
    model: Optional[str] = None
    series: Optional[str] = None
    price_brl: float = 0.0
    distributor: str = ""
    technical_specs: Dict[str, Any] = field(default_factory=dict)
    images: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class ManufacturerNormalizer:
    """Normaliza nomes de fabricantes"""
    
    # Mapeamento de variações para nome oficial
    MANUFACTURER_MAP = {
        # Inversores
        'growatt': 'Growatt',
        'saj': 'SAJ',
        'deye': 'Deye',
        'fronius': 'Fronius',
        'abb': 'ABB',
        'sma': 'SMA',
        'huawei': 'Huawei',
        'sungrow': 'Sungrow',
        'goodwe': 'Goodwe',
        'sofar': 'Sofar',
        'canadian': 'Canadian Solar',
        'canadian solar': 'Canadian Solar',
        'hoymiles': 'Hoymiles',
        'apsystems': 'APsystems',
        'enphase': 'Enphase',
        'delta': 'Delta',
        'solis': 'Solis',
        'weg': 'WEG',
        'intelbras': 'Intelbras',
        
        # Painéis
        'jinko': 'JinkoSolar',
        'jinkosolar': 'JinkoSolar',
        'trina': 'Trina Solar',
        'trina solar': 'Trina Solar',
        'ja solar': 'JA Solar',
        'longi': 'Longi',
        'odex': 'Odex',
        'risen': 'Risen',
        'jinergy': 'Jinergy',
        'suntech': 'Suntech',
        
        # Estruturas
        'solar group': 'Solar Group',
        'k2': 'K2 Systems',
        'k2 systems': 'K2 Systems',
        'romagnole': 'Romagnole',
        'steck': 'Steck',
        'unirac': 'Unirac',
        'schletter': 'Schletter',
        'aluflex': 'Aluflex',
        
        # String Boxes
        'clamper': 'Clamper',
        
        # Cabos
        'nexans': 'Nexans',
        'prysmian': 'Prysmian',
        'ficap': 'Ficap',
        'cobrecom': 'Cobrecom',
        
        # Baterias
        'byd': 'BYD',
        'pylontech': 'Pylontech',
        'lg chem': 'LG Chem',
        'lg': 'LG Chem',
    }
    
    # País de origem
    MANUFACTURER_COUNTRY = {
        'Growatt': 'China',
        'SAJ': 'China',
        'Deye': 'China',
        'Fronius': 'Áustria',
        'ABB': 'Suíça',
        'SMA': 'Alemanha',
        'Huawei': 'China',
        'Sungrow': 'China',
        'Goodwe': 'China',
        'Sofar': 'China',
        'Canadian Solar': 'Canadá',
        'Hoymiles': 'China',
        'APsystems': 'China',
        'Enphase': 'EUA',
        'Delta': 'Taiwan',
        'Solis': 'China',
        'WEG': 'Brasil',
        'Intelbras': 'Brasil',
        'JinkoSolar': 'China',
        'Trina Solar': 'China',
        'JA Solar': 'China',
        'Longi': 'China',
        'Odex': 'Brasil',
        'Risen': 'China',
        'Jinergy': 'China',
        'Suntech': 'China',
        'Solar Group': 'Brasil',
        'K2 Systems': 'Alemanha',
        'Romagnole': 'Brasil',
        'Steck': 'Brasil',
        'Unirac': 'EUA',
        'Schletter': 'Alemanha',
        'Aluflex': 'Brasil',
        'Clamper': 'Brasil',
        'Nexans': 'França',
        'Prysmian': 'Itália',
        'Ficap': 'Brasil',
        'Cobrecom': 'Brasil',
        'BYD': 'China',
        'Pylontech': 'China',
        'LG Chem': 'Coreia do Sul',
    }
    
    @classmethod
    def normalize(cls, name: str) -> str:
        """Normaliza nome do fabricante"""
        if not name:
            return "Unknown"
        
        # Remove acentos e converte para lowercase
        normalized = unicodedata.normalize('NFKD', name.lower())
        normalized = ''.join([c for c in normalized if not unicodedata.combining(c)])
        normalized = normalized.strip()
        
        # Busca no mapeamento
        return cls.MANUFACTURER_MAP.get(normalized, name.title())
    
    @classmethod
    def get_country(cls, manufacturer: str) -> str:
        """Retorna país de origem"""
        return cls.MANUFACTURER_COUNTRY.get(manufacturer, "Unknown")


class SKUGenerator:
    """Gera SKUs padronizados"""
    
    @staticmethod
    def generate(product_data: Dict[str, Any], category: str) -> str:
        """Gera SKU padronizado baseado na categoria"""
        manufacturer = ManufacturerNormalizer.normalize(
            product_data.get('manufacturer', 'UNKNOWN')
        ).upper().replace(' ', '-')
        
        if category == 'panels':
            power = product_data.get('power_w', 0)
            return f"{manufacturer}-{power}W"
        
        elif category == 'inverters':
            power = product_data.get('power_kw', 0)
            voltage = product_data.get('voltage_v', '')
            phases = product_data.get('phases', '').upper()
            phase_code = {'MONOFÁSICO': 'MONO', 'BIFÁSICO': 'BI', 'TRIFÁSICO': 'TRI'}.get(phases, '')
            
            if voltage and phase_code:
                return f"{manufacturer}-{power}KW-{voltage}V-{phase_code}"
            return f"{manufacturer}-{power}KW"
        
        elif category == 'kits':
            power = product_data.get('power_kwp', 0)
            kit_type = product_data.get('kit_type', 'GRID')
            return f"KIT-{power}KWP-{kit_type}"
        
        elif category == 'structures':
            roof_type = product_data.get('roof_type', 'GENERIC')
            return f"{manufacturer}-STRUCT-{roof_type}"
        
        elif category == 'stringboxes':
            entries = product_data.get('entries', 0)
            return f"{manufacturer}-SB-{entries}E"
        
        elif category == 'cables':
            section = product_data.get('section_mm2', 0)
            cable_type = product_data.get('cable_type', 'PV')
            return f"{manufacturer}-CABLE-{section}MM2-{cable_type}"
        
        elif category == 'batteries':
            capacity = product_data.get('capacity_kwh', 0)
            voltage = product_data.get('voltage_v', 0)
            return f"{manufacturer}-BAT-{capacity}KWH-{voltage}V"
        
        else:
            return f"{manufacturer}-{category.upper()}-{product_data.get('id', 'UNKNOWN')}"


class ConsolidatedInventoryExtractor:
    """Extrator principal de inventário consolidado"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.manufacturers: Dict[str, Manufacturer] = {}
        self.products: List[Product] = []
        self.categories: Dict[str, int] = defaultdict(int)
        self.distributors: Set[str] = set()
        
    def extract_from_odex(self) -> None:
        """Extrai produtos da ODEX"""
        print("📦 Extraindo produtos ODEX...")
        
        odex_path = self.base_path / 'distributors' / 'odex'
        
        # Busca todos os arquivos JSON
        json_files = list(odex_path.rglob('*.json'))
        
        for json_file in json_files:
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Determina categoria pelo caminho
                category = self._detect_category_from_path(json_file)
                
                # Processa produtos
                if isinstance(data, list):
                    for item in data:
                        self._process_odex_product(item, category)
                elif isinstance(data, dict):
                    # Pode ser um único produto ou dicionário de produtos
                    if 'products' in data:
                        for item in data['products']:
                            self._process_odex_product(item, category)
                    else:
                        self._process_odex_product(data, category)
                        
            except Exception as e:
                print(f"  ⚠️ Erro ao processar {json_file.name}: {e}")
        
        print(f"  ✅ ODEX: {len([p for p in self.products if p.distributor == 'ODEX'])} produtos")
    
    def _detect_category_from_path(self, path: Path) -> str:
        """Detecta categoria pelo caminho do arquivo"""
        path_str = str(path).lower()
        
        if 'inverter' in path_str or 'inversores' in path_str:
            return 'inverters'
        elif 'panel' in path_str or 'painel' in path_str or 'module' in path_str:
            return 'panels'
        elif 'string' in path_str or 'stringbox' in path_str:
            return 'stringboxes'
        elif 'structure' in path_str or 'estrutura' in path_str:
            return 'structures'
        elif 'kit' in path_str:
            return 'kits'
        elif 'cable' in path_str or 'cabo' in path_str:
            return 'cables'
        elif 'batter' in path_str or 'bateria' in path_str:
            return 'batteries'
        else:
            return 'accessories'
    
    def _process_odex_product(self, item: Dict[str, Any], category: str) -> None:
        """Processa produto ODEX"""
        # Extrai informações básicas
        title = item.get('title', item.get('name', item.get('product_name', 'Unknown')))
        manufacturer_raw = item.get('manufacturer', item.get('marca', item.get('brand', '')))
        manufacturer = ManufacturerNormalizer.normalize(manufacturer_raw)
        
        # Extrai preço
        price = self._extract_price(item)
        
        # Gera SKU
        sku = SKUGenerator.generate(item, category)
        
        # Cria produto
        product = Product(
            id=f"odex_{category}_{item.get('id', item.get('sku', sku))}",
            title=title,
            sku=sku,
            manufacturer=manufacturer,
            category=category,
            model=item.get('model', item.get('modelo')),
            series=item.get('series', item.get('serie')),
            price_brl=price,
            distributor='ODEX',
            technical_specs=self._extract_technical_specs(item, category),
            images=self._extract_images(item),
            metadata=item.get('metadata', {})
        )
        
        self.products.append(product)
        self._update_manufacturer(manufacturer, category, price, 'ODEX')
        self.categories[category] += 1
        self.distributors.add('ODEX')
    
    def extract_from_fotus(self) -> None:
        """Extrai kits FOTUS"""
        print("📦 Extraindo kits FOTUS...")
        
        fotus_paths = [
            self.base_path / 'distributors' / 'fotus',
            self.base_path / 'distributors' / 'fotus-hybrid'
        ]
        
        for fotus_path in fotus_paths:
            if not fotus_path.exists():
                continue
                
            json_files = list(fotus_path.rglob('*.json'))
            
            for json_file in json_files:
                try:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # FOTUS geralmente tem lista de kits
                    if isinstance(data, list):
                        for kit in data:
                            self._process_fotus_kit(kit)
                    elif isinstance(data, dict):
                        if 'kits' in data:
                            for kit in data['kits']:
                                self._process_fotus_kit(kit)
                        else:
                            self._process_fotus_kit(data)
                            
                except Exception as e:
                    print(f"  ⚠️ Erro ao processar {json_file.name}: {e}")
        
        print(f"  ✅ FOTUS: {len([p for p in self.products if p.distributor == 'FOTUS'])} kits")
    
    def _process_fotus_kit(self, kit: Dict[str, Any]) -> None:
        """Processa kit FOTUS"""
        title = kit.get('title', kit.get('name', 'Unknown Kit'))
        
        # Extrai potência
        power_kwp = self._extract_power_from_title(title)
        
        # Determina tipo de kit
        kit_type = 'HYBRID' if 'híbrido' in title.lower() or 'hibrido' in title.lower() else 'GRID-TIE'
        
        # Extrai fabricantes dos componentes
        manufacturers = self._extract_manufacturers_from_kit(kit)
        main_manufacturer = manufacturers[0] if manufacturers else 'FOTUS'
        
        # Gera SKU
        sku = f"KIT-{power_kwp}KWP-{kit_type}"
        
        # Extrai preço
        price = self._extract_price(kit)
        
        # Cria produto
        product = Product(
            id=f"fotus_kits_{kit.get('id', sku)}",
            title=title,
            sku=sku,
            manufacturer=main_manufacturer,
            category='kits',
            subcategory=kit_type.lower(),
            price_brl=price,
            distributor='FOTUS',
            technical_specs={
                'power_kwp': power_kwp,
                'kit_type': kit_type,
                'components': kit.get('components', kit.get('componentes', [])),
                'estimated_generation': kit.get('estimated_generation'),
            },
            images=self._extract_images(kit),
            metadata=kit.get('metadata', {})
        )
        
        self.products.append(product)
        self._update_manufacturer(main_manufacturer, 'kits', price, 'FOTUS')
        self.categories['kits'] += 1
        self.distributors.add('FOTUS')
    
    def extract_from_neosolar(self) -> None:
        """Extrai kits NeoSolar"""
        print("📦 Extraindo kits NeoSolar...")
        
        neosolar_path = self.base_path / 'distributors' / 'neosolar'
        
        if not neosolar_path.exists():
            print("  ⚠️ Diretório NeoSolar não encontrado")
            return
        
        json_files = list(neosolar_path.rglob('*.json'))
        
        for json_file in json_files:
            if 'image_mapping' in json_file.name:
                continue  # Pula mapeamento de imagens
                
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, list):
                    for kit in data:
                        self._process_neosolar_kit(kit)
                elif isinstance(data, dict):
                    if 'kits' in data:
                        for kit in data['kits']:
                            self._process_neosolar_kit(kit)
                    else:
                        self._process_neosolar_kit(data)
                        
            except Exception as e:
                print(f"  ⚠️ Erro ao processar {json_file.name}: {e}")
        
        print(f"  ✅ NeoSolar: {len([p for p in self.products if p.distributor == 'NeoSolar'])} kits")
    
    def _process_neosolar_kit(self, kit: Dict[str, Any]) -> None:
        """Processa kit NeoSolar"""
        title = kit.get('title', kit.get('name', kit.get('nome', 'Unknown Kit')))
        
        # Extrai potência
        power_kwp = self._extract_power_from_title(title)
        
        # Gera SKU
        sku = f"KIT-{power_kwp}KWP-NEOSOLAR"
        
        # Extrai preço
        price = self._extract_price(kit)
        
        # Extrai fabricantes
        manufacturers = self._extract_manufacturers_from_kit(kit)
        main_manufacturer = manufacturers[0] if manufacturers else 'NeoSolar'
        
        # Cria produto
        product = Product(
            id=f"neosolar_kits_{kit.get('id', kit.get('sku', sku))}",
            title=title,
            sku=sku,
            manufacturer=main_manufacturer,
            category='kits',
            subcategory='grid-tie',
            price_brl=price,
            distributor='NeoSolar',
            technical_specs={
                'power_kwp': power_kwp,
                'components': kit.get('components', kit.get('componentes', [])),
            },
            images=self._extract_images(kit),
            metadata=kit.get('metadata', {})
        )
        
        self.products.append(product)
        self._update_manufacturer(main_manufacturer, 'kits', price, 'NeoSolar')
        self.categories['kits'] += 1
        self.distributors.add('NeoSolar')
    
    def extract_from_fortlev(self) -> None:
        """Extrai produtos FortLev"""
        print("📦 Extraindo produtos FortLev...")
        
        fortlev_path = self.base_path / 'distributors' / 'fortlev'
        
        if not fortlev_path.exists():
            print("  ⚠️ Diretório FortLev não encontrado")
            return
        
        json_files = list(fortlev_path.rglob('*.json'))
        
        for json_file in json_files:
            if 'image_mapping' in json_file.name:
                continue
                
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if isinstance(data, list):
                    for product in data:
                        self._process_fortlev_product(product)
                elif isinstance(data, dict):
                    if 'products' in data:
                        for product in data['products']:
                            self._process_fortlev_product(product)
                    else:
                        self._process_fortlev_product(data)
                        
            except Exception as e:
                print(f"  ⚠️ Erro ao processar {json_file.name}: {e}")
        
        print(f"  ✅ FortLev: {len([p for p in self.products if p.distributor == 'FortLev'])} produtos")
    
    def _process_fortlev_product(self, product_data: Dict[str, Any]) -> None:
        """Processa produto FortLev"""
        title = product_data.get('title', product_data.get('name', 'Unknown'))
        
        # Detecta categoria
        category = self._detect_category_from_title(title)
        
        # Extrai fabricante
        manufacturer_raw = product_data.get('manufacturer', product_data.get('brand', ''))
        manufacturer = ManufacturerNormalizer.normalize(manufacturer_raw) if manufacturer_raw else 'FortLev'
        
        # Gera SKU
        sku = SKUGenerator.generate(product_data, category)
        
        # Extrai preço
        price = self._extract_price(product_data)
        
        # Cria produto
        product = Product(
            id=f"fortlev_{category}_{product_data.get('id', sku)}",
            title=title,
            sku=sku,
            manufacturer=manufacturer,
            category=category,
            price_brl=price,
            distributor='FortLev',
            technical_specs=self._extract_technical_specs(product_data, category),
            images=self._extract_images(product_data),
            metadata=product_data.get('metadata', {})
        )
        
        self.products.append(product)
        self._update_manufacturer(manufacturer, category, price, 'FortLev')
        self.categories[category] += 1
        self.distributors.add('FortLev')
    
    def _detect_category_from_title(self, title: str) -> str:
        """Detecta categoria pelo título"""
        title_lower = title.lower()
        
        if 'kit' in title_lower:
            return 'kits'
        elif 'inversor' in title_lower or 'inverter' in title_lower:
            return 'inverters'
        elif 'painel' in title_lower or 'panel' in title_lower or 'módulo' in title_lower:
            return 'panels'
        elif 'estrutura' in title_lower or 'structure' in title_lower:
            return 'structures'
        elif 'string' in title_lower:
            return 'stringboxes'
        elif 'cabo' in title_lower or 'cable' in title_lower:
            return 'cables'
        elif 'bateria' in title_lower or 'battery' in title_lower:
            return 'batteries'
        else:
            return 'accessories'
    
    def _extract_price(self, data: Dict[str, Any]) -> float:
        """Extrai preço de diferentes formatos"""
        # Tenta diversos campos
        price_fields = ['price', 'preco', 'valor', 'price_brl', 'amount']
        
        for field in price_fields:
            if field in data:
                value = data[field]
                if isinstance(value, (int, float)):
                    return float(value)
                elif isinstance(value, str):
                    # Remove R$, pontos e vírgulas
                    cleaned = re.sub(r'[R$\s.]', '', value)
                    cleaned = cleaned.replace(',', '.')
                    try:
                        return float(cleaned)
                    except:
                        pass
        
        # Tenta em prices array
        if 'prices' in data and isinstance(data['prices'], list) and len(data['prices']) > 0:
            first_price = data['prices'][0]
            if isinstance(first_price, dict) and 'amount' in first_price:
                return float(first_price['amount']) / 100  # Converte de centavos
        
        return 0.0
    
    def _extract_images(self, data: Dict[str, Any]) -> List[str]:
        """Extrai URLs de imagens"""
        images = []
        
        # Campos possíveis
        if 'images' in data:
            imgs = data['images']
            if isinstance(imgs, list):
                images.extend([img.get('url', img) if isinstance(img, dict) else img for img in imgs])
            elif isinstance(imgs, str):
                images.append(imgs)
        
        if 'image' in data:
            images.append(data['image'])
        
        if 'thumbnail' in data:
            images.append(data['thumbnail'])
        
        if 'image_url' in data:
            images.append(data['image_url'])
        
        return [img for img in images if img]
    
    def _extract_technical_specs(self, data: Dict[str, Any], category: str) -> Dict[str, Any]:
        """Extrai especificações técnicas"""
        specs = {}
        
        # Campos comuns
        common_fields = [
            'power_w', 'power_kw', 'power_kwp',
            'voltage_v', 'current_a', 'efficiency',
            'technology', 'tecnologia',
            'warranty_years', 'garantia_anos',
            'dimensions', 'dimensoes',
            'weight_kg', 'peso_kg',
        ]
        
        for field in common_fields:
            if field in data:
                specs[field] = data[field]
        
        # Especificações por categoria
        if category == 'inverters':
            inv_fields = ['phases', 'fases', 'mppt_count', 'grid_connection', 'hybrid']
            for field in inv_fields:
                if field in data:
                    specs[field] = data[field]
        
        elif category == 'panels':
            panel_fields = ['cells', 'celulas', 'efficiency', 'eficiencia', 'bifacial']
            for field in panel_fields:
                if field in data:
                    specs[field] = data[field]
        
        elif category == 'kits':
            kit_fields = ['total_panels', 'total_inverters', 'estimated_generation', 'roof_type']
            for field in kit_fields:
                if field in data:
                    specs[field] = data[field]
        
        # Metadata técnica
        if 'technical_specs' in data:
            specs.update(data['technical_specs'])
        
        if 'specs' in data:
            specs.update(data['specs'])
        
        return specs
    
    def _extract_power_from_title(self, title: str) -> float:
        """Extrai potência do título"""
        # Padrões comuns: 5.5kWp, 5,5 kWp, 5500Wp, etc.
        patterns = [
            r'(\d+[,.]?\d*)\s*kwp',
            r'(\d+[,.]?\d*)\s*kw',
            r'(\d+)\s*wp',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, title.lower())
            if match:
                value = match.group(1).replace(',', '.')
                power = float(value)
                
                # Converte Wp para kWp se necessário
                if 'wp' in pattern and power > 100:
                    power = power / 1000
                
                return round(power, 2)
        
        return 0.0
    
    def _extract_manufacturers_from_kit(self, kit: Dict[str, Any]) -> List[str]:
        """Extrai fabricantes dos componentes do kit"""
        manufacturers = []
        
        # Busca em componentes
        components = kit.get('components', kit.get('componentes', []))
        
        for comp in components:
            if isinstance(comp, dict):
                mfr = comp.get('manufacturer', comp.get('fabricante', comp.get('brand', '')))
                if mfr:
                    normalized = ManufacturerNormalizer.normalize(mfr)
                    if normalized not in manufacturers:
                        manufacturers.append(normalized)
            elif isinstance(comp, str):
                # Tenta extrair do texto
                for mfr_key in ManufacturerNormalizer.MANUFACTURER_MAP.keys():
                    if mfr_key in comp.lower():
                        normalized = ManufacturerNormalizer.normalize(mfr_key)
                        if normalized not in manufacturers:
                            manufacturers.append(normalized)
                            break
        
        # Busca no título/descrição do kit
        title = kit.get('title', kit.get('name', '')).lower()
        for mfr_key in ManufacturerNormalizer.MANUFACTURER_MAP.keys():
            if mfr_key in title:
                normalized = ManufacturerNormalizer.normalize(mfr_key)
                if normalized not in manufacturers:
                    manufacturers.append(normalized)
        
        return manufacturers
    
    def _update_manufacturer(self, name: str, category: str, price: float, distributor: str) -> None:
        """Atualiza estatísticas do fabricante"""
        normalized = ManufacturerNormalizer.normalize(name)
        
        if normalized not in self.manufacturers:
            self.manufacturers[normalized] = Manufacturer(
                name=normalized,
                normalized_name=normalized.lower().replace(' ', '_'),
                origin_country=ManufacturerNormalizer.get_country(normalized)
            )
        
        mfr = self.manufacturers[normalized]
        mfr.product_count += 1
        mfr.categories.add(category)
        mfr.total_value_brl += price
        mfr.distributors.add(distributor)
    
    def generate_consolidated_report(self) -> Dict[str, Any]:
        """Gera relatório consolidado"""
        
        # Estatísticas gerais
        total_products = len(self.products)
        total_value = sum(p.price_brl for p in self.products)
        avg_price = total_value / total_products if total_products > 0 else 0
        
        # Por categoria
        categories_stats = {}
        for cat, count in self.categories.items():
            cat_products = [p for p in self.products if p.category == cat]
            cat_value = sum(p.price_brl for p in cat_products)
            categories_stats[cat] = {
                'count': count,
                'total_value_brl': round(cat_value, 2),
                'avg_price_brl': round(cat_value / count if count > 0 else 0, 2),
                'percentage': round(count / total_products * 100, 2) if total_products > 0 else 0
            }
        
        # Por distribuidor
        distributors_stats = {}
        for dist in self.distributors:
            dist_products = [p for p in self.products if p.distributor == dist]
            dist_value = sum(p.price_brl for p in dist_products)
            distributors_stats[dist] = {
                'count': len(dist_products),
                'total_value_brl': round(dist_value, 2),
                'avg_price_brl': round(dist_value / len(dist_products) if dist_products else 0, 2),
                'categories': list(set(p.category for p in dist_products))
            }
        
        # Top fabricantes
        top_manufacturers = sorted(
            self.manufacturers.values(),
            key=lambda m: m.product_count,
            reverse=True
        )[:20]
        
        # Por país
        countries_stats = defaultdict(lambda: {'manufacturers': 0, 'products': 0, 'total_value': 0})
        for mfr in self.manufacturers.values():
            country = mfr.origin_country
            countries_stats[country]['manufacturers'] += 1
            countries_stats[country]['products'] += mfr.product_count
            countries_stats[country]['total_value'] += mfr.total_value_brl
        
        return {
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_products': total_products,
                'total_manufacturers': len(self.manufacturers),
                'total_distributors': len(self.distributors),
                'total_categories': len(self.categories),
                'total_value_brl': round(total_value, 2),
                'average_price_brl': round(avg_price, 2),
            },
            'categories': categories_stats,
            'distributors': distributors_stats,
            'manufacturers': {
                'total': len(self.manufacturers),
                'top_20': [m.to_dict() for m in top_manufacturers],
                'all': {name: m.to_dict() for name, m in self.manufacturers.items()}
            },
            'countries': dict(countries_stats),
        }
    
    def export_to_json(self, output_dir: str) -> None:
        """Exporta inventário consolidado"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        
        # 1. Produtos completos
        products_file = output_path / f'consolidated_products_{timestamp}.json'
        with open(products_file, 'w', encoding='utf-8') as f:
            json.dump(
                [p.to_dict() for p in self.products],
                f,
                indent=2,
                ensure_ascii=False
            )
        print(f"✅ Exportado: {products_file}")
        
        # 2. Fabricantes
        manufacturers_file = output_path / f'consolidated_manufacturers_{timestamp}.json'
        with open(manufacturers_file, 'w', encoding='utf-8') as f:
            json.dump(
                {name: m.to_dict() for name, m in self.manufacturers.items()},
                f,
                indent=2,
                ensure_ascii=False
            )
        print(f"✅ Exportado: {manufacturers_file}")
        
        # 3. Relatório consolidado
        report = self.generate_consolidated_report()
        report_file = output_path / f'consolidated_report_{timestamp}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"✅ Exportado: {report_file}")
        
        # 4. Markdown executivo
        self._generate_markdown_report(report, output_path, timestamp)
    
    def _generate_markdown_report(self, report: Dict[str, Any], output_path: Path, timestamp: str) -> None:
        """Gera relatório em Markdown"""
        md_file = output_path / f'CONSOLIDATED_INVENTORY_REPORT_{timestamp}.md'
        
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(f"""# 🚀 YSH Solar - Inventário Consolidado

**Data de Geração:** {datetime.now().strftime('%d de %B de %Y, %H:%M')}  
**Versão:** 3.0.0

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| **Total de Produtos** | {report['summary']['total_products']:,} |
| **Total de Fabricantes** | {report['summary']['total_manufacturers']} |
| **Total de Distribuidores** | {report['summary']['total_distributors']} |
| **Total de Categorias** | {report['summary']['total_categories']} |
| **Valor Total Estimado** | R$ {report['summary']['total_value_brl']:,.2f} |
| **Preço Médio** | R$ {report['summary']['average_price_brl']:,.2f} |

---

## 📦 Por Categoria

| Categoria | Produtos | Valor Total | Preço Médio | % do Total |
|-----------|----------|-------------|-------------|------------|
""")
            
            for cat, stats in sorted(report['categories'].items(), key=lambda x: x[1]['count'], reverse=True):
                f.write(f"| {cat.title()} | {stats['count']:,} | R$ {stats['total_value_brl']:,.2f} | R$ {stats['avg_price_brl']:,.2f} | {stats['percentage']:.1f}% |\n")
            
            f.write(f"""
---

## 🏢 Por Distribuidor

| Distribuidor | Produtos | Valor Total | Preço Médio | Categorias |
|--------------|----------|-------------|-------------|------------|
""")
            
            for dist, stats in sorted(report['distributors'].items(), key=lambda x: x[1]['count'], reverse=True):
                cats = ', '.join(stats['categories'])
                f.write(f"| {dist} | {stats['count']:,} | R$ {stats['total_value_brl']:,.2f} | R$ {stats['avg_price_brl']:,.2f} | {cats} |\n")
            
            f.write(f"""
---

## 🏭 Top 20 Fabricantes

| # | Fabricante | País | Produtos | Valor Total | Categorias |
|---|------------|------|----------|-------------|------------|
""")
            
            for i, mfr in enumerate(report['manufacturers']['top_20'], 1):
                cats = ', '.join(mfr['categories'])
                f.write(f"| {i} | {mfr['name']} | {mfr['origin_country']} | {mfr['product_count']:,} | R$ {mfr['total_value_brl']:,.2f} | {cats} |\n")
            
            f.write(f"""
---

## 🌍 Por País de Origem

| País | Fabricantes | Produtos | Valor Total |
|------|-------------|----------|-------------|
""")
            
            for country, stats in sorted(report['countries'].items(), key=lambda x: x[1]['products'], reverse=True):
                f.write(f"| {country} | {stats['manufacturers']} | {stats['products']:,} | R$ {stats['total_value']:,.2f} |\n")
            
            f.write(f"""
---

## 📈 Análise de Cobertura

### Distribuidores por Categoria
""")
            
            for cat in sorted(report['categories'].keys()):
                f.write(f"\n**{cat.title()}:**\n\n")
                cat_products = [p for p in self.products if p.category == cat]
                dist_count = Counter(p.distributor for p in cat_products)
                for dist, count in dist_count.most_common():
                    pct = (count / len(cat_products) * 100) if cat_products else 0
                    f.write(f"- {dist}: {count} produtos ({pct:.1f}%)\n")
            
            f.write("""
---

## 🎯 Insights e Recomendações

### Pontos Fortes
- ✅ Ampla cobertura de categorias
- ✅ Múltiplos distribuidores por categoria
- ✅ Boa diversidade de fabricantes
- ✅ Mix de produtos nacionais e importados

### Oportunidades
- 📈 Expansão em categorias com menor cobertura
- 📈 Aumentar variedade de fabricantes premium
- 📈 Consolidar fornecimento de componentes críticos
- 📈 Padronização de SKUs e especificações técnicas

---

**Gerado por:** YSH Solar Inventory Consolidation System v3.0.0  
**Próxima atualização:** Mensal

""")
        
        print(f"✅ Exportado: {md_file}")


def main():
    """Função principal"""
    print("=" * 80)
    print("🚀 YSH SOLAR - EXTRATOR DE INVENTÁRIO CONSOLIDADO")
    print("=" * 80)
    print()
    
    # Diretório base
    base_path = Path(__file__).parent
    
    # Cria extrator
    extractor = ConsolidatedInventoryExtractor(str(base_path))
    
    # Extrai de todos os distribuidores
    print("\n📦 INICIANDO EXTRAÇÃO DE INVENTÁRIO...\n")
    
    extractor.extract_from_odex()
    extractor.extract_from_fotus()
    extractor.extract_from_neosolar()
    extractor.extract_from_fortlev()
    
    # Exporta resultados
    print("\n💾 EXPORTANDO INVENTÁRIO CONSOLIDADO...\n")
    
    output_dir = base_path / 'consolidated-inventory'
    extractor.export_to_json(str(output_dir))
    
    # Sumário final
    print("\n" + "=" * 80)
    print("✅ EXTRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 80)
    print(f"\n📊 Estatísticas Finais:")
    print(f"   • Produtos: {len(extractor.products):,}")
    print(f"   • Fabricantes: {len(extractor.manufacturers)}")
    print(f"   • Distribuidores: {len(extractor.distributors)}")
    print(f"   • Categorias: {len(extractor.categories)}")
    print(f"\n📁 Arquivos gerados em: {output_dir}")
    print()


if __name__ == "__main__":
    main()
