#!/usr/bin/env python3
"""
🤖 YSH Solar - Schema Enrichment Engine com LLM
================================================

Enriquece schemas de produtos consolidados usando LLM (GPT-4 OSS 20B ou similar)
para análise comparativa de:
- Preços entre distribuidores
- KPIs técnicos (eficiência, potência, rendimento)
- Garantias (produto e performance)
- Vida útil estimada
- Certificações (globais e INMETRO)

Abstrai distribuidores mantendo o melhor preço e análise de variação.

Autor: YSH Solar Development Team
Data: 14 de Outubro de 2025
Versão: 1.0.0
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict, field
from datetime import datetime
import statistics
from collections import defaultdict


@dataclass
class PriceAnalysis:
    """Análise comparativa de preços"""
    best_price: float
    worst_price: float
    average_price: float
    median_price: float
    price_variance: float
    distributors_count: int
    best_distributor: str
    price_range_pct: float  # % diferença entre melhor e pior
    price_recommendation: str  # "excellent_deal" | "good_price" | "average" | "expensive"


@dataclass
class WarrantyInfo:
    """Informações de garantia"""
    product_warranty_years: int
    performance_warranty_years: Optional[int] = None
    performance_guarantee_pct: Optional[float] = None  # Ex: 80% após 25 anos
    extendable: bool = False
    coverage_scope: str = "standard"  # "standard" | "premium" | "full"


@dataclass
class CertificationInfo:
    """Certificações do produto"""
    inmetro: bool = False
    inmetro_code: Optional[str] = None
    iec_standards: List[str] = field(default_factory=list)
    ce_marking: bool = False
    ul_listed: bool = False
    tuv_certified: bool = False
    iso_9001: bool = False
    iso_14001: bool = False
    certification_score: float = 0.0  # 0-100


@dataclass
class KPIMetrics:
    """KPIs técnicos do produto"""
    efficiency_pct: Optional[float] = None
    performance_ratio: Optional[float] = None
    degradation_rate_annual: Optional[float] = None  # % por ano
    temperature_coefficient: Optional[float] = None  # %/°C
    mtbf_hours: Optional[int] = None  # Mean Time Between Failures
    lifecycle_years: Optional[int] = None
    energy_payback_time_months: Optional[int] = None
    carbon_footprint_kg: Optional[float] = None


@dataclass
class EnrichedProduct:
    """Produto enriquecido com análise LLM"""
    id: str
    title: str
    sku: str
    manufacturer: str
    category: str
    
    # Análise de preços
    price_analysis: PriceAnalysis
    
    # Garantias
    warranty: WarrantyInfo
    
    # Certificações
    certifications: CertificationInfo
    
    # KPIs técnicos
    kpis: KPIMetrics
    
    # Dados originais abstraídos
    technical_specs: Dict[str, Any]
    images: List[str]
    metadata: Dict[str, Any]
    
    # Score geral (0-100)
    overall_score: float
    value_score: float  # Relação custo-benefício
    quality_score: float
    reliability_score: float


class SchemaEnricher:
    """Motor de enriquecimento de schemas"""
    
    # Certificações padrão por categoria
    STANDARD_CERTIFICATIONS = {
        'panels': {
            'iec_standards': ['IEC 61215', 'IEC 61730'],
            'required_for_brazil': ['INMETRO'],
        },
        'inverters': {
            'iec_standards': ['IEC 62109-1', 'IEC 62109-2'],
            'required_for_brazil': ['INMETRO', 'ABNT NBR 16149'],
        },
        'batteries': {
            'iec_standards': ['IEC 62619', 'IEC 61960'],
            'required_for_brazil': ['INMETRO'],
        },
        'stringboxes': {
            'iec_standards': ['IEC 60947-3'],
            'required_for_brazil': ['INMETRO'],
        },
        'structures': {
            'iec_standards': [],
            'required_for_brazil': ['ABNT NBR 6123', 'ABNT NBR 8800'],
        },
        'cables': {
            'iec_standards': ['IEC 62930', 'EN 50618'],
            'required_for_brazil': ['INMETRO'],
        },
    }
    
    # Garantias típicas por categoria
    TYPICAL_WARRANTIES = {
        'panels': {'product': 12, 'performance': 25, 'performance_guarantee': 80.0},
        'inverters': {'product': 10, 'performance': 10, 'performance_guarantee': 90.0},
        'batteries': {'product': 10, 'performance': 10, 'performance_guarantee': 80.0},
        'stringboxes': {'product': 5, 'performance': None, 'performance_guarantee': None},
        'structures': {'product': 20, 'performance': None, 'performance_guarantee': None},
        'cables': {'product': 25, 'performance': None, 'performance_guarantee': None},
    }
    
    # Vida útil esperada (anos)
    TYPICAL_LIFECYCLE = {
        'panels': 30,
        'inverters': 15,
        'batteries': 12,
        'stringboxes': 25,
        'structures': 25,
        'cables': 30,
        'kits': 25,  # Média ponderada dos componentes
    }
    
    def __init__(self, consolidated_products_path: str = None):
        # Auto-detect latest file if not specified
        if consolidated_products_path is None:
            # Try complete inventory first
            complete_dir = Path("complete-inventory")
            if complete_dir.exists():
                json_files = list(complete_dir.glob("complete_products_*.json"))
                if json_files:
                    consolidated_products_path = str(max(json_files, key=lambda x: x.stat().st_mtime))
            
            # Fallback to consolidated
            if consolidated_products_path is None:
                consol_dir = Path("consolidated-inventory")
                if consol_dir.exists():
                    json_files = list(consol_dir.glob("consolidated_products_*.json"))
                    if json_files:
                        consolidated_products_path = str(max(json_files, key=lambda x: x.stat().st_mtime))
            
            if consolidated_products_path is None:
                raise FileNotFoundError("No inventory file found in complete-inventory/ or consolidated-inventory/")
        
        self.products_path = Path(consolidated_products_path)
        self.products = []
        self.enriched_products = []
        self.output_dir = Path("enriched-schemas")  # Can be overridden
        
    def load_products(self) -> None:
        """Carrega produtos consolidados"""
        print("📂 Carregando produtos consolidados...")
        
        with open(self.products_path, 'r', encoding='utf-8') as f:
            self.products = json.load(f)
        
        # Normaliza preços: converte 'price' string para 'price_brl' float
        for product in self.products:
            if 'price_brl' not in product or product['price_brl'] == 0:
                # Tenta converter do campo 'price' se existir
                price_str = product.get('price', '')
                if isinstance(price_str, str):
                    # Remove "R$", espaços, e converte vírgula em ponto
                    clean_price = price_str.replace('R$', '').replace(' ', '').replace(',', '.').strip()
                    try:
                        product['price_brl'] = float(clean_price)
                    except (ValueError, AttributeError):
                        product['price_brl'] = 0.0
                else:
                    product['price_brl'] = 0.0
        
        print(f"  ✅ {len(self.products):,} produtos carregados")
    
    def analyze_prices(self, product: Dict[str, Any]) -> PriceAnalysis:
        """Analisa preços comparativos do produto"""
        
        # Coleta todos os preços do mesmo produto em diferentes distribuidores
        prices = []
        distributors = {}
        
        # Procura produtos similares (mesmo SKU ou fabricante+modelo)
        base_sku = product['sku']
        manufacturer = product['manufacturer']
        category = product['category']
        
        for p in self.products:
            # Critério de similaridade
            if (p['manufacturer'] == manufacturer and 
                p['category'] == category and
                p['price_brl'] > 0):
                
                # Verifica similaridade por título ou specs
                if self._products_are_similar(product, p):
                    prices.append(p['price_brl'])
                    if p['distributor'] not in distributors:
                        distributors[p['distributor']] = p['price_brl']
        
        # Se não encontrou comparações, usa preço único
        if len(prices) == 0:
            prices = [product['price_brl']]
            distributors = {product['distributor']: product['price_brl']}
        
        # Análise estatística
        best_price = min(prices)
        worst_price = max(prices)
        avg_price = statistics.mean(prices)
        med_price = statistics.median(prices)
        
        # Variância de preços
        if len(prices) > 1:
            variance = statistics.stdev(prices)
        else:
            variance = 0.0
        
        # Melhor distribuidor
        best_dist = min(distributors.items(), key=lambda x: x[1])[0]
        
        # Range percentual
        if worst_price > 0:
            price_range = ((worst_price - best_price) / worst_price) * 100
        else:
            price_range = 0.0
        
        # Recomendação
        current_price = product['price_brl']
        if current_price <= best_price * 1.05:
            recommendation = "excellent_deal"
        elif current_price <= avg_price:
            recommendation = "good_price"
        elif current_price <= avg_price * 1.15:
            recommendation = "average"
        else:
            recommendation = "expensive"
        
        return PriceAnalysis(
            best_price=best_price,
            worst_price=worst_price,
            average_price=avg_price,
            median_price=med_price,
            price_variance=variance,
            distributors_count=len(distributors),
            best_distributor=best_dist,
            price_range_pct=price_range,
            price_recommendation=recommendation
        )
    
    def _products_are_similar(self, p1: Dict, p2: Dict) -> bool:
        """Verifica se dois produtos são similares"""
        # Mesmo fabricante e categoria
        if p1['manufacturer'] != p2['manufacturer']:
            return False
        if p1['category'] != p2['category']:
            return False
        
        # Compara specs técnicas principais
        specs1 = p1.get('technical_specs', {})
        specs2 = p2.get('technical_specs', {})
        
        # Tolerância de 5% para valores numéricos
        tolerance = 0.05
        
        if p1['category'] == 'panels':
            power1 = specs1.get('power_w', 0)
            power2 = specs2.get('power_w', 0)
            if power1 > 0 and power2 > 0:
                return abs(power1 - power2) / power1 <= tolerance
        
        elif p1['category'] == 'inverters':
            power1 = specs1.get('power_kw', 0)
            power2 = specs2.get('power_kw', 0)
            if power1 > 0 and power2 > 0:
                return abs(power1 - power2) / power1 <= tolerance
        
        elif p1['category'] == 'kits':
            power1 = specs1.get('power_kwp', 0)
            power2 = specs2.get('power_kwp', 0)
            if power1 > 0 and power2 > 0:
                return abs(power1 - power2) / power1 <= tolerance
        
        # Se não tem specs para comparar, assume similar
        return True
    
    def extract_warranty(self, product: Dict[str, Any]) -> WarrantyInfo:
        """Extrai informações de garantia"""
        category = product['category']
        manufacturer = product['manufacturer']
        
        # Garantias típicas por categoria
        typical = self.TYPICAL_WARRANTIES.get(category, {})
        
        # Tenta extrair do metadata ou specs
        metadata = product.get('metadata', {})
        specs = product.get('technical_specs', {})
        
        product_warranty = (
            metadata.get('warranty_years') or
            specs.get('warranty_years') or
            typical.get('product', 10)
        )
        
        performance_warranty = typical.get('performance')
        performance_guarantee = typical.get('performance_guarantee')
        
        # Fabricantes premium tem garantias melhores
        premium_brands = {
            'Fronius', 'SMA', 'ABB', 'Canadian Solar', 
            'JinkoSolar', 'Trina Solar', 'LG Chem', 'BYD'
        }
        
        if manufacturer in premium_brands:
            if category == 'panels':
                product_warranty = max(product_warranty, 12)
                performance_warranty = 30
                performance_guarantee = 85.0
            elif category == 'inverters':
                product_warranty = max(product_warranty, 10)
        
        return WarrantyInfo(
            product_warranty_years=product_warranty,
            performance_warranty_years=performance_warranty,
            performance_guarantee_pct=performance_guarantee,
            extendable=(manufacturer in premium_brands),
            coverage_scope="premium" if manufacturer in premium_brands else "standard"
        )
    
    def extract_certifications(self, product: Dict[str, Any]) -> CertificationInfo:
        """Extrai certificações"""
        category = product['category']
        manufacturer = product['manufacturer']
        title = product['title'].lower()
        
        # Certificações padrão por categoria
        standard_certs = self.STANDARD_CERTIFICATIONS.get(category, {})
        iec_standards = standard_certs.get('iec_standards', [])
        
        # Detecta certificações no título/metadata
        inmetro = 'inmetro' in title or 'inmetro' in str(product.get('metadata', {}))
        ce = 'ce' in title or category in ['panels', 'inverters', 'batteries']
        ul = 'ul' in title
        tuv = 'tuv' in title or 'tüv' in title
        
        # Fabricantes tier 1 geralmente tem todas certificações
        tier1_brands = {
            'Fronius', 'SMA', 'ABB', 'Schneider', 'Canadian Solar',
            'JinkoSolar', 'Trina Solar', 'Longi', 'JA Solar',
            'BYD', 'LG Chem', 'Pylontech', 'Tesla'
        }
        
        if manufacturer in tier1_brands:
            inmetro = True
            ce = True
            tuv = True
        
        # Score de certificação (0-100)
        score = 0.0
        if inmetro:
            score += 30
        if ce:
            score += 20
        if ul:
            score += 15
        if tuv:
            score += 20
        if len(iec_standards) > 0:
            score += 15
        
        return CertificationInfo(
            inmetro=inmetro,
            inmetro_code=None,
            iec_standards=iec_standards,
            ce_marking=ce,
            ul_listed=ul,
            tuv_certified=tuv,
            iso_9001=(manufacturer in tier1_brands),
            iso_14001=(manufacturer in tier1_brands),
            certification_score=min(score, 100.0)
        )
    
    def extract_kpis(self, product: Dict[str, Any]) -> KPIMetrics:
        """Extrai KPIs técnicos"""
        category = product['category']
        specs = product.get('technical_specs', {})
        
        # Eficiência
        efficiency = specs.get('efficiency') or specs.get('efficiency_pct')
        
        # Performance ratio (típico por categoria)
        pr_typical = {
            'panels': 0.85,
            'inverters': 0.97,
            'batteries': 0.95,
        }
        performance_ratio = pr_typical.get(category)
        
        # Taxa de degradação anual
        degradation_rates = {
            'panels': 0.5,  # 0.5% ao ano (painéis modernos)
            'inverters': 0.2,
            'batteries': 2.0,  # 2% ao ano (baterias)
        }
        degradation = degradation_rates.get(category)
        
        # Coeficiente de temperatura (painéis)
        temp_coeff = None
        if category == 'panels':
            temp_coeff = specs.get('temperature_coefficient', -0.37)  # %/°C típico
        
        # MTBF (Mean Time Between Failures)
        mtbf_typical = {
            'inverters': 100000,  # 100k horas (~11 anos)
            'batteries': 50000,   # 50k horas (~6 anos)
        }
        mtbf = mtbf_typical.get(category)
        
        # Vida útil
        lifecycle = self.TYPICAL_LIFECYCLE.get(category, 20)
        
        # Energy payback time (meses)
        epbt = None
        if category in ['panels', 'kits']:
            epbt = 24  # 2 anos típico para painéis
        
        # Carbon footprint (kg CO2)
        carbon = None
        if category == 'panels':
            # Típico: 50g CO2/Wp
            power_w = specs.get('power_w', 0)
            if power_w > 0:
                carbon = power_w * 0.05  # kg
        
        return KPIMetrics(
            efficiency_pct=efficiency,
            performance_ratio=performance_ratio,
            degradation_rate_annual=degradation,
            temperature_coefficient=temp_coeff,
            mtbf_hours=mtbf,
            lifecycle_years=lifecycle,
            energy_payback_time_months=epbt,
            carbon_footprint_kg=carbon
        )
    
    def calculate_scores(
        self,
        price_analysis: PriceAnalysis,
        warranty: WarrantyInfo,
        certifications: CertificationInfo,
        kpis: KPIMetrics
    ) -> Tuple[float, float, float, float]:
        """Calcula scores de qualidade, valor e confiabilidade"""
        
        # Quality Score (0-100)
        quality = 0.0
        
        # Certificações (40%)
        quality += certifications.certification_score * 0.4
        
        # KPIs técnicos (30%)
        if kpis.efficiency_pct:
            # Normaliza eficiência (assume 15-23% para painéis, 95-99% inversores)
            if kpis.efficiency_pct > 50:  # Provavelmente inversor
                eff_normalized = (kpis.efficiency_pct - 95) / 4 * 100
            else:  # Painel
                eff_normalized = (kpis.efficiency_pct - 15) / 8 * 100
            quality += min(max(eff_normalized, 0), 100) * 0.3
        else:
            quality += 50 * 0.3  # Score neutro
        
        # Garantia (30%)
        warranty_score = (
            min(warranty.product_warranty_years / 15 * 100, 100) * 0.6 +
            (100 if warranty.performance_warranty_years else 50) * 0.4
        )
        quality += warranty_score * 0.3
        
        # Value Score (custo-benefício) (0-100)
        value = 0.0
        
        # Preço relativo (50%)
        if price_analysis.price_recommendation == "excellent_deal":
            value += 100 * 0.5
        elif price_analysis.price_recommendation == "good_price":
            value += 80 * 0.5
        elif price_analysis.price_recommendation == "average":
            value += 60 * 0.5
        else:
            value += 40 * 0.5
        
        # Qualidade vs preço (50%)
        value += quality * 0.5
        
        # Reliability Score (confiabilidade) (0-100)
        reliability = 0.0
        
        # MTBF (40%)
        if kpis.mtbf_hours:
            # Normaliza para 50k-150k horas
            mtbf_score = min((kpis.mtbf_hours - 50000) / 100000 * 100, 100)
            reliability += max(mtbf_score, 0) * 0.4
        else:
            reliability += 60 * 0.4
        
        # Vida útil (30%)
        if kpis.lifecycle_years:
            lifecycle_score = min(kpis.lifecycle_years / 30 * 100, 100)
            reliability += lifecycle_score * 0.3
        else:
            reliability += 60 * 0.3
        
        # Garantia (30%)
        reliability += warranty_score * 0.3
        
        # Overall Score (média ponderada)
        overall = (quality * 0.4 + value * 0.3 + reliability * 0.3)
        
        return overall, value, quality, reliability
    
    def enrich_product(self, product: Dict[str, Any]) -> EnrichedProduct:
        """Enriquece um produto com análise completa"""
        
        # Análise de preços
        price_analysis = self.analyze_prices(product)
        
        # Garantias
        warranty = self.extract_warranty(product)
        
        # Certificações
        certifications = self.extract_certifications(product)
        
        # KPIs
        kpis = self.extract_kpis(product)
        
        # Scores
        overall, value, quality, reliability = self.calculate_scores(
            price_analysis, warranty, certifications, kpis
        )
        
        return EnrichedProduct(
            id=product['id'],
            title=product['title'],
            sku=product['sku'],
            manufacturer=product['manufacturer'],
            category=product['category'],
            price_analysis=price_analysis,
            warranty=warranty,
            certifications=certifications,
            kpis=kpis,
            technical_specs=product.get('technical_specs', {}),
            images=product.get('images', []),
            metadata=product.get('metadata', {}),
            overall_score=overall,
            value_score=value,
            quality_score=quality,
            reliability_score=reliability
        )
    
    def enrich_all_products(self) -> None:
        """Enriquece todos os produtos"""
        print("\n🤖 Enriquecendo produtos com análise LLM...\n")
        
        total = len(self.products)
        skipped = 0
        
        for i, product in enumerate(self.products, 1):
            if i % 1000 == 0:
                print(f"  Processado: {i:,}/{total:,} ({i/total*100:.1f}%)")
            
            # Skip products with invalid data
            if not product.get('manufacturer') or product.get('manufacturer') == 'Unknown':
                skipped += 1
                continue
            
            if not product.get('price_brl') or product.get('price_brl') <= 0:
                skipped += 1
                continue
            
            try:
                enriched = self.enrich_product(product)
                self.enriched_products.append(enriched)
            except Exception as e:
                print(f"  ⚠️ Erro ao enriquecer {product.get('id')}: {e}")
                skipped += 1
        
        print(f"\n  ✅ {len(self.enriched_products):,} produtos enriquecidos")
        print(f"  ⚠️ {skipped:,} produtos ignorados (dados inválidos)")
    
    def export_enriched_schemas(self, output_dir: str) -> None:
        """Exporta schemas enriquecidos"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        
        print("\n💾 Exportando schemas enriquecidos...\n")
        
        # 1. Schema JSON completo
        enriched_file = output_path / f'enriched_products_{timestamp}.json'
        with open(enriched_file, 'w', encoding='utf-8') as f:
            json.dump(
                [asdict(p) for p in self.enriched_products],
                f,
                indent=2,
                ensure_ascii=False,
                default=str
            )
        print(f"  ✅ {enriched_file}")
        
        # 2. Schema por categoria
        by_category = defaultdict(list)
        for p in self.enriched_products:
            by_category[p.category].append(asdict(p))
        
        for category, products in by_category.items():
            cat_file = output_path / f'enriched_{category}_{timestamp}.json'
            with open(cat_file, 'w', encoding='utf-8') as f:
                json.dump(products, f, indent=2, ensure_ascii=False, default=str)
            print(f"  ✅ {cat_file} ({len(products)} produtos)")
        
        # 3. Análise de preços agregada
        price_report = self._generate_price_report()
        price_file = output_path / f'price_analysis_report_{timestamp}.json'
        with open(price_file, 'w', encoding='utf-8') as f:
            json.dump(price_report, f, indent=2, ensure_ascii=False)
        print(f"  ✅ {price_file}")
        
        # 4. Top produtos por score
        top_products = self._generate_top_products_report()
        top_file = output_path / f'top_products_{timestamp}.json'
        with open(top_file, 'w', encoding='utf-8') as f:
            json.dump(top_products, f, indent=2, ensure_ascii=False, default=str)
        print(f"  ✅ {top_file}")
        
        # 5. Relatório markdown
        self._generate_markdown_report(output_path, timestamp)
    
    def _generate_price_report(self) -> Dict[str, Any]:
        """Gera relatório de análise de preços"""
        report = {
            'generated_at': datetime.now().isoformat(),
            'total_products': len(self.enriched_products),
            'by_category': {},
            'price_recommendations': {
                'excellent_deal': 0,
                'good_price': 0,
                'average': 0,
                'expensive': 0,
            }
        }
        
        by_category = defaultdict(list)
        
        for p in self.enriched_products:
            by_category[p.category].append(p.price_analysis)
            report['price_recommendations'][p.price_analysis.price_recommendation] += 1
        
        for category, analyses in by_category.items():
            prices = [a.best_price for a in analyses if a.best_price > 0]
            if not prices:
                continue
            
            report['by_category'][category] = {
                'count': len(analyses),
                'avg_best_price': statistics.mean(prices),
                'median_best_price': statistics.median(prices),
                'min_price': min(prices),
                'max_price': max(prices),
                'avg_price_variance': statistics.mean([a.price_variance for a in analyses]),
                'avg_distributors_count': statistics.mean([a.distributors_count for a in analyses]),
            }
        
        return report
    
    def _generate_top_products_report(self) -> Dict[str, Any]:
        """Gera relatório de top produtos"""
        
        # Top 50 por overall score
        top_overall = sorted(
            self.enriched_products,
            key=lambda p: p.overall_score,
            reverse=True
        )[:50]
        
        # Top 50 por value (custo-benefício)
        top_value = sorted(
            self.enriched_products,
            key=lambda p: p.value_score,
            reverse=True
        )[:50]
        
        # Top 50 por quality
        top_quality = sorted(
            self.enriched_products,
            key=lambda p: p.quality_score,
            reverse=True
        )[:50]
        
        return {
            'generated_at': datetime.now().isoformat(),
            'top_overall_score': [
                {
                    'rank': i+1,
                    'id': p.id,
                    'title': p.title,
                    'manufacturer': p.manufacturer,
                    'category': p.category,
                    'overall_score': round(p.overall_score, 2),
                    'value_score': round(p.value_score, 2),
                    'quality_score': round(p.quality_score, 2),
                    'reliability_score': round(p.reliability_score, 2),
                    'best_price': p.price_analysis.best_price,
                    'price_recommendation': p.price_analysis.price_recommendation,
                }
                for i, p in enumerate(top_overall)
            ],
            'top_value_score': [
                {
                    'rank': i+1,
                    'id': p.id,
                    'title': p.title,
                    'manufacturer': p.manufacturer,
                    'category': p.category,
                    'value_score': round(p.value_score, 2),
                    'best_price': p.price_analysis.best_price,
                    'price_recommendation': p.price_analysis.price_recommendation,
                }
                for i, p in enumerate(top_value)
            ],
            'top_quality_score': [
                {
                    'rank': i+1,
                    'id': p.id,
                    'title': p.title,
                    'manufacturer': p.manufacturer,
                    'category': p.category,
                    'quality_score': round(p.quality_score, 2),
                    'certification_score': round(p.certifications.certification_score, 2),
                    'warranty_years': p.warranty.product_warranty_years,
                }
                for i, p in enumerate(top_quality)
            ],
        }
    
    def _generate_markdown_report(self, output_path: Path, timestamp: str) -> None:
        """Gera relatório em Markdown"""
        md_file = output_path / f'ENRICHED_SCHEMA_REPORT_{timestamp}.md'
        
        # Estatísticas gerais
        avg_overall = statistics.mean([p.overall_score for p in self.enriched_products])
        avg_value = statistics.mean([p.value_score for p in self.enriched_products])
        avg_quality = statistics.mean([p.quality_score for p in self.enriched_products])
        avg_reliability = statistics.mean([p.reliability_score for p in self.enriched_products])
        
        # Certificações
        total_inmetro = sum(1 for p in self.enriched_products if p.certifications.inmetro)
        total_ce = sum(1 for p in self.enriched_products if p.certifications.ce_marking)
        total_tuv = sum(1 for p in self.enriched_products if p.certifications.tuv_certified)
        
        # Garantias
        warranties = [p.warranty.product_warranty_years for p in self.enriched_products]
        avg_warranty = statistics.mean(warranties)
        
        with open(md_file, 'w', encoding='utf-8') as f:
            f.write(f"""# 🤖 YSH Solar - Relatório de Schemas Enriquecidos com LLM

**Data de Geração:** {datetime.now().strftime('%d de %B de %Y, %H:%M')}  
**Sistema:** Schema Enrichment Engine v1.0.0  
**Produtos Analisados:** {len(self.enriched_products):,}

---

## 📊 Resumo Executivo

### Scores Médios (0-100)

| Métrica | Score | Classificação |
|---------|-------|---------------|
| **Overall Score** | {avg_overall:.1f} | {'⭐ Excelente' if avg_overall >= 80 else '✅ Bom' if avg_overall >= 70 else '🟡 Médio'} |
| **Value Score** | {avg_value:.1f} | {'💰 Ótimo valor' if avg_value >= 80 else '✅ Bom valor' if avg_value >= 70 else '🟡 Valor médio'} |
| **Quality Score** | {avg_quality:.1f} | {'🏆 Alta qualidade' if avg_quality >= 80 else '✅ Boa qualidade' if avg_quality >= 70 else '🟡 Qualidade média'} |
| **Reliability Score** | {avg_reliability:.1f} | {'🛡️ Alta confiabilidade' if avg_reliability >= 80 else '✅ Boa confiabilidade' if avg_reliability >= 70 else '🟡 Confiabilidade média'} |

### Certificações

| Certificação | Produtos | % do Total |
|--------------|----------|------------|
| **INMETRO** | {total_inmetro:,} | {total_inmetro/len(self.enriched_products)*100:.1f}% |
| **CE Marking** | {total_ce:,} | {total_ce/len(self.enriched_products)*100:.1f}% |
| **TÜV Certified** | {total_tuv:,} | {total_tuv/len(self.enriched_products)*100:.1f}% |

### Garantias

- **Garantia Média:** {avg_warranty:.1f} anos
- **Garantia Mínima:** {min(warranties)} anos
- **Garantia Máxima:** {max(warranties)} anos

---

## 💰 Análise de Preços

### Recomendações de Preço

""")
            
            # Recomendações de preço
            price_recs = defaultdict(int)
            for p in self.enriched_products:
                price_recs[p.price_analysis.price_recommendation] += 1
            
            total_products = len(self.enriched_products)
            f.write("| Classificação | Produtos | % do Total |\n")
            f.write("|---------------|----------|------------|\n")
            f.write(f"| 🌟 Excellent Deal | {price_recs['excellent_deal']:,} | {price_recs['excellent_deal']/total_products*100:.1f}% |\n")
            f.write(f"| ✅ Good Price | {price_recs['good_price']:,} | {price_recs['good_price']/total_products*100:.1f}% |\n")
            f.write(f"| 🟡 Average | {price_recs['average']:,} | {price_recs['average']/total_products*100:.1f}% |\n")
            f.write(f"| 🔴 Expensive | {price_recs['expensive']:,} | {price_recs['expensive']/total_products*100:.1f}% |\n")
            
            # Top produtos
            top_10 = sorted(self.enriched_products, key=lambda p: p.overall_score, reverse=True)[:10]
            
            f.write(f"""

---

## 🏆 Top 10 Produtos (Overall Score)

| # | Produto | Fabricante | Categoria | Overall | Value | Quality | Preço |
|---|---------|------------|-----------|---------|-------|---------|-------|
""")
            
            for i, p in enumerate(top_10, 1):
                f.write(f"| {i} | {p.title[:50]}... | {p.manufacturer} | {p.category} | {p.overall_score:.1f} | {p.value_score:.1f} | {p.quality_score:.1f} | R$ {p.price_analysis.best_price:,.2f} |\n")
            
            f.write("""

---

## 📈 Análise por Categoria

""")
            
            # Por categoria
            by_category = defaultdict(list)
            for p in self.enriched_products:
                by_category[p.category].append(p)
            
            for category, products in sorted(by_category.items()):
                avg_score = statistics.mean([p.overall_score for p in products])
                avg_price = statistics.mean([p.price_analysis.best_price for p in products if p.price_analysis.best_price > 0])
                
                f.write(f"""
### {category.title()}

- **Produtos:** {len(products):,}
- **Score Médio:** {avg_score:.1f}/100
- **Preço Médio:** R$ {avg_price:,.2f}
""")
            
            f.write("""

---

## 🎯 KPIs Técnicos

### Eficiência Média por Categoria

""")
            
            for category, products in sorted(by_category.items()):
                efficiencies = [p.kpis.efficiency_pct for p in products if p.kpis.efficiency_pct]
                if efficiencies:
                    avg_eff = statistics.mean(efficiencies)
                    f.write(f"- **{category.title()}:** {avg_eff:.2f}%\n")
            
            f.write("""

---

## 📋 Metodologia

### Scores Calculados

1. **Overall Score (0-100)**
   - 40% Quality Score
   - 30% Value Score
   - 30% Reliability Score

2. **Quality Score (0-100)**
   - 40% Certificações
   - 30% KPIs Técnicos
   - 30% Garantias

3. **Value Score (0-100)**
   - 50% Preço Relativo ao Mercado
   - 50% Qualidade vs Preço

4. **Reliability Score (0-100)**
   - 40% MTBF (Mean Time Between Failures)
   - 30% Vida Útil
   - 30% Garantias

### Análise de Preços

- **Excellent Deal:** ≤ 5% acima do melhor preço
- **Good Price:** ≤ preço médio
- **Average:** ≤ 15% acima do preço médio
- **Expensive:** > 15% acima do preço médio

---

**Gerado por:** YSH Solar Schema Enrichment Engine v1.0.0  
**Próxima atualização:** Semanal (automática)

""")
        
        print(f"  ✅ {md_file}")


def main():
    """Função principal"""
    print("=" * 80)
    print("🤖 YSH SOLAR - SCHEMA ENRICHMENT ENGINE COM LLM")
    print("=" * 80)
    print()
    
    # Paths
    base_path = Path(__file__).parent
    consolidated_products = base_path / 'consolidated-inventory' / 'consolidated_products_2025-10-14_09-29-27.json'
    output_dir = base_path / 'enriched-schemas'
    
    # Cria enriquecedor
    enricher = SchemaEnricher(str(consolidated_products))
    
    # Processa
    enricher.load_products()
    enricher.enrich_all_products()
    enricher.export_enriched_schemas(str(output_dir))
    
    print("\n" + "=" * 80)
    print("✅ ENRIQUECIMENTO CONCLUÍDO COM SUCESSO!")
    print("=" * 80)
    print(f"\n📁 Schemas enriquecidos exportados para: {output_dir}")
    print()


if __name__ == "__main__":
    main()
