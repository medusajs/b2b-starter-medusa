#!/usr/bin/env python3
"""
Test vision models connectivity and basic functionality.
Run this before processing full kit dataset.
"""

import os
import sys
import json
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO
import base64


def test_gemma3_connection():
    """Test Gemma3 (Ollama) connectivity."""
    print("Testing Gemma3 connection...")
    
    endpoint = os.getenv("GEMMA3_ENDPOINT", "http://localhost:11434/api/generate")
    
    try:
        # Test basic endpoint
        response = requests.get(endpoint.replace('/api/generate', '/api/tags'), timeout=5)
        response.raise_for_status()
        print("✓ Gemma3 (Ollama) is running")
        
        # List available models
        models = response.json().get('models', [])
        print(f"  Available models: {[m['name'] for m in models]}")
        
        return True
    except Exception as e:
        print(f"✗ Gemma3 connection failed: {e}")
        return False


def test_gpt_oss_connection():
    """Test GPT OSS 20B connectivity."""
    print("\nTesting GPT OSS connection...")
    
    endpoint = os.getenv("GPT_OSS_ENDPOINT", "http://localhost:8080/v1/chat/completions")
    
    try:
        # Test models endpoint
        models_url = endpoint.replace('/v1/chat/completions', '/v1/models')
        response = requests.get(models_url, timeout=5)
        response.raise_for_status()
        print("✓ GPT OSS 20B is running")
        
        # List available models
        models = response.json().get('data', [])
        print(f"  Available models: {[m['id'] for m in models]}")
        
        return True
    except Exception as e:
        print(f"✗ GPT OSS connection failed: {e}")
        return False


def test_image_download():
    """Test image download from S3."""
    print("\nTesting image download...")
    
    # Use a real FortLev image URL from kits
    test_url = "https://prod-platform-api.s3.amazonaws.com/uploads/products/1734526652-painel-longi-hi-mo-6-explorer-lr5-72hph-530m-imagem-04.png"
    
    try:
        response = requests.get(test_url, timeout=10)
        response.raise_for_status()
        
        # Try to open as image
        img = Image.open(BytesIO(response.content))
        print(f"✓ Image downloaded successfully")
        print(f"  Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
        
        return True
    except Exception as e:
        print(f"✗ Image download failed: {e}")
        return False


def test_gemma3_vision(test_image_path: Path = None):
    """Test Gemma3 vision analysis with sample image."""
    print("\nTesting Gemma3 vision analysis...")
    
    if not test_image_path or not test_image_path.exists():
        print("  Skipping (no test image)")
        return None
    
    endpoint = os.getenv("GEMMA3_ENDPOINT", "http://localhost:11434/api/generate")
    model = os.getenv("GEMMA3_MODEL", "gemma3:latest")
    
    try:
        # Load and encode image
        with Image.open(test_image_path) as img:
            img.thumbnail((800, 800))
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Test prompt
        payload = {
            "model": model,
            "prompt": "Describe this image in one sentence.",
            "images": [img_base64],
            "stream": False
        }
        
        print(f"  Calling {endpoint}...")
        response = requests.post(endpoint, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        analysis = result.get('response', '')
        print(f"✓ Gemma3 vision working")
        print(f"  Response: {analysis[:100]}...")
        
        return True
    except Exception as e:
        print(f"✗ Gemma3 vision test failed: {e}")
        return False


def test_gpt_oss_ocr(test_image_path: Path = None):
    """Test GPT OSS OCR with sample image."""
    print("\nTesting GPT OSS OCR...")
    
    if not test_image_path or not test_image_path.exists():
        print("  Skipping (no test image)")
        return None
    
    endpoint = os.getenv("GPT_OSS_ENDPOINT", "http://localhost:8080/v1/chat/completions")
    model = os.getenv("GPT_OSS_MODEL", "gpt-oss-20b")
    
    try:
        # Load and encode image
        with open(test_image_path, 'rb') as f:
            img_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        # Test prompt
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract any visible text from this image."
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
            "max_tokens": 500
        }
        
        print(f"  Calling {endpoint}...")
        response = requests.post(endpoint, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        ocr_text = result['choices'][0]['message']['content']
        print(f"✓ GPT OSS OCR working")
        print(f"  Extracted: {ocr_text[:100]}...")
        
        return True
    except Exception as e:
        print(f"✗ GPT OSS OCR test failed: {e}")
        return False


def main():
    """Run all tests."""
    print("=== YSH Vision Models Test Suite ===\n")
    
    # Check environment
    print("Environment Configuration:")
    print(f"  GEMMA3_ENDPOINT: {os.getenv('GEMMA3_ENDPOINT', 'http://localhost:11434/api/generate')}")
    print(f"  GPT_OSS_ENDPOINT: {os.getenv('GPT_OSS_ENDPOINT', 'http://localhost:8080/v1/chat/completions')}")
    print()
    
    # Run connectivity tests
    gemma3_ok = test_gemma3_connection()
    gpt_oss_ok = test_gpt_oss_connection()
    image_ok = test_image_download()
    
    # Find test image in cache (if available)
    cache_dir = Path(__file__).parent / "cache" / "images"
    test_image = None
    if cache_dir.exists():
        images = list(cache_dir.glob("*.png")) + list(cache_dir.glob("*.jpg"))
        if images:
            test_image = images[0]
            print(f"\nFound test image: {test_image.name}")
    
    # Run vision tests if models are available
    if gemma3_ok and test_image:
        test_gemma3_vision(test_image)
    
    if gpt_oss_ok and test_image:
        test_gpt_oss_ocr(test_image)
    
    # Summary
    print("\n=== Test Summary ===")
    print(f"Gemma3 Connection: {'✓ PASS' if gemma3_ok else '✗ FAIL'}")
    print(f"GPT OSS Connection: {'✓ PASS' if gpt_oss_ok else '✗ FAIL'}")
    print(f"Image Download: {'✓ PASS' if image_ok else '✗ FAIL'}")
    
    if not (gemma3_ok and gpt_oss_ok):
        print("\n⚠ Some services are not available.")
        print("Please check VISION-SETUP.md for installation instructions.")
        sys.exit(1)
    else:
        print("\n✓ All systems ready for vision processing!")
        sys.exit(0)


if __name__ == "__main__":
    main()
