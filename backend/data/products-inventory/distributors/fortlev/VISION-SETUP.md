# Vision AI Setup Guide - YSH Kit Processor

## Overview

Integration of **Gemma3** and **GPT OSS 20B** models for automated extraction of solar component specifications from kit images.

## Architecture

### Models Used

1. **Gemma3** (Google): Visual analysis of solar panels and inverters
   - Component identification
   - Technical specification extraction
   - Manufacturer/model recognition

2. **GPT OSS 20B**: OCR text extraction
   - Label reading
   - Model number extraction
   - Specification parsing

### Processing Pipeline

```
Kit JSON → Download Images → Gemma3 Vision Analysis → GPT OSS OCR → Enhanced JSON
```

## Prerequisites

### 1. Install Python Dependencies

```bash
pip install pillow requests
```

### 2. Deploy Gemma3 (Ollama)

**Option A: Local Deployment**

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull Gemma3 model
ollama pull gemma3:latest

# Verify running on http://localhost:11434
ollama list
```

**Option B: Docker Deployment**

```bash
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull gemma3:latest
```

### 3. Deploy GPT OSS 20B

**Using llama.cpp or text-generation-webui**

```bash
# Clone llama.cpp
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
make

# Download GPT OSS 20B model (GGUF format)
# Place in models/ directory

# Run server
./server -m models/gpt-oss-20b.gguf --port 8080 --host 0.0.0.0
```

**Using text-generation-webui**

```bash
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
pip install -r requirements.txt

# Place model in models/
python server.py --model gpt-oss-20b --api --port 8080
```

## Configuration

### Environment Variables

Create `.env` file in `fortlev/` directory:

```env
# Gemma3 Configuration
GEMMA3_ENDPOINT=http://localhost:11434/api/generate
GEMMA3_MODEL=gemma3:latest

# GPT OSS 20B Configuration
GPT_OSS_ENDPOINT=http://localhost:8080/v1/chat/completions
GPT_OSS_MODEL=gpt-oss-20b

# Image Processing
IMAGE_CACHE_DIR=./cache/images
PROCESSED_DIR=./processed/kits
```

### Remote Deployment (Optional)

If models are deployed on separate servers:

```env
GEMMA3_ENDPOINT=http://192.168.1.100:11434/api/generate
GPT_OSS_ENDPOINT=http://192.168.1.101:8080/v1/chat/completions
```

## Usage

### Process All Kits

```bash
cd products-inventory/distributors/fortlev
python vision_processor.py
```

### Process Specific Kit (Custom Script)

```python
from vision_processor import KitVisionProcessor
from pathlib import Path
import json

processor = KitVisionProcessor()

# Load single kit
with open('fortlev-kits.json') as f:
    kits = json.load(f)

# Process first kit
enhanced_kit = processor.process_kit(kits[0])

# Save
with open('test-output.json', 'w') as f:
    json.dump(enhanced_kit, f, indent=2)
```

## Output Format

### Enhanced Kit Structure

```json
{
  "id": "kit-longi-growatt-6",
  "name": "Kit Fotovoltaico 6,50kWp - Longi + Growatt",
  "components": {
    "panel": {
      "id": "longi-hi-mo-6-explorer-lr5-72hph-530m",
      "manufacturer": "Longi",
      "image": "https://prod-platform-api.s3.amazonaws.com/...",
      "vision_analysis": {
        "gemma3": {
          "manufacturer": "LONGi Solar",
          "model": "Hi-MO 6 Explorer LR5-72HPH-530M",
          "power_w": 530,
          "technology": "monocrystalline",
          "cells": "144 half-cut",
          "additional_specs": {
            "efficiency": "21.3%",
            "dimensions": "2278x1134x30mm"
          }
        },
        "gpt_oss_ocr": {
          "power_w": 530,
          "model": "LR5-72HPH-530M"
        },
        "raw_ocr_text": "LONGi Hi-MO 6 Explorer 530W..."
      }
    },
    "inverter": {
      "id": "growatt-mic-3000tl-x",
      "manufacturer": "Growatt",
      "image": "https://prod-platform-api.s3.amazonaws.com/...",
      "vision_analysis": {
        "gemma3": {
          "manufacturer": "Growatt",
          "model": "MIC-3000TL-X",
          "power_kw": 3.0,
          "type": "microinverter",
          "voltage": "220V",
          "mppt": 1,
          "additional_specs": {
            "max_dc_input": "60V",
            "efficiency": "96.5%"
          }
        },
        "gpt_oss_ocr": {
          "power_kw": 3.0,
          "voltage": "220V"
        },
        "raw_ocr_text": "Growatt MIC-3000TL-X 3kW..."
      }
    }
  }
}
```

## Resolving Unknown Manufacturers

The vision processor enhances kits with unknown components:

**Before Vision Processing:**

```json
{
  "panel": {
    "manufacturer": "Unknown",
    "id": "panel-unknown-123"
  }
}
```

**After Vision Processing:**

```json
{
  "panel": {
    "manufacturer": "Unknown",
    "id": "panel-unknown-123",
    "vision_analysis": {
      "gemma3": {
        "manufacturer": "Canadian Solar",
        "model": "CS6R-400MS"
      }
    }
  }
}
```

### Post-Processing Script

Create `merge_vision_data.py` to update original manufacturers:

```python
import json

with open('fortlev-kits-enhanced.json') as f:
    enhanced = json.load(f)

for kit in enhanced:
    # Update panel manufacturer
    panel_vision = kit['components']['panel'].get('vision_analysis', {})
    gemma_panel = panel_vision.get('gemma3', {})
    if gemma_panel.get('manufacturer'):
        kit['components']['panel']['manufacturer'] = gemma_panel['manufacturer']
    
    # Update inverter manufacturer
    inv_vision = kit['components']['inverter'].get('vision_analysis', {})
    gemma_inv = inv_vision.get('gemma3', {})
    if gemma_inv.get('manufacturer'):
        kit['components']['inverter']['manufacturer'] = gemma_inv['manufacturer']

with open('fortlev-kits-final.json', 'w') as f:
    json.dump(enhanced, f, indent=2)
```

## Performance Considerations

### Processing Time

- **Gemma3**: ~2-5 seconds per image
- **GPT OSS OCR**: ~3-7 seconds per image
- **Total per kit**: ~10-24 seconds (2 images)
- **217 kits**: ~36-87 minutes

### Optimization Strategies

1. **Batch Processing**: Process multiple images in parallel
2. **Image Caching**: Reuse downloaded images
3. **GPU Acceleration**: Use CUDA for model inference
4. **Selective Processing**: Only process "Unknown" manufacturers

### Parallel Processing Example

```python
from concurrent.futures import ThreadPoolExecutor

def process_batch(kits, max_workers=4):
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(processor.process_kit, kit) for kit in kits]
        return [f.result() for f in futures]
```

## Troubleshooting

### Gemma3 Connection Failed

```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
systemctl restart ollama  # Linux
# or
brew services restart ollama  # macOS
```

### GPT OSS Not Responding

```bash
# Check server logs
tail -f text-generation-webui/server.log

# Verify endpoint
curl http://localhost:8080/v1/models
```

### Image Download Timeouts

Increase timeout in `vision_processor.py`:

```python
response = requests.get(url, timeout=60)  # Default 30
```

### Memory Issues

Reduce image size in `Gemma3VisionAnalyzer`:

```python
max_size = (640, 640)  # Default (800, 800)
```

## Next Steps

1. **Run Vision Processing**:

   ```bash
   python vision_processor.py
   ```

2. **Validate Results**:
   - Check `fortlev-kits-enhanced.json`
   - Review `cache/images/` for downloaded images
   - Verify manufacturer extraction accuracy

3. **Merge Back to Original**:

   ```bash
   python merge_vision_data.py
   ```

4. **Update Medusa Inventory**:
   - Import enhanced kits to vector store
   - Populate product variant metadata
   - Link to sales channels

## References

- [Ollama Documentation](https://github.com/ollama/ollama)
- [llama.cpp Server](https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md)
- [text-generation-webui API](https://github.com/oobabooga/text-generation-webui/wiki/12-%E2%80%90-OpenAI-API)
- [Gemma Model Card](https://ai.google.dev/gemma)

---

**Created**: 2025-01-22  
**Version**: 1.0  
**Maintainer**: YSH Development Team
