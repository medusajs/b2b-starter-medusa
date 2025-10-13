#!/usr/bin/env python3
"""
🖼️ Product Image Quality Enhancement & Optimization Script

Usa as bibliotecas mais performáticas para:
- Aumentar qualidade visual (sharpening, denoise, upscaling)
- Otimizar tamanho de arquivo
- Converter para formatos modernos (WebP, AVIF)
- Processar em lote com multiprocessing

Bibliotecas utilizadas:
- Pillow-SIMD (fork otimizado da Pillow)
- opencv-python (cv2) - Processamento avançado
- scikit-image - Algoritmos de qualidade
- numpy - Operações vetorizadas
- joblib - Paralelização eficiente

Uso:
    python scripts/optimize-product-images.py --input static/images-catálogo_distribuidores \
                                               --output static/images-optimized \
                                               --quality high \
                                               --format webp \
                                               --workers 4
"""

import os
import sys
import argparse
import json
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from concurrent.futures import ProcessPoolExecutor, as_completed

try:
    from PIL import Image, ImageEnhance, ImageFilter
    import numpy as np
    import cv2
    from skimage import exposure, restoration
    from joblib import Parallel, delayed
except ImportError as e:
    print("❌ Dependências não encontradas. Instale com:")
    print("   pip install Pillow opencv-python scikit-image numpy joblib")
    print(f"   Erro: {e}")
    sys.exit(1)

# ============================================================================
# CONFIGURAÇÕES
# ============================================================================

@dataclass
class ImageConfig:
    """Configuração de processamento"""
    # Qualidade
    quality_preset: str = "high"  # low, medium, high, ultra
    sharpen_amount: float = 1.5
    denoise_strength: int = 10
    enhance_contrast: bool = True
    enhance_colors: bool = True
    
    # Upscaling
    upscale_factor: Optional[float] = None  # 1.5, 2.0, etc
    upscale_method: str = "lanczos"  # lanczos, cubic, edsr
    
    # Formato de saída
    output_format: str = "webp"  # webp, avif, jpg, png
    webp_quality: int = 85
    jpeg_quality: int = 90
    png_compression: int = 6
    
    # Performance
    max_workers: int = 4
    batch_size: int = 50
    
    # Dimensões
    max_width: int = 2048
    max_height: int = 2048
    generate_thumbnails: bool = True
    thumbnail_size: Tuple[int, int] = (400, 400)
    
    def __post_init__(self):
        """Ajusta parâmetros baseado no preset"""
        presets = {
            "low": {
                "sharpen_amount": 1.0,
                "denoise_strength": 5,
                "webp_quality": 75,
                "jpeg_quality": 80,
            },
            "medium": {
                "sharpen_amount": 1.3,
                "denoise_strength": 8,
                "webp_quality": 80,
                "jpeg_quality": 85,
            },
            "high": {
                "sharpen_amount": 1.5,
                "denoise_strength": 10,
                "webp_quality": 85,
                "jpeg_quality": 90,
            },
            "ultra": {
                "sharpen_amount": 2.0,
                "denoise_strength": 15,
                "webp_quality": 95,
                "jpeg_quality": 95,
            }
        }
        
        if self.quality_preset in presets:
            preset = presets[self.quality_preset]
            for key, value in preset.items():
                setattr(self, key, value)


@dataclass
class ProcessingResult:
    """Resultado do processamento de uma imagem"""
    input_path: str
    output_path: str
    success: bool
    original_size_bytes: int
    optimized_size_bytes: int
    compression_ratio: float
    processing_time_ms: float
    width: int
    height: int
    format: str
    error: Optional[str] = None


# ============================================================================
# FUNÇÕES DE PROCESSAMENTO DE IMAGEM
# ============================================================================

def load_image(image_path: str) -> Optional[np.ndarray]:
    """
    Carrega imagem usando cv2 (mais rápido que PIL para grandes imagens)
    """
    try:
        # cv2 carrega em BGR, converter para RGB
        img = cv2.imread(image_path)
        if img is None:
            return None
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    except Exception as e:
        print(f"❌ Erro ao carregar {image_path}: {e}")
        return None


def denoise_image(img: np.ndarray, strength: int = 10) -> np.ndarray:
    """
    Remove ruído da imagem usando Non-local Means Denoising
    Algoritmo muito eficiente que preserva bordas
    """
    if strength <= 0:
        return img
    
    # cv2.fastNlMeansDenoisingColored é otimizado com CUDA se disponível
    return cv2.fastNlMeansDenoisingColored(
        img,
        None,
        h=strength,
        hColor=strength,
        templateWindowSize=7,
        searchWindowSize=21
    )


def sharpen_image(img: np.ndarray, amount: float = 1.5) -> np.ndarray:
    """
    Aplica sharpening usando Unsharp Mask
    Algoritmo que preserva melhor detalhes que outros métodos
    """
    if amount <= 0:
        return img
    
    # Gaussian blur para criar máscara
    gaussian = cv2.GaussianBlur(img, (0, 0), 2.0)
    
    # Unsharp mask: original + amount * (original - gaussian)
    sharpened = cv2.addWeighted(img, 1.0 + amount, gaussian, -amount, 0)
    
    return np.clip(sharpened, 0, 255).astype(np.uint8)


def enhance_contrast_adaptive(img: np.ndarray) -> np.ndarray:
    """
    Melhora contraste usando CLAHE (Contrast Limited Adaptive Histogram Equalization)
    Muito superior ao histogram equalization tradicional
    """
    # Converter para LAB (melhor para contraste)
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    # Aplicar CLAHE apenas no canal L (luminosidade)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    
    # Recombinar canais
    enhanced_lab = cv2.merge([l_enhanced, a, b])
    
    return cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)


def enhance_colors(img: np.ndarray, saturation_boost: float = 1.2) -> np.ndarray:
    """
    Melhora saturação de cores de forma natural
    """
    if saturation_boost <= 1.0:
        return img
    
    # Converter para HSV
    hsv = cv2.cvtColor(img, cv2.COLOR_RGB2HSV).astype(np.float32)
    
    # Aumentar saturação (canal S)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * saturation_boost, 0, 255)
    
    # Converter de volta
    hsv = hsv.astype(np.uint8)
    return cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)


def upscale_image(img: np.ndarray, factor: float, method: str = "lanczos") -> np.ndarray:
    """
    Upscaling de imagem com diferentes métodos
    """
    if factor <= 1.0:
        return img
    
    height, width = img.shape[:2]
    new_width = int(width * factor)
    new_height = int(height * factor)
    
    if method == "lanczos":
        # Lanczos - melhor qualidade para upscaling
        return cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
    
    elif method == "cubic":
        # Cubic - bom balanço velocidade/qualidade
        return cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_CUBIC)
    
    elif method == "edsr":
        # EDSR (Enhanced Deep Super-Resolution) - melhor mas mais lento
        # Requer modelo pré-treinado
        try:
            sr = cv2.dnn_superres.DnnSuperResImpl_create()
            sr.readModel("models/EDSR_x2.pb")  # Baixar modelo separadamente
            sr.setModel("edsr", 2)
            return sr.upsample(img)
        except:
            # Fallback para lanczos se modelo não disponível
            return cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
    
    return img


def resize_if_needed(img: np.ndarray, max_width: int, max_height: int) -> np.ndarray:
    """
    Redimensiona imagem se exceder dimensões máximas
    """
    height, width = img.shape[:2]
    
    if width <= max_width and height <= max_height:
        return img
    
    # Calcular novo tamanho mantendo aspect ratio
    ratio = min(max_width / width, max_height / height)
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    
    return cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)


def process_image_quality(
    img: np.ndarray,
    config: ImageConfig
) -> np.ndarray:
    """
    Pipeline completo de melhoria de qualidade
    """
    # 1. Denoise (remover ruído)
    if config.denoise_strength > 0:
        img = denoise_image(img, config.denoise_strength)
    
    # 2. Upscale (se configurado)
    if config.upscale_factor and config.upscale_factor > 1.0:
        img = upscale_image(img, config.upscale_factor, config.upscale_method)
    
    # 3. Enhance contrast
    if config.enhance_contrast:
        img = enhance_contrast_adaptive(img)
    
    # 4. Enhance colors
    if config.enhance_colors:
        img = enhance_colors(img, saturation_boost=1.15)
    
    # 5. Sharpen (último passo)
    if config.sharpen_amount > 0:
        img = sharpen_image(img, config.sharpen_amount)
    
    # 6. Resize se necessário
    img = resize_if_needed(img, config.max_width, config.max_height)
    
    return img


def save_optimized_image(
    img: np.ndarray,
    output_path: str,
    config: ImageConfig
) -> int:
    """
    Salva imagem otimizada no formato especificado
    Retorna tamanho do arquivo em bytes
    """
    # Converter numpy array para PIL Image para salvar
    pil_img = Image.fromarray(img)
    
    # Criar diretório se não existir
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Salvar baseado no formato
    if config.output_format == "webp":
        pil_img.save(
            output_path,
            "WEBP",
            quality=config.webp_quality,
            method=6,  # 0-6, 6 é o mais lento mas melhor compressão
            lossless=False
        )
    
    elif config.output_format == "avif":
        # AVIF - formato moderno com melhor compressão que WebP
        # Requer pillow-avif-plugin
        try:
            pil_img.save(
                output_path,
                "AVIF",
                quality=config.webp_quality,
                speed=4  # 0-10, menor = melhor qualidade mas mais lento
            )
        except Exception as e:
            print(f"⚠️ AVIF não suportado, usando WebP: {e}")
            output_path = output_path.replace(".avif", ".webp")
            pil_img.save(output_path, "WEBP", quality=config.webp_quality)
    
    elif config.output_format == "jpg" or config.output_format == "jpeg":
        pil_img.save(
            output_path,
            "JPEG",
            quality=config.jpeg_quality,
            optimize=True,
            progressive=True
        )
    
    elif config.output_format == "png":
        pil_img.save(
            output_path,
            "PNG",
            compress_level=config.png_compression,
            optimize=True
        )
    
    return os.path.getsize(output_path)


def create_thumbnail(
    img: np.ndarray,
    thumbnail_path: str,
    size: Tuple[int, int],
    config: ImageConfig
) -> None:
    """
    Cria thumbnail otimizada
    """
    # Calcular dimensões mantendo aspect ratio
    height, width = img.shape[:2]
    thumb_width, thumb_height = size
    
    ratio = min(thumb_width / width, thumb_height / height)
    new_width = int(width * ratio)
    new_height = int(height * ratio)
    
    # Resize com alta qualidade
    thumbnail = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)
    
    # Salvar
    save_optimized_image(thumbnail, thumbnail_path, config)


# ============================================================================
# PROCESSAMENTO EM LOTE
# ============================================================================

def process_single_image(
    input_path: str,
    output_dir: str,
    config: ImageConfig
) -> ProcessingResult:
    """
    Processa uma única imagem
    """
    start_time = time.time()
    
    try:
        # Get original file size
        original_size = os.path.getsize(input_path)
        
        # Load image
        img = load_image(input_path)
        if img is None:
            return ProcessingResult(
                input_path=input_path,
                output_path="",
                success=False,
                original_size_bytes=original_size,
                optimized_size_bytes=0,
                compression_ratio=0,
                processing_time_ms=0,
                width=0,
                height=0,
                format="",
                error="Failed to load image"
            )
        
        # Process image quality
        processed_img = process_image_quality(img, config)
        
        # Generate output path
        input_filename = Path(input_path).stem
        output_filename = f"{input_filename}.{config.output_format}"
        output_path = os.path.join(output_dir, output_filename)
        
        # Save optimized image
        optimized_size = save_optimized_image(processed_img, output_path, config)
        
        # Create thumbnail if enabled
        if config.generate_thumbnails:
            thumbnail_filename = f"{input_filename}-thumb.{config.output_format}"
            thumbnail_path = os.path.join(output_dir, "thumbnails", thumbnail_filename)
            create_thumbnail(processed_img, thumbnail_path, config.thumbnail_size, config)
        
        # Calculate metrics
        processing_time = (time.time() - start_time) * 1000  # ms
        compression_ratio = (1 - optimized_size / original_size) * 100
        height, width = processed_img.shape[:2]
        
        return ProcessingResult(
            input_path=input_path,
            output_path=output_path,
            success=True,
            original_size_bytes=original_size,
            optimized_size_bytes=optimized_size,
            compression_ratio=compression_ratio,
            processing_time_ms=processing_time,
            width=width,
            height=height,
            format=config.output_format,
            error=None
        )
    
    except Exception as e:
        return ProcessingResult(
            input_path=input_path,
            output_path="",
            success=False,
            original_size_bytes=0,
            optimized_size_bytes=0,
            compression_ratio=0,
            processing_time_ms=0,
            width=0,
            height=0,
            format="",
            error=str(e)
        )


def find_images(input_dir: str, extensions: List[str] = None) -> List[str]:
    """
    Encontra todas as imagens no diretório
    """
    if extensions is None:
        extensions = [".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"]
    
    image_paths = []
    
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if any(file.lower().endswith(ext) for ext in extensions):
                image_paths.append(os.path.join(root, file))
    
    return image_paths


def process_batch(
    image_paths: List[str],
    output_dir: str,
    config: ImageConfig
) -> List[ProcessingResult]:
    """
    Processa lote de imagens em paralelo
    """
    print(f"\n🖼️  Processando {len(image_paths)} imagens...")
    print(f"⚙️  Usando {config.max_workers} workers")
    print(f"📊 Qualidade: {config.quality_preset}")
    print(f"📦 Formato: {config.output_format}")
    
    results = []
    
    # Processar em paralelo usando ProcessPoolExecutor
    with ProcessPoolExecutor(max_workers=config.max_workers) as executor:
        futures = {
            executor.submit(process_single_image, img_path, output_dir, config): img_path
            for img_path in image_paths
        }
        
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            results.append(result)
            
            # Progress bar
            percent = (i / len(image_paths)) * 100
            status = "✅" if result.success else "❌"
            print(f"\r{status} Progresso: {i}/{len(image_paths)} ({percent:.1f}%)", end="", flush=True)
    
    print("\n")
    return results


# ============================================================================
# RELATÓRIO E ESTATÍSTICAS
# ============================================================================

def generate_report(results: List[ProcessingResult], output_dir: str) -> None:
    """
    Gera relatório de processamento
    """
    successful = [r for r in results if r.success]
    failed = [r for r in results if not r.success]
    
    if not successful:
        print("\n❌ Nenhuma imagem foi processada com sucesso")
        return
    
    # Estatísticas
    total_original_size = sum(r.original_size_bytes for r in successful)
    total_optimized_size = sum(r.optimized_size_bytes for r in successful)
    avg_compression = sum(r.compression_ratio for r in successful) / len(successful)
    avg_processing_time = sum(r.processing_time_ms for r in successful) / len(successful)
    total_time = sum(r.processing_time_ms for r in successful) / 1000  # seconds
    
    # Relatório console
    print("\n" + "=" * 80)
    print("📊 RELATÓRIO DE PROCESSAMENTO")
    print("=" * 80)
    print(f"\n✅ Sucesso: {len(successful)} imagens")
    print(f"❌ Falhas: {len(failed)} imagens")
    print(f"\n📦 Tamanho Original Total: {total_original_size / 1_000_000:.2f} MB")
    print(f"📦 Tamanho Otimizado Total: {total_optimized_size / 1_000_000:.2f} MB")
    print(f"💾 Economia: {(total_original_size - total_optimized_size) / 1_000_000:.2f} MB ({avg_compression:.1f}%)")
    print(f"\n⏱️  Tempo Médio por Imagem: {avg_processing_time:.0f}ms")
    print(f"⏱️  Tempo Total: {total_time:.1f}s")
    print(f"🚀 Throughput: {len(successful) / total_time:.1f} imagens/segundo")
    
    if failed:
        print(f"\n❌ Imagens com erro:")
        for result in failed[:10]:  # Mostrar apenas primeiras 10
            print(f"   - {Path(result.input_path).name}: {result.error}")
        if len(failed) > 10:
            print(f"   ... e mais {len(failed) - 10} erros")
    
    # Salvar relatório JSON
    report_path = os.path.join(output_dir, "processing-report.json")
    report_data = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_images": len(results),
            "successful": len(successful),
            "failed": len(failed),
            "total_original_size_mb": total_original_size / 1_000_000,
            "total_optimized_size_mb": total_optimized_size / 1_000_000,
            "savings_mb": (total_original_size - total_optimized_size) / 1_000_000,
            "avg_compression_ratio": avg_compression,
            "avg_processing_time_ms": avg_processing_time,
            "total_time_seconds": total_time,
            "throughput_images_per_second": len(successful) / total_time if total_time > 0 else 0
        },
        "results": [asdict(r) for r in results]
    }
    
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Relatório salvo em: {report_path}")
    print("=" * 80 + "\n")


# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Otimiza e melhora qualidade de imagens de produtos"
    )
    
    parser.add_argument(
        "--input",
        "-i",
        required=True,
        help="Diretório de entrada com imagens"
    )
    
    parser.add_argument(
        "--output",
        "-o",
        required=True,
        help="Diretório de saída para imagens otimizadas"
    )
    
    parser.add_argument(
        "--quality",
        "-q",
        choices=["low", "medium", "high", "ultra"],
        default="high",
        help="Preset de qualidade (default: high)"
    )
    
    parser.add_argument(
        "--format",
        "-f",
        choices=["webp", "avif", "jpg", "jpeg", "png"],
        default="webp",
        help="Formato de saída (default: webp)"
    )
    
    parser.add_argument(
        "--upscale",
        "-u",
        type=float,
        default=None,
        help="Fator de upscaling (ex: 1.5, 2.0)"
    )
    
    parser.add_argument(
        "--workers",
        "-w",
        type=int,
        default=4,
        help="Número de workers paralelos (default: 4)"
    )
    
    parser.add_argument(
        "--no-thumbnails",
        action="store_true",
        help="Não gerar thumbnails"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simular sem processar imagens"
    )
    
    args = parser.parse_args()
    
    # Validar diretórios
    if not os.path.isdir(args.input):
        print(f"❌ Diretório de entrada não encontrado: {args.input}")
        sys.exit(1)
    
    # Criar config
    config = ImageConfig(
        quality_preset=args.quality,
        output_format=args.format,
        upscale_factor=args.upscale,
        max_workers=args.workers,
        generate_thumbnails=not args.no_thumbnails
    )
    
    # Encontrar imagens
    image_paths = find_images(args.input)
    
    if not image_paths:
        print(f"❌ Nenhuma imagem encontrada em: {args.input}")
        sys.exit(1)
    
    print(f"\n🔍 Encontradas {len(image_paths)} imagens em {args.input}")
    
    if args.dry_run:
        print("\n🧪 DRY RUN - Nenhuma imagem será processada")
        print(f"   Formato de saída: {config.output_format}")
        print(f"   Qualidade: {config.quality_preset}")
        print(f"   Workers: {config.max_workers}")
        print(f"   Thumbnails: {'Sim' if config.generate_thumbnails else 'Não'}")
        if config.upscale_factor:
            print(f"   Upscaling: {config.upscale_factor}x")
        sys.exit(0)
    
    # Processar imagens
    results = process_batch(image_paths, args.output, config)
    
    # Gerar relatório
    generate_report(results, args.output)


if __name__ == "__main__":
    main()
