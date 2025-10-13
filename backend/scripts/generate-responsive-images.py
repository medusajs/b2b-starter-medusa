#!/usr/bin/env python3
"""
Gerador de Imagens Responsivas - Mantém Qualidade Original
Cria 4 versões de cada imagem:
- original: mantém tamanho original
- large: 1200px (desktop)
- medium: 800px (tablet)
- thumb: 400px (mobile)
"""

import json
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from datetime import datetime
from concurrent.futures import ProcessPoolExecutor, as_completed
import sys


# Configuração dos tamanhos responsivos
RESPONSIVE_SIZES = {
    'original': None,  # Mantém tamanho original
    'large': 1200,     # Desktop
    'medium': 800,     # Tablet
    'thumb': 400       # Mobile
}

# Diretórios
CATALOG_DIR = Path('static/images-catálogo_distribuidores')
OUTPUT_DIR = Path('static/images-responsive')

# Qualidade WebP (alta qualidade, sem perdas visíveis)
WEBP_QUALITY = 95  # Alta qualidade
WEBP_METHOD = 6    # Melhor compressão (mais lento)


class ResponsiveImageGenerator:
    """Gera versões responsivas das imagens mantendo qualidade"""
    
    def __init__(self):
        self.stats = {
            'processed': 0,
            'skipped': 0,
            'errors': 0,
            'total_original_size': 0,
            'total_responsive_size': 0
        }
        
        # Criar diretórios de saída
        for size_name in RESPONSIVE_SIZES.keys():
            (OUTPUT_DIR / size_name).mkdir(parents=True, exist_ok=True)
    
    def resize_image(self, img_array, target_width):
        """
        Redimensiona imagem mantendo aspect ratio
        Usa LANCZOS para melhor qualidade
        """
        h, w = img_array.shape[:2]
        
        if w <= target_width:
            # Se já é menor, mantém original
            return img_array
        
        # Calcular novo tamanho mantendo aspect ratio
        aspect_ratio = h / w
        new_width = target_width
        new_height = int(new_width * aspect_ratio)
        
        # Converter para PIL para melhor qualidade de resize
        pil_img = Image.fromarray(img_array)
        pil_resized = pil_img.resize(
            (new_width, new_height),
            Image.Resampling.LANCZOS  # Melhor qualidade
        )
        
        return np.array(pil_resized)
    
    def process_image(self, sku, original_path):
        """Processa uma imagem gerando todas as versões responsivas"""
        
        try:
            # Carregar imagem original
            pil_original = Image.open(original_path)
            original_array = np.array(pil_original)
            
            original_size = original_path.stat().st_size
            self.stats['total_original_size'] += original_size
            
            responsive_paths = {}
            total_responsive_size = 0
            
            # Gerar cada versão
            for size_name, target_width in RESPONSIVE_SIZES.items():
                output_path = OUTPUT_DIR / size_name / f'{sku}.webp'
                
                if size_name == 'original':
                    # Manter tamanho original, apenas converter para WebP
                    processed = original_array
                else:
                    # Redimensionar
                    processed = self.resize_image(original_array, target_width)
                
                # Converter de volta para PIL e salvar como WebP
                pil_processed = Image.fromarray(processed)
                pil_processed.save(
                    output_path,
                    'WEBP',
                    quality=WEBP_QUALITY,
                    method=WEBP_METHOD
                )
                
                responsive_paths[size_name] = str(output_path)
                total_responsive_size += output_path.stat().st_size
            
            self.stats['total_responsive_size'] += total_responsive_size
            self.stats['processed'] += 1
            
            # Calcular economia
            savings_pct = ((original_size - total_responsive_size) / 
                          original_size * 100)
            
            return {
                'sku': sku,
                'success': True,
                'paths': responsive_paths,
                'original_size': original_size,
                'responsive_size': total_responsive_size,
                'savings_pct': savings_pct
            }
            
        except Exception as e:
            self.stats['errors'] += 1
            return {
                'sku': sku,
                'success': False,
                'error': str(e)
            }
    
    def find_original_file(self, sku):
        """Encontra o arquivo original da imagem"""
        
        # Procurar em todos os subdiretórios
        for pattern in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
            files = list(CATALOG_DIR.rglob(f'{sku}{pattern}'))
            if files:
                return files[0]
        
        return None
    
    def load_image_map(self):
        """Carrega IMAGE_MAP.json"""
        image_map_path = CATALOG_DIR / 'IMAGE_MAP.json'
        
        if not image_map_path.exists():
            print(f'❌ IMAGE_MAP.json não encontrado em {CATALOG_DIR}')
            return None
        
        with open(image_map_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def update_image_map(self, results):
        """Atualiza IMAGE_MAP.json com paths responsivos"""
        
        image_map = self.load_image_map()
        if not image_map:
            return
        
        # Criar mapa de resultados por SKU
        results_map = {r['sku']: r for r in results if r['success']}
        
        # Atualizar cada entrada
        updated_count = 0
        for category, items in image_map.get('categories', {}).items():
            for item in items:
                sku = item.get('sku')
                if sku in results_map:
                    result = results_map[sku]
                    
                    # Adicionar campo responsive
                    item['responsive'] = {
                        'original': f'/static/images-responsive/original/{sku}.webp',
                        'large': f'/static/images-responsive/large/{sku}.webp',
                        'medium': f'/static/images-responsive/medium/{sku}.webp',
                        'thumb': f'/static/images-responsive/thumb/{sku}.webp'
                    }
                    
                    # Adicionar metadados
                    item['responsive_metadata'] = {
                        'generated_at': datetime.now().isoformat(),
                        'original_size_kb': round(result['original_size'] / 1024, 2),
                        'responsive_size_kb': round(result['responsive_size'] / 1024, 2),
                        'savings_pct': round(result['savings_pct'], 2)
                    }
                    
                    updated_count += 1
        
        # Atualizar versão e timestamp
        if 'metadata' not in image_map:
            image_map['metadata'] = {}
        
        image_map['metadata']['version'] = '4.0'
        image_map['metadata']['updated_at'] = datetime.now().isoformat()
        image_map['metadata']['responsive_enabled'] = True
        
        # Salvar backup
        backup_path = CATALOG_DIR / 'IMAGE_MAP.json.backup-v3'
        image_map_path = CATALOG_DIR / 'IMAGE_MAP.json'
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(image_map, f, ensure_ascii=False, indent=2)
        
        with open(image_map_path, 'w', encoding='utf-8') as f:
            json.dump(image_map, f, ensure_ascii=False, indent=2)
        
        print(f'\n✅ IMAGE_MAP.json atualizado: {updated_count} itens')
        print(f'💾 Backup salvo: {backup_path}')
    
    def generate_report(self, results):
        """Gera relatório detalhado"""
        
        successful = [r for r in results if r['success']]
        failed = [r for r in results if not r['success']]
        
        print(f'\n{"="*60}')
        print('📊 RELATÓRIO DE PROCESSAMENTO')
        print(f'{"="*60}')
        print(f'\n✅ Processadas com sucesso: {len(successful)}')
        print(f'❌ Erros: {len(failed)}')
        print(f'📦 Total de imagens: {len(results)}')
        
        if successful:
            avg_savings = sum(r['savings_pct'] for r in successful) / len(successful)
            total_original_mb = self.stats['total_original_size'] / (1024 * 1024)
            total_responsive_mb = self.stats['total_responsive_size'] / (1024 * 1024)
            
            print(f'\n💾 Tamanho original: {total_original_mb:.2f} MB')
            print(f'💾 Tamanho responsivo: {total_responsive_mb:.2f} MB')
            print(f'📉 Economia média: {avg_savings:.2f}%')
        
        if failed:
            print(f'\n❌ Erros encontrados:')
            for r in failed[:10]:  # Mostrar primeiros 10
                print(f'  - {r["sku"]}: {r["error"]}')
        
        # Salvar relatório JSON
        report_path = OUTPUT_DIR / 'generation-report.json'
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump({
                'generated_at': datetime.now().isoformat(),
                'summary': {
                    'total': len(results),
                    'successful': len(successful),
                    'failed': len(failed)
                },
                'stats': self.stats,
                'results': results
            }, f, ensure_ascii=False, indent=2)
        
        print(f'\n📄 Relatório salvo: {report_path}')


def main():
    print('='*60)
    print('🎨 GERADOR DE IMAGENS RESPONSIVAS')
    print('Mantém qualidade original - Apenas redimensiona')
    print('='*60)
    
    generator = ResponsiveImageGenerator()
    
    # Carregar IMAGE_MAP.json
    print('\n📖 Carregando IMAGE_MAP.json...')
    image_map = generator.load_image_map()
    
    if not image_map:
        sys.exit(1)
    
    # Coletar todos os SKUs
    skus_to_process = []
    for category, items in image_map.get('categories', {}).items():
        for item in items:
            sku = item.get('sku')
            if sku:
                skus_to_process.append(sku)
    
    print(f'✅ {len(skus_to_process)} SKUs encontrados')
    
    # Processar imagens
    print('\n🔄 Processando imagens...')
    results = []
    
    for i, sku in enumerate(skus_to_process, 1):
        # Encontrar arquivo original
        original_path = generator.find_original_file(sku)
        
        if not original_path:
            results.append({
                'sku': sku,
                'success': False,
                'error': 'Arquivo original não encontrado'
            })
            continue
        
        # Processar
        result = generator.process_image(sku, original_path)
        results.append(result)
        
        # Progresso
        if i % 50 == 0 or i == len(skus_to_process):
            success_count = len([r for r in results if r['success']])
            print(f'  Progresso: {i}/{len(skus_to_process)} '
                  f'({success_count} OK)')
    
    # Atualizar IMAGE_MAP.json
    print('\n📝 Atualizando IMAGE_MAP.json...')
    generator.update_image_map(results)
    
    # Gerar relatório
    generator.generate_report(results)
    
    print(f'\n{"="*60}')
    print('✅ PROCESSAMENTO CONCLUÍDO!')
    print(f'{"="*60}')


if __name__ == '__main__':
    main()
