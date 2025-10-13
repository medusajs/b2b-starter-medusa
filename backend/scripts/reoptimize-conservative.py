#!/usr/bin/env python3
"""
Script para re-otimizar imagens específicas com parâmetros conservadores
Ideal para imagens de produto com logos e detalhes importantes
"""

import sys
import cv2
import numpy as np
from pathlib import Path
from PIL import Image


def conservative_optimize(input_path: Path, output_path: Path, quality: int = 95):
    """
    Otimização conservadora que preserva logos e detalhes
    """
    print(f'\n🔧 Re-otimizando: {input_path.name}')
    print(f'   Modo: CONSERVADOR (preserva logos e detalhes)\n')
    
    # Carregar imagem usando PIL primeiro (melhor suporte a encoding)
    try:
        pil_img_orig = Image.open(input_path)
        img = cv2.cvtColor(np.array(pil_img_orig), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print(f'❌ Erro ao carregar imagem: {e}')
        return False
    
    print(f'   Tamanho original: {input_path.stat().st_size / 1024:.2f} KB')
    print(f'   Dimensões: {img.shape[1]}x{img.shape[0]}')
    
    # Aplicar apenas ajustes sutis
    # 1. Denoise muito leve (apenas ruído de fundo)
    img_denoised = cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 21)
    print(f'   ✓ Denoise leve aplicado (força: 3)')
    
    # 2. Ajuste de contraste mínimo
    lab = cv2.cvtColor(img_denoised, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # CLAHE muito conservador
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l)
    
    img_enhanced = cv2.merge([l_enhanced, a, b])
    img_enhanced = cv2.cvtColor(img_enhanced, cv2.COLOR_LAB2BGR)
    print(f'   ✓ Contraste ajustado suavemente')
    
    # 3. SEM sharpen artificial - mantém detalhes naturais
    print(f'   ✓ Sharpen artificial desabilitado')
    
    # 4. Converter para RGB (PIL)
    img_rgb = cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2RGB)
    pil_img = Image.fromarray(img_rgb)
    
    # 5. Salvar como WebP com qualidade alta
    pil_img.save(
        output_path,
        'WEBP',
        quality=quality,
        method=6,  # Melhor compressão
        lossless=False
    )
    
    output_size = output_path.stat().st_size
    print(f'   ✓ Salvo como WebP (quality={quality})')
    print(f'   Tamanho final: {output_size / 1024:.2f} KB')
    
    reduction = (1 - output_size / input_path.stat().st_size) * 100
    print(f'   📉 Redução: {reduction:.2f}%')
    
    if reduction > 0:
        print(f'\n   ✅ Otimização bem-sucedida!')
    else:
        print(f'\n   ⚠️  WebP ficou maior - considere manter original')
    
    return True


def reoptimize_image(sku: str, quality: int = 95):
    """Re-otimiza uma imagem específica"""
    
    # Encontrar original
    original_paths = list(Path('static/images-catálogo_distribuidores').rglob(f'{sku}.*'))
    original_paths = [p for p in original_paths if p.suffix != '.webp']
    
    if not original_paths:
        print(f'❌ Original não encontrado: {sku}')
        return False
    
    original_path = original_paths[0]
    output_path = Path('static/images-intelligent-optimized') / f'{sku}.webp'
    
    print(f'\n{"="*80}')
    print(f'RE-OTIMIZAÇÃO CONSERVADORA')
    print(f'{"="*80}')
    print(f'\nSKU: {sku}')
    print(f'Original: {original_path}')
    print(f'Output: {output_path}')
    
    # Criar backup se já existe
    if output_path.exists():
        backup_path = output_path.with_suffix('.webp.old')
        output_path.rename(backup_path)
        print(f'📦 Backup criado: {backup_path.name}')
    
    # Re-otimizar
    success = conservative_optimize(original_path, output_path, quality)
    
    print(f'\n{"="*80}\n')
    
    return success


def batch_reoptimize(sku_list_file: str, quality: int = 95):
    """Re-otimiza múltiplas imagens de uma lista"""
    
    with open(sku_list_file, 'r', encoding='utf-8') as f:
        skus = [line.strip() for line in f if line.strip()]
    
    print(f'\n🔄 Re-otimizando {len(skus)} imagens...\n')
    
    success_count = 0
    for i, sku in enumerate(skus, 1):
        print(f'\n[{i}/{len(skus)}] {sku}')
        if reoptimize_image(sku, quality):
            success_count += 1
    
    print(f'\n✅ {success_count}/{len(skus)} imagens re-otimizadas com sucesso!')


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Uso:')
        print('  python reoptimize-conservative.py <SKU> [quality]')
        print('  python reoptimize-conservative.py --batch <file.txt> [quality]')
        print('\nExemplos:')
        print('  python reoptimize-conservative.py ODEX-ODEX-INV-SAJ-17000W')
        print('  python reoptimize-conservative.py ODEX-ODEX-INV-SAJ-17000W 98')
        print('  python reoptimize-conservative.py --batch problematic.txt 95')
        sys.exit(1)
    
    quality = 95
    if len(sys.argv) > 2 and sys.argv[1] != '--batch':
        quality = int(sys.argv[2])
    elif len(sys.argv) > 3:
        quality = int(sys.argv[3])
    
    if sys.argv[1] == '--batch':
        batch_reoptimize(sys.argv[2], quality)
    else:
        sku = sys.argv[1]
        reoptimize_image(sku, quality)
