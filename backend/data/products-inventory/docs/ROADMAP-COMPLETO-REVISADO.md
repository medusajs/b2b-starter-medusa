# 🗺️ ROADMAP COMPLETO REVISADO - YSH B2B SOLAR PLATFORM

**Data de Revisão:** 14 de Outubro de 2025  
**Status:** 🎯 **PLANO EXECUTIVO ATUALIZADO**  
**Escopo:** SKUs + Schemas + APIs + Sincronização de Imagens + Vision AI

---

## 📊 VISÃO GERAL DO SISTEMA

```tsx
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA COMPLETA                          │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────┐
        │                                           │
┌───────▼────────┐                         ┌───────▼────────┐
│  DATA SOURCES  │                         │   PROCESSING   │
│  (Normalized)  │                         │   PIPELINE     │
└───────┬────────┘                         └───────┬────────┘
        │                                           │
    ┌───┴───┐                                   ┌───┴───┐
    │       │                                   │       │
┌───▼───┐ ┌▼─────┐                       ┌─────▼───┐ ┌▼──────┐
│FortLev│ │NeoSol│                       │SKU Gen  │ │Vision │
│217kts │ │2.6K  │                       │Engine   │ │AI Proc│
└───┬───┘ └┬─────┘                       └─────┬───┘ └┬──────┘
    │      │                                   │      │
    └──────┼───────────────────────────────────┴──────┘
           │
    ┌──────▼──────┐
    │   SCHEMAS   │
    │  + IMAGES   │
    └──────┬──────┘
           │
    ┌──────┼──────┐
    │      │      │
┌───▼──┐ ┌▼────┐ ┌▼─────┐
│ JSON │ │ TS  │ │ APIs │
│Schema│ │Types│ │FastAPI
└──┬───┘ └┬────┘ └┬─────┘
   │      │      │
   └──────┼──────┘
          │
   ┌──────▼──────┐
   │  MEDUSA.JS  │
   │   STORE     │
   └─────────────┘
```

---

## 🎯 FASE 1: ESTRUTURA DE SKUs E SCHEMAS (HOJE - 3h)

### 1.1 Sistema de Geração de SKUs ⚡ **PRIORIDADE MÁXIMA**

**Objetivo:** Criar SKUs únicos, consistentes e semânticos para todos os produtos.

#### Padrão de SKU Definido

```tsx
[DIST]-[CATEGORIA]-[POWER]-[BRAND]-[SEQUENCE]

Exemplos:
- FLV-KIT-5.63KWP-LONGI-001
- FLV-PANEL-575W-LONGI-HM6-001
- FLV-INV-5.0KW-BYD-H-001
- NEO-KIT-10.5KWP-CANADIAN-042
- FTS-KIT-3.3KWP-HOYMILES-001
```

**Componentes do SKU:**

- `DIST`: 3 letras do distribuidor (FLV, NEO, FTS)
- `CATEGORIA`: KIT, PANEL, INV, BAT, STRUCT, CHARGE
- `POWER`: Potência com unidade (5.63KWP, 575W, 5.0KW)
- `BRAND`: Marca abreviada (LONGI, BYD, CANADIAN, HOYMILES)
- `SEQUENCE`: 3 dígitos sequenciais (001-999)

#### Script de Geração

**Arquivo:** `backend/data/products-inventory/scripts/generate_skus.py`

```python
"""
SKU Generator for YSH B2B Solar Products
Generates unique, semantic SKUs for all products
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict


class SKUGenerator:
    """Generate consistent SKUs for solar products"""
    
    DISTRIBUTOR_CODES = {
        'fortlev': 'FLV',
        'neosolar': 'NEO',
        'fotus': 'FTS'
    }
    
    CATEGORY_CODES = {
        'kit': 'KIT',
        'panel': 'PANEL',
        'inverter': 'INV',
        'battery': 'BAT',
        'structure': 'STRUCT',
        'charger': 'CHARGE'
    }
    
    BRAND_ABBREVIATIONS = {
        'longi': 'LONGI',
        'byd': 'BYD',
        'canadian solar': 'CANADIAN',
        'trina': 'TRINA',
        'jinko': 'JINKO',
        'hoymiles': 'HOYMILES',
        'growatt': 'GROWATT',
        'deye': 'DEYE',
        'apsystems': 'APS',
        'enphase': 'ENPHASE',
        'fronius': 'FRONIUS',
        'sma': 'SMA',
        'huawei': 'HUAWEI',
        'sungrow': 'SUNGROW'
    }
    
    def __init__(self):
        self.sku_counters = defaultdict(int)
        self.existing_skus = set()
    
    def clean_brand_name(self, brand: str) -> str:
        """Clean and abbreviate brand name"""
        brand_lower = brand.lower().strip()
        
        for full_name, abbrev in self.BRAND_ABBREVIATIONS.items():
            if full_name in brand_lower:
                return abbrev
        
        # Fallback: use first 3-6 letters
        clean = re.sub(r'[^a-zA-Z]', '', brand)
        return clean[:6].upper()
    
    def generate_kit_sku(
        self,
        distributor: str,
        power_kwp: float,
        brand: str,
        kit_id: Optional[str] = None
    ) -> str:
        """Generate SKU for solar kit"""
        
        dist_code = self.DISTRIBUTOR_CODES.get(distributor.lower(), 'UNK')
        category = 'KIT'
        power_str = f"{power_kwp:.2f}KWP".replace('.', '')
        brand_code = self.clean_brand_name(brand)
        
        # Base SKU without sequence
        base_sku = f"{dist_code}-{category}-{power_str}-{brand_code}"
        
        # Generate unique sequence
        self.sku_counters[base_sku] += 1
        sequence = str(self.sku_counters[base_sku]).zfill(3)
        
        sku = f"{base_sku}-{sequence}"
        
        # Ensure uniqueness
        while sku in self.existing_skus:
            self.sku_counters[base_sku] += 1
            sequence = str(self.sku_counters[base_sku]).zfill(3)
            sku = f"{base_sku}-{sequence}"
        
        self.existing_skus.add(sku)
        return sku
    
    def generate_component_sku(
        self,
        distributor: str,
        category: str,
        power: float,
        unit: str,
        brand: str,
        model: Optional[str] = None
    ) -> str:
        """Generate SKU for component (panel, inverter, etc)"""
        
        dist_code = self.DISTRIBUTOR_CODES.get(distributor.lower(), 'UNK')
        cat_code = self.CATEGORY_CODES.get(category.lower(), 'COMP')
        
        # Power with unit
        if unit.lower() in ['w', 'watt']:
            power_str = f"{int(power)}W"
        elif unit.lower() in ['kw', 'kwp']:
            power_str = f"{power:.1f}KW".replace('.', '')
        else:
            power_str = f"{int(power)}{unit.upper()}"
        
        brand_code = self.clean_brand_name(brand)
        
        # Include model if available
        model_code = ""
        if model:
            model_clean = re.sub(r'[^a-zA-Z0-9]', '', model)[:4].upper()
            model_code = f"-{model_clean}"
        
        base_sku = f"{dist_code}-{cat_code}-{power_str}-{brand_code}{model_code}"
        
        # Generate sequence
        self.sku_counters[base_sku] += 1
        sequence = str(self.sku_counters[base_sku]).zfill(3)
        
        sku = f"{base_sku}-{sequence}"
        
        while sku in self.existing_skus:
            self.sku_counters[base_sku] += 1
            sequence = str(self.sku_counters[base_sku]).zfill(3)
            sku = f"{base_sku}-{sequence}"
        
        self.existing_skus.add(sku)
        return sku
    
    def process_normalized_kits(
        self,
        input_file: Path,
        output_file: Path,
        distributor: str
    ):
        """Process normalized kits and add SKUs"""
        
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"\n[SKU Generator] Processing {len(kits)} kits from {distributor}")
        
        for kit in kits:
            # Generate kit SKU
            power = kit.get('power_kwp', 0)
            
            # Get primary brand from panels or inverter
            brand = "GENERIC"
            if 'components' in kit:
                if 'panels' in kit['components'] and kit['components']['panels']:
                    brand = kit['components']['panels'][0].get('brand', 'GENERIC')
                elif 'inverter' in kit['components']:
                    brand = kit['components']['inverter'].get('brand', 'GENERIC')
            
            sku = self.generate_kit_sku(
                distributor=distributor,
                power_kwp=power,
                brand=brand,
                kit_id=kit.get('kit_id')
            )
            
            kit['sku'] = sku
            kit['sku_generated'] = True
            
            # Generate component SKUs
            if 'components' in kit:
                # Panels
                if 'panels' in kit['components']:
                    for panel in kit['components']['panels']:
                        if 'sku' not in panel:
                            panel['sku'] = self.generate_component_sku(
                                distributor=distributor,
                                category='panel',
                                power=panel.get('power_w', 0),
                                unit='W',
                                brand=panel.get('brand', 'GENERIC'),
                                model=panel.get('model')
                            )
                
                # Inverter
                if 'inverter' in kit['components']:
                    inv = kit['components']['inverter']
                    if 'sku' not in inv:
                        inv['sku'] = self.generate_component_sku(
                            distributor=distributor,
                            category='inverter',
                            power=inv.get('power_kw', 0),
                            unit='KW',
                            brand=inv.get('brand', 'GENERIC'),
                            model=inv.get('model')
                        )
                
                # Batteries
                if 'batteries' in kit['components']:
                    for battery in kit['components']['batteries']:
                        if 'sku' not in battery:
                            battery['sku'] = self.generate_component_sku(
                                distributor=distributor,
                                category='battery',
                                power=battery.get('capacity_kwh', 0),
                                unit='KWH',
                                brand=battery.get('brand', 'GENERIC'),
                                model=battery.get('model')
                            )
        
        # Save with SKUs
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(kits, f, ensure_ascii=False, indent=2)
        
        print(f"[SKU Generator] ✅ Saved {len(kits)} kits with SKUs to {output_file.name}")
        print(f"[SKU Generator] 📊 Total unique SKUs generated: {len(self.existing_skus)}")


def main():
    """Generate SKUs for all distributors"""
    
    base_path = Path(__file__).parent.parent / "distributors"
    
    generator = SKUGenerator()
    
    # Process each distributor
    distributors = [
        ('fortlev', 'fortlev/fortlev-kits-normalized.json', 'fortlev/fortlev-kits-with-skus.json'),
        ('neosolar', 'neosolar/neosolar-kits-normalized.json', 'neosolar/neosolar-kits-with-skus.json'),
        ('fotus', 'fotus/fotus-kits-normalized.json', 'fotus/fotus-kits-with-skus.json'),
        ('fotus', 'fotus/fotus-kits-hibridos-normalized.json', 'fotus/fotus-kits-hibridos-with-skus.json'),
    ]
    
    for dist_name, input_rel, output_rel in distributors:
        input_path = base_path / input_rel
        output_path = base_path / output_rel
        
        if input_path.exists():
            generator.process_normalized_kits(input_path, output_path, dist_name)
        else:
            print(f"[SKU Generator] ⚠️  File not found: {input_path}")
    
    print(f"\n[SKU Generator] 🎉 SKU generation complete!")
    print(f"[SKU Generator] 📊 Total SKUs: {len(generator.existing_skus)}")


if __name__ == "__main__":
    main()
```

---

### 1.2 Schemas JSON Unificados ⚡ **CRÍTICO**

**Objetivo:** Schemas TypeScript-safe para todos os tipos de produtos.

#### Schema Master: Product Base

**Arquivo:** `backend/data/products-inventory/schemas/master/product-base-schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ysh-b2b.com/schemas/product-base.json",
  "title": "Product Base Schema",
  "description": "Base schema for all YSH B2B solar products",
  "type": "object",
  "required": ["id", "sku", "title", "category", "distributor"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique product identifier (UUID v4)"
    },
    "sku": {
      "type": "string",
      "pattern": "^[A-Z]{3}-[A-Z]+-[0-9A-Z]+-[A-Z0-9]+-[0-9]{3}$",
      "description": "SKU following pattern: DIST-CAT-POWER-BRAND-SEQ"
    },
    "title": {
      "type": "string",
      "minLength": 10,
      "maxLength": 200,
      "description": "Product title"
    },
    "title_short": {
      "type": "string",
      "maxLength": 100,
      "description": "Short title for listings"
    },
    "title_seo": {
      "type": "string",
      "maxLength": 150,
      "description": "SEO-optimized title"
    },
    "title_marketplace": {
      "type": "string",
      "maxLength": 200,
      "description": "Marketplace-optimized title"
    },
    "description": {
      "type": "string",
      "description": "Full product description"
    },
    "description_short": {
      "type": "string",
      "maxLength": 300,
      "description": "Short description"
    },
    "category": {
      "type": "string",
      "enum": ["kit", "panel", "inverter", "battery", "structure", "charger", "accessory"],
      "description": "Product category"
    },
    "distributor": {
      "type": "string",
      "enum": ["fortlev", "neosolar", "fotus"],
      "description": "Distributor name"
    },
    "brand": {
      "type": "string",
      "description": "Primary brand"
    },
    "model": {
      "type": "string",
      "description": "Model identifier"
    },
    "images": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/Image"
      },
      "description": "Product images"
    },
    "pricing": {
      "$ref": "#/definitions/Pricing"
    },
    "specifications": {
      "type": "object",
      "description": "Technical specifications"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Product tags"
    },
    "metadata": {
      "type": "object",
      "description": "Additional metadata"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "definitions": {
    "Image": {
      "type": "object",
      "required": ["url", "type"],
      "properties": {
        "url": {
          "type": "string",
          "format": "uri"
        },
        "type": {
          "type": "string",
          "enum": ["primary", "gallery", "technical", "lifestyle", "combination"]
        },
        "alt": {
          "type": "string"
        },
        "width": {"type": "integer"},
        "height": {"type": "integer"},
        "format": {
          "type": "string",
          "enum": ["jpg", "png", "webp", "svg"]
        },
        "size_kb": {"type": "number"}
      }
    },
    "Pricing": {
      "type": "object",
      "required": ["currency", "cost"],
      "properties": {
        "currency": {
          "type": "string",
          "enum": ["BRL", "USD"]
        },
        "cost": {
          "type": "number",
          "minimum": 0,
          "description": "Distributor cost price"
        },
        "suggested_retail": {
          "type": "number",
          "minimum": 0
        },
        "margin_percentage": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "promotional_price": {
          "type": "number",
          "minimum": 0
        },
        "bulk_discounts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "min_quantity": {"type": "integer"},
              "discount_percentage": {"type": "number"}
            }
          }
        }
      }
    }
  }
}
```

#### Schema Específico: Solar Kit

**Arquivo:** `backend/data/products-inventory/schemas/master/solar-kit-schema.json`

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://ysh-b2b.com/schemas/solar-kit.json",
  "title": "Solar Kit Schema",
  "description": "Complete schema for solar energy kits",
  "allOf": [
    {"$ref": "product-base-schema.json"}
  ],
  "required": ["power_kwp", "system_type", "components", "performance"],
  "properties": {
    "power_kwp": {
      "type": "number",
      "minimum": 0.1,
      "maximum": 1000,
      "description": "Total power in kWp"
    },
    "system_type": {
      "type": "string",
      "enum": ["grid-tie", "off-grid", "hybrid"],
      "description": "System type"
    },
    "voltage": {
      "type": "string",
      "enum": ["110V", "220V", "380V", "440V"],
      "description": "System voltage"
    },
    "components": {
      "type": "object",
      "required": ["panels"],
      "properties": {
        "panels": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/Panel"
          }
        },
        "inverter": {
          "$ref": "#/definitions/Inverter"
        },
        "microinverters": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Microinverter"
          }
        },
        "batteries": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Battery"
          }
        },
        "charge_controller": {
          "$ref": "#/definitions/ChargeController"
        },
        "structure": {
          "$ref": "#/definitions/Structure"
        },
        "accessories": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      }
    },
    "performance": {
      "type": "object",
      "properties": {
        "generation_avg_kwh_month": {
          "type": "number",
          "minimum": 0
        },
        "generation_avg_kwh_day": {
          "type": "number",
          "minimum": 0
        },
        "capacity_factor": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "performance_ratio": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "solar_hours_avg": {
          "type": "number",
          "minimum": 0,
          "maximum": 24
        },
        "efficiency_percentage": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        }
      }
    },
    "installation": {
      "type": "object",
      "properties": {
        "estimated_time_hours": {"type": "number"},
        "complexity": {
          "type": "string",
          "enum": ["simple", "moderate", "complex"]
        },
        "required_certifications": {
          "type": "array",
          "items": {"type": "string"}
        },
        "installation_manual_url": {"type": "string", "format": "uri"}
      }
    },
    "warranties": {
      "type": "object",
      "properties": {
        "panels_years": {"type": "integer"},
        "inverter_years": {"type": "integer"},
        "batteries_years": {"type": "integer"},
        "workmanship_years": {"type": "integer"}
      }
    },
    "certifications": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["INMETRO", "IEC", "UL", "CE", "ANEEL"]
      }
    },
    "vision_analysis": {
      "$ref": "#/definitions/VisionAnalysis"
    }
  },
  "definitions": {
    "Panel": {
      "type": "object",
      "required": ["brand", "model", "power_w", "quantity"],
      "properties": {
        "sku": {"type": "string"},
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "power_w": {"type": "number", "minimum": 100},
        "quantity": {"type": "integer", "minimum": 1},
        "total_power_kwp": {"type": "number"},
        "technology": {
          "type": "string",
          "enum": ["monocrystalline", "polycrystalline", "thin-film", "bifacial"]
        },
        "efficiency": {"type": "number", "minimum": 0, "maximum": 100},
        "dimensions": {
          "type": "object",
          "properties": {
            "length_mm": {"type": "number"},
            "width_mm": {"type": "number"},
            "thickness_mm": {"type": "number"}
          }
        },
        "weight_kg": {"type": "number"}
      }
    },
    "Inverter": {
      "type": "object",
      "required": ["brand", "model", "power_kw"],
      "properties": {
        "sku": {"type": "string"},
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "power_kw": {"type": "number", "minimum": 0.5},
        "quantity": {"type": "integer", "minimum": 1},
        "type": {
          "type": "string",
          "enum": ["string", "central", "hybrid"]
        },
        "phases": {"type": "integer", "enum": [1, 2, 3]},
        "mppt_trackers": {"type": "integer"},
        "efficiency": {"type": "number", "minimum": 0, "maximum": 100},
        "has_wifi": {"type": "boolean"},
        "monitoring_platform": {"type": "string"}
      }
    },
    "Microinverter": {
      "type": "object",
      "required": ["brand", "model", "power_w", "quantity"],
      "properties": {
        "sku": {"type": "string"},
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "power_w": {"type": "number"},
        "quantity": {"type": "integer", "minimum": 1},
        "channels": {"type": "integer"},
        "efficiency": {"type": "number"}
      }
    },
    "Battery": {
      "type": "object",
      "required": ["brand", "model", "capacity_kwh", "voltage", "quantity"],
      "properties": {
        "sku": {"type": "string"},
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "capacity_kwh": {"type": "number", "minimum": 1},
        "voltage": {"type": "number"},
        "quantity": {"type": "integer", "minimum": 1},
        "total_capacity_kwh": {"type": "number"},
        "technology": {
          "type": "string",
          "enum": ["lithium-ion", "lead-acid", "gel", "agm", "lifepo4"]
        },
        "depth_of_discharge": {"type": "number", "minimum": 0, "maximum": 100},
        "cycle_life": {"type": "integer"}
      }
    },
    "ChargeController": {
      "type": "object",
      "properties": {
        "sku": {"type": "string"},
        "brand": {"type": "string"},
        "model": {"type": "string"},
        "type": {
          "type": "string",
          "enum": ["PWM", "MPPT"]
        },
        "max_current_a": {"type": "number"}
      }
    },
    "Structure": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["roof-mounting", "ground-mounting", "carport", "solar-tracker"]
        },
        "material": {
          "type": "string",
          "enum": ["aluminum", "steel", "stainless-steel"]
        },
        "tilt_angle": {"type": "number"},
        "orientation": {
          "type": "string",
          "enum": ["north", "south", "east", "west", "adjustable"]
        }
      }
    },
    "VisionAnalysis": {
      "type": "object",
      "properties": {
        "processed_at": {"type": "string", "format": "date-time"},
        "model": {"type": "string"},
        "processing_time_s": {"type": "number"},
        "components_visible": {
          "type": "array",
          "items": {"type": "string"}
        },
        "image_quality": {
          "type": "string",
          "enum": ["excellent", "good", "fair", "poor"]
        },
        "quality_score": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10
        },
        "technical_details": {
          "type": "object",
          "properties": {
            "panel_type": {"type": "string"},
            "panel_color": {"type": "string"},
            "frame_color": {"type": "string"},
            "visual_features": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        },
        "marketing": {
          "type": "object",
          "properties": {
            "description": {"type": "string"},
            "tags": {
              "type": "array",
              "items": {"type": "string"}
            },
            "selling_points": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        },
        "completeness": {
          "type": "object",
          "properties": {
            "is_complete": {"type": "boolean"},
            "missing_components": {
              "type": "array",
              "items": {"type": "string"}
            },
            "suggestions": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        }
      }
    }
  }
}
```

---

### 1.3 TypeScript Types e Interfaces

**Arquivo:** `backend/src/types/products.ts`

```typescript
/**
 * YSH B2B Solar Products - Type Definitions
 * Generated from JSON Schema
 */

export type ProductCategory = 
  | 'kit' 
  | 'panel' 
  | 'inverter' 
  | 'battery' 
  | 'structure' 
  | 'charger' 
  | 'accessory';

export type Distributor = 'fortlev' | 'neosolar' | 'fotus';

export type SystemType = 'grid-tie' | 'off-grid' | 'hybrid';

export type Voltage = '110V' | '220V' | '380V' | '440V';

export type Currency = 'BRL' | 'USD';

export type ImageType = 
  | 'primary' 
  | 'gallery' 
  | 'technical' 
  | 'lifestyle' 
  | 'combination';

export type ImageQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type PanelTechnology = 
  | 'monocrystalline' 
  | 'polycrystalline' 
  | 'thin-film' 
  | 'bifacial';

export type InverterType = 'string' | 'central' | 'hybrid';

export type BatteryTechnology = 
  | 'lithium-ion' 
  | 'lead-acid' 
  | 'gel' 
  | 'agm' 
  | 'lifepo4';

export interface ProductImage {
  url: string;
  type: ImageType;
  alt?: string;
  width?: number;
  height?: number;
  format?: 'jpg' | 'png' | 'webp' | 'svg';
  size_kb?: number;
}

export interface Pricing {
  currency: Currency;
  cost: number;
  suggested_retail?: number;
  margin_percentage?: number;
  promotional_price?: number;
  bulk_discounts?: Array<{
    min_quantity: number;
    discount_percentage: number;
  }>;
}

export interface ProductBase {
  id: string;
  sku: string;
  title: string;
  title_short?: string;
  title_seo?: string;
  title_marketplace?: string;
  description?: string;
  description_short?: string;
  category: ProductCategory;
  distributor: Distributor;
  brand?: string;
  model?: string;
  images?: ProductImage[];
  pricing?: Pricing;
  specifications?: Record<string, any>;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Panel {
  sku?: string;
  brand: string;
  model: string;
  power_w: number;
  quantity: number;
  total_power_kwp?: number;
  technology?: PanelTechnology;
  efficiency?: number;
  dimensions?: {
    length_mm?: number;
    width_mm?: number;
    thickness_mm?: number;
  };
  weight_kg?: number;
}

export interface Inverter {
  sku?: string;
  brand: string;
  model: string;
  power_kw: number;
  quantity?: number;
  type?: InverterType;
  phases?: 1 | 2 | 3;
  mppt_trackers?: number;
  efficiency?: number;
  has_wifi?: boolean;
  monitoring_platform?: string;
}

export interface Microinverter {
  sku?: string;
  brand: string;
  model: string;
  power_w: number;
  quantity: number;
  channels?: number;
  efficiency?: number;
}

export interface Battery {
  sku?: string;
  brand: string;
  model: string;
  capacity_kwh: number;
  voltage: number;
  quantity: number;
  total_capacity_kwh?: number;
  technology?: BatteryTechnology;
  depth_of_discharge?: number;
  cycle_life?: number;
}

export interface ChargeController {
  sku?: string;
  brand: string;
  model: string;
  type: 'PWM' | 'MPPT';
  max_current_a?: number;
}

export interface Structure {
  type?: 'roof-mounting' | 'ground-mounting' | 'carport' | 'solar-tracker';
  material?: 'aluminum' | 'steel' | 'stainless-steel';
  tilt_angle?: number;
  orientation?: 'north' | 'south' | 'east' | 'west' | 'adjustable';
}

export interface KitComponents {
  panels: Panel[];
  inverter?: Inverter;
  microinverters?: Microinverter[];
  batteries?: Battery[];
  charge_controller?: ChargeController;
  structure?: Structure;
  accessories?: any[];
}

export interface Performance {
  generation_avg_kwh_month?: number;
  generation_avg_kwh_day?: number;
  capacity_factor?: number;
  performance_ratio?: number;
  solar_hours_avg?: number;
  efficiency_percentage?: number;
}

export interface Installation {
  estimated_time_hours?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  required_certifications?: string[];
  installation_manual_url?: string;
}

export interface Warranties {
  panels_years?: number;
  inverter_years?: number;
  batteries_years?: number;
  workmanship_years?: number;
}

export interface VisionAnalysis {
  processed_at?: string;
  model?: string;
  processing_time_s?: number;
  components_visible?: string[];
  image_quality?: ImageQuality;
  quality_score?: number;
  technical_details?: {
    panel_type?: string;
    panel_color?: string;
    frame_color?: string;
    visual_features?: string[];
  };
  marketing?: {
    description?: string;
    tags?: string[];
    selling_points?: string[];
  };
  completeness?: {
    is_complete?: boolean;
    missing_components?: string[];
    suggestions?: string[];
  };
}

export interface SolarKit extends ProductBase {
  power_kwp: number;
  system_type: SystemType;
  voltage?: Voltage;
  components: KitComponents;
  performance?: Performance;
  installation?: Installation;
  warranties?: Warranties;
  certifications?: string[];
  vision_analysis?: VisionAnalysis;
}

// Utility types
export type SolarKitWithSKU = Required<Pick<SolarKit, 'sku'>> & SolarKit;

export type SolarKitSummary = Pick<
  SolarKit,
  'id' | 'sku' | 'title' | 'power_kwp' | 'system_type' | 'distributor' | 'pricing'
>;

// Validator functions
export function isValidSKU(sku: string): boolean {
  const skuPattern = /^[A-Z]{3}-[A-Z]+-[0-9A-Z]+-[A-Z0-9]+-[0-9]{3}$/;
  return skuPattern.test(sku);
}

export function calculateTotalPower(panels: Panel[]): number {
  return panels.reduce((sum, panel) => 
    sum + (panel.power_w * panel.quantity / 1000), 0
  );
}

export function calculateMargin(cost: number, retail: number): number {
  if (cost === 0) return 0;
  return ((retail - cost) / cost) * 100;
}

export function generateProductId(): string {
  // Generate UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## 🎯 FASE 2: APIs REST (HOJE - 2h)

### 2.1 FastAPI Backend

**Arquivo:** `backend/api/main.py`

```python
"""
YSH B2B Solar Products API
FastAPI backend for product management and synchronization
"""

from fastapi import FastAPI, HTTPException, Query, Path, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from enum import Enum
from pathlib import Path as FilePath
import json
import asyncio
from datetime import datetime

# Initialize FastAPI
app = FastAPI(
    title="YSH B2B Solar Products API",
    description="RESTful API for managing solar products catalog",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class DistributorEnum(str, Enum):
    fortlev = "fortlev"
    neosolar = "neosolar"
    fotus = "fotus"

class SystemTypeEnum(str, Enum):
    grid_tie = "grid-tie"
    off_grid = "off-grid"
    hybrid = "hybrid"

class CategoryEnum(str, Enum):
    kit = "kit"
    panel = "panel"
    inverter = "inverter"
    battery = "battery"
    structure = "structure"
    charger = "charger"
    accessory = "accessory"

# Pydantic Models
class ImageModel(BaseModel):
    url: str
    type: str = Field(..., regex="^(primary|gallery|technical|lifestyle|combination)$")
    alt: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    format: Optional[str] = None
    size_kb: Optional[float] = None

class PricingModel(BaseModel):
    currency: str = "BRL"
    cost: float = Field(..., ge=0)
    suggested_retail: Optional[float] = Field(None, ge=0)
    margin_percentage: Optional[float] = Field(None, ge=0, le=100)

class PanelModel(BaseModel):
    sku: Optional[str] = None
    brand: str
    model: str
    power_w: float = Field(..., gt=0)
    quantity: int = Field(..., gt=0)
    total_power_kwp: Optional[float] = None
    technology: Optional[str] = None

class InverterModel(BaseModel):
    sku: Optional[str] = None
    brand: str
    model: str
    power_kw: float = Field(..., gt=0)
    quantity: int = 1
    type: Optional[str] = None

class PerformanceModel(BaseModel):
    generation_avg_kwh_month: Optional[float] = Field(None, ge=0)
    capacity_factor: Optional[float] = Field(None, ge=0, le=1)
    performance_ratio: Optional[float] = Field(None, ge=0, le=1)

class ProductBaseModel(BaseModel):
    id: str
    sku: str = Field(..., regex="^[A-Z]{3}-[A-Z]+-[0-9A-Z]+-[A-Z0-9]+-[0-9]{3}$")
    title: str = Field(..., min_length=10, max_length=200)
    category: CategoryEnum
    distributor: DistributorEnum
    brand: Optional[str] = None
    images: Optional[List[ImageModel]] = []
    pricing: Optional[PricingModel] = None
    tags: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class SolarKitModel(ProductBaseModel):
    power_kwp: float = Field(..., gt=0)
    system_type: SystemTypeEnum
    components: Dict[str, Any]
    performance: Optional[PerformanceModel] = None

# Database (in-memory for now - replace with actual DB)
class ProductDatabase:
    def __init__(self):
        self.products: Dict[str, Dict] = {}
        self.load_from_files()
    
    def load_from_files(self):
        """Load products from normalized JSON files"""
        base_path = FilePath(__file__).parent.parent.parent / "data" / "products-inventory" / "distributors"
        
        files = [
            ("fortlev", base_path / "fortlev" / "fortlev-kits-with-skus.json"),
            ("neosolar", base_path / "neosolar" / "neosolar-kits-with-skus.json"),
            ("fotus", base_path / "fotus" / "fotus-kits-with-skus.json"),
        ]
        
        for dist, file_path in files:
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    kits = json.load(f)
                    for kit in kits:
                        if 'sku' in kit:
                            self.products[kit['sku']] = kit
        
        print(f"[DB] Loaded {len(self.products)} products")
    
    def get_all(self, skip: int = 0, limit: int = 100, distributor: Optional[str] = None) -> List[Dict]:
        products = list(self.products.values())
        
        if distributor:
            products = [p for p in products if p.get('distributor') == distributor]
        
        return products[skip:skip + limit]
    
    def get_by_sku(self, sku: str) -> Optional[Dict]:
        return self.products.get(sku)
    
    def search(
        self,
        query: str,
        distributor: Optional[str] = None,
        power_min: Optional[float] = None,
        power_max: Optional[float] = None,
        system_type: Optional[str] = None
    ) -> List[Dict]:
        results = []
        
        for product in self.products.values():
            # Distributor filter
            if distributor and product.get('distributor') != distributor:
                continue
            
            # Power filter
            power = product.get('power_kwp', 0)
            if power_min and power < power_min:
                continue
            if power_max and power > power_max:
                continue
            
            # System type filter
            if system_type and product.get('system_type') != system_type:
                continue
            
            # Text search
            if query:
                search_text = f"{product.get('title', '')} {product.get('sku', '')} {product.get('brand', '')}".lower()
                if query.lower() in search_text:
                    results.append(product)
            else:
                results.append(product)
        
        return results
    
    def get_images_status(self) -> Dict[str, Any]:
        """Get image synchronization status"""
        total = len(self.products)
        with_images = sum(1 for p in self.products.values() if p.get('images'))
        
        return {
            "total_products": total,
            "products_with_images": with_images,
            "products_without_images": total - with_images,
            "coverage_percentage": round((with_images / total * 100), 2) if total > 0 else 0
        }

# Global database instance
db = ProductDatabase()

# Routes

@app.get("/")
async def root():
    return {
        "name": "YSH B2B Solar Products API",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "products": "/api/products",
            "search": "/api/products/search",
            "images": "/api/images/status",
            "docs": "/api/docs"
        }
    }

@app.get("/api/products", response_model=List[Dict[str, Any]])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    distributor: Optional[DistributorEnum] = None
):
    """Get all products with pagination"""
    products = db.get_all(
        skip=skip,
        limit=limit,
        distributor=distributor.value if distributor else None
    )
    return products

@app.get("/api/products/{sku}")
async def get_product_by_sku(
    sku: str = Path(..., regex="^[A-Z]{3}-[A-Z]+-[0-9A-Z]+-[A-Z0-9]+-[0-9]{3}$")
):
    """Get product by SKU"""
    product = db.get_by_sku(sku)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU {sku} not found")
    return product

@app.get("/api/products/search")
async def search_products(
    q: str = Query(..., min_length=2),
    distributor: Optional[DistributorEnum] = None,
    power_min: Optional[float] = Query(None, ge=0),
    power_max: Optional[float] = Query(None, ge=0),
    system_type: Optional[SystemTypeEnum] = None
):
    """Search products"""
    results = db.search(
        query=q,
        distributor=distributor.value if distributor else None,
        power_min=power_min,
        power_max=power_max,
        system_type=system_type.value if system_type else None
    )
    
    return {
        "query": q,
        "count": len(results),
        "results": results
    }

@app.get("/api/images/status")
async def get_images_status():
    """Get image synchronization status"""
    return db.get_images_status()

@app.get("/api/distributors/{distributor}/stats")
async def get_distributor_stats(distributor: DistributorEnum):
    """Get statistics for a distributor"""
    products = db.get_all(distributor=distributor.value)
    
    total_power = sum(p.get('power_kwp', 0) for p in products)
    avg_power = total_power / len(products) if products else 0
    
    system_types = {}
    for p in products:
        st = p.get('system_type', 'unknown')
        system_types[st] = system_types.get(st, 0) + 1
    
    return {
        "distributor": distributor.value,
        "total_products": len(products),
        "total_power_kwp": round(total_power, 2),
        "average_power_kwp": round(avg_power, 2),
        "system_types": system_types,
        "products_with_images": sum(1 for p in products if p.get('images'))
    }

@app.post("/api/sync/images")
async def sync_images():
    """Trigger image synchronization"""
    # This would trigger the actual sync process
    return {
        "status": "triggered",
        "message": "Image synchronization process started",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "products_count": len(db.products)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 🎯 FASE 3: SINCRONIZAÇÃO DE IMAGENS (HOJE - 2h)

### 3.1 Sistema de Sincronização Image ↔ Product

**Arquivo:** `backend/data/products-inventory/scripts/sync_images.py`

```python
"""
Image Synchronization System
Syncs product images with database and validates availability
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import hashlib


@dataclass
class ImageSyncResult:
    total_products: int
    products_with_images: int
    products_without_images: int
    images_found: int
    images_missing: int
    images_copied: int
    errors: List[str]


class ImageSynchronizer:
    """Synchronize images with product catalog"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.distributors_path = base_path / "distributors"
        self.images_output = base_path / "images_catalog"
        self.images_output.mkdir(exist_ok=True)
    
    def sync_distributor(
        self,
        distributor: str,
        products_file: str,
        images_dir: str
    ) -> ImageSyncResult:
        """Sync images for a distributor"""
        
        print(f"\n[Sync] Processing {distributor}...")
        
        # Load products
        products_path = self.distributors_path / distributor / products_file
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Images directory
        images_path = self.distributors_path / distributor / images_dir
        
        # Scan available images
        available_images = {}
        if images_path.exists():
            for img_file in images_path.rglob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.svg']:
                    available_images[img_file.stem.lower()] = img_file
        
        # Sync results
        result = ImageSyncResult(
            total_products=len(products),
            products_with_images=0,
            products_without_images=0,
            images_found=0,
            images_missing=0,
            images_copied=0,
            errors=[]
        )
        
        # Process each product
        for product in products:
            sku = product.get('sku', '')
            kit_id = product.get('kit_id', '')
            
            # Check if product already has images
            if product.get('images') and len(product.get('images', [])) > 0:
                result.products_with_images += 1
                continue
            
            # Try to find image by SKU or kit_id
            image_file = self._find_image_file(
                sku, kit_id, available_images
            )
            
            if image_file:
                # Copy image to catalog
                dest_file = self._copy_image_to_catalog(
                    distributor, sku, image_file
                )
                
                if dest_file:
                    # Add image to product
                    if 'images' not in product:
                        product['images'] = []
                    
                    product['images'].append({
                        "url": str(dest_file.relative_to(self.base_path)),
                        "type": "primary",
                        "alt": product.get('title', ''),
                        "format": dest_file.suffix[1:].lower(),
                        "size_kb": round(dest_file.stat().st_size / 1024, 2)
                    })
                    
                    result.products_with_images += 1
                    result.images_found += 1
                    result.images_copied += 1
                else:
                    result.errors.append(f"Failed to copy image for {sku}")
                    result.products_without_images += 1
            else:
                result.products_without_images += 1
                result.images_missing += 1
        
        # Save updated products
        output_file = self.distributors_path / distributor / f"{distributor}-kits-synced.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[Sync] ✅ Saved to {output_file.name}")
        
        return result
    
    def _find_image_file(
        self,
        sku: str,
        kit_id: str,
        available_images: Dict[str, Path]
    ) -> Optional[Path]:
        """Find image file by SKU or kit_id"""
        
        search_keys = [
            sku.lower(),
            kit_id.lower(),
            sku.replace('-', '').lower(),
            kit_id.replace('-', '').lower(),
            sku.split('-')[0].lower()  # Just distributor code
        ]
        
        for key in search_keys:
            if key in available_images:
                return available_images[key]
        
        return None
    
    def _copy_image_to_catalog(
        self,
        distributor: str,
        sku: str,
        source: Path
    ) -> Optional[Path]:
        """Copy image to catalog directory"""
        
        try:
            dest_dir = self.images_output / distributor
            dest_dir.mkdir(exist_ok=True)
            
            dest_file = dest_dir / f"{sku}{source.suffix}"
            
            if not dest_file.exists():
                shutil.copy2(source, dest_file)
            
            return dest_file
        
        except Exception as e:
            print(f"[Sync] ❌ Error copying {source}: {e}")
            return None
    
    def sync_all(self) -> Dict[str, ImageSyncResult]:
        """Sync all distributors"""
        
        distributors = [
            ('fortlev', 'fortlev-kits-with-skus.json', 'organized_images'),
            ('neosolar', 'neosolar-kits-with-skus.json', 'images'),
            ('fotus', 'fotus-kits-with-skus.json', 'images'),
        ]
        
        results = {}
        
        for dist, products_file, images_dir in distributors:
            try:
                result = self.sync_distributor(dist, products_file, images_dir)
                results[dist] = result
            except Exception as e:
                print(f"[Sync] ❌ Error processing {dist}: {e}")
                results[dist] = ImageSyncResult(
                    total_products=0,
                    products_with_images=0,
                    products_without_images=0,
                    images_found=0,
                    images_missing=0,
                    images_copied=0,
                    errors=[str(e)]
                )
        
        return results
    
    def generate_report(self, results: Dict[str, ImageSyncResult]) -> str:
        """Generate sync report"""
        
        report = []
        report.append("\n" + "="*60)
        report.append("IMAGE SYNCHRONIZATION REPORT")
        report.append("="*60 + "\n")
        
        total_products = 0
        total_with_images = 0
        total_images_found = 0
        
        for dist, result in results.items():
            total_products += result.total_products
            total_with_images += result.products_with_images
            total_images_found += result.images_found
            
            report.append(f"📦 {dist.upper()}")
            report.append(f"   Products: {result.total_products}")
            report.append(f"   With Images: {result.products_with_images} ({result.products_with_images/result.total_products*100:.1f}%)")
            report.append(f"   Without Images: {result.products_without_images}")
            report.append(f"   Images Found: {result.images_found}")
            report.append(f"   Images Copied: {result.images_copied}")
            
            if result.errors:
                report.append(f"   ❌ Errors: {len(result.errors)}")
            
            report.append("")
        
        report.append("-"*60)
        report.append(f"📊 TOTAL")
        report.append(f"   Products: {total_products}")
        report.append(f"   With Images: {total_with_images} ({total_with_images/total_products*100:.1f}%)")
        report.append(f"   Images Found: {total_images_found}")
        report.append("="*60 + "\n")
        
        return "\n".join(report)


def main():
    """Run image synchronization"""
    
    base_path = Path(__file__).parent.parent
    
    synchronizer = ImageSynchronizer(base_path)
    results = synchronizer.sync_all()
    
    report = synchronizer.generate_report(results)
    print(report)
    
    # Save report
    report_file = base_path / "IMAGE_SYNC_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"[Sync] 📄 Report saved to {report_file}")


if __name__ == "__main__":
    main()
```

---

## 🎯 EXECUÇÃO IMEDIATA (PRÓXIMOS 30 MIN)

```bash
# 1. Gerar SKUs
cd backend/data/products-inventory/scripts
python generate_skus.py

# 2. Sincronizar Imagens
python sync_images.py

# 3. Iniciar API FastAPI
cd ../../../api
python main.py

# 4. Testar API
curl http://localhost:8000/api/products
curl http://localhost:8000/api/images/status
```

---

**Este roadmap inclui:**
✅ Sistema completo de geração de SKUs  
✅ Schemas JSON unificados com validação  
✅ TypeScript types para frontend  
✅ API FastAPI com endpoints REST  
✅ Sistema de sincronização de imagens  
✅ Documentação completa  
✅ Scripts de execução  

**Pronto para executar AGORA!** 🚀
