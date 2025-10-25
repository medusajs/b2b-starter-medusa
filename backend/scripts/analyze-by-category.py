#!/usr/bin/env python3
"""
Análise detalhada de imagens por categoria
Avalia qualidade, dimensões, formatos e características visuais
"""

import json
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from collections import defaultdict
from typing import Dict, List
import sys


class CategoryAnalyzer:
    def __init__(self):
        self.categories = defaultdict(list)
        self.analysis_results = {}
        
    def load_image_map(self, path: str):
        """Carrega IMAGE_MAP.json"""
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Agrupar por categoria
        for sku, entry in data['mappings'].items():
            category = entry.get('category', 'unknown')
            self.categories[category].append({
                'sku': sku,
                'distributor': entry.get('distributor', 'unknown'),
                'images': entry.get('images', {}),
                'optimization': entry.get('optimization', {})
            })
        
        print(f'✅ Carregadas {len(data["mappings"])} imagens')
        print(f'📊 Categorias encontradas: {len(self.categories)}')
        for cat, items in sorted(self.categories.items()):
            print(f'   {cat}: {len(items)} imagens')
    
    def analyze_image_quality(self, img_path: Path) -> Dict:
        """Analisa qualidade visual de uma imagem"""
        try:
            # Carregar com PIL
            pil_img = Image.open(img_path)
            img_array = np.array(pil_img)
            
            # Converter para BGR para OpenCV
            if len(img_array.shape) == 3:
                if img_array.shape[2] == 4:  # RGBA
                    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGBA2BGR)
                else:  # RGB
                    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            else:
                img_bgr = cv2.cvtColor(img_array, cv2.COLOR_GRAY2BGR)
            
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            
            # Métricas de qualidade
            metrics = {
                'width': pil_img.size[0],
                'height': pil_img.size[1],
                'aspect_ratio': pil_img.size[0] / pil_img.size[1],
                'format': pil_img.format,
                'mode': pil_img.mode,
                'size_kb': img_path.stat().st_size / 1024,
                
                # Nitidez (Laplacian variance)
                'sharpness': cv2.Laplacian(gray, cv2.CV_64F).var(),
                
                # Contraste (desvio padrão)
                'contrast': float(gray.std()),
                
                # Brilho médio
                'brightness': float(gray.mean()),
                
                # Saturação (se colorida)
                'saturation': 0.0
            }
            
            if len(img_array.shape) == 3 and img_array.shape[2] >= 3:
                hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
                metrics['saturation'] = float(hsv[:, :, 1].mean())
            
            # Detectar tipo de imagem
            metrics['image_type'] = self.detect_image_type(img_bgr, gray)
            
            return metrics
            
        except Exception as e:
            print(f'❌ Erro ao analisar {img_path.name}: {e}')
            return None
    
    def detect_image_type(self, img_bgr, gray) -> str:
        """Detecta tipo de imagem (produto, diagrama, logo, etc)"""
        
        # Analisar quantidade de bordas
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Analisar histograma
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist_entropy = -np.sum(hist * np.log2(hist + 1e-10))
        
        # Classificar
        if edge_density > 0.15:
            return 'diagrama_tecnico'  # Muitas bordas = diagrama
        elif hist_entropy < 5.0:
            return 'logo_simples'  # Baixa entropia = logo/gráfico simples
        elif gray.std() > 60:
            return 'produto_fotografia'  # Alto contraste = foto de produto
        else:
            return 'produto_render'  # Imagem renderizada/limpa
    
    def analyze_category(self, category: str, sample_size: int = 20):
        """Analisa imagens de uma categoria específica"""
        
        items = self.categories[category]
        print(f'\n{"="*80}')
        print(f'📊 ANÁLISE: {category.upper()}')
        print(f'{"="*80}')
        print(f'Total de imagens: {len(items)}')
        
        # Analisar amostra
        sample = items[:sample_size] if len(items) > sample_size else items
        
        metrics_list = []
        for item in sample:
            # Tentar encontrar imagem otimizada ou original
            sku = item['sku']
            
            # Verificar otimizada
            webp_path = Path('static/images-intelligent-optimized') / f'{sku}.webp'
            if webp_path.exists():
                metrics = self.analyze_image_quality(webp_path)
                if metrics:
                    metrics['optimized'] = True
                    metrics['sku'] = sku
                    metrics_list.append(metrics)
                continue
            
            # Verificar original
            original_paths = list(Path('static/images-catálogo_distribuidores').rglob(f'{sku}.*'))
            original_paths = [p for p in original_paths if p.suffix != '.webp']
            if original_paths:
                metrics = self.analyze_image_quality(original_paths[0])
                if metrics:
                    metrics['optimized'] = False
                    metrics['sku'] = sku
                    metrics_list.append(metrics)
        
        if not metrics_list:
            print('❌ Nenhuma imagem encontrada para análise')
            return None
        
        # Calcular estatísticas
        stats = self.calculate_stats(metrics_list)
        self.analysis_results[category] = {
            'total_images': len(items),
            'analyzed_samples': len(metrics_list),
            'stats': stats,
            'samples': metrics_list[:5]  # Top 5 para referência
        }
        
        self.print_category_stats(category, stats)
        
        return stats
    
    def calculate_stats(self, metrics_list: List[Dict]) -> Dict:
        """Calcula estatísticas agregadas"""
        
        stats = {
            'dimensions': defaultdict(int),
            'formats': defaultdict(int),
            'image_types': defaultdict(int),
            'avg_sharpness': 0,
            'avg_contrast': 0,
            'avg_brightness': 0,
            'avg_saturation': 0,
            'avg_size_kb': 0,
            'aspect_ratios': defaultdict(int)
        }
        
        for m in metrics_list:
            # Dimensões
            dim = f"{m['width']}x{m['height']}"
            stats['dimensions'][dim] += 1
            
            # Formatos
            stats['formats'][m['format']] += 1
            
            # Tipos
            stats['image_types'][m['image_type']] += 1
            
            # Aspect ratio
            ar = round(m['aspect_ratio'], 2)
            stats['aspect_ratios'][ar] += 1
            
            # Médias
            stats['avg_sharpness'] += m['sharpness']
            stats['avg_contrast'] += m['contrast']
            stats['avg_brightness'] += m['brightness']
            stats['avg_saturation'] += m['saturation']
            stats['avg_size_kb'] += m['size_kb']
        
        # Calcular médias finais
        n = len(metrics_list)
        stats['avg_sharpness'] /= n
        stats['avg_contrast'] /= n
        stats['avg_brightness'] /= n
        stats['avg_saturation'] /= n
        stats['avg_size_kb'] /= n
        
        return stats
    
    def print_category_stats(self, category: str, stats: Dict):
        """Imprime estatísticas de uma categoria"""
        
        print(f'\n📐 DIMENSÕES MAIS COMUNS:')
        for dim, count in sorted(stats['dimensions'].items(), 
                                 key=lambda x: x[1], reverse=True)[:3]:
            pct = (count / sum(stats['dimensions'].values())) * 100
            print(f'   {dim}: {count} ({pct:.1f}%)')
        
        print(f'\n📦 FORMATOS:')
        for fmt, count in sorted(stats['formats'].items(), 
                                 key=lambda x: x[1], reverse=True):
            pct = (count / sum(stats['formats'].values())) * 100
            print(f'   {fmt}: {count} ({pct:.1f}%)')
        
        print(f'\n🎨 TIPOS DE IMAGEM:')
        for img_type, count in sorted(stats['image_types'].items(), 
                                      key=lambda x: x[1], reverse=True):
            pct = (count / sum(stats['image_types'].values())) * 100
            print(f'   {img_type}: {count} ({pct:.1f}%)')
        
        print(f'\n📊 MÉTRICAS DE QUALIDADE:')
        print(f'   Nitidez média: {stats["avg_sharpness"]:.2f}')
        print(f'   Contraste médio: {stats["avg_contrast"]:.2f}')
        print(f'   Brilho médio: {stats["avg_brightness"]:.2f}')
        print(f'   Saturação média: {stats["avg_saturation"]:.2f}')
        print(f'   Tamanho médio: {stats["avg_size_kb"]:.2f} KB')
    
    def generate_recommendations(self):
        """Gera recomendações de padronização"""
        
        print(f'\n\n{"="*80}')
        print('🎯 RECOMENDAÇÕES DE PADRONIZAÇÃO')
        print(f'{"="*80}\n')
        
        recommendations = {}
        
        for category, data in self.analysis_results.items():
            stats = data['stats']
            
            # Determinar dimensões ideais
            most_common_dim = max(stats['dimensions'].items(), 
                                 key=lambda x: x[1])[0]
            
            # Determinar tipo predominante
            most_common_type = max(stats['image_types'].items(), 
                                  key=lambda x: x[1])[0]
            
            # Recomendações específicas por tipo
            rec = {
                'dimensions': most_common_dim,
                'format': 'WebP',
                'quality': 85,
                'processing': {}
            }
            
            # Ajustar por tipo de imagem
            if most_common_type == 'produto_fotografia':
                rec['quality'] = 90
                rec['processing'] = {
                    'denoise': 2,
                    'contrast': 1.05,
                    'sharpen': 0.5,
                    'saturation': 1.0,
                    'maintain_details': True
                }
            elif most_common_type == 'diagrama_tecnico':
                rec['quality'] = 95
                rec['processing'] = {
                    'denoise': 1,
                    'contrast': 1.02,
                    'sharpen': 0.0,
                    'saturation': 1.0,
                    'maintain_details': True
                }
            elif most_common_type == 'logo_simples':
                rec['quality'] = 98
                rec['processing'] = {
                    'denoise': 0,
                    'contrast': 1.0,
                    'sharpen': 0.0,
                    'saturation': 1.0,
                    'maintain_details': True
                }
            else:  # produto_render
                rec['quality'] = 88
                rec['processing'] = {
                    'denoise': 3,
                    'contrast': 1.08,
                    'sharpen': 1.0,
                    'saturation': 1.0,
                    'maintain_details': True
                }
            
            recommendations[category] = rec
            
            print(f'\n📦 {category.upper()}')
            print(f'   Tipo predominante: {most_common_type}')
            print(f'   Dimensões sugeridas: {rec["dimensions"]}')
            print(f'   Formato: {rec["format"]}')
            print(f'   Qualidade WebP: {rec["quality"]}')
            print(f'   Processamento:')
            for key, value in rec['processing'].items():
                print(f'      {key}: {value}')
        
        # Salvar recomendações
        output_path = Path('docs/IMAGE_OPTIMIZATION_RECOMMENDATIONS.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'generated_at': '2025-10-13',
                'analysis_summary': self.analysis_results,
                'recommendations': recommendations
            }, f, indent=2, ensure_ascii=False)
        
        print(f'\n💾 Recomendações salvas em: {output_path}')
        
        return recommendations


def main():
    analyzer = CategoryAnalyzer()
    
    # Carregar IMAGE_MAP
    image_map_path = 'static/images-catálogo_distribuidores/IMAGE_MAP.json'
    analyzer.load_image_map(image_map_path)
    
    print(f'\n{"="*80}')
    print('🔍 INICIANDO ANÁLISE POR CATEGORIA')
    print(f'{"="*80}')
    
    # Analisar cada categoria
    for category in sorted(analyzer.categories.keys()):
        analyzer.analyze_category(category, sample_size=30)
    
    # Gerar recomendações
    analyzer.generate_recommendations()
    
    print(f'\n{"="*80}')
    print('✅ ANÁLISE COMPLETA!')
    print(f'{"="*80}\n')


if __name__ == '__main__':
    main()
