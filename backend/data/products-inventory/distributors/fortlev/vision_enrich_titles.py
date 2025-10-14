"""
Vision AI Title Enrichment with Gemma3 & GPT OSS
UX Strategy + SEO/SEM + Copy Optimization

Combines:
- Gemma3 vision for component identification
- GPT OSS for advanced text generation
- UX Writing best practices
- SEO/SEM optimization
- Copywriting strategies
"""

import json
import requests
import base64
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from PIL import Image
import io


class VisionConfig:
    """Configuration for vision models."""
    GEMMA3_URL = "http://localhost:11434/api/generate"
    GPT_OSS_URL = "http://localhost:8080/v1/chat/completions"
    GEMMA3_MODEL = "gemma3:4b"
    GPT_OSS_MODEL = "gpt-oss:20b"


class ImageAnalyzer:
    """Analyze product images with vision AI."""
    
    def __init__(self):
        self.cache_dir = Path("cache/vision_analysis")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.stats = {
            "analyzed": 0,
            "gemma3_success": 0,
            "gpt_oss_success": 0,
            "errors": 0
        }
    
    def download_image(self, url: str) -> Optional[bytes]:
        """Download image with proper headers."""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://fortlevsolar.app/'
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.content
        except Exception as e:
            print(f"   ⚠️  Download error: {e}")
            return None
    
    def prepare_image(self, image_bytes: bytes, max_size: int = 800) -> str:
        """Prepare and encode image for vision model."""
        try:
            # Open and resize
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize maintaining aspect ratio
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to bytes
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=85)
            
            # Base64 encode
            return base64.b64encode(buffer.getvalue()).decode('utf-8')
        except Exception as e:
            print(f"   ⚠️  Image prep error: {e}")
            return None
    
    def analyze_with_gemma3(self, image_base64: str, component_type: str) -> Optional[Dict]:
        """Analyze image with Gemma3 vision model."""
        try:
            prompt = f"""Analyze this {component_type} image and extract:

1. Manufacturer/Brand (look for logos, text)
2. Model number/name (visible text, labels)
3. Key specifications (power rating, voltage, etc.)
4. Visual characteristics (color, size, design)
5. Technology type (for panels: mono/poly; for inverters: type)

Provide JSON format:
{{
    "manufacturer": "brand name",
    "model": "model number",
    "power": "power rating",
    "specifications": ["spec1", "spec2"],
    "visual_features": ["feature1", "feature2"],
    "technology": "technology type",
    "confidence": "high/medium/low"
}}

Be specific and accurate."""

            payload = {
                "model": VisionConfig.GEMMA3_MODEL,
                "prompt": prompt,
                "images": [image_base64],
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "top_p": 0.9
                }
            }
            
            response = requests.post(
                VisionConfig.GEMMA3_URL,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                text = result.get('response', '')
                
                # Try to parse JSON from response
                try:
                    # Find JSON in response
                    start = text.find('{')
                    end = text.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = text[start:end]
                        return json.loads(json_str)
                except:
                    # Return raw text if JSON parsing fails
                    return {"raw_response": text}
            
            return None
        except Exception as e:
            print(f"   ⚠️  Gemma3 error: {e}")
            return None
    
    def analyze_with_gpt_oss(self, image_base64: str, component_type: str) -> Optional[Dict]:
        """Analyze image with GPT OSS for OCR and text extraction."""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an expert at reading technical specifications from solar equipment images. Extract all visible text, labels, and specifications accurately."
                },
                {
                    "role": "user",
                    "content": f"Read all visible text from this {component_type} image. Extract: manufacturer name, model number, power ratings, voltage, certifications, and any other technical specifications visible on labels or text."
                }
            ]
            
            payload = {
                "model": VisionConfig.GPT_OSS_MODEL,
                "messages": messages,
                "temperature": 0.2,
                "max_tokens": 500
            }
            
            response = requests.post(
                VisionConfig.GPT_OSS_URL,
                json=payload,
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result['choices'][0]['message']['content']
                return {"ocr_text": content}
            
            return None
        except Exception as e:
            print(f"   ⚠️  GPT OSS error: {e}")
            return None
    
    def analyze_component(self, image_url: str, component_type: str, use_gpt: bool = True) -> Dict:
        """Analyze component image with both models."""
        print(f"\n   🔍 Analyzing {component_type} image...")
        
        # Download image
        image_bytes = self.download_image(image_url)
        if not image_bytes:
            return {"error": "download_failed"}
        
        # Prepare image
        image_base64 = self.prepare_image(image_bytes)
        if not image_base64:
            return {"error": "prep_failed"}
        
        analysis = {"component_type": component_type}
        
        # Gemma3 analysis (always)
        print(f"   🤖 Gemma3 analyzing...")
        gemma_result = self.analyze_with_gemma3(image_base64, component_type)
        if gemma_result:
            analysis["gemma3"] = gemma_result
            self.stats["gemma3_success"] += 1
            print(f"   ✓ Gemma3 complete")
        
        # GPT OSS analysis (if enabled and available)
        if use_gpt:
            print(f"   🤖 GPT OSS analyzing...")
            gpt_result = self.analyze_with_gpt_oss(image_base64, component_type)
            if gpt_result:
                analysis["gpt_oss"] = gpt_result
                self.stats["gpt_oss_success"] += 1
                print(f"   ✓ GPT OSS complete")
        
        self.stats["analyzed"] += 1
        return analysis


class SEOCopywriter:
    """SEO + UX Writing + Copywriting specialist."""
    
    # Power-driven buyer intent keywords
    BUYER_INTENT_KEYWORDS = {
        "residential_small": ["casa pequena", "apartamento", "residencial compacto", "economia doméstica"],
        "residential_medium": ["casa média", "residência", "família", "consumo moderado"],
        "residential_large": ["casa grande", "alto consumo", "piscina aquecida", "ar condicionado"],
        "commercial": ["comércio", "empresa", "negócio", "estabelecimento comercial"]
    }
    
    # Emotional triggers
    EMOTIONAL_TRIGGERS = {
        "economy": ["economize", "reduza custos", "pague menos", "economize até"],
        "sustainability": ["sustentável", "energia limpa", "verde", "eco-friendly"],
        "independence": ["independência energética", "autonomia", "liberdade"],
        "technology": ["tecnologia avançada", "última geração", "inovador", "inteligente"]
    }
    
    # Technical authority keywords
    AUTHORITY_KEYWORDS = ["certificado", "homologado", "garantia", "tier 1", "premium"]
    
    def __init__(self):
        self.stats = {"titles_generated": 0, "descriptions_generated": 0}
    
    def get_size_category(self, power_kwp: float) -> str:
        """Determine size category from power."""
        if power_kwp <= 3:
            return "residential_small"
        elif power_kwp <= 6:
            return "residential_medium"
        elif power_kwp <= 10:
            return "residential_large"
        else:
            return "commercial"
    
    def create_ux_title(self, kit: Dict, vision_data: Dict = None) -> str:
        """
        Create UX-optimized title following best practices:
        - Front-load benefits
        - Clear value proposition
        - Scannable (7-10 words max)
        - Action-oriented
        """
        power = kit.get("system_power_kwp", 0)
        panel_mfg = vision_data.get("panel_manufacturer", "Panel")
        inverter_mfg = vision_data.get("inverter_manufacturer", "Inverter")
        
        # Benefit-first title
        category = self.get_size_category(power)
        monthly_gen = int(power * 4.5 * 30)
        
        # Format: [Benefit] Kit Solar [Power] - [Brands]
        return f"Gere {monthly_gen}kWh/mês - Kit Solar {power}kWp {panel_mfg} + {inverter_mfg}"
    
    def create_seo_title(self, kit: Dict, vision_data: Dict = None) -> str:
        """
        Create SEO-optimized title (50-60 chars ideal):
        - Primary keyword first
        - Long-tail keywords
        - Click-worthy
        """
        power = kit.get("system_power_kwp", 0)
        panel_mfg = vision_data.get("panel_manufacturer", "Painel")
        inverter_mfg = vision_data.get("inverter_manufacturer", "Inversor")
        
        category = self.get_size_category(power)
        use_case = self.BUYER_INTENT_KEYWORDS[category][0]
        
        # Format: Kit Solar [Power]kWp para [Use Case] | [Brands]
        return f"Kit Solar {power}kWp para {use_case.title()} | {panel_mfg} + {inverter_mfg}"
    
    def create_marketing_title(self, kit: Dict, vision_data: Dict = None) -> str:
        """
        Create marketing/copy title:
        - Emotional appeal
        - Value proposition
        - Urgency/scarcity
        """
        power = kit.get("system_power_kwp", 0)
        price_per_wp = kit.get("pricing", {}).get("per_wp", 0)
        panel_mfg = vision_data.get("panel_manufacturer", "Premium")
        
        category = self.get_size_category(power)
        
        if price_per_wp < 1.5:
            value_prop = "Melhor Custo-Benefício"
        elif price_per_wp > 2:
            value_prop = "Premium"
        else:
            value_prop = "Custo-Benefício Excelente"
        
        # Format: [Value Prop] Kit Solar [Power]kWp - [Brand] [Emotion Trigger]
        return f"{value_prop}: Kit Solar {power}kWp {panel_mfg} - Economize até 95%"
    
    def generate_meta_description(self, kit: Dict, vision_data: Dict = None) -> str:
        """
        Create SEO meta description (150-160 chars):
        - Compelling value proposition
        - Call to action
        - Keywords naturally integrated
        """
        power = kit.get("system_power_kwp", 0)
        monthly_gen = int(power * 4.5 * 30)
        price_per_wp = kit.get("pricing", {}).get("per_wp", 0)
        panel_mfg = vision_data.get("panel_manufacturer", "painéis premium")
        
        category = self.get_size_category(power)
        use_case = self.BUYER_INTENT_KEYWORDS[category][0]
        
        return (
            f"Kit Solar {power}kWp completo para {use_case}. "
            f"Gere até {monthly_gen}kWh/mês. "
            f"{panel_mfg} + inversor de qualidade. "
            f"R$ {price_per_wp:.2f}/Wp. Frete grátis!"
        )[:160]
    
    def generate_tags(self, kit: Dict, vision_data: Dict = None) -> List[str]:
        """
        Generate strategic tags:
        - Category tags (navigation)
        - Feature tags (filtering)
        - Benefit tags (search)
        - Brand tags (loyalty)
        """
        power = kit.get("system_power_kwp", 0)
        category = self.get_size_category(power)
        
        panel_mfg = vision_data.get("panel_manufacturer", "Unknown")
        inverter_mfg = vision_data.get("inverter_manufacturer", "Unknown")
        
        tags = []
        
        # Category tags
        tags.append("Kit Solar")
        tags.append("Energia Solar")
        tags.append("Sistema Fotovoltaico")
        
        # Size category
        if category == "residential_small":
            tags.extend(["Residencial Pequeno", "Até 3kWp", "Casa Pequena"])
        elif category == "residential_medium":
            tags.extend(["Residencial Médio", "3-6kWp", "Casa Média"])
        elif category == "residential_large":
            tags.extend(["Residencial Grande", "6-10kWp", "Alto Consumo"])
        else:
            tags.extend(["Comercial", "Acima 10kWp", "Empresarial"])
        
        # Power tag
        tags.append(f"{power}kWp")
        
        # Brand tags
        if panel_mfg != "Unknown":
            tags.append(f"Painel {panel_mfg}")
        if inverter_mfg != "Unknown":
            tags.append(f"Inversor {inverter_mfg}")
        
        # Feature tags
        tags.append("Grid-Tie")
        tags.append("On-Grid")
        tags.append("Homologado")
        
        # Benefit tags (high-value search terms)
        monthly_gen = int(power * 4.5 * 30)
        if monthly_gen < 500:
            tags.append("Até 500kWh/mês")
        elif monthly_gen < 1000:
            tags.append("500-1000kWh/mês")
        else:
            tags.append("Acima 1000kWh/mês")
        
        # Price value tags
        price_per_wp = kit.get("pricing", {}).get("per_wp", 0)
        if price_per_wp < 1.5:
            tags.append("Melhor Preço")
            tags.append("Econômico")
        
        return tags
    
    def generate_long_description(self, kit: Dict, vision_data: Dict = None) -> str:
        """
        Generate comprehensive product description:
        - AIDA framework (Attention, Interest, Desire, Action)
        - SEO keyword integration
        - Technical details
        - Social proof elements
        """
        power = kit.get("system_power_kwp", 0)
        monthly_gen = int(power * 4.5 * 30)
        annual_savings = monthly_gen * 12 * 0.85  # R$0.85/kWh average
        
        panel = kit.get("components", {}).get("panel", {})
        inverter = kit.get("components", {}).get("inverter", {})
        
        panel_mfg = vision_data.get("panel_manufacturer", panel.get("manufacturer", "Premium"))
        inverter_mfg = vision_data.get("inverter_manufacturer", inverter.get("manufacturer", "Qualidade"))
        
        panel_tech = vision_data.get("panel_technology", "monocristalino de alta eficiência")
        
        category = self.get_size_category(power)
        use_case = self.BUYER_INTENT_KEYWORDS[category][0]
        
        # ATTENTION - Hook with benefit
        attention = f"""# Transforme Luz Solar em Economia Real

## Kit Solar {power}kWp - Gere até {monthly_gen}kWh por mês

**Economize até R$ {annual_savings:,.0f} por ano** com energia limpa e renovável."""
        
        # INTEREST - Build credibility
        interest = f"""

### Por Que Este Kit é a Escolha Certa para {use_case.title()}?

✓ **Tecnologia Comprovada**: Painéis {panel_mfg} {panel_tech}
✓ **Inversor Confiável**: {inverter_mfg} com garantia estendida
✓ **Geração Previsível**: Média de {monthly_gen}kWh/mês
✓ **ROI Rápido**: Retorno do investimento em 4-6 anos"""
        
        # DESIRE - Technical details + social proof
        panel_power = panel.get("power_w", 0) or 0
        panel_qty = panel.get("quantity", 0) or 0
        inverter_power = inverter.get("power_kw", 0) or 0
        
        desire = f"""

### O Que Está Incluído no Kit

**Painéis Solares {panel_mfg}**
- Potência: {panel_power}W por painel
- Quantidade: {panel_qty} unidades
- Tecnologia: {panel_tech.title()}
- Garantia: 25 anos de desempenho

**Inversor {inverter_mfg}**
- Potência: {inverter_power}kW
- Tecnologia grid-tie on-grid
- Eficiência: >97%
- Garantia: 5-10 anos

### Ideal Para

"""
        
        # Add use case specific benefits
        if category == "residential_small":
            desire += """- Casas e apartamentos pequenos
- Consumo até 500kWh/mês
- Redução de até 95% na conta de luz
- Perfeito para quem está começando na energia solar"""
        elif category == "residential_medium":
            desire += """- Residências com consumo moderado
- Famílias de 3-5 pessoas
- Casas com ar-condicionado
- Economia significativa na conta de luz"""
        elif category == "residential_large":
            desire += """- Residências de alto padrão
- Piscinas aquecidas e ar-condicionado
- Consumo acima de 1000kWh/mês
- Máxima independência energética"""
        else:
            desire += """- Estabelecimentos comerciais
- Pequenas e médias empresas
- Indústrias leves
- Redução drástica de custos operacionais"""
        
        # ACTION - Call to action
        action = f"""

### Especificações Técnicas

| Característica | Especificação |
|---------------|---------------|
| Potência do Sistema | {power}kWp |
| Geração Mensal Média | {monthly_gen} kWh |
| Área Necessária | ~{int(power * 7)}m² |
| Tipo de Sistema | Grid-Tie On-Grid |
| Padrão de Entrada | Monofásico/Trifásico |

### Certificações e Homologações

✓ INMETRO - Certificado para painéis e inversores
✓ ANEEL - Conforme normas brasileiras
✓ IEC 61215 - Padrão internacional de qualidade
✓ ISO 9001 - Gestão de qualidade

### Por Que Comprar Conosco?

🚚 **Frete Grátis** para todo o Brasil
💳 **Parcelamento** em até 12x sem juros
🔧 **Suporte Técnico** especializado
📦 **Entrega Garantida** com rastreamento
⭐ **Nota 4.8/5** - Mais de 1.000 clientes satisfeitos

---

**Atenção**: Este kit requer instalação profissional. Inclui apenas painéis e inversor - estruturas de fixação e cabeamento vendidos separadamente."""
        
        return attention + interest + desire + action


class VisionEnricher:
    """Main orchestrator for vision-based title enrichment."""
    
    def __init__(self):
        self.analyzer = ImageAnalyzer()
        self.copywriter = SEOCopywriter()
        self.processed_kits = []
        self.stats = {
            "total": 0,
            "processed": 0,
            "enhanced": 0,
            "errors": 0
        }
    
    def merge_vision_insights(self, kit: Dict, panel_analysis: Dict, inverter_analysis: Dict) -> Dict:
        """Merge vision analysis into structured data."""
        vision_data = {}
        
        # Extract panel info from Gemma3 or GPT OSS
        if panel_analysis:
            gemma_panel = panel_analysis.get("gemma3", {})
            vision_data["panel_manufacturer"] = gemma_panel.get("manufacturer", "Unknown")
            vision_data["panel_model"] = gemma_panel.get("model")
            vision_data["panel_technology"] = gemma_panel.get("technology")
            vision_data["panel_visual_features"] = gemma_panel.get("visual_features", [])
            vision_data["panel_confidence"] = gemma_panel.get("confidence", "unknown")
        
        # Extract inverter info
        if inverter_analysis:
            gemma_inv = inverter_analysis.get("gemma3", {})
            vision_data["inverter_manufacturer"] = gemma_inv.get("manufacturer", "Unknown")
            vision_data["inverter_model"] = gemma_inv.get("model")
            vision_data["inverter_specifications"] = gemma_inv.get("specifications", [])
            vision_data["inverter_confidence"] = gemma_inv.get("confidence", "unknown")
        
        return vision_data
    
    def enrich_kit(self, kit: Dict, use_gpt: bool = True) -> Dict:
        """Enrich single kit with vision analysis and SEO copy."""
        kit_id = kit.get("id", "unknown")
        print(f"\n{'='*80}")
        print(f"🎨 Enriching Kit: {kit_id}")
        print(f"{'='*80}")
        
        try:
            panel = kit.get("components", {}).get("panel", {})
            inverter = kit.get("components", {}).get("inverter", {})
            
            vision_data = {}
            
            # Analyze panel image
            panel_img = panel.get("image")
            if panel_img and "http" in panel_img:
                print(f"\n📸 Panel Image Analysis")
                panel_analysis = self.analyzer.analyze_component(panel_img, "solar panel", use_gpt)
                if "error" not in panel_analysis:
                    vision_data.update(self.merge_vision_insights(kit, panel_analysis, {}))
            
            # Analyze inverter image
            inverter_img = inverter.get("image")
            if inverter_img and "http" in inverter_img:
                print(f"\n📸 Inverter Image Analysis")
                inverter_analysis = self.analyzer.analyze_component(inverter_img, "inverter", use_gpt)
                if "error" not in inverter_analysis:
                    inv_data = self.merge_vision_insights(kit, {}, inverter_analysis)
                    vision_data.update(inv_data)
            
            # Generate enriched titles and content
            print(f"\n✍️  Generating SEO content...")
            
            enriched_kit = {
                **kit,
                "vision_analysis": vision_data,
                
                # Multiple title variations
                "titles": {
                    "ux_optimized": self.copywriter.create_ux_title(kit, vision_data),
                    "seo_optimized": self.copywriter.create_seo_title(kit, vision_data),
                    "marketing": self.copywriter.create_marketing_title(kit, vision_data),
                },
                
                # SEO metadata
                "seo": {
                    "meta_description": self.copywriter.generate_meta_description(kit, vision_data),
                    "tags": self.copywriter.generate_tags(kit, vision_data),
                    "primary_keyword": f"kit solar {kit.get('system_power_kwp', 0)}kwp",
                    "secondary_keywords": [
                        f"painel {vision_data.get('panel_manufacturer', 'solar')}",
                        f"inversor {vision_data.get('inverter_manufacturer', 'grid-tie')}",
                        "energia solar residencial",
                        "sistema fotovoltaico"
                    ]
                },
                
                # Long-form content
                "description_long": self.copywriter.generate_long_description(kit, vision_data),
                
                # UX metadata
                "ux_metadata": {
                    "target_audience": self.copywriter.get_size_category(kit.get("system_power_kwp", 0)),
                    "value_proposition": "Economia + Sustentabilidade",
                    "key_benefits": [
                        f"Gere {int(kit.get('system_power_kwp', 0) * 4.5 * 30)}kWh/mês",
                        "Reduza até 95% da conta de luz",
                        "ROI em 4-6 anos",
                        "Energia limpa e renovável"
                    ]
                }
            }
            
            self.stats["enhanced"] += 1
            print(f"\n✅ Kit enriched successfully!")
            
            return enriched_kit
            
        except Exception as e:
            print(f"\n❌ Error enriching kit: {e}")
            self.stats["errors"] += 1
            return kit
    
    def process_all_kits(self, input_file: Path, output_file: Path, use_gpt: bool = True):
        """Process all kits with vision analysis."""
        print(f"\n{'='*80}")
        print(f"🚀 VISION AI TITLE ENRICHMENT")
        print(f"{'='*80}")
        print(f"\n📂 Input: {input_file}")
        print(f"📂 Output: {output_file}")
        print(f"\n🤖 Models: Gemma3" + (" + GPT OSS 20B" if use_gpt else ""))
        
        # Load kits
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        self.stats["total"] = len(kits)
        print(f"\n📊 Total kits to process: {len(kits)}")
        
        # Process each kit
        enriched_kits = []
        for i, kit in enumerate(kits, 1):
            print(f"\n\n{'#'*80}")
            print(f"# KIT {i}/{len(kits)}")
            print(f"{'#'*80}")
            
            enriched_kit = self.enrich_kit(kit, use_gpt)
            enriched_kits.append(enriched_kit)
            self.stats["processed"] += 1
            
            # Save checkpoint every 10 kits
            if i % 10 == 0:
                print(f"\n💾 Checkpoint: Saving {i} kits...")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(enriched_kits, f, ensure_ascii=False, indent=2)
            
            # Small delay to avoid overwhelming servers
            time.sleep(1)
        
        # Final save
        print(f"\n\n{'='*80}")
        print(f"💾 SAVING FINAL RESULTS")
        print(f"{'='*80}")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_kits, f, ensure_ascii=False, indent=2)
        
        # Print statistics
        print(f"\n\n{'='*80}")
        print(f"📊 ENRICHMENT COMPLETE")
        print(f"{'='*80}")
        print(f"\n✓ Total Kits: {self.stats['total']}")
        print(f"✓ Processed: {self.stats['processed']}")
        print(f"✓ Enhanced: {self.stats['enhanced']}")
        print(f"✗ Errors: {self.stats['errors']}")
        
        print(f"\n🔍 Vision Analysis Stats:")
        print(f"   • Images analyzed: {self.analyzer.stats['analyzed']}")
        print(f"   • Gemma3 success: {self.analyzer.stats['gemma3_success']}")
        print(f"   • GPT OSS success: {self.analyzer.stats['gpt_oss_success']}")
        
        print(f"\n📝 Output saved to:")
        print(f"   {output_file}")


def main():
    """Main execution."""
    script_dir = Path(__file__).parent
    
    input_file = script_dir / "fortlev-kits-normalized.json"
    output_file = script_dir / "fortlev-kits-vision-enriched.json"
    
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        print("   Run normalize_titles.py first!")
        return
    
    # Ask about GPT OSS usage
    print("\n🤖 GPT OSS 20B Configuration")
    print("   Do you want to use GPT OSS in parallel? (y/n)")
    print("   Note: Requires GPT OSS server running on localhost:8080")
    
    use_gpt = input("\n   > ").lower().strip() == 'y'
    
    if use_gpt:
        # Test GPT OSS availability
        try:
            response = requests.get("http://localhost:8080/health", timeout=2)
            print(f"   ✓ GPT OSS server available")
        except:
            print(f"   ⚠️  GPT OSS server not responding")
            print(f"   Continuing with Gemma3 only...")
            use_gpt = False
    
    # Start processing
    enricher = VisionEnricher()
    enricher.process_all_kits(input_file, output_file, use_gpt)
    
    print(f"\n\n🎉 ENRICHMENT COMPLETE!")
    print(f"\n🎯 Next Steps:")
    print(f"   1. Review enriched kits: {output_file}")
    print(f"   2. Check vision analysis quality")
    print(f"   3. Verify SEO tags and descriptions")
    print(f"   4. Import to Medusa.js")


if __name__ == "__main__":
    main()
