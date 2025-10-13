#!/usr/bin/env python3
"""Analisa uma imagem específica para verificar qualidade da otimização"""

import sys
from pathlib import Path
from PIL import Image
import cv2
import numpy as np


def analyze_image(sku: str):
    """Analisa imagem original vs otimizada"""
    
    # Encontrar imagens
    webp_path = Path(f'static/images-intelligent-optimized/{sku}.webp')
    original_paths = list(Path('static/images-catálogo_distribuidores').rglob(f'{sku}.*'))
    original_paths = [p for p in original_paths if p.suffix != '.webp']
    
    print(f'\n{"="*80}')
    print(f'ANÁLISE DE QUALIDADE: {sku}')
    print(f'{"="*80}\n')
    
    if not webp_path.exists():
        print(f'❌ WebP não encontrado: {webp_path}')
        return
    
    if not original_paths:
        print(f'❌ Original não encontrado para: {sku}')
        return
    
    original_path = original_paths[0]
    
    # Abrir imagens
    webp_img = Image.open(webp_path)
    orig_img = Image.open(original_path)
    
    # Informações básicas
    print('📊 INFORMAÇÕES BÁSICAS:')
    print(f'\nOriginal:')
    print(f'  Path: {original_path}')
    print(f'  Tamanho: {original_path.stat().st_size / 1024:.2f} KB')
    print(f'  Dimensões: {orig_img.size[0]}x{orig_img.size[1]}')
    print(f'  Formato: {orig_img.format}')
    print(f'  Modo: {orig_img.mode}')
    
    print(f'\nWebP Otimizado:')
    print(f'  Path: {webp_path}')
    print(f'  Tamanho: {webp_path.stat().st_size / 1024:.2f} KB')
    print(f'  Dimensões: {webp_img.size[0]}x{webp_img.size[1]}')
    print(f'  Formato: {webp_img.format}')
    print(f'  Modo: {webp_img.mode}')
    
    reduction = (1 - webp_path.stat().st_size / original_path.stat().st_size) * 100
    print(f'\n📉 Redução de tamanho: {reduction:.2f}%')
    
    # Análise de qualidade com OpenCV
    print(f'\n🔍 ANÁLISE DE QUALIDADE:\n')
    
    # Converter para OpenCV
    orig_cv = cv2.cvtColor(np.array(orig_img), cv2.COLOR_RGB2BGR)
    webp_cv = cv2.cvtColor(np.array(webp_img), cv2.COLOR_RGB2BGR)
    
    # Calcular SSIM (Structural Similarity)
    from skimage.metrics import structural_similarity as ssim
    
    # Redimensionar se necessário
    if orig_cv.shape != webp_cv.shape:
        webp_cv = cv2.resize(webp_cv, (orig_cv.shape[1], orig_cv.shape[0]))
    
    # Converter para escala de cinza para SSIM
    orig_gray = cv2.cvtColor(orig_cv, cv2.COLOR_BGR2GRAY)
    webp_gray = cv2.cvtColor(webp_cv, cv2.COLOR_BGR2GRAY)
    
    ssim_value = ssim(orig_gray, webp_gray)
    print(f'SSIM (Similaridade Estrutural): {ssim_value:.4f}')
    print(f'  0.90-1.00: Excelente qualidade')
    print(f'  0.80-0.90: Boa qualidade')
    print(f'  0.70-0.80: Qualidade aceitável')
    print(f'  < 0.70: Perda perceptível de qualidade')
    
    # Análise de nitidez (Laplacian variance)
    orig_laplacian = cv2.Laplacian(orig_gray, cv2.CV_64F).var()
    webp_laplacian = cv2.Laplacian(webp_gray, cv2.CV_64F).var()
    
    print(f'\nNitidez (Laplacian variance):')
    print(f'  Original: {orig_laplacian:.2f}')
    print(f'  WebP: {webp_laplacian:.2f}')
    sharpness_change = ((webp_laplacian - orig_laplacian) / orig_laplacian) * 100
    print(f'  Mudança: {sharpness_change:+.2f}%')
    
    # Análise de contraste
    orig_contrast = orig_gray.std()
    webp_contrast = webp_gray.std()
    
    print(f'\nContraste (desvio padrão):')
    print(f'  Original: {orig_contrast:.2f}')
    print(f'  WebP: {webp_contrast:.2f}')
    contrast_change = ((webp_contrast - orig_contrast) / orig_contrast) * 100
    print(f'  Mudança: {contrast_change:+.2f}%')
    
    # Diagnóstico
    print(f'\n{"="*80}')
    print('🎯 DIAGNÓSTICO:')
    print(f'{"="*80}\n')
    
    issues = []
    
    if ssim_value < 0.80:
        issues.append('⚠️  SSIM baixo - perda significativa de qualidade estrutural')
    
    if sharpness_change < -20:
        issues.append('⚠️  Nitidez reduzida em mais de 20% - imagem ficou borrada')
    
    if contrast_change < -15:
        issues.append('⚠️  Contraste reduzido significativamente')
    
    if reduction > 90:
        issues.append('⚠️  Compressão excessiva (>90%) - pode ter perdido detalhes')
    
    if issues:
        print('PROBLEMAS DETECTADOS:\n')
        for issue in issues:
            print(f'  {issue}')
        
        print('\n💡 RECOMENDAÇÕES:\n')
        print('  1. Re-otimizar com --quality 95 (ao invés de padrão)')
        print('  2. Desabilitar denoise excessivo')
        print('  3. Reduzir sharpen artificial')
        print('  4. Considerar manter original se for imagem de produto com logo')
    else:
        print('✅ Qualidade mantida adequadamente!\n')
    
    print(f'\n{"="*80}\n')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso: python analyze-single-image.py <SKU>')
        print('Exemplo: python analyze-single-image.py ODEX-ODEX-INV-SAJ-17000W')
        sys.exit(1)
    
    sku = sys.argv[1]
    analyze_image(sku)
