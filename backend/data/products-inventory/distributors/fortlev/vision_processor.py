#!/usr/bin/env python3
"""
Vision-based kit image analyzer using Gemma3 and GPT OSS models.
Extracts technical specifications from solar kit component images.
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


class VisionModelConfig:
    """Configuration for vision models."""
    
    # Gemma3 (Google's open model)
    GEMMA3_ENDPOINT = os.getenv("GEMMA3_ENDPOINT", "http://localhost:11434/api/generate")
    GEMMA3_MODEL = "gemma3:latest"
    
    # GPT OSS 20B (Local deployment)
    GPT_OSS_ENDPOINT = os.getenv("GPT_OSS_ENDPOINT", "http://localhost:8080/v1/chat/completions")
    GPT_OSS_MODEL = "gpt-oss-20b"
    
    # Image storage
    IMAGE_CACHE_DIR = Path(__file__).parent / "cache" / "images"
    PROCESSED_DIR = Path(__file__).parent / "processed" / "kits"


class ImageDownloader:
    """Download and cache images from URLs."""
    
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def download_image(self, url: str, kit_id: str, component: str) -> Optional[Path]:
        """
        Download image from URL and cache locally.
        
        Args:
            url: Image URL (S3 or other)
            kit_id: Kit identifier
            component: 'panel' or 'inverter'
        
        Returns:
            Path to cached image file
        """
        if not url or 'http' not in url:
            return None
        
        # Generate cache filename
        ext = url.split('.')[-1].split('?')[0] or 'png'
        if ext not in ['jpg', 'jpeg', 'png', 'webp']:
            ext = 'png'
        
        cache_file = self.cache_dir / f"{kit_id}_{component}.{ext}"
        
        # Return cached if exists
        if cache_file.exists():
            return cache_file
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Save to cache
            with open(cache_file, 'wb') as f:
                f.write(response.content)
            
            return cache_file
        
        except Exception as e:
            print(f"Error downloading {url}: {e}")
            return None
    
    def image_to_base64(self, image_path: Path) -> str:
        """Convert image to base64 for API transmission."""
        with open(image_path, 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')


class Gemma3VisionAnalyzer:
    """Use Gemma3 for visual analysis of solar equipment."""
    
    def __init__(self, endpoint: str, model: str):
        self.endpoint = endpoint
        self.model = model
    
    def analyze_solar_component(
        self, 
        image_path: Path, 
        component_type: str
    ) -> Dict[str, Any]:
        """
        Analyze solar component image using Gemma3.
        
        Args:
            image_path: Path to component image
            component_type: 'panel' or 'inverter'
        
        Returns:
            Extracted specifications
        """
        prompt = self._build_prompt(component_type)
        
        try:
            # Prepare image
            with Image.open(image_path) as img:
                # Resize if too large
                max_size = (800, 800)
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # Convert to bytes
                buffer = BytesIO()
                img.save(buffer, format='PNG')
                img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            # Call Gemma3 API
            payload = {
                "model": self.model,
                "prompt": prompt,
                "images": [img_base64],
                "stream": False
            }
            
            response = requests.post(self.endpoint, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            analysis_text = result.get('response', '')
            
            # Parse structured data from response
            return self._parse_analysis(analysis_text, component_type)
        
        except Exception as e:
            print(f"Gemma3 analysis error: {e}")
            return {}
    
    def _build_prompt(self, component_type: str) -> str:
        """Build analysis prompt for component type."""
        if component_type == 'panel':
            return """
Analyze this solar panel image and extract:
1. Manufacturer brand name
2. Model number
3. Power rating (Watts or kWp)
4. Panel technology (monocrystalline, polycrystalline, etc.)
5. Cell configuration (e.g., 72-cell, 144 half-cut)
6. Visible specifications from labels

Return as JSON format:
{
  "manufacturer": "...",
  "model": "...",
  "power_w": 0,
  "technology": "...",
  "cells": "...",
  "additional_specs": {}
}
"""
        else:  # inverter
            return """
Analyze this solar inverter image and extract:
1. Manufacturer brand name
2. Model number
3. Power rating (kW)
4. Type (grid-tie, hybrid, microinverter)
5. Voltage (220V, 380V)
6. Number of MPPT trackers
7. Visible specifications from labels

Return as JSON format:
{
  "manufacturer": "...",
  "model": "...",
  "power_kw": 0,
  "type": "...",
  "voltage": "...",
  "mppt": 0,
  "additional_specs": {}
}
"""
    
    def _parse_analysis(self, text: str, component_type: str) -> Dict[str, Any]:
        """Parse JSON response from Gemma3."""
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
        except:
            pass
        
        # Fallback: empty dict
        return {}


class GPTOSSocr:
    """Use GPT OSS 20B for OCR text extraction."""
    
    def __init__(self, endpoint: str, model: str):
        self.endpoint = endpoint
        self.model = model
    
    def extract_text_from_image(self, image_path: Path) -> str:
        """
        Extract all visible text from image using OCR.
        
        Args:
            image_path: Path to image file
        
        Returns:
            Extracted text content
        """
        try:
            # Convert image to base64
            with open(image_path, 'rb') as f:
                img_base64 = base64.b64encode(f.read()).decode('utf-8')
            
            # Call GPT OSS API
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": "Extract all visible text from this image. Include product names, model numbers, specifications, and any technical details. Return as plain text."
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{img_base64}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 1000
            }
            
            response = requests.post(self.endpoint, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
        
        except Exception as e:
            print(f"GPT OSS OCR error: {e}")
            return ""
    
    def extract_specifications(self, ocr_text: str, component_type: str) -> Dict[str, Any]:
        """
        Extract structured specifications from OCR text.
        
        Args:
            ocr_text: Raw OCR output
            component_type: 'panel' or 'inverter'
        
        Returns:
            Structured specifications
        """
        specs = {}
        
        if component_type == 'panel':
            # Extract panel specs
            power_match = re.search(r'(\d+)\s*W(?:p)?', ocr_text, re.IGNORECASE)
            if power_match:
                specs['power_w'] = int(power_match.group(1))
            
            # Model patterns
            model_patterns = [
                r'(?:Model|Modelo)[:\s]*([A-Z0-9-]+)',
                r'([A-Z]{2,}-\d{3,}[A-Z]*)',
            ]
            for pattern in model_patterns:
                match = re.search(pattern, ocr_text)
                if match:
                    specs['model'] = match.group(1)
                    break
        
        else:  # inverter
            # Extract inverter specs
            power_match = re.search(r'(\d+(?:\.\d+)?)\s*k?W', ocr_text, re.IGNORECASE)
            if power_match:
                power_str = power_match.group(1)
                specs['power_kw'] = float(power_str)
            
            # Voltage
            voltage_match = re.search(r'(220|380)V', ocr_text)
            if voltage_match:
                specs['voltage'] = f"{voltage_match.group(1)}V"
            
            # MPPT
            mppt_match = re.search(r'(\d+)\s*MPPT', ocr_text, re.IGNORECASE)
            if mppt_match:
                specs['mppt'] = int(mppt_match.group(1))
        
        return specs


class KitVisionProcessor:
    """Main processor for kit image analysis."""
    
    def __init__(self):
        self.downloader = ImageDownloader(VisionModelConfig.IMAGE_CACHE_DIR)
        self.gemma3 = Gemma3VisionAnalyzer(
            VisionModelConfig.GEMMA3_ENDPOINT,
            VisionModelConfig.GEMMA3_MODEL
        )
        self.gpt_oss = GPTOSSocr(
            VisionModelConfig.GPT_OSS_ENDPOINT,
            VisionModelConfig.GPT_OSS_MODEL
        )
        
        # Ensure processed directory exists
        VisionModelConfig.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    
    def process_kit(self, kit: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process kit images with vision models.
        
        Args:
            kit: Kit data with component images
        
        Returns:
            Enhanced kit data with vision analysis
        """
        kit_id = kit['id']
        print(f"Processing kit: {kit_id}")
        
        enhanced_kit = kit.copy()
        
        # Process panel image
        panel_image_url = kit['components']['panel']['image']
        if panel_image_url:
            panel_path = self.downloader.download_image(panel_image_url, kit_id, 'panel')
            if panel_path:
                # Gemma3 vision analysis
                gemma_panel = self.gemma3.analyze_solar_component(panel_path, 'panel')
                
                # GPT OSS OCR
                panel_ocr = self.gpt_oss.extract_text_from_image(panel_path)
                gpt_panel = self.gpt_oss.extract_specifications(panel_ocr, 'panel')
                
                # Merge results
                enhanced_kit['components']['panel']['vision_analysis'] = {
                    'gemma3': gemma_panel,
                    'gpt_oss_ocr': gpt_panel,
                    'raw_ocr_text': panel_ocr
                }
        
        # Process inverter image
        inverter_image_url = kit['components']['inverter']['image']
        if inverter_image_url:
            inverter_path = self.downloader.download_image(inverter_image_url, kit_id, 'inverter')
            if inverter_path:
                # Gemma3 vision analysis
                gemma_inv = self.gemma3.analyze_solar_component(inverter_path, 'inverter')
                
                # GPT OSS OCR
                inv_ocr = self.gpt_oss.extract_text_from_image(inverter_path)
                gpt_inv = self.gpt_oss.extract_specifications(inv_ocr, 'inverter')
                
                # Merge results
                enhanced_kit['components']['inverter']['vision_analysis'] = {
                    'gemma3': gemma_inv,
                    'gpt_oss_ocr': gpt_inv,
                    'raw_ocr_text': inv_ocr
                }
        
        return enhanced_kit
    
    def process_all_kits(self, kits_file: Path) -> List[Dict[str, Any]]:
        """
        Process all kits from JSON file.
        
        Args:
            kits_file: Path to kits JSON
        
        Returns:
            List of enhanced kits
        """
        with open(kits_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        enhanced_kits = []
        total = len(kits)
        
        for idx, kit in enumerate(kits, 1):
            print(f"\n[{idx}/{total}] Processing {kit['id']}...")
            try:
                enhanced_kit = self.process_kit(kit)
                enhanced_kits.append(enhanced_kit)
            except Exception as e:
                print(f"Error processing kit {kit['id']}: {e}")
                enhanced_kits.append(kit)  # Keep original
        
        return enhanced_kits
    
    def save_enhanced_kits(self, kits: List[Dict[str, Any]], output_file: Path):
        """Save enhanced kits to JSON."""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(kits, f, indent=2, ensure_ascii=False)
        print(f"\nSaved enhanced kits to {output_file}")


def main():
    """Main execution."""
    print("=== YSH Kit Vision Processor ===\n")
    
    # Paths
    base_dir = Path(__file__).parent
    input_file = base_dir / "fortlev-kits.json"
    output_file = base_dir / "fortlev-kits-enhanced.json"
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
        return
    
    # Initialize processor
    processor = KitVisionProcessor()
    
    # Process kits
    print("Starting vision-based processing...\n")
    enhanced_kits = processor.process_all_kits(input_file)
    
    # Save results
    processor.save_enhanced_kits(enhanced_kits, output_file)
    
    print(f"\n✓ Processed {len(enhanced_kits)} kits with vision models")
    print(f"✓ Images cached in: {VisionModelConfig.IMAGE_CACHE_DIR}")
    print(f"✓ Results saved to: {output_file}")


if __name__ == "__main__":
    main()
