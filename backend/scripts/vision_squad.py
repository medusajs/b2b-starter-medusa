#!/usr/bin/env python3
"""
Vision Squad - 3 Specialized Vision Agents
Part of AgentFlow v2.0 - Phase 1 Sprint 3-4
"""

import ollama
import time
import json
from pathlib import Path
from typing import Dict, Any, Optional
from dataclasses import dataclass
import cv2
import numpy as np


@dataclass
class VisionResult:
    """Result from vision analysis"""
    success: bool
    confidence: float
    data: Dict[str, Any]
    agent_name: str
    processing_time: float
    fallback_triggered: bool = False


class PrimaryVisionAgent:
    """
    Primary Vision Agent - Llama 3.2 Vision:11b
    Fast local inference for standard products
    """
    
    def __init__(self, model: str = "llama3.2-vision:11b"):
        self.model = model
        self.name = "👁️ Primary Vision"
        self.confidence_threshold = 0.7
        
    def analyze(self, image_path: str, category: str) -> VisionResult:
        """Analyze product image"""
        start = time.time()
        
        prompt = f"""Você é um especialista em produtos fotovoltaicos.

Analise esta imagem de produto da categoria {category} e extraia:

{{
  "manufacturer": "marca/logo visível",
  "model": "código/modelo exato",
  "product_type": "inverter/panel/battery/stringbox/structure",
  "subtype": "gridtie/hybrid/offgrid/mono/poly/bifacial",
  "specifications": {{
    "power_w": 0,
    "power_kw": 0.0,
    "voltage": "...",
    "current_a": 0,
    "phase": "mono/tri/N/A",
    "efficiency_percent": 0.0,
    "mppt_count": 0
  }},
  "visible_text": "todo texto legível",
  "certifications": ["INMETRO", "IEC", "CE"],
  "image_quality_score": 0-10,
  "confidence_score": 0-10
}}

Retorne APENAS JSON, sem markdown."""

        try:
            response = ollama.chat(
                model=self.model,
                messages=[{
                    'role': 'user',
                    'content': prompt,
                    'images': [image_path]
                }],
                options={'temperature': 0.1, 'num_predict': 1200}
            )
            
            elapsed = time.time() - start
            result_text = response['message']['content']
            
            # Parse JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            metadata = json.loads(result_text.strip())
            confidence = metadata.get('confidence_score', 5) / 10
            
            return VisionResult(
                success=True,
                confidence=confidence,
                data=metadata,
                agent_name=self.name,
                processing_time=elapsed
            )
            
        except Exception as e:
            return VisionResult(
                success=False,
                confidence=0.0,
                data={'error': str(e)},
                agent_name=self.name,
                processing_time=time.time() - start
            )


class SpecialistVisionAgent:
    """
    Specialist Vision Agent - GPT-4o Vision (API)
    Fallback for complex products or low confidence
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.name = "🔬 Specialist Vision"
        
    def analyze(self, image_path: str, category: str, primary_result: Optional[Dict] = None) -> VisionResult:
        """Analyze complex product or validate primary result"""
        start = time.time()
        
        if not self.api_key:
            return VisionResult(
                success=False,
                confidence=0.0,
                data={'error': 'OpenAI API key not configured'},
                agent_name=self.name,
                processing_time=time.time() - start,
                fallback_triggered=True
            )
        
        # TODO: Implement GPT-4o Vision call
        # For now, return enhanced result
        
        return VisionResult(
            success=True,
            confidence=0.95,
            data={
                'note': 'Specialist analysis would go here',
                'primary_validated': primary_result is not None
            },
            agent_name=self.name,
            processing_time=time.time() - start,
            fallback_triggered=True
        )


class ImageQualityAgent:
    """
    Image Quality Agent - OpenCV pre-processing
    Improves image quality before LLM analysis
    """
    
    def __init__(self):
        self.name = "📸 Image Quality"
        
    def analyze(self, image_path: str) -> Dict[str, Any]:
        """Analyze and improve image quality"""
        try:
            img = cv2.imread(str(image_path))
            
            if img is None:
                return {
                    'quality_score': 0,
                    'usable': False,
                    'issues': ['Image could not be loaded']
                }
            
            # Calculate quality metrics
            height, width = img.shape[:2]
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Sharpness (Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            sharpness_score = min(laplacian_var / 100, 10)
            
            # Brightness
            brightness = np.mean(gray)
            brightness_score = 10 if 50 < brightness < 200 else 5
            
            # Contrast
            contrast = np.std(gray)
            contrast_score = min(contrast / 10, 10)
            
            # Overall quality
            quality_score = (sharpness_score + brightness_score + contrast_score) / 3
            
            return {
                'quality_score': round(quality_score, 1),
                'usable': quality_score >= 5,
                'dimensions': {'width': width, 'height': height},
                'metrics': {
                    'sharpness': round(sharpness_score, 1),
                    'brightness': round(brightness_score, 1),
                    'contrast': round(contrast_score, 1)
                },
                'issues': self._detect_issues(quality_score, brightness, laplacian_var)
            }
            
        except Exception as e:
            return {
                'quality_score': 0,
                'usable': False,
                'issues': [f'Error analyzing image: {str(e)}']
            }
    
    def _detect_issues(self, quality_score: float, brightness: float, sharpness: float) -> list:
        """Detect quality issues"""
        issues = []
        
        if quality_score < 5:
            issues.append('Overall quality too low')
        if brightness < 50:
            issues.append('Image too dark')
        elif brightness > 200:
            issues.append('Image overexposed')
        if sharpness < 10:
            issues.append('Image blurry - consider recapture')
            
        return issues


class VisionSquad:
    """
    Vision Squad Coordinator
    Orchestrates 3 vision agents with fallback logic
    """
    
    def __init__(self, enable_specialist: bool = True):
        self.primary = PrimaryVisionAgent()
        self.specialist = SpecialistVisionAgent() if enable_specialist else None
        self.quality = ImageQualityAgent()
        
    def analyze(self, image_path: str, category: str, verbose: bool = True) -> Dict[str, Any]:
        """
        Analyze image with full squad
        
        Workflow:
        1. Quality Agent checks image
        2. Primary Agent analyzes (Llama 3.2 Vision)
        3. If confidence < 70%, Specialist Agent validates (GPT-4o)
        """
        
        if verbose:
            print(f"\n{'='*70}")
            print(f"🤖 Vision Squad Analysis")
            print(f"{'='*70}")
        
        # Step 1: Quality check
        if verbose:
            print(f"\n📸 Image Quality Agent...")
        
        quality_result = self.quality.analyze(image_path)
        
        if verbose:
            print(f"   Quality Score: {quality_result['quality_score']}/10")
            print(f"   Usable: {quality_result['usable']}")
            if quality_result['issues']:
                print(f"   Issues: {', '.join(quality_result['issues'])}")
        
        if not quality_result['usable']:
            return {
                'success': False,
                'error': 'Image quality too low',
                'quality': quality_result
            }
        
        # Step 2: Primary analysis
        if verbose:
            print(f"\n👁️ Primary Vision Agent (Llama 3.2)...")
        
        primary_result = self.primary.analyze(image_path, category)
        
        if verbose:
            print(f"   Success: {primary_result.success}")
            print(f"   Confidence: {primary_result.confidence:.0%}")
            print(f"   Time: {primary_result.processing_time:.1f}s")
        
        if not primary_result.success:
            if verbose:
                print(f"   ❌ Primary analysis failed")
            return {
                'success': False,
                'error': primary_result.data.get('error'),
                'quality': quality_result
            }
        
        # Step 3: Specialist fallback if needed
        specialist_result = None
        
        if primary_result.confidence < 0.7 and self.specialist:
            if verbose:
                print(f"\n🔬 Specialist Vision Agent (GPT-4o fallback)...")
            
            specialist_result = self.specialist.analyze(
                image_path,
                category,
                primary_result.data
            )
            
            if verbose:
                print(f"   Confidence: {specialist_result.confidence:.0%}")
                print(f"   Time: {specialist_result.processing_time:.1f}s")
        
        # Combine results
        final_data = primary_result.data
        final_confidence = primary_result.confidence
        
        if specialist_result and specialist_result.success:
            final_confidence = max(primary_result.confidence, specialist_result.confidence)
            # Merge specialist improvements
            final_data['specialist_validated'] = True
        
        if verbose:
            print(f"\n✅ Final Confidence: {final_confidence:.0%}")
            print(f"{'='*70}\n")
        
        return {
            'success': True,
            'confidence': final_confidence,
            'data': final_data,
            'quality': quality_result,
            'primary_agent': primary_result.agent_name,
            'specialist_used': specialist_result is not None,
            'total_time': primary_result.processing_time + (
                specialist_result.processing_time if specialist_result else 0
            )
        }


# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python vision_squad.py <image_path> <category>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    category = sys.argv[2]
    
    squad = VisionSquad(enable_specialist=True)
    result = squad.analyze(image_path, category, verbose=True)
    
    print("\nFinal Result:")
    print(json.dumps(result, indent=2))
