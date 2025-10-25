#!/usr/bin/env python3
"""
Script de Validação de Otimização de Imagens

Valida a qualidade e efetividade das otimizações de imagens,
identificando casos problemáticos e gerando relatório detalhado.
"""

import json
import os
from pathlib import Path
from typing import Dict, List
import sys


class OptimizationValidator:
    def __init__(self, optimized_dir: str, original_base: str, image_map: str):
        self.optimized_dir = Path(optimized_dir)
        self.original_base = Path(original_base)
        self.image_map_path = Path(image_map)
        
        self.stats = {
            'total_analyzed': 0,
            'successful': 0,
            'problematic': 0,
            'not_found': 0,
            'total_savings_bytes': 0,
            'total_original_bytes': 0
        }
        
        self.problematic_files = []
    
    def validate_all(self) -> Dict:
        """Valida todas as otimizações"""
        print("🔍 Validando otimizações de imagens...")
        print("=" * 80)
        
        # Carregar IMAGE_MAP se existir
        image_map_data = None
        if self.image_map_path.exists():
            with open(self.image_map_path, 'r', encoding='utf-8') as f:
                image_map_data = json.load(f)
            print(f"✅ IMAGE_MAP.json carregado")
        
        # Encontrar todas as imagens WebP otimizadas
        webp_files = list(self.optimized_dir.glob('*.webp'))
        self.stats['total_analyzed'] = len(webp_files)
        
        print(f"📊 Encontradas {len(webp_files)} imagens WebP otimizadas\n")
        
        for webp_path in webp_files:
            self._validate_single_image(webp_path)
        
        return self._generate_report(image_map_data)
    
    def _validate_single_image(self, webp_path: Path):
        """Valida uma única imagem"""
        # Encontrar original
        base_name = webp_path.stem
        original_path = None
        
        for ext in ['.jpg', '.jpeg', '.png']:
            potential_original = self.original_base / 'images-catálogo_distribuidores'
            for candidate in potential_original.rglob(f'{base_name}{ext}'):
                original_path = candidate
                break
            if original_path:
                break
        
        if not original_path or not original_path.exists():
            self.stats['not_found'] += 1
            return
        
        # Comparar tamanhos
        webp_size = webp_path.stat().st_size
        original_size = original_path.stat().st_size
        
        self.stats['total_original_bytes'] += original_size
        
        if webp_size < original_size:
            self.stats['successful'] += 1
            self.stats['total_savings_bytes'] += (original_size - webp_size)
        else:
            self.stats['problematic'] += 1
            increase = webp_size - original_size
            increase_pct = (increase / original_size) * 100
            
            self.problematic_files.append({
                'filename': base_name,
                'original_kb': round(original_size / 1024, 2),
                'webp_kb': round(webp_size / 1024, 2),
                'increase_kb': round(increase / 1024, 2),
                'increase_percent': round(increase_pct, 2)
            })
    
    def _generate_report(self, image_map_data: Dict) -> Dict:
        """Gera relatório de validação"""
        report = {
            'validation_status': 'completed',
            'statistics': {
                'total_analyzed': self.stats['total_analyzed'],
                'successful_optimizations': self.stats['successful'],
                'problematic_cases': self.stats['problematic'],
                'not_found': self.stats['not_found'],
                'success_rate': round(
                    (self.stats['successful'] / self.stats['total_analyzed'] * 100), 2
                ) if self.stats['total_analyzed'] > 0 else 0
            },
            'space_savings': {
                'total_original_mb': round(
                    self.stats['total_original_bytes'] / (1024 * 1024), 2
                ),
                'total_saved_mb': round(
                    self.stats['total_savings_bytes'] / (1024 * 1024), 2
                ),
                'compression_ratio': round(
                    (self.stats['total_savings_bytes'] /
                     self.stats['total_original_bytes'] * 100), 2
                ) if self.stats['total_original_bytes'] > 0 else 0
            },
            'problematic_files': self.problematic_files[:10],
            'total_problematic': len(self.problematic_files)
        }
        
        # Adicionar info do IMAGE_MAP se disponível
        if image_map_data:
            report['image_map_status'] = {
                'version': image_map_data.get('version', 'unknown'),
                'total_skus': image_map_data.get('total_skus', 0),
                'optimization_stats': image_map_data.get(
                    'optimization_stats', {}
                )
            }
        
        return report
    
    def print_report(self, report: Dict):
        """Imprime relatório formatado"""
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO DE VALIDAÇÃO DE OTIMIZAÇÃO")
        print("=" * 80)
        
        stats = report['statistics']
        print(f"\n✅ Imagens analisadas:        {stats['total_analyzed']}")
        print(f"✅ Otimizações bem-sucedidas: {stats['successful_optimizations']}"
              f" ({stats['success_rate']}%)")
        print(f"⚠️  Casos problemáticos:       {stats['problematic_cases']}")
        print(f"❓ Originais não encontrados: {stats['not_found']}")
        
        space = report['space_savings']
        print(f"\n💾 Tamanho original total:    {space['total_original_mb']} MB")
        print(f"💾 Espaço economizado:        {space['total_saved_mb']} MB")
        print(f"📉 Taxa de compressão:        {space['compression_ratio']}%")
        
        if report.get('image_map_status'):
            print(f"\n📝 IMAGE_MAP.json:")
            print(f"   Versão: {report['image_map_status']['version']}")
            print(f"   SKUs: {report['image_map_status']['total_skus']}")
            
            opt_stats = report['image_map_status'].get('optimization_stats', {})
            if opt_stats:
                print(f"   Migrados para WebP: {opt_stats.get('migrated_to_webp', 0)}")
                print(f"   Mantidos originais: {opt_stats.get('kept_original', 0)}")
        
        if report['problematic_files']:
            print(f"\n⚠️  TOP 10 CASOS PROBLEMÁTICOS:")
            for i, file in enumerate(report['problematic_files'], 1):
                print(f"   {i}. {file['filename']}")
                print(f"      Original: {file['original_kb']} KB → "
                      f"WebP: {file['webp_kb']} KB")
                print(f"      Aumento: +{file['increase_kb']} KB "
                      f"({file['increase_percent']}%)")
        
        print("\n" + "=" * 80)
        
        # Recomendações
        if stats['problematic_cases'] > stats['successful_optimizations'] * 0.15:
            print("\n⚠️  ATENÇÃO: Mais de 15% das otimizações são problemáticas!")
            print("   Recomendações:")
            print("   1. Aumentar --min-size para 40 ou 50 KB")
            print("   2. Revisar imagens problemáticas individualmente")
            print("   3. Considerar reverter casos com aumento > 50%")
        elif stats['success_rate'] > 85:
            print("\n✅ EXCELENTE! Taxa de sucesso > 85%")
            print("   Próximos passos:")
            print("   1. Aplicar migração do IMAGE_MAP.json")
            print("   2. Processar imagens restantes")
            print("   3. Monitorar performance em produção")
        
        print()


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Valida otimizações de imagens'
    )
    parser.add_argument(
        '--optimized-dir',
        default='static/images-intelligent-optimized',
        help='Diretório com imagens otimizadas'
    )
    parser.add_argument(
        '--original-dir',
        default='static',
        help='Diretório base das imagens originais'
    )
    parser.add_argument(
        '--image-map',
        default='static/images-catálogo_distribuidores/IMAGE_MAP.json',
        help='Path para IMAGE_MAP.json'
    )
    parser.add_argument(
        '--output',
        help='Salvar relatório em arquivo JSON'
    )
    
    args = parser.parse_args()
    
    # Validar paths
    if not Path(args.optimized_dir).exists():
        print(f"❌ Erro: Diretório não encontrado: {args.optimized_dir}")
        return 1
    
    # Executar validação
    validator = OptimizationValidator(
        optimized_dir=args.optimized_dir,
        original_base=args.original_dir,
        image_map=args.image_map
    )
    
    report = validator.validate_all()
    validator.print_report(report)
    
    # Salvar relatório se solicitado
    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"📄 Relatório salvo em: {output_path}")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
