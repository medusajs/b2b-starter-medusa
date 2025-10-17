"""
SKU Governor - Sistema de Validação e Normalização de Schemas e SKUs
=====================================================================

Sistema autoritativo para validar, normalizar e gerar SKUs globais agnósticos
ao fornecedor para todos os componentes fotovoltaicos.

Padrão SKU Global: ^(PNL|INV|BAT|EST|CAB|CON)-[A-Z0-9]+(-[A-Z0-9]+)*$

Autor: YSH B2B Platform
Versão: 1.0.0
Data: 17 de Outubro de 2025
"""

import json
import re
import sys
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
import unicodedata


# ============================================================================
# ENUMS E CONSTANTES
# ============================================================================

class ProductCategory(Enum):
    """Categorias de produtos suportadas"""
    PANEL = "PNL"
    INVERTER = "INV"
    BATTERY = "BAT"
    STRUCTURE = "EST"
    CABLE = "CAB"
    CONNECTOR = "CON"
    STRINGBOX = "SBOX"
    EV_CHARGER = "EVC"
    KIT = "KIT"


class ValidationSeverity(Enum):
    """Níveis de severidade de erros"""
    ERROR = "ERROR"      # Bloqueia processamento
    WARNING = "WARNING"  # Permite processamento com alerta
    INFO = "INFO"        # Informativo


# Padrões de SKU por categoria
SKU_PATTERNS = {
    ProductCategory.PANEL: r"^PNL-[A-Z0-9]+-\d+W(-[A-Z0-9]+)?$",
    ProductCategory.INVERTER: r"^INV-[A-Z0-9]+-\d+K(W|VA)?(-[A-Z0-9]+)?$",
    ProductCategory.BATTERY: r"^BAT-[A-Z0-9]+-\d+(KWH|AH)(-\d+V)?(-[A-Z0-9]+)?$",
    ProductCategory.STRUCTURE: r"^EST-[A-Z0-9]+-\d+P(-[A-Z0-9]+)?$",
    ProductCategory.CABLE: r"^CAB-\d+MM(2)?-[A-Z0-9]+(-\d+M)?$",
    ProductCategory.CONNECTOR: r"^CON-[A-Z0-9]+(-[A-Z0-9]+)?$",
    ProductCategory.STRINGBOX: r"^SBOX-\d+E-\d+A(-\d+V)?$",
    ProductCategory.EV_CHARGER: r"^EVC-[A-Z0-9]+-\d+KW(-[A-Z0-9]+)?$",
    ProductCategory.KIT: r"^KIT-\d+\.?\d*KWP(-[A-Z0-9]+)?$",
}

# Campos obrigatórios por categoria
REQUIRED_FIELDS = {
    ProductCategory.PANEL: [
        "manufacturer", "model", "power_w", "technology", 
        "efficiency_percent", "vmp_v", "imp_a", "voc_v", "isc_a"
    ],
    ProductCategory.INVERTER: [
        "manufacturer", "model", "power_kw", "type",
        "max_efficiency_percent", "input_voltage_range_v",
        "output_voltage_v", "mppt_quantity"
    ],
    ProductCategory.BATTERY: [
        "manufacturer", "model", "capacity_kwh", "voltage_v",
        "technology", "dod_percent", "cycle_life", "chemistry"
    ],
    ProductCategory.STRUCTURE: [
        "manufacturer", "model", "roof_type", "material",
        "panel_capacity", "orientation"
    ],
    ProductCategory.CABLE: [
        "type", "section_mm2", "color", "temperature_rating_c",
        "voltage_rating_v"
    ],
    ProductCategory.CONNECTOR: [
        "type", "manufacturer", "current_rating_a", "voltage_rating_v",
        "protection_degree"
    ],
}

# Unidades normalizadas
UNIT_NORMALIZATION = {
    # Potência
    "W": "Wp", "w": "Wp", "watts": "Wp", "watt": "Wp",
    "KW": "kW", "kw": "kW", "kilowatt": "kW", "kilowatts": "kW",
    "kWp": "kWp", "kwp": "kWp", "KWp": "kWp",
    
    # Capacidade
    "Ah": "Ah", "AH": "Ah", "ah": "Ah", "ampere-hour": "Ah",
    "kWh": "kWh", "KWH": "kWh", "kwh": "kWh", "kilowatt-hour": "kWh",
    
    # Voltagem
    "V": "V", "v": "V", "volt": "V", "volts": "V",
    "Vdc": "Vdc", "VDC": "Vdc", "vdc": "Vdc",
    "Vac": "Vac", "VAC": "Vac", "vac": "Vac",
    
    # Corrente
    "A": "A", "a": "A", "amp": "A", "amps": "A", "ampere": "A",
    
    # Área/Seção
    "mm²": "mm2", "mm2": "mm2", "MM2": "mm2", "MM²": "mm2",
    
    # Temperatura
    "°C": "C", "C": "C", "celsius": "C",
}

# Tecnologias normalizadas
TECH_NORMALIZATION = {
    # Painéis
    "monocristalino": "Mono PERC",
    "mono": "Mono PERC",
    "mono perc": "Mono PERC",
    "monocrystalline perc": "Mono PERC",
    "n-type": "N-Type TOPCon",
    "topcon": "N-Type TOPCon",
    "n-type topcon": "N-Type TOPCon",
    "bifacial": "Bifacial",
    "half-cell": "Half-Cell",
    "half cell": "Half-Cell",
    
    # Baterias
    "lithium": "Lítio LFP",
    "lifepo4": "Lítio LFP",
    "lfp": "Lítio LFP",
    "li-ion": "Lítio NMC",
    "nmc": "Lítio NMC",
    "lead-acid": "Chumbo-Ácido",
    "gel": "Gel VRLA",
    "agm": "AGM VRLA",
}


# ============================================================================
# DATACLASSES
# ============================================================================

@dataclass
class ValidationIssue:
    """Representa um problema de validação"""
    severity: ValidationSeverity
    category: str
    field: str
    message: str
    value: Any = None
    line_number: Optional[int] = None
    distributor_sku: Optional[str] = None


@dataclass
class NormalizedProduct:
    """Produto normalizado pronto para Medusa"""
    # Campos principais
    title: str
    handle: str
    category: ProductCategory
    
    # SKUs
    global_sku: str
    distributor_sku: str
    distributor_name: str
    
    # Especificações técnicas
    manufacturer: str
    model: str
    technical_specs: Dict[str, Any]
    
    # Metadados
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    # Preço
    price_brl: Optional[float] = None
    
    # Imagens
    image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    
    # Certificações
    certifications: List[str] = field(default_factory=list)
    
    # Status
    status: str = "published"
    
    # Validação
    validation_issues: List[ValidationIssue] = field(default_factory=list)


@dataclass
class GovernorReport:
    """Relatório completo de processamento"""
    total_processed: int = 0
    total_valid: int = 0
    total_invalid: int = 0
    total_warnings: int = 0
    
    products_by_category: Dict[str, int] = field(default_factory=dict)
    skus_generated: List[str] = field(default_factory=list)
    validation_issues: List[ValidationIssue] = field(default_factory=list)
    
    processing_time_seconds: float = 0.0


# ============================================================================
# FUNÇÕES UTILITÁRIAS
# ============================================================================

def normalize_string(text: str) -> str:
    """Normaliza string removendo acentos e caracteres especiais"""
    if not text:
        return ""
    
    # Remove acentos
    nfkd = unicodedata.normalize('NFKD', text)
    text_without_accents = ''.join([c for c in nfkd if not unicodedata.combining(c)])
    
    # Converte para uppercase e remove caracteres especiais
    normalized = re.sub(r'[^A-Z0-9\s-]', '', text_without_accents.upper())
    
    # Remove espaços múltiplos
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    return normalized


def generate_handle(title: str) -> str:
    """Gera handle URL-friendly a partir do título"""
    handle = title.lower()
    
    # Remove acentos
    nfkd = unicodedata.normalize('NFKD', handle)
    handle = ''.join([c for c in nfkd if not unicodedata.combining(c)])
    
    # Substitui caracteres especiais por hífens
    handle = re.sub(r'[^a-z0-9]+', '-', handle)
    
    # Remove hífens duplicados e das extremidades
    handle = re.sub(r'-+', '-', handle).strip('-')
    
    # Limita tamanho
    return handle[:100]


def normalize_unit(value: Any, unit: str) -> Tuple[float, str]:
    """Normaliza valor e unidade"""
    try:
        # Converte valor para float
        if isinstance(value, str):
            # Remove caracteres não numéricos exceto . e ,
            clean_value = re.sub(r'[^\d.,]', '', value)
            clean_value = clean_value.replace(',', '.')
            numeric_value = float(clean_value)
        else:
            numeric_value = float(value)
        
        # Normaliza unidade
        normalized_unit = UNIT_NORMALIZATION.get(unit, unit)
        
        return numeric_value, normalized_unit
    
    except (ValueError, TypeError) as e:
        raise ValueError(f"Não foi possível normalizar valor '{value}' com unidade '{unit}': {e}")


def normalize_technology(tech: str) -> str:
    """Normaliza nome de tecnologia"""
    tech_lower = tech.lower().strip()
    return TECH_NORMALIZATION.get(tech_lower, tech.title())


# ============================================================================
# GERADORES DE SKU POR CATEGORIA
# ============================================================================

class SKUGenerator:
    """Classe responsável por gerar SKUs globais agnósticos"""
    
    @staticmethod
    def generate_panel_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para painéis solares"""
        manufacturer = normalize_string(data.get("manufacturer", "UNKN"))[:4]
        model = normalize_string(data.get("model", "MODEL"))[:10]
        power_w = int(data.get("power_w", 0))
        
        # Adiciona sufixo de tecnologia se disponível
        tech = data.get("technology", "")
        tech_suffix = ""
        if "bifacial" in tech.lower():
            tech_suffix = "-BF"
        elif "half" in tech.lower():
            tech_suffix = "-HC"
        elif "topcon" in tech.lower():
            tech_suffix = "-TC"
        
        return f"PNL-{manufacturer}-{model}-{power_w}W{tech_suffix}"
    
    @staticmethod
    def generate_inverter_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para inversores"""
        manufacturer = normalize_string(data.get("manufacturer", "UNKN"))[:4]
        model = normalize_string(data.get("model", "MODEL"))[:10]
        power_kw = int(float(data.get("power_kw", 0)))
        
        # Adiciona sufixo de tipo
        inv_type = data.get("type", "").lower()
        type_suffix = ""
        if "hybrid" in inv_type or "híbrido" in inv_type:
            type_suffix = "-HYB"
        elif "off" in inv_type:
            type_suffix = "-OFF"
        elif "micro" in inv_type:
            type_suffix = "-MICRO"
        
        return f"INV-{manufacturer}-{model}-{power_kw}KW{type_suffix}"
    
    @staticmethod
    def generate_battery_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para baterias"""
        manufacturer = normalize_string(data.get("manufacturer", "UNKN"))[:4]
        model = normalize_string(data.get("model", "MODEL"))[:10]
        capacity_kwh = int(float(data.get("capacity_kwh", 0)))
        voltage_v = int(float(data.get("voltage_v", 0)))
        
        # Sufixo de tecnologia
        tech = data.get("technology", "").upper()
        tech_suffix = ""
        if "LFP" in tech or "LIFEPO4" in tech:
            tech_suffix = "-LFP"
        elif "NMC" in tech:
            tech_suffix = "-NMC"
        elif "GEL" in tech:
            tech_suffix = "-GEL"
        elif "AGM" in tech:
            tech_suffix = "-AGM"
        
        return f"BAT-{manufacturer}-{model}-{capacity_kwh}KWH-{voltage_v}V{tech_suffix}"
    
    @staticmethod
    def generate_structure_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para estruturas"""
        manufacturer = normalize_string(data.get("manufacturer", "UNKN"))[:4]
        roof_type = normalize_string(data.get("roof_type", "STD"))[:4]
        panel_capacity = int(data.get("panel_capacity", 0))
        
        # Orientação
        orientation = data.get("orientation", "").lower()
        orient_suffix = "-V" if "vertical" in orientation or "retrato" in orientation else "-H"
        
        return f"EST-{manufacturer}-{roof_type}-{panel_capacity}P{orient_suffix}"
    
    @staticmethod
    def generate_cable_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para cabos"""
        section_mm2 = int(float(data.get("section_mm2", 0)))
        color = normalize_string(data.get("color", "BLK"))[:4]
        cable_type = data.get("type", "").upper()
        
        type_prefix = "CC" if "DC" in cable_type or "CC" in cable_type else "CA"
        
        return f"CAB-{type_prefix}-{section_mm2}MM2-{color}"
    
    @staticmethod
    def generate_connector_sku(data: Dict[str, Any]) -> str:
        """Gera SKU para conectores"""
        manufacturer = normalize_string(data.get("manufacturer", "UNKN"))[:4]
        conn_type = normalize_string(data.get("type", "MC4"))[:6]
        current_a = int(float(data.get("current_rating_a", 0)))
        
        return f"CON-{manufacturer}-{conn_type}-{current_a}A"
    
    @staticmethod
    def generate_sku(category: ProductCategory, data: Dict[str, Any]) -> str:
        """Gera SKU baseado na categoria"""
        generators = {
            ProductCategory.PANEL: SKUGenerator.generate_panel_sku,
            ProductCategory.INVERTER: SKUGenerator.generate_inverter_sku,
            ProductCategory.BATTERY: SKUGenerator.generate_battery_sku,
            ProductCategory.STRUCTURE: SKUGenerator.generate_structure_sku,
            ProductCategory.CABLE: SKUGenerator.generate_cable_sku,
            ProductCategory.CONNECTOR: SKUGenerator.generate_connector_sku,
        }
        
        generator = generators.get(category)
        if not generator:
            raise ValueError(f"Gerador de SKU não implementado para categoria {category}")
        
        sku = generator(data)
        
        # Valida contra o padrão
        pattern = SKU_PATTERNS.get(category)
        if pattern and not re.match(pattern, sku):
            raise ValueError(f"SKU gerado '{sku}' não corresponde ao padrão '{pattern}'")
        
        return sku


# ============================================================================
# VALIDADORES POR CATEGORIA
# ============================================================================

class ProductValidator:
    """Classe responsável por validar produtos por categoria"""
    
    def __init__(self, category: ProductCategory):
        self.category = category
        self.issues: List[ValidationIssue] = []
    
    def validate(self, data: Dict[str, Any], distributor_sku: str) -> List[ValidationIssue]:
        """Valida produto e retorna lista de problemas"""
        self.issues = []
        
        # Validação de campos obrigatórios
        self._validate_required_fields(data, distributor_sku)
        
        # Validação específica por categoria
        if self.category == ProductCategory.PANEL:
            self._validate_panel(data, distributor_sku)
        elif self.category == ProductCategory.INVERTER:
            self._validate_inverter(data, distributor_sku)
        elif self.category == ProductCategory.BATTERY:
            self._validate_battery(data, distributor_sku)
        elif self.category == ProductCategory.STRUCTURE:
            self._validate_structure(data, distributor_sku)
        
        return self.issues
    
    def _validate_required_fields(self, data: Dict[str, Any], sku: str):
        """Valida presença de campos obrigatórios"""
        required = REQUIRED_FIELDS.get(self.category, [])
        
        for field in required:
            if field not in data or data[field] is None or data[field] == "":
                self.issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    category=self.category.value,
                    field=field,
                    message=f"Campo obrigatório ausente ou vazio",
                    distributor_sku=sku
                ))
    
    def _validate_panel(self, data: Dict[str, Any], sku: str):
        """Validação específica para painéis"""
        # Valida eficiência
        efficiency = data.get("efficiency_percent")
        if efficiency:
            try:
                eff_value = float(efficiency)
                if eff_value < 10 or eff_value > 25:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="PNL",
                        field="efficiency_percent",
                        message=f"Eficiência fora do range típico (10-25%): {eff_value}%",
                        value=eff_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                self.issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    category="PNL",
                    field="efficiency_percent",
                    message=f"Eficiência inválida: {efficiency}",
                    value=efficiency,
                    distributor_sku=sku
                ))
        
        # Valida potência
        power_w = data.get("power_w")
        if power_w:
            try:
                power_value = float(power_w)
                if power_value < 100 or power_value > 800:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="PNL",
                        field="power_w",
                        message=f"Potência fora do range típico (100-800W): {power_value}W",
                        value=power_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass
    
    def _validate_inverter(self, data: Dict[str, Any], sku: str):
        """Validação específica para inversores"""
        # Valida eficiência
        efficiency = data.get("max_efficiency_percent")
        if efficiency:
            try:
                eff_value = float(efficiency)
                if eff_value < 90 or eff_value > 99.5:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="INV",
                        field="max_efficiency_percent",
                        message=f"Eficiência fora do range típico (90-99.5%): {eff_value}%",
                        value=eff_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass
        
        # Valida MPPT
        mppt = data.get("mppt_quantity")
        if mppt:
            try:
                mppt_value = int(mppt)
                if mppt_value < 1 or mppt_value > 12:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="INV",
                        field="mppt_quantity",
                        message=f"Quantidade de MPPT fora do range típico (1-12): {mppt_value}",
                        value=mppt_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass
    
    def _validate_battery(self, data: Dict[str, Any], sku: str):
        """Validação específica para baterias"""
        # Valida DoD
        dod = data.get("dod_percent")
        if dod:
            try:
                dod_value = float(dod)
                if dod_value < 30 or dod_value > 100:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="BAT",
                        field="dod_percent",
                        message=f"DoD fora do range típico (30-100%): {dod_value}%",
                        value=dod_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass
        
        # Valida ciclos de vida
        cycles = data.get("cycle_life")
        if cycles:
            try:
                cycles_value = int(cycles)
                if cycles_value < 500 or cycles_value > 10000:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="BAT",
                        field="cycle_life",
                        message=f"Ciclos de vida fora do range típico (500-10000): {cycles_value}",
                        value=cycles_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass
    
    def _validate_structure(self, data: Dict[str, Any], sku: str):
        """Validação específica para estruturas"""
        # Valida capacidade de painéis
        capacity = data.get("panel_capacity")
        if capacity:
            try:
                cap_value = int(capacity)
                if cap_value < 1 or cap_value > 100:
                    self.issues.append(ValidationIssue(
                        severity=ValidationSeverity.WARNING,
                        category="EST",
                        field="panel_capacity",
                        message=f"Capacidade de painéis fora do range típico (1-100): {cap_value}",
                        value=cap_value,
                        distributor_sku=sku
                    ))
            except (ValueError, TypeError):
                pass


# ============================================================================
# GOVERNADOR PRINCIPAL
# ============================================================================

class SKUGovernor:
    """Sistema principal de governança de SKUs e schemas"""
    
    def __init__(self, distributor_name: str):
        self.distributor_name = distributor_name
        self.report = GovernorReport()
        self.processed_skus: Dict[str, NormalizedProduct] = {}
    
    def process_products(
        self,
        products: List[Dict[str, Any]],
        category: ProductCategory
    ) -> Tuple[List[NormalizedProduct], GovernorReport]:
        """Processa lista de produtos brutos"""
        import time
        start_time = time.time()
        
        normalized_products = []
        
        for idx, product_data in enumerate(products, 1):
            try:
                normalized = self._process_single_product(
                    product_data,
                    category,
                    line_number=idx
                )
                
                if normalized:
                    normalized_products.append(normalized)
                    self.processed_skus[normalized.global_sku] = normalized
                    self.report.total_valid += 1
                    
                    # Conta por categoria
                    cat_name = category.value
                    self.report.products_by_category[cat_name] = \
                        self.report.products_by_category.get(cat_name, 0) + 1
                    
                    self.report.skus_generated.append(normalized.global_sku)
                else:
                    self.report.total_invalid += 1
                
            except Exception as e:
                self.report.total_invalid += 1
                self.report.validation_issues.append(ValidationIssue(
                    severity=ValidationSeverity.ERROR,
                    category=category.value,
                    field="general",
                    message=f"Erro ao processar produto: {str(e)}",
                    line_number=idx
                ))
            
            self.report.total_processed += 1
        
        self.report.processing_time_seconds = time.time() - start_time
        
        # Conta warnings
        self.report.total_warnings = sum(
            1 for issue in self.report.validation_issues 
            if issue.severity == ValidationSeverity.WARNING
        )
        
        return normalized_products, self.report
    
    def _process_single_product(
        self,
        data: Dict[str, Any],
        category: ProductCategory,
        line_number: int
    ) -> Optional[NormalizedProduct]:
        """Processa um único produto"""
        
        # SKU do distribuidor
        distributor_sku = data.get("sku", f"DIST-{line_number}")
        
        # Valida produto
        validator = ProductValidator(category)
        issues = validator.validate(data, distributor_sku)
        
        # Se houver erros críticos, não processa
        has_errors = any(issue.severity == ValidationSeverity.ERROR for issue in issues)
        if has_errors:
            self.report.validation_issues.extend(issues)
            return None
        
        # Normaliza dados técnicos
        try:
            normalized_specs = self._normalize_technical_specs(data, category)
        except Exception as e:
            self.report.validation_issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category=category.value,
                field="technical_specs",
                message=f"Erro ao normalizar especificações: {str(e)}",
                line_number=line_number,
                distributor_sku=distributor_sku
            ))
            return None
        
        # Gera SKU global
        try:
            global_sku = SKUGenerator.generate_sku(category, normalized_specs)
        except Exception as e:
            self.report.validation_issues.append(ValidationIssue(
                severity=ValidationSeverity.ERROR,
                category=category.value,
                field="sku_generation",
                message=f"Erro ao gerar SKU: {str(e)}",
                line_number=line_number,
                distributor_sku=distributor_sku
            ))
            return None
        
        # Monta título
        title = self._generate_title(normalized_specs, category)
        
        # Monta handle
        handle = generate_handle(title)
        
        # Monta produto normalizado
        normalized = NormalizedProduct(
            title=title,
            handle=handle,
            category=category,
            global_sku=global_sku,
            distributor_sku=distributor_sku,
            distributor_name=self.distributor_name,
            manufacturer=normalized_specs.get("manufacturer", "Unknown"),
            model=normalized_specs.get("model", "Unknown"),
            technical_specs=normalized_specs,
            metadata={
                "variant": {
                    "manufacturer_sku": data.get("manufacturer_sku", ""),
                    "datasheets": data.get("datasheets", []),
                    "certifications": data.get("certifications", []),
                    "efficiency": normalized_specs.get("efficiency_percent"),
                    "temperature_coeff": normalized_specs.get("temp_coeff_pmax_percent"),
                    "warranty_years": data.get("warranty_years", 0)
                }
            },
            price_brl=data.get("price_brl"),
            image_url=data.get("image_url"),
            thumbnail_url=data.get("thumbnail_url"),
            certifications=data.get("certifications", []),
            validation_issues=issues
        )
        
        # Adiciona warnings ao relatório
        if issues:
            self.report.validation_issues.extend(issues)
        
        return normalized
    
    def _normalize_technical_specs(
        self,
        data: Dict[str, Any],
        category: ProductCategory
    ) -> Dict[str, Any]:
        """Normaliza especificações técnicas"""
        specs = {}
        
        # Copia campos básicos
        for field in ["manufacturer", "model"]:
            if field in data:
                specs[field] = data[field]
        
        # Normalização específica por categoria
        if category == ProductCategory.PANEL:
            specs = self._normalize_panel_specs(data)
        elif category == ProductCategory.INVERTER:
            specs = self._normalize_inverter_specs(data)
        elif category == ProductCategory.BATTERY:
            specs = self._normalize_battery_specs(data)
        elif category == ProductCategory.STRUCTURE:
            specs = self._normalize_structure_specs(data)
        elif category == ProductCategory.CABLE:
            specs = self._normalize_cable_specs(data)
        elif category == ProductCategory.CONNECTOR:
            specs = self._normalize_connector_specs(data)
        
        return specs
    
    def _normalize_panel_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de painéis"""
        specs = {
            "manufacturer": data.get("manufacturer", ""),
            "model": data.get("model", ""),
        }
        
        # Potência
        if "power_w" in data:
            specs["power_w"], _ = normalize_unit(data["power_w"], "W")
        
        # Eficiência
        if "efficiency_percent" in data:
            specs["efficiency_percent"] = float(data["efficiency_percent"])
        
        # Tecnologia
        if "technology" in data:
            specs["technology"] = normalize_technology(data["technology"])
        
        # Especificações elétricas
        for field in ["vmp_v", "imp_a", "voc_v", "isc_a"]:
            if field in data:
                specs[field] = float(data[field])
        
        # Coeficientes de temperatura
        for field in ["temp_coeff_pmax_percent", "temp_coeff_voc_percent", "temp_coeff_isc_percent"]:
            if field in data:
                specs[field] = float(data[field])
        
        # Dimensões
        for field in ["length_mm", "width_mm", "height_mm", "weight_kg"]:
            if field in data:
                specs[field] = float(data[field])
        
        return specs
    
    def _normalize_inverter_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de inversores"""
        specs = {
            "manufacturer": data.get("manufacturer", ""),
            "model": data.get("model", ""),
        }
        
        # Potência
        if "power_kw" in data:
            specs["power_kw"], _ = normalize_unit(data["power_kw"], "kW")
        
        # Tipo
        if "type" in data:
            specs["type"] = data["type"]
        
        # Eficiência
        if "max_efficiency_percent" in data:
            specs["max_efficiency_percent"] = float(data["max_efficiency_percent"])
        
        # Range de voltagem
        if "input_voltage_range_v" in data:
            specs["input_voltage_range_v"] = data["input_voltage_range_v"]
        
        # Voltagem de saída
        if "output_voltage_v" in data:
            specs["output_voltage_v"] = float(data["output_voltage_v"])
        
        # MPPT
        if "mppt_quantity" in data:
            specs["mppt_quantity"] = int(data["mppt_quantity"])
        
        # Corrente máxima
        if "max_input_current_a" in data:
            specs["max_input_current_a"] = float(data["max_input_current_a"])
        
        return specs
    
    def _normalize_battery_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de baterias"""
        specs = {
            "manufacturer": data.get("manufacturer", ""),
            "model": data.get("model", ""),
        }
        
        # Capacidade
        if "capacity_kwh" in data:
            specs["capacity_kwh"], _ = normalize_unit(data["capacity_kwh"], "kWh")
        
        # Voltagem
        if "voltage_v" in data:
            specs["voltage_v"], _ = normalize_unit(data["voltage_v"], "V")
        
        # Tecnologia
        if "technology" in data:
            specs["technology"] = normalize_technology(data["technology"])
        
        # Química
        if "chemistry" in data:
            specs["chemistry"] = data["chemistry"]
        
        # DoD
        if "dod_percent" in data:
            specs["dod_percent"] = float(data["dod_percent"])
        
        # Ciclos de vida
        if "cycle_life" in data:
            specs["cycle_life"] = int(data["cycle_life"])
        
        # Eficiência round-trip
        if "round_trip_efficiency_percent" in data:
            specs["round_trip_efficiency_percent"] = float(data["round_trip_efficiency_percent"])
        
        return specs
    
    def _normalize_structure_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de estruturas"""
        specs = {
            "manufacturer": data.get("manufacturer", ""),
            "model": data.get("model", ""),
            "roof_type": data.get("roof_type", ""),
            "material": data.get("material", ""),
        }
        
        # Capacidade de painéis
        if "panel_capacity" in data:
            specs["panel_capacity"] = int(data["panel_capacity"])
        
        # Orientação
        if "orientation" in data:
            specs["orientation"] = data["orientation"]
        
        return specs
    
    def _normalize_cable_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de cabos"""
        specs = {}
        
        # Seção
        if "section_mm2" in data:
            specs["section_mm2"], _ = normalize_unit(data["section_mm2"], "mm2")
        
        # Cor
        if "color" in data:
            specs["color"] = data["color"]
        
        # Tipo
        if "type" in data:
            specs["type"] = data["type"]
        
        # Rating de temperatura
        if "temperature_rating_c" in data:
            specs["temperature_rating_c"] = int(data["temperature_rating_c"])
        
        # Rating de voltagem
        if "voltage_rating_v" in data:
            specs["voltage_rating_v"], _ = normalize_unit(data["voltage_rating_v"], "V")
        
        return specs
    
    def _normalize_connector_specs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normaliza especificações de conectores"""
        specs = {
            "manufacturer": data.get("manufacturer", ""),
            "type": data.get("type", ""),
        }
        
        # Rating de corrente
        if "current_rating_a" in data:
            specs["current_rating_a"], _ = normalize_unit(data["current_rating_a"], "A")
        
        # Rating de voltagem
        if "voltage_rating_v" in data:
            specs["voltage_rating_v"], _ = normalize_unit(data["voltage_rating_v"], "V")
        
        # Grau de proteção
        if "protection_degree" in data:
            specs["protection_degree"] = data["protection_degree"]
        
        return specs
    
    def _generate_title(self, specs: Dict[str, Any], category: ProductCategory) -> str:
        """Gera título descritivo para o produto"""
        manufacturer = specs.get("manufacturer", "")
        model = specs.get("model", "")
        
        if category == ProductCategory.PANEL:
            power = specs.get("power_w", "")
            tech = specs.get("technology", "")
            return f"Painel Solar {manufacturer} {model} {power}W {tech}".strip()
        
        elif category == ProductCategory.INVERTER:
            power = specs.get("power_kw", "")
            inv_type = specs.get("type", "")
            return f"Inversor {inv_type} {manufacturer} {model} {power}kW".strip()
        
        elif category == ProductCategory.BATTERY:
            capacity = specs.get("capacity_kwh", "")
            voltage = specs.get("voltage_v", "")
            tech = specs.get("technology", "")
            return f"Bateria {tech} {manufacturer} {model} {capacity}kWh {voltage}V".strip()
        
        elif category == ProductCategory.STRUCTURE:
            roof_type = specs.get("roof_type", "")
            capacity = specs.get("panel_capacity", "")
            return f"Estrutura {roof_type} {manufacturer} {capacity} Painéis".strip()
        
        elif category == ProductCategory.CABLE:
            section = specs.get("section_mm2", "")
            color = specs.get("color", "")
            cable_type = specs.get("type", "")
            return f"Cabo {cable_type} {section}mm² {color}".strip()
        
        elif category == ProductCategory.CONNECTOR:
            conn_type = specs.get("type", "")
            current = specs.get("current_rating_a", "")
            return f"Conector {conn_type} {manufacturer} {current}A".strip()
        
        return f"{manufacturer} {model}".strip()
    
    def export_normalized_json(self, products: List[NormalizedProduct], output_path: Path):
        """Exporta produtos normalizados para JSON"""
        output_data = [
            {
                **asdict(product),
                "validation_issues": [
                    {
                        "severity": issue.severity.value,
                        "category": issue.category,
                        "field": issue.field,
                        "message": issue.message,
                        "value": issue.value
                    }
                    for issue in product.validation_issues
                ]
            }
            for product in products
        ]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    def export_report(self, output_path: Path):
        """Exporta relatório de validação"""
        report_data = {
            "summary": {
                "total_processed": self.report.total_processed,
                "total_valid": self.report.total_valid,
                "total_invalid": self.report.total_invalid,
                "total_warnings": self.report.total_warnings,
                "processing_time_seconds": self.report.processing_time_seconds,
            },
            "products_by_category": self.report.products_by_category,
            "skus_generated_count": len(self.report.skus_generated),
            "validation_issues": [
                {
                    "severity": issue.severity.value,
                    "category": issue.category,
                    "field": issue.field,
                    "message": issue.message,
                    "value": issue.value,
                    "line_number": issue.line_number,
                    "distributor_sku": issue.distributor_sku
                }
                for issue in self.report.validation_issues
            ]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)


# ============================================================================
# INTERFACE DE LINHA DE COMANDO
# ============================================================================

def main():
    """Função principal de linha de comando"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="SKU Governor - Validação e normalização de schemas e SKUs"
    )
    parser.add_argument(
        "input_file",
        type=str,
        help="Arquivo JSON de entrada com produtos brutos"
    )
    parser.add_argument(
        "--category",
        type=str,
        required=True,
        choices=["panel", "inverter", "battery", "structure", "cable", "connector"],
        help="Categoria dos produtos"
    )
    parser.add_argument(
        "--distributor",
        type=str,
        required=True,
        help="Nome do distribuidor (ex: neosolar, fortlev, fotus)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=".",
        help="Diretório para salvar outputs (padrão: diretório atual)"
    )
    
    args = parser.parse_args()
    
    # Mapeia categoria string para enum
    category_map = {
        "panel": ProductCategory.PANEL,
        "inverter": ProductCategory.INVERTER,
        "battery": ProductCategory.BATTERY,
        "structure": ProductCategory.STRUCTURE,
        "cable": ProductCategory.CABLE,
        "connector": ProductCategory.CONNECTOR,
    }
    
    category = category_map[args.category]
    
    # Carrega arquivo de entrada
    input_path = Path(args.input_file)
    if not input_path.exists():
        print(f"❌ Erro: Arquivo '{input_path}' não encontrado")
        sys.exit(1)
    
    with open(input_path, 'r', encoding='utf-8') as f:
        raw_products = json.load(f)
    
    print(f"📦 Carregados {len(raw_products)} produtos de '{input_path}'")
    
    # Processa produtos
    governor = SKUGovernor(distributor_name=args.distributor)
    normalized_products, report = governor.process_products(raw_products, category)
    
    # Salva outputs
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Nome base dos arquivos
    base_name = f"{args.distributor}-{args.category}-normalized"
    
    # Exporta JSON normalizado
    json_output = output_dir / f"{base_name}.json"
    governor.export_normalized_json(normalized_products, json_output)
    print(f"✅ JSON normalizado salvo em '{json_output}'")
    
    # Exporta relatório
    report_output = output_dir / f"{base_name}-report.json"
    governor.export_report(report_output)
    print(f"📊 Relatório salvo em '{report_output}'")
    
    # Exibe resumo
    print("\n" + "="*80)
    print("📈 RESUMO DO PROCESSAMENTO")
    print("="*80)
    print(f"Total processado: {report.total_processed}")
    print(f"Válidos: {report.total_valid} ({report.total_valid/report.total_processed*100:.1f}%)")
    print(f"Inválidos: {report.total_invalid}")
    print(f"Warnings: {report.total_warnings}")
    print(f"Tempo: {report.processing_time_seconds:.2f}s")
    print("\nProdutos por categoria:")
    for cat, count in report.products_by_category.items():
        print(f"  {cat}: {count}")
    
    # Exibe erros críticos
    errors = [i for i in report.validation_issues if i.severity == ValidationSeverity.ERROR]
    if errors:
        print(f"\n❌ {len(errors)} ERROS CRÍTICOS:")
        for error in errors[:10]:  # Mostra apenas os primeiros 10
            print(f"  Linha {error.line_number or '?'} | {error.category} | "
                  f"{error.field}: {error.message}")
        if len(errors) > 10:
            print(f"  ... e mais {len(errors) - 10} erros (veja o relatório completo)")
    
    # Retorna código de saída apropriado
    sys.exit(0 if report.total_invalid == 0 else 1)


if __name__ == "__main__":
    main()
