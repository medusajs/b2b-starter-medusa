"""
Bundle Composer - Sistema de composição de Kits como Bundles Virtuais

Este sistema cria bundles (kits) a partir de SKUs de componentes validados,
calculando disponibilidade dinâmica e preços com margem configurável.

Contexto Medusa.js:
- Product com metadata.is_bundle=true
- Variant sem manage_inventory (estoque calculado dinamicamente)
- inventory_items[] array com {inventory_item_id, required_quantity}
- Disponibilidade = MIN(FLOOR(stock_componente / quantity_required))
- Preço = SOMA(preço_componente) + margem

Usage:
    python bundle-composer.py --config bundle-config.json --output bundles-payload.json
"""

import json
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict, field
from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
import unicodedata
import argparse


class PricingStrategy(Enum):
    """Estratégias de precificação de bundles."""
    SUM_COMPONENTS = "sum_of_components"  # Soma dos componentes sem margem
    SUM_WITH_MARGIN = "sum_with_margin"    # Soma + margem percentual
    FIXED_PRICE = "fixed_price"            # Preço fixo independente dos componentes


class BundleCategory(Enum):
    """Categorias de bundles/kits."""
    RESIDENTIAL_ONGRID = "residential_ongrid"
    RESIDENTIAL_HYBRID = "residential_hybrid"
    RESIDENTIAL_OFFGRID = "residential_offgrid"
    COMMERCIAL_ONGRID = "commercial_ongrid"
    COMMERCIAL_HYBRID = "commercial_hybrid"
    INDUSTRIAL_ONGRID = "industrial_ongrid"
    CUSTOM = "custom"


@dataclass
class BundleComponent:
    """Componente de um bundle."""
    variant_sku: str
    quantity: int
    inventory_item_id: Optional[str] = None  # Preenchido durante resolução
    current_stock: Optional[int] = None      # Stock disponível do componente
    unit_price_brl: Optional[Decimal] = None # Preço unitário do componente


@dataclass
class MarginPolicy:
    """Política de margem para precificação."""
    margin_percent: Decimal        # Margem percentual (ex: 15.0 = 15%)
    min_margin_brl: Optional[Decimal] = None  # Margem mínima em R$
    max_margin_brl: Optional[Decimal] = None  # Margem máxima em R$
    apply_per_component: bool = False  # Se True, aplica margem por componente; se False, no total


@dataclass
class PricingConfig:
    """Configuração de precificação."""
    strategy: PricingStrategy
    margin_policy: Optional[MarginPolicy] = None
    fixed_price_brl: Optional[Decimal] = None  # Usado apenas com FIXED_PRICE
    currency_code: str = "BRL"
    price_list_id: Optional[str] = None  # PriceList Medusa para buscar preços


@dataclass
class BundleMetadata:
    """Metadados do bundle."""
    is_bundle: bool = True
    bundle_category: str = "custom"
    pricing_strategy: str = "sum_with_margin"
    margin_percent: Optional[Decimal] = None
    min_margin_brl: Optional[Decimal] = None
    max_margin_brl: Optional[Decimal] = None
    
    # KPIs Técnicos (opcionais)
    total_power_kwp: Optional[Decimal] = None
    estimated_generation_month_kwh: Optional[Decimal] = None
    inverter_type: Optional[str] = None
    has_battery: bool = False
    battery_capacity_kwh: Optional[Decimal] = None
    payback_years: Optional[Decimal] = None
    
    # Componentes do bundle
    bundle_components: List[Dict] = field(default_factory=list)


@dataclass
class BundleAvailability:
    """Disponibilidade calculada de um bundle."""
    available_quantity: int
    limiting_component: Optional[str] = None  # SKU do componente que limita
    component_stocks: Dict[str, int] = field(default_factory=dict)
    calculation_notes: List[str] = field(default_factory=list)


@dataclass
class BundlePrice:
    """Preço calculado de um bundle."""
    total_price_brl: Decimal
    components_cost_brl: Decimal
    margin_brl: Decimal
    margin_percent: Decimal
    price_breakdown: List[Dict] = field(default_factory=list)


@dataclass
class BundlePayload:
    """Payload completo para criação do bundle no Medusa."""
    # Product fields
    title: str
    handle: str
    description: Optional[str] = None
    status: str = "published"
    
    # Variant fields
    variant_title: str = "Default"
    variant_sku: str = ""
    manage_inventory: bool = False  # Bundles nunca gerenciam estoque próprio
    
    # Inventory items (componentes)
    inventory_items: List[Dict] = field(default_factory=list)
    
    # Pricing
    prices: List[Dict] = field(default_factory=list)
    
    # Metadata
    metadata: Dict = field(default_factory=dict)
    
    # Calculated fields (não enviados ao Medusa, apenas para referência)
    availability: Optional[BundleAvailability] = None
    calculated_price: Optional[BundlePrice] = None


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def normalize_string(text: str) -> str:
    """Remove acentos e normaliza string."""
    if not text:
        return ""
    
    # Remove acentos
    nfkd = unicodedata.normalize('NFKD', text)
    text_no_accents = ''.join([c for c in nfkd if not unicodedata.combining(c)])
    
    return text_no_accents


def generate_handle(text: str, max_length: int = 100) -> str:
    """
    Gera handle URL-friendly a partir de texto.
    
    Args:
        text: Texto fonte
        max_length: Comprimento máximo do handle
    
    Returns:
        Handle normalizado (lowercase, hyphens, no special chars)
    """
    # Normalizar string
    normalized = normalize_string(text)
    
    # Lowercase
    handle = normalized.lower()
    
    # Substituir espaços e caracteres especiais por hífens
    handle = re.sub(r'[^a-z0-9]+', '-', handle)
    
    # Remover hífens duplicados
    handle = re.sub(r'-+', '-', handle)
    
    # Remover hífens no início e fim
    handle = handle.strip('-')
    
    # Limitar comprimento
    if len(handle) > max_length:
        handle = handle[:max_length].rstrip('-')
    
    return handle


def validate_sku_pattern(sku: str, pattern: str = r'^[A-Z0-9]+-[A-Z0-9-]+$') -> bool:
    """
    Valida se SKU segue o padrão esperado.
    
    Args:
        sku: SKU a validar
        pattern: Regex pattern (default: padrão global)
    
    Returns:
        True se válido, False caso contrário
    """
    return bool(re.match(pattern, sku))


# ============================================================================
# SKU GENERATOR FOR BUNDLES
# ============================================================================

class BundleSKUGenerator:
    """Gera SKUs para bundles seguindo o padrão KIT-*."""
    
    @staticmethod
    def generate(
        category: BundleCategory,
        power_kwp: Optional[Decimal] = None,
        inverter_brand: Optional[str] = None,
        custom_suffix: Optional[str] = None
    ) -> str:
        """
        Gera SKU para bundle.
        
        Formato: KIT-{CATEGORY}-{POWER}KWP-{BRAND}[-{SUFFIX}]
        Exemplo: KIT-RESHYB-8KWP-GROW-LFP
        
        Args:
            category: Categoria do bundle
            power_kwp: Potência em kWp
            inverter_brand: Marca do inversor (primeiras 4 letras)
            custom_suffix: Sufixo customizado opcional
        
        Returns:
            SKU do bundle
        """
        parts = ["KIT"]
        
        # Categoria abreviada
        category_map = {
            BundleCategory.RESIDENTIAL_ONGRID: "RESON",
            BundleCategory.RESIDENTIAL_HYBRID: "RESHYB",
            BundleCategory.RESIDENTIAL_OFFGRID: "RESOFF",
            BundleCategory.COMMERCIAL_ONGRID: "COMON",
            BundleCategory.COMMERCIAL_HYBRID: "COMHYB",
            BundleCategory.INDUSTRIAL_ONGRID: "INDON",
            BundleCategory.CUSTOM: "CUSTOM"
        }
        parts.append(category_map.get(category, "CUSTOM"))
        
        # Potência
        if power_kwp:
            power_int = int(power_kwp)
            parts.append(f"{power_int}KWP")
        
        # Marca do inversor (primeiras 4 letras, uppercase)
        if inverter_brand:
            brand_norm = normalize_string(inverter_brand).upper()
            brand_abbr = brand_norm[:4]
            parts.append(brand_abbr)
        
        # Sufixo customizado
        if custom_suffix:
            suffix_norm = normalize_string(custom_suffix).upper()
            parts.append(suffix_norm)
        
        sku = "-".join(parts)
        
        # Validar padrão
        if not re.match(r'^KIT-[A-Z0-9]+(-[A-Z0-9]+)*$', sku):
            raise ValueError(f"SKU gerado '{sku}' não segue o padrão esperado")
        
        return sku


# ============================================================================
# AVAILABILITY CALCULATOR
# ============================================================================

class AvailabilityCalculator:
    """Calcula disponibilidade dinâmica de bundles."""
    
    @staticmethod
    def calculate(components: List[BundleComponent]) -> BundleAvailability:
        """
        Calcula disponibilidade do bundle.
        
        Fórmula: MIN(FLOOR(stock_componente / quantity_required))
        
        Args:
            components: Lista de componentes com stock preenchido
        
        Returns:
            BundleAvailability com quantidade disponível e detalhes
        """
        if not components:
            return BundleAvailability(
                available_quantity=0,
                calculation_notes=["Nenhum componente fornecido"]
            )
        
        # Validar que todos os componentes têm stock
        missing_stock = [c.variant_sku for c in components if c.current_stock is None]
        if missing_stock:
            return BundleAvailability(
                available_quantity=0,
                calculation_notes=[
                    f"Componentes sem informação de estoque: {', '.join(missing_stock)}"
                ]
            )
        
        # Calcular quantidade disponível de cada componente
        component_availabilities = []
        component_stocks = {}
        
        for comp in components:
            if comp.current_stock == 0:
                available = 0
            else:
                available = comp.current_stock // comp.quantity
            
            component_availabilities.append((comp.variant_sku, available))
            component_stocks[comp.variant_sku] = comp.current_stock
        
        # Mínimo disponível (componente limitante)
        min_available = min(avail for _, avail in component_availabilities)
        limiting_component = next(
            sku for sku, avail in component_availabilities if avail == min_available
        )
        
        # Notas de cálculo
        notes = [
            f"Disponibilidade calculada: {min_available} kits",
            f"Componente limitante: {limiting_component}"
        ]
        
        for sku, avail in component_availabilities:
            comp = next(c for c in components if c.variant_sku == sku)
            notes.append(
                f"  {sku}: {comp.current_stock} unidades / {comp.quantity} por kit = {avail} kits"
            )
        
        return BundleAvailability(
            available_quantity=min_available,
            limiting_component=limiting_component,
            component_stocks=component_stocks,
            calculation_notes=notes
        )


# ============================================================================
# PRICE CALCULATOR
# ============================================================================

class PriceCalculator:
    """Calcula preço de bundles com margem."""
    
    @staticmethod
    def calculate(
        components: List[BundleComponent],
        pricing_config: PricingConfig
    ) -> BundlePrice:
        """
        Calcula preço do bundle.
        
        Args:
            components: Lista de componentes com preços preenchidos
            pricing_config: Configuração de precificação
        
        Returns:
            BundlePrice com preço total e breakdown
        """
        if not components:
            raise ValueError("Nenhum componente fornecido para cálculo de preço")
        
        # Validar que todos os componentes têm preço
        missing_price = [c.variant_sku for c in components if c.unit_price_brl is None]
        if missing_price:
            raise ValueError(
                f"Componentes sem preço: {', '.join(missing_price)}"
            )
        
        # Estratégia FIXED_PRICE
        if pricing_config.strategy == PricingStrategy.FIXED_PRICE:
            if not pricing_config.fixed_price_brl:
                raise ValueError("fixed_price_brl obrigatório para estratégia FIXED_PRICE")
            
            components_cost = sum(
                c.unit_price_brl * c.quantity for c in components
            )
            
            fixed_price = pricing_config.fixed_price_brl
            margin = fixed_price - components_cost
            margin_pct = (margin / components_cost * 100) if components_cost > 0 else Decimal(0)
            
            return BundlePrice(
                total_price_brl=fixed_price,
                components_cost_brl=components_cost,
                margin_brl=margin,
                margin_percent=margin_pct,
                price_breakdown=[
                    {
                        "sku": c.variant_sku,
                        "quantity": c.quantity,
                        "unit_price": float(c.unit_price_brl),
                        "subtotal": float(c.unit_price_brl * c.quantity)
                    }
                    for c in components
                ]
            )
        
        # Calcular custo dos componentes
        components_cost = Decimal(0)
        price_breakdown = []
        
        for comp in components:
            subtotal = comp.unit_price_brl * comp.quantity
            components_cost += subtotal
            
            price_breakdown.append({
                "sku": comp.variant_sku,
                "quantity": comp.quantity,
                "unit_price": float(comp.unit_price_brl),
                "subtotal": float(subtotal)
            })
        
        # Estratégia SUM_COMPONENTS (sem margem)
        if pricing_config.strategy == PricingStrategy.SUM_COMPONENTS:
            return BundlePrice(
                total_price_brl=components_cost,
                components_cost_brl=components_cost,
                margin_brl=Decimal(0),
                margin_percent=Decimal(0),
                price_breakdown=price_breakdown
            )
        
        # Estratégia SUM_WITH_MARGIN
        if pricing_config.strategy == PricingStrategy.SUM_WITH_MARGIN:
            if not pricing_config.margin_policy:
                raise ValueError("margin_policy obrigatória para estratégia SUM_WITH_MARGIN")
            
            margin_policy = pricing_config.margin_policy
            
            # Calcular margem percentual
            margin = components_cost * (margin_policy.margin_percent / 100)
            
            # Aplicar piso/teto de margem
            if margin_policy.min_margin_brl and margin < margin_policy.min_margin_brl:
                margin = margin_policy.min_margin_brl
            
            if margin_policy.max_margin_brl and margin > margin_policy.max_margin_brl:
                margin = margin_policy.max_margin_brl
            
            total_price = components_cost + margin
            actual_margin_pct = (margin / components_cost * 100) if components_cost > 0 else Decimal(0)
            
            return BundlePrice(
                total_price_brl=total_price,
                components_cost_brl=components_cost,
                margin_brl=margin,
                margin_percent=actual_margin_pct,
                price_breakdown=price_breakdown
            )
        
        raise ValueError(f"Estratégia de precificação desconhecida: {pricing_config.strategy}")


# ============================================================================
# BUNDLE COMPOSER
# ============================================================================

class BundleComposer:
    """Compositor de bundles a partir de componentes."""
    
    def __init__(
        self,
        inventory_resolver: Optional[callable] = None,
        price_resolver: Optional[callable] = None
    ):
        """
        Inicializa compositor.
        
        Args:
            inventory_resolver: Função (variant_sku) -> (inventory_item_id, stock)
            price_resolver: Função (variant_sku, price_list_id) -> price_brl
        """
        self.inventory_resolver = inventory_resolver
        self.price_resolver = price_resolver
    
    def compose(
        self,
        title: str,
        components: List[Dict],
        pricing_config: PricingConfig,
        category: BundleCategory = BundleCategory.CUSTOM,
        description: Optional[str] = None,
        metadata_overrides: Optional[Dict] = None,
        resolve_inventory: bool = True,
        resolve_prices: bool = True
    ) -> BundlePayload:
        """
        Compõe um bundle completo.
        
        Args:
            title: Título do bundle
            components: Lista de dicts [{variant_sku, quantity}, ...]
            pricing_config: Configuração de precificação
            category: Categoria do bundle
            description: Descrição opcional
            metadata_overrides: Metadados customizados adicionais
            resolve_inventory: Se True, resolve inventory_item_id e stock
            resolve_prices: Se True, resolve preços dos componentes
        
        Returns:
            BundlePayload completo pronto para Medusa
        """
        # Validar componentes
        if not components:
            raise ValueError("Bundle deve ter pelo menos um componente")
        
        # Criar objetos BundleComponent
        bundle_components = []
        for comp_dict in components:
            variant_sku = comp_dict.get("variant_sku")
            quantity = comp_dict.get("quantity")
            
            if not variant_sku or not quantity:
                raise ValueError(
                    f"Componente inválido: {comp_dict}. "
                    "Esperado: {{variant_sku, quantity}}"
                )
            
            # Validar SKU pattern
            if not validate_sku_pattern(variant_sku):
                raise ValueError(
                    f"SKU '{variant_sku}' não segue o padrão esperado"
                )
            
            bundle_comp = BundleComponent(
                variant_sku=variant_sku,
                quantity=int(quantity)
            )
            bundle_components.append(bundle_comp)
        
        # Resolver inventory_item_id e stock
        if resolve_inventory and self.inventory_resolver:
            for comp in bundle_components:
                try:
                    inv_id, stock = self.inventory_resolver(comp.variant_sku)
                    comp.inventory_item_id = inv_id
                    comp.current_stock = stock
                except Exception as e:
                    print(
                        f"⚠️  Não foi possível resolver inventário para {comp.variant_sku}: {e}",
                        file=sys.stderr
                    )
        
        # Resolver preços
        if resolve_prices and self.price_resolver:
            for comp in bundle_components:
                try:
                    price = self.price_resolver(
                        comp.variant_sku,
                        pricing_config.price_list_id
                    )
                    comp.unit_price_brl = Decimal(str(price))
                except Exception as e:
                    print(
                        f"⚠️  Não foi possível resolver preço para {comp.variant_sku}: {e}",
                        file=sys.stderr
                    )
        
        # Calcular disponibilidade
        availability = None
        if all(c.current_stock is not None for c in bundle_components):
            availability = AvailabilityCalculator.calculate(bundle_components)
        
        # Calcular preço
        calculated_price = None
        if all(c.unit_price_brl is not None for c in bundle_components):
            calculated_price = PriceCalculator.calculate(
                bundle_components,
                pricing_config
            )
        
        # Gerar SKU do bundle
        # Tentar extrair potência do título ou metadata
        power_kwp = None
        if metadata_overrides and "total_power_kwp" in metadata_overrides:
            power_kwp = Decimal(str(metadata_overrides["total_power_kwp"]))
        
        # Tentar extrair marca do inversor dos componentes
        inverter_brand = None
        for comp in bundle_components:
            if comp.variant_sku.startswith("INV-"):
                # Extrair marca do SKU: INV-GROW-MIN-5KW -> GROW
                parts = comp.variant_sku.split("-")
                if len(parts) >= 2:
                    inverter_brand = parts[1]
                break
        
        bundle_sku = BundleSKUGenerator.generate(
            category=category,
            power_kwp=power_kwp,
            inverter_brand=inverter_brand
        )
        
        # Gerar handle
        handle = generate_handle(title)
        
        # Construir metadata
        metadata = BundleMetadata(
            is_bundle=True,
            bundle_category=category.value,
            pricing_strategy=pricing_config.strategy.value,
            bundle_components=[
                {
                    "variant_sku": c.variant_sku,
                    "quantity": c.quantity,
                    "inventory_item_id": c.inventory_item_id
                }
                for c in bundle_components
            ]
        )
        
        # Aplicar margin_policy ao metadata
        if pricing_config.margin_policy:
            metadata.margin_percent = pricing_config.margin_policy.margin_percent
            metadata.min_margin_brl = pricing_config.margin_policy.min_margin_brl
            metadata.max_margin_brl = pricing_config.margin_policy.max_margin_brl
        
        # Aplicar overrides customizados
        if metadata_overrides:
            for key, value in metadata_overrides.items():
                if hasattr(metadata, key):
                    setattr(metadata, key, value)
        
        # Construir inventory_items array para Medusa
        inventory_items = []
        for comp in bundle_components:
            if comp.inventory_item_id:
                inventory_items.append({
                    "inventory_item_id": comp.inventory_item_id,
                    "required_quantity": comp.quantity
                })
        
        # Construir prices array para Medusa
        prices = []
        if calculated_price:
            # Converter para centavos (Medusa usa centavos)
            amount_cents = int(
                (calculated_price.total_price_brl * 100).quantize(
                    Decimal('1'),
                    rounding=ROUND_HALF_UP
                )
            )
            
            price_entry = {
                "currency_code": pricing_config.currency_code,
                "amount": amount_cents
            }
            
            if pricing_config.price_list_id:
                price_entry["price_list_id"] = pricing_config.price_list_id
            
            prices.append(price_entry)
        
        # Construir payload
        payload = BundlePayload(
            title=title,
            handle=handle,
            description=description,
            variant_sku=bundle_sku,
            manage_inventory=False,  # Bundles nunca gerenciam estoque próprio
            inventory_items=inventory_items,
            prices=prices,
            metadata=asdict(metadata),
            availability=availability,
            calculated_price=calculated_price
        )
        
        return payload


# ============================================================================
# CLI
# ============================================================================

def load_config(config_path: Path) -> Dict:
    """Carrega configuração de bundle do arquivo JSON."""
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description="Bundle Composer - Cria kits como bundles virtuais"
    )
    parser.add_argument(
        "config",
        type=Path,
        help="Arquivo JSON com configuração do bundle"
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("bundle-payload.json"),
        help="Arquivo de saída para payload (default: bundle-payload.json)"
    )
    parser.add_argument(
        "--mock-inventory",
        action="store_true",
        help="Usar resolução mock de inventário (para testes)"
    )
    parser.add_argument(
        "--mock-prices",
        action="store_true",
        help="Usar resolução mock de preços (para testes)"
    )
    
    args = parser.parse_args()
    
    # Carregar configuração
    try:
        config = load_config(args.config)
    except Exception as e:
        print(f"❌ Erro ao carregar configuração: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Mock resolvers para testes
    def mock_inventory_resolver(variant_sku: str) -> Tuple[str, int]:
        """Mock: retorna inventory_item_id e stock simulados."""
        inv_id = f"inv_{variant_sku.lower().replace('-', '_')}"
        stock = 100  # Stock simulado
        return inv_id, stock
    
    def mock_price_resolver(variant_sku: str, price_list_id: Optional[str]) -> Decimal:
        """Mock: retorna preços simulados baseados na categoria."""
        if variant_sku.startswith("PNL-"):
            return Decimal("850.00")
        elif variant_sku.startswith("INV-"):
            return Decimal("4500.00")
        elif variant_sku.startswith("BAT-"):
            return Decimal("15000.00")
        elif variant_sku.startswith("EST-"):
            return Decimal("1200.00")
        else:
            return Decimal("500.00")
    
    # Configurar resolvers
    inventory_resolver = mock_inventory_resolver if args.mock_inventory else None
    price_resolver = mock_price_resolver if args.mock_prices else None
    
    # Criar compositor
    composer = BundleComposer(
        inventory_resolver=inventory_resolver,
        price_resolver=price_resolver
    )
    
    # Parsear configuração de precificação
    pricing_strategy = PricingStrategy(config["pricing"]["strategy"])
    
    margin_policy = None
    if "margin_policy" in config["pricing"]:
        mp = config["pricing"]["margin_policy"]
        margin_policy = MarginPolicy(
            margin_percent=Decimal(str(mp["margin_percent"])),
            min_margin_brl=Decimal(str(mp.get("min_margin_brl", 0))),
            max_margin_brl=Decimal(str(mp.get("max_margin_brl", 999999)))
        )
    
    pricing_config = PricingConfig(
        strategy=pricing_strategy,
        margin_policy=margin_policy,
        fixed_price_brl=Decimal(str(config["pricing"].get("fixed_price_brl", 0))),
        price_list_id=config["pricing"].get("price_list_id")
    )
    
    # Compor bundle
    try:
        bundle_category = BundleCategory(config.get("category", "custom"))
        
        payload = composer.compose(
            title=config["title"],
            components=config["components"],
            pricing_config=pricing_config,
            category=bundle_category,
            description=config.get("description"),
            metadata_overrides=config.get("metadata", {}),
            resolve_inventory=args.mock_inventory,
            resolve_prices=args.mock_prices
        )
        
        # Serializar para JSON
        output_data = asdict(payload)
        
        # Converter Decimals para float para serialização
        def decimal_to_float(obj):
            if isinstance(obj, Decimal):
                return float(obj)
            elif isinstance(obj, dict):
                return {k: decimal_to_float(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [decimal_to_float(item) for item in obj]
            return obj
        
        output_data = decimal_to_float(output_data)
        
        # Salvar output
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Bundle composto com sucesso!")
        print(f"   SKU: {payload.variant_sku}")
        print(f"   Handle: {payload.handle}")
        
        if payload.calculated_price:
            print(f"   Preço: R$ {payload.calculated_price.total_price_brl:.2f}")
            print(f"   Margem: R$ {payload.calculated_price.margin_brl:.2f} ({payload.calculated_price.margin_percent:.1f}%)")
        
        if payload.availability:
            print(f"   Disponibilidade: {payload.availability.available_quantity} kits")
            print(f"   Componente limitante: {payload.availability.limiting_component}")
        
        print(f"\n📄 Payload salvo em: {args.output}")
        
    except Exception as e:
        print(f"❌ Erro ao compor bundle: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
