"""
MIGRATION SCRIPT: Kits with Payment Splits
Importa kits_api_with_splits.json para Medusa com custos detalhados

Features:
- Importa custos_pagamento (kit, dossiê, mão de obra, total)
- Importa fabricacao_detalhada (módulos, inversor, BOS)
- Cria cost_breakdown para cada produto
- Gera SKUs dinâmicos com tier variants
- Calcula pricing com taxas de pagamento incluídas
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

class KitsWithSplitsImporter:
    """
    Importador de kits com custos detalhados e splits de pagamento
    """
    
    DISTRIBUTOR_CODES = {
        "fortlev": "FLV",
        "neosolar": "NEO",
        "fotus": "FTS",
    }
    
    TIER_MULTIPLIERS = {
        "bronze": 1.0,
        "silver": 0.95,
        "gold": 0.90,
        "platinum": 0.85,
    }
    
    # Taxas Asaas (default: PIX)
    DEFAULT_PAYMENT_FEE_BRL = 1.89
    
    def __init__(self, input_file: str, output_dir: str = "medusa_import_with_splits"):
        self.input_file = input_file
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        self.products = []
        self.cost_breakdowns = []
        self.split_recipients = []
        
        # Stats
        self.stats = {
            "total_kits": 0,
            "total_products": 0,
            "total_variants": 0,
            "total_cost_breakdowns": 0,
            "avg_kit_cost_brl": 0,
            "avg_labor_cost_brl": 0,
            "avg_dossier_cost_brl": 0,
            "avg_total_project_cost_brl": 0,
        }
    
    def load_kits(self) -> List[Dict]:
        """Carrega kits do JSON"""
        print(f"Loading kits from {self.input_file}...")
        
        with open(self.input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        self.stats["total_kits"] = len(kits)
        print(f"Loaded {len(kits)} kits")
        
        return kits
    
    def extract_cost_breakdown(self, kit: Dict) -> Dict:
        """
        Extrai custos detalhados do kit
        
        custos_pagamento:
        - custo_kit_reais: Kit completo (painéis + inversor + BOS)
        - custo_dossie_tecnico_homologacao_reais: Dossiê técnico
        - custo_mao_de_obra_reais: Instalação
        - valor_total_projeto_reais: Total geral
        """
        custos = kit.get("custos_pagamento", {})
        fabricacao = kit.get("fabricacao_detalhada", {})
        
        cost_breakdown = {
            # Custos principais
            "custo_kit_reais": custos.get("custo_kit_reais", 0),
            "custo_dossie_tecnico_homologacao_reais": custos.get("custo_dossie_tecnico_homologacao_reais", 0),
            "custo_mao_de_obra_reais": custos.get("custo_mao_de_obra_reais", 0),
            "valor_total_projeto_reais": custos.get("valor_total_projeto_reais", 0),
            
            # Breakdown detalhado
            "modulos_solares": fabricacao.get("modulos_solares", []),
            "inversor_solar": fabricacao.get("inversor_solar", {}),
            "componentes_balance_of_system": fabricacao.get("componentes_balance_of_system", {}),
            "custo_total_do_kit_reais": fabricacao.get("custo_total_do_kit_reais", 0),
        }
        
        return cost_breakdown
    
    def calculate_pricing_with_fees(self, base_price_brl: float, payment_method: str = "pix") -> Dict:
        """
        Calcula pricing com taxas de pagamento incluídas
        
        Args:
            base_price_brl: Preço base (custo_kit_reais)
            payment_method: boleto, credit_card, pix (default)
        
        Returns:
            {
                base_price_brl: float,
                payment_fee_brl: float,
                price_with_fees_brl: float,
            }
        """
        # Taxas por método (PIX como default)
        fees = {
            "pix": 1.89,
            "pix_dynamic": 1.89,
            "boleto": 1.89,
            "credit_card": base_price_brl * 0.0289,  # 2.89% à vista
            "debit_card": base_price_brl * 0.0189,   # 1.89%
        }
        
        payment_fee = fees.get(payment_method, self.DEFAULT_PAYMENT_FEE_BRL)
        
        return {
            "base_price_brl": base_price_brl,
            "payment_fee_brl": payment_fee,
            "price_with_fees_brl": base_price_brl + payment_fee,
        }
    
    def generate_sku(self, kit: Dict, tier: str = "bronze", sequence: int = 1) -> str:
        """
        Gera SKU dinâmico com tier
        
        Format: {DIST}-{TYPE}-{POWER}-{BRAND}-{TIER}-{CERT}-{SEQ}
        Exemplo: YSH-KIT-120KWP-JINKO-BRZ-CERT-001
        """
        # Extrai dados
        power_kwp = kit.get("potencia_quilowatt_pico", 0)
        modulos = kit.get("fabricacao_detalhada", {}).get("modulos_solares", [])
        
        # Marca do painel
        brand = "GENERIC"
        if modulos and len(modulos) > 0:
            brand_full = modulos[0].get("marca_do_modulo", "GENERIC")
            brand = brand_full.upper().replace(" ", "")[:8]
        
        # Formata potência
        if power_kwp < 1:
            power_str = f"{int(power_kwp * 1000)}W"
        else:
            power_str = f"{int(power_kwp * 100)}KWP"
        
        # Tier code
        tier_codes = {
            "bronze": "BRZ",
            "silver": "SLV",
            "gold": "GLD",
            "platinum": "PLT",
        }
        tier_code = tier_codes.get(tier, "BRZ")
        
        # Certificação (placeholder, pode ser extraído do JSON)
        cert_flag = "CERT"  # CERT, PEND, EXPR, NONE
        
        # SKU final
        sku = f"YSH-KIT-{power_str}-{brand}-{tier_code}-{cert_flag}-{sequence:03d}"
        
        return sku
    
    def migrate_kit(self, kit: Dict, kit_index: int) -> Dict:
        """
        Converte um kit para formato Medusa com custo breakdown
        """
        # Extrai custos
        cost_breakdown = self.extract_cost_breakdown(kit)
        
        # Base price = custo_kit_reais (sem margem ainda)
        base_price = cost_breakdown["custo_kit_reais"]
        
        # Adiciona margem de lucro (ex: 15%)
        margin_percent = 15.0
        base_price_with_margin = base_price * (1 + margin_percent / 100)
        
        # Calcula pricing com taxas
        pricing_breakdown = self.calculate_pricing_with_fees(base_price_with_margin)
        
        # Gera SKU base
        base_sku = self.generate_sku(kit, tier="bronze", sequence=kit_index + 1)
        
        # Cria 4 variants (1 por tier)
        variants = []
        tiers = ["bronze", "silver", "gold", "platinum"]
        
        for tier in tiers:
            tier_multiplier = self.TIER_MULTIPLIERS[tier]
            tier_price = pricing_breakdown["price_with_fees_brl"] * tier_multiplier
            
            tier_sku = self.generate_sku(kit, tier=tier, sequence=kit_index + 1)
            
            variant = {
                "sku": tier_sku,
                "title": f"{tier.capitalize()} Tier",
                "tier": tier,
                "pricing": {
                    "base_price_brl": base_price_with_margin,
                    "tier_multiplier": tier_multiplier,
                    "tier_price_brl": tier_price,
                    "payment_fee_brl": pricing_breakdown["payment_fee_brl"],
                    "final_price_brl": tier_price,
                },
                "inventory": {
                    "manage_inventory": True,
                    "allow_backorder": False,
                    "quantity": 100,  # Placeholder
                },
                "options": [
                    {"option": "tier", "value": tier},
                ],
            }
            
            variants.append(variant)
        
        # Produto Medusa
        product = {
            "id": f"prod_kit_{kit_index + 1}",
            "title": self._generate_product_title(kit),
            "subtitle": f"Kit Fotovoltaico {kit.get('potencia_quilowatt_pico', 0)} kWp",
            "description": self._generate_product_description(kit),
            "handle": f"kit-{kit_index + 1}",
            "is_giftcard": False,
            "status": "published",
            "variants": variants,
            "options": [
                {
                    "title": "Tier",
                    "values": tiers,
                },
            ],
            "tags": [
                {"value": "solar-kit"},
                {"value": kit.get("categoria_do_kit", "unknown")},
                {"value": f"{kit.get('potencia_quilowatt_pico', 0)}kwp"},
            ],
            "metadata": {
                "categoria": kit.get("categoria_do_kit"),
                "tier_geracao": kit.get("tier_de_geracao"),
                "potencia_kwp": kit.get("potencia_quilowatt_pico"),
                "regiao": kit.get("regiao_de_instalacao"),
                "consumo_medio_kwh": kit.get("consumo_medio_comercial_kwh_mes"),
                "geracao_mensal_kwh": kit.get("geracao_mensal_kit_kwh"),
            },
        }
        
        # Cost Breakdown (extension)
        cost_breakdown_record = {
            "id": f"cost_breakdown_{kit_index + 1}",
            "product_id": product["id"],
            "distributor_code": "YSH",  # Placeholder
            **cost_breakdown,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        
        self.cost_breakdowns.append(cost_breakdown_record)
        
        return product
    
    def _generate_product_title(self, kit: Dict) -> str:
        """Gera título do produto"""
        power = kit.get("potencia_quilowatt_pico", 0)
        modulos = kit.get("fabricacao_detalhada", {}).get("modulos_solares", [])
        
        if modulos and len(modulos) > 0:
            brand = modulos[0].get("marca_do_modulo", "Generic")
            return f"Kit Solar {power} kWp - {brand}"
        
        return f"Kit Solar {power} kWp"
    
    def _generate_product_description(self, kit: Dict) -> str:
        """Gera descrição do produto"""
        fabricacao = kit.get("fabricacao_detalhada", {})
        modulos = fabricacao.get("modulos_solares", [])
        inversor = fabricacao.get("inversor_solar", {})
        
        desc_parts = [
            f"**Potência:** {kit.get('potencia_quilowatt_pico', 0)} kWp",
            f"**Geração Mensal:** {kit.get('geracao_mensal_kit_kwh', 0)} kWh",
            f"**Região:** {kit.get('regiao_de_instalacao', 'N/A')}",
        ]
        
        if modulos:
            modulo = modulos[0]
            desc_parts.append(f"**Painéis:** {modulo.get('quantidade_de_unidades', 0)}x {modulo.get('marca_do_modulo', 'N/A')} {modulo.get('modelo_do_modulo', 'N/A')}")
        
        if inversor:
            desc_parts.append(f"**Inversor:** {inversor.get('marca_do_inversor', 'N/A')} {inversor.get('modelo_do_inversor', 'N/A')}")
        
        custos = kit.get("custos_pagamento", {})
        desc_parts.append(f"**Valor Total Projeto:** R$ {custos.get('valor_total_projeto_reais', 0):,.2f}")
        
        return "\n\n".join(desc_parts)
    
    def migrate_all_kits(self):
        """Processa todos os kits"""
        print("\n=== STARTING KITS MIGRATION WITH SPLITS ===\n")
        
        kits = self.load_kits()
        
        # Processa cada kit
        for idx, kit in enumerate(kits):
            if idx % 100 == 0:
                print(f"Processing kit {idx + 1}/{len(kits)}...")
            
            product = self.migrate_kit(kit, idx)
            self.products.append(product)
        
        # Calcula stats
        self.stats["total_products"] = len(self.products)
        self.stats["total_variants"] = sum(len(p["variants"]) for p in self.products)
        self.stats["total_cost_breakdowns"] = len(self.cost_breakdowns)
        
        # Médias
        if self.cost_breakdowns:
            self.stats["avg_kit_cost_brl"] = sum(cb["custo_kit_reais"] for cb in self.cost_breakdowns) / len(self.cost_breakdowns)
            self.stats["avg_labor_cost_brl"] = sum(cb["custo_mao_de_obra_reais"] for cb in self.cost_breakdowns) / len(self.cost_breakdowns)
            self.stats["avg_dossier_cost_brl"] = sum(cb["custo_dossie_tecnico_homologacao_reais"] for cb in self.cost_breakdowns) / len(self.cost_breakdowns)
            self.stats["avg_total_project_cost_brl"] = sum(cb["valor_total_projeto_reais"] for cb in self.cost_breakdowns) / len(self.cost_breakdowns)
        
        # Salva arquivos
        self._save_outputs()
        
        print(f"\n=== MIGRATION COMPLETE ===")
        print(f"Products: {self.stats['total_products']}")
        print(f"Variants: {self.stats['total_variants']}")
        print(f"Cost Breakdowns: {self.stats['total_cost_breakdowns']}")
        print(f"Avg Kit Cost: R$ {self.stats['avg_kit_cost_brl']:,.2f}")
        print(f"Avg Labor Cost: R$ {self.stats['avg_labor_cost_brl']:,.2f}")
        print(f"Avg Dossier Cost: R$ {self.stats['avg_dossier_cost_brl']:,.2f}")
        print(f"Avg Total Project: R$ {self.stats['avg_total_project_cost_brl']:,.2f}")
        print(f"\nOutput directory: {self.output_dir.absolute()}")
    
    def _save_outputs(self):
        """Salva outputs JSON"""
        # Products
        products_file = self.output_dir / "medusa_products_with_costs.json"
        with open(products_file, 'w', encoding='utf-8') as f:
            json.dump(self.products, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(self.products)} products to {products_file}")
        
        # Cost Breakdowns
        costs_file = self.output_dir / "medusa_cost_breakdowns.json"
        with open(costs_file, 'w', encoding='utf-8') as f:
            json.dump(self.cost_breakdowns, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(self.cost_breakdowns)} cost breakdowns to {costs_file}")
        
        # Stats
        stats_file = self.output_dir / "migration_summary.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump(self.stats, f, indent=2, ensure_ascii=False)
        print(f"Saved migration summary to {stats_file}")


if __name__ == "__main__":
    # Path to kits_api_with_splits.json
    input_file = r"C:\Users\fjuni\OneDrive\Documentos\GitHub\yello-solar-hub_catalog\data\kits_api_with_splits.json"
    
    # Create importer
    importer = KitsWithSplitsImporter(input_file)
    
    # Run migration
    importer.migrate_all_kits()
