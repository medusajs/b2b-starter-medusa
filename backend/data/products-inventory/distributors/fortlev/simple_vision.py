#!/usr/bin/env python3
"""
Vision-based kit analyzer using Gemma3 (via Ollama).
Simplified version focusing on Gemma3 for component identification.
"""

import json
import os
import re
import requests
from pathlib import Path
from typing import Dict, List, Any, Optional
from PIL import Image
from io import BytesIO
import base64


class VisionConfig:
    """Configuration for vision processing."""
    
    GEMMA3_ENDPOINT = os.getenv("GEMMA3_ENDPOINT", "http://localhost:11434/api/generate")
    GEMMA3_MODEL = os.getenv("GEMMA3_MODEL", "gemma3:4b")
    IMAGE_CACHE_DIR = Path(__file__).parent / "cache" / "images"
    USE_GPT_OSS = False  # Disabled by default


class ImageDownloader:
    """Download and cache images from URLs."""
    
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def download_image(self, url: str, kit_id: str, component: str) -> Optional[Path]:
        """Download image with error handling."""
        if not url or 'http' not in url:
            return None
        
        # Generate cache filename
        ext = url.split('.')[-1].split('?')[0] or 'png'
        if ext not in ['jpg', 'jpeg', 'png', 'webp']:
            ext = 'png'
        
        cache_file = self.cache_dir / f"{kit_id}_{component}.{ext}"
        
        # Return cached if exists
        if cache_file.exists():
            print(f"    Using cached image: {cache_file.name}")
            return cache_file
        
        try:
            # Try with custom headers to avoid 403
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://fortlevsolar.app/'
            }
            
            response = requests.get(url, timeout=30, headers=headers)
            response.raise_for_status()
            
            # Save to cache
            with open(cache_file, 'wb') as f:
                f.write(response.content)
            
            print(f"    Downloaded: {cache_file.name}")
            return cache_file
        
        except Exception as e:
            print(f"    ⚠ Download failed: {str(e)[:60]}...")
            return None


class Gemma3Analyzer:
    """Gemma3 vision analyzer for solar components."""
    
    def __init__(self, endpoint: str, model: str):
        self.endpoint = endpoint
        self.model = model
    
    def analyze_component(
        self, 
        image_path: Path, 
        component_type: str
    ) -> Dict[str, Any]:
        """Analyze component with Gemma3."""
        prompt = self._build_prompt(component_type)
        
        try:
            # Prepare image
            with Image.open(image_path) as img:
                # Resize for faster processing
                max_size = (640, 640)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert to base64
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            print(f"    Analyzing with Gemma3...")
            
            # Call Ollama API
            payload = {
                "model": self.model,
                "prompt": prompt,
                "images": [img_base64],
                "stream": False
            }
            
            response = requests.post(self.endpoint, json=payload, timeout=120)
            response.raise_for_status()
            
            result = response.json()
            analysis_text = result.get('response', '')
            
            # Parse response
            parsed = self._parse_analysis(analysis_text, component_type)
            print(f"    ✓ Extracted: {parsed.get('manufacturer', 'Unknown')}")
            
            return parsed
        
        except Exception as e:
            print(f"    ✗ Analysis failed: {e}")
            return {}
    
    def _build_prompt(self, component_type: str) -> str:
        """Build prompt for component type."""
        if component_type == 'panel':
            return """Analyze this solar panel image and extract information.

What brand/manufacturer is visible on the panel? (Look for logos like: LONGi, Canadian Solar, JA Solar, Trina, BYD, Risen, Jinko, etc.)
What is the model number?
What power rating in Watts (W)?

Return ONLY in this JSON format:
{"manufacturer": "Brand Name", "model": "Model-Number", "power_w": 530}

If you cannot identify something, use "Unknown" for text or 0 for numbers."""
        
        else:  # inverter
            return """Analyze this solar inverter image and extract information.

What brand/manufacturer is visible? (Look for logos like: Growatt, Sungrow, Fronius, Huawei, SMA, Solis, Enphase, etc.)
What is the model number?
What power rating in kW?

Return ONLY in this JSON format:
{"manufacturer": "Brand Name", "model": "Model-Number", "power_kw": 5.0}

If you cannot identify something, use "Unknown" for text or 0 for numbers."""
    
    def _parse_analysis(self, text: str, component_type: str) -> Dict[str, Any]:
        """Parse JSON from Gemma3 response."""
        try:
            # Try to extract JSON
            json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group(0))
                return parsed
        except:
            pass
        
        # Fallback: try to extract from plain text
        result = {}
        
        # Extract manufacturer
        mfr_patterns = [
            r'(?:manufacturer|marca|fabricante)[:\s]+"?([A-Za-z\s]+)"?',
            r'"manufacturer"[:\s]+"([^"]+)"',
            r'brand[:\s]+([A-Za-z\s]+)',
        ]
        for pattern in mfr_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['manufacturer'] = match.group(1).strip()
                break
        
        # Extract model
        model_patterns = [
            r'(?:model|modelo)[:\s]+"?([A-Z0-9\-]+)"?',
            r'"model"[:\s]+"([^"]+)"',
        ]
        for pattern in model_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                result['model'] = match.group(1).strip()
                break
        
        # Extract power
        if component_type == 'panel':
            power_match = re.search(r'(\d+)\s*W', text)
            if power_match:
                result['power_w'] = int(power_match.group(1))
        else:
            power_match = re.search(r'(\d+(?:\.\d+)?)\s*kW', text)
            if power_match:
                result['power_kw'] = float(power_match.group(1))
        
        return result if result else {}


class KitProcessor:
    """Process kits with Gemma3 vision."""
    
    def __init__(self):
        self.downloader = ImageDownloader(VisionConfig.IMAGE_CACHE_DIR)
        self.analyzer = Gemma3Analyzer(
            VisionConfig.GEMMA3_ENDPOINT,
            VisionConfig.GEMMA3_MODEL
        )
    
    def process_kit(self, kit: Dict[str, Any]) -> Dict[str, Any]:
        """Process single kit with vision analysis."""
        kit_id = kit['id']
        enhanced_kit = kit.copy()
        
        print(f"\n📦 {kit_id}")
        
        # Process panel
        panel_url = kit['components']['panel']['image']
        if panel_url:
            print(f"  🔆 Panel:")
            panel_path = self.downloader.download_image(panel_url, kit_id, 'panel')
            if panel_path:
                panel_analysis = self.analyzer.analyze_component(panel_path, 'panel')
                if panel_analysis:
                    enhanced_kit['components']['panel']['vision_analysis'] = panel_analysis
                    # Update manufacturer if found
                    if panel_analysis.get('manufacturer') and panel_analysis['manufacturer'] != 'Unknown':
                        enhanced_kit['components']['panel']['manufacturer'] = panel_analysis['manufacturer']
        
        # Process inverter
        inverter_url = kit['components']['inverter']['image']
        if inverter_url:
            print(f"  ⚡ Inverter:")
            inverter_path = self.downloader.download_image(inverter_url, kit_id, 'inverter')
            if inverter_path:
                inverter_analysis = self.analyzer.analyze_component(inverter_path, 'inverter')
                if inverter_analysis:
                    enhanced_kit['components']['inverter']['vision_analysis'] = inverter_analysis
                    # Update manufacturer if found
                    if inverter_analysis.get('manufacturer') and inverter_analysis['manufacturer'] != 'Unknown':
                        enhanced_kit['components']['inverter']['manufacturer'] = inverter_analysis['manufacturer']
        
        return enhanced_kit
    
    def process_all(self, input_file: Path, output_file: Path, limit: int = None):
        """Process all kits from JSON file."""
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        if limit:
            kits = kits[:limit]
        
        print(f"\n{'='*60}")
        print(f"YSH Vision Processor - Gemma3")
        print(f"{'='*60}")
        print(f"Total kits: {len(kits)}")
        print(f"Model: {VisionConfig.GEMMA3_MODEL}")
        print(f"Cache: {VisionConfig.IMAGE_CACHE_DIR}")
        print(f"{'='*60}")
        
        enhanced_kits = []
        success_count = 0
        
        for idx, kit in enumerate(kits, 1):
            print(f"\n[{idx}/{len(kits)}]", end=" ")
            
            try:
                enhanced = self.process_kit(kit)
                enhanced_kits.append(enhanced)
                
                # Check if we identified anything new
                panel_mfr = enhanced['components']['panel'].get('manufacturer', 'Unknown')
                inv_mfr = enhanced['components']['inverter'].get('manufacturer', 'Unknown')
                
                if panel_mfr != 'Unknown' or inv_mfr != 'Unknown':
                    success_count += 1
                
            except Exception as e:
                print(f"  ✗ Error: {e}")
                enhanced_kits.append(kit)
            
            # Save periodically
            if idx % 10 == 0:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(enhanced_kits, f, indent=2, ensure_ascii=False)
                print(f"\n  💾 Saved checkpoint ({idx} kits)")
        
        # Final save
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enhanced_kits, f, indent=2, ensure_ascii=False)
        
        print(f"\n{'='*60}")
        print(f"✓ Processing complete!")
        print(f"  Total: {len(enhanced_kits)}")
        print(f"  Identified: {success_count}")
        print(f"  Output: {output_file}")
        print(f"{'='*60}\n")


def main():
    """Main execution."""
    base_dir = Path(__file__).parent
    input_file = base_dir / "fortlev-kits.json"
    output_file = base_dir / "fortlev-kits-enhanced.json"
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
        return
    
    processor = KitProcessor()
    
    # Process ALL kits
    print("Processing ALL 217 kits...")
    processor.process_all(input_file, output_file)


if __name__ == "__main__":
    main()
