#!/usr/bin/env python3
"""
Script de Migração IMAGE_MAP.json para WebP Otimizado

Este script atualiza o IMAGE_MAP.json para apontar para as versões WebP otimizadas,
mantendo fallback para originais quando a otimização aumentou o tamanho do arquivo.

Funcionalidades:
- Atualiza paths para imagens WebP otimizadas
- Valida se WebP é menor que original
- Mantém original quando WebP é maior
- Adiciona metadados de otimização
- Gera relatório detalhado
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple
import hashlib
from datetime import datetime


class ImageMapMigrator:
    def __init__(self, image_map_path: str, optimized_dir: str, original_base_dir: str):
        self.image_map_path = Path(image_map_path)
        self.optimized_dir = Path(optimized_dir)
        self.original_base_dir = Path(original_base_dir)
        self.stats = {
            'total_skus': 0,
            'migrated_to_webp': 0,
            'kept_original': 0,
            'not_found': 0,
            'total_size_original': 0,
            'total_size_optimized': 0,
            'space_saved': 0
        }
        
    def get_file_size(self, file_path: Path) -> int:
        """Retorna tamanho do arquivo em bytes"""
        try:
            return file_path.stat().st_size
        except:
            return 0
    
    def calculate_hash(self, file_path: Path) -> str:
        """Calcula MD5 hash do arquivo"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def find_optimized_webp(self, original_path: str) -> Tuple[Path | None, bool]:
        """
        Procura pela versão WebP otimizada
        Retorna (path_webp, is_better) onde is_better indica se WebP é menor
        """
        # Extrair nome base do arquivo original
        # Converter path separators para o sistema operacional
        # Remove /static/ prefix se existir
        path_cleaned = original_path.lstrip('/').replace('static/', '', 1)
        original_path_normalized = path_cleaned.replace('/', os.sep)
        original_full_path = self.original_base_dir / original_path_normalized
        if not original_full_path.exists():
            return None, False
        
        # Construir path do WebP otimizado
        filename = original_full_path.stem
        webp_path = self.optimized_dir / f"{filename}.webp"
        
        if not webp_path.exists():
            return None, False
        
        # Comparar tamanhos
        original_size = self.get_file_size(original_full_path)
        webp_size = self.get_file_size(webp_path)
        
        # WebP é melhor se for pelo menos 5% menor
        is_better = webp_size < (original_size * 0.95)
        
        return webp_path, is_better
    
    def convert_to_relative_path(self, absolute_path: Path) -> str:
        """Converte path absoluto para relativo ao static/"""
        try:
            # Encontrar 'static' no path e construir caminho relativo
            parts = absolute_path.parts
            if 'static' in parts:
                static_idx = parts.index('static')
                relative_parts = parts[static_idx:]
                return '/static/' + '/'.join(relative_parts[1:])
            return str(absolute_path)
        except:
            return str(absolute_path)
    
    def migrate_mapping(self, sku: str, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Migra um mapping individual para WebP se vantajoso"""
        updated_entry = entry.copy()
        original_path = entry['images']['original']
        
        # Buscar versão WebP otimizada
        webp_path, is_better = self.find_optimized_webp(original_path)
        
        if webp_path and is_better:
            # WebP é melhor, migrar
            webp_relative = self.convert_to_relative_path(webp_path)
            
            # Calcular estatísticas
            original_full = self.original_base_dir / original_path.lstrip('/')
            original_size = self.get_file_size(original_full)
            webp_size = self.get_file_size(webp_path)
            
            self.stats['total_size_original'] += original_size
            self.stats['total_size_optimized'] += webp_size
            self.stats['space_saved'] += (original_size - webp_size)
            self.stats['migrated_to_webp'] += 1
            
            # Atualizar todos os tamanhos para WebP
            updated_entry['images'] = {
                'original': webp_relative,
                'thumb': webp_relative,
                'medium': webp_relative,
                'large': webp_relative
            }
            
            # Adicionar metadados de otimização
            compression_ratio = 0
            if original_size > 0:
                compression_ratio = round((1 - webp_size/original_size) * 100, 2)
            
            updated_entry['optimization'] = {
                'format': 'webp',
                'original_size': original_size,
                'optimized_size': webp_size,
                'compression_ratio': compression_ratio,
                'migrated_at': datetime.now().isoformat()
            }
            
            # Atualizar hash
            updated_entry['hash'] = self.calculate_hash(webp_path)
            
        elif webp_path and not is_better:
            # WebP existe mas não é melhor, manter original
            self.stats['kept_original'] += 1
            updated_entry['optimization'] = {
                'format': 'original',
                'reason': 'webp_larger_than_original'
            }
        else:
            # WebP não encontrado
            self.stats['not_found'] += 1
            updated_entry['optimization'] = {
                'format': 'original',
                'reason': 'webp_not_generated'
            }
        
        return updated_entry
    
    def migrate(self) -> Dict[str, Any]:
        """Executa a migração completa"""
        print("🔄 Iniciando migração IMAGE_MAP.json para WebP...")
        print(f"📂 Diretório de imagens otimizadas: {self.optimized_dir}")
        print(f"📂 Diretório de imagens originais: {self.original_base_dir}")
        print()
        
        # Carregar IMAGE_MAP.json
        with open(self.image_map_path, 'r', encoding='utf-8') as f:
            image_map = json.load(f)
        
        self.stats['total_skus'] = len(image_map['mappings'])
        
        # Processar cada mapping
        updated_mappings = {}
        for sku, entry in image_map['mappings'].items():
            updated_mappings[sku] = self.migrate_mapping(sku, entry)
        
        # Criar novo IMAGE_MAP
        updated_image_map = {
            'version': '3.0',
            'generated_at': datetime.now().isoformat(),
            'total_skus': image_map['total_skus'],
            'total_images': image_map['total_images'],
            'stats': image_map.get('stats', {}),
            'optimization_stats': {
                'migrated_to_webp': self.stats['migrated_to_webp'],
                'kept_original': self.stats['kept_original'],
                'not_found': self.stats['not_found'],
                'space_saved_mb': round(self.stats['space_saved'] / (1024 * 1024), 2),
                'compression_ratio': round((self.stats['space_saved'] / self.stats['total_size_original'] * 100), 2) if self.stats['total_size_original'] > 0 else 0
            },
            'mappings': updated_mappings
        }
        
        return updated_image_map
    
    def save_backup(self):
        """Cria backup do IMAGE_MAP.json original"""
        backup_path = self.image_map_path.with_suffix('.json.backup')
        if not backup_path.exists():
            import shutil
            shutil.copy2(self.image_map_path, backup_path)
            print(f"✅ Backup criado: {backup_path}")
    
    def save_migrated(self, updated_map: Dict[str, Any], dry_run: bool = False):
        """Salva o IMAGE_MAP.json atualizado"""
        if dry_run:
            output_path = self.image_map_path.with_name('IMAGE_MAP_MIGRATED.json')
            print(f"\n🔍 Modo DRY-RUN: Salvando em {output_path}")
        else:
            self.save_backup()
            output_path = self.image_map_path
            print(f"\n💾 Salvando IMAGE_MAP.json atualizado...")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(updated_map, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Salvo com sucesso: {output_path}")
    
    def print_report(self):
        """Imprime relatório de migração"""
        print("\n" + "="*80)
        print("📊 RELATÓRIO DE MIGRAÇÃO")
        print("="*80)
        print(f"\nTotal de SKUs processados:     {self.stats['total_skus']}")
        print(f"Migrados para WebP:            {self.stats['migrated_to_webp']} ({round(self.stats['migrated_to_webp']/self.stats['total_skus']*100, 1)}%)")
        print(f"Mantidos como original:        {self.stats['kept_original']} ({round(self.stats['kept_original']/self.stats['total_skus']*100, 1)}%)")
        print(f"WebP não encontrado:           {self.stats['not_found']} ({round(self.stats['not_found']/self.stats['total_skus']*100, 1)}%)")
        
        if self.stats['total_size_original'] > 0:
            print(f"\nTamanho original total:        {round(self.stats['total_size_original']/(1024*1024), 2)} MB")
            print(f"Tamanho otimizado total:       {round(self.stats['total_size_optimized']/(1024*1024), 2)} MB")
            print(f"Espaço economizado:            {round(self.stats['space_saved']/(1024*1024), 2)} MB")
            print(f"Taxa de compressão média:      {round(self.stats['space_saved']/self.stats['total_size_original']*100, 2)}%")
        
        print("\n" + "="*80 + "\n")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Migra IMAGE_MAP.json para versões WebP otimizadas')
    parser.add_argument('--image-map', default='static/images-catálogo_distribuidores/IMAGE_MAP.json',
                      help='Path para IMAGE_MAP.json')
    parser.add_argument('--optimized-dir', default='static/images-intelligent-optimized',
                      help='Diretório com imagens WebP otimizadas')
    parser.add_argument('--original-dir', default='static',
                      help='Diretório base das imagens originais')
    parser.add_argument('--dry-run', action='store_true',
                      help='Modo teste: não sobrescreve o original')
    
    args = parser.parse_args()
    
    # Validar paths
    image_map_path = Path(args.image_map)
    if not image_map_path.exists():
        print(f"❌ Erro: IMAGE_MAP.json não encontrado em {image_map_path}")
        return 1
    
    optimized_dir = Path(args.optimized_dir)
    if not optimized_dir.exists():
        print(f"❌ Erro: Diretório de imagens otimizadas não encontrado: {optimized_dir}")
        return 1
    
    # Executar migração
    migrator = ImageMapMigrator(
        image_map_path=str(image_map_path),
        optimized_dir=str(optimized_dir),
        original_base_dir=args.original_dir
    )
    
    updated_map = migrator.migrate()
    migrator.save_migrated(updated_map, dry_run=args.dry_run)
    migrator.print_report()
    
    if args.dry_run:
        print("\n💡 Execute sem --dry-run para aplicar as mudanças")
    else:
        print("\n✅ Migração concluída com sucesso!")
    
    return 0


if __name__ == '__main__':
    exit(main())
