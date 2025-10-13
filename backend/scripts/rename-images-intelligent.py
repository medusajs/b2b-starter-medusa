#!/usr/bin/env python3
"""
Renomeação Inteligente de Imagens de Produtos
Renomeia arquivos físicos seguindo padrão padronizado e atualiza IMAGE_MAP.json

Padrão: FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA-DISTRIBUIDOR.webp
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
import re


# Configuração
CATALOG_DIR = Path('static/images-catálogo_distribuidores')
IMAGE_MAP_PATH = CATALOG_DIR / 'IMAGE_MAP.json'
DATASETS_PATH = Path('data/catalog/data/catalog/distributor_datasets')

# Mapeamento de datasets para processar
DATASETS = [
    {
        'file': DATASETS_PATH / 'odex/odex-inverters.json',
        'distributor': 'ODEX',
        'category': 'inverters',
        'image_dir': CATALOG_DIR / 'ODEX-INVERTERS'
    },
    {
        'file': DATASETS_PATH / 'odex/odex-panels.json',
        'distributor': 'ODEX',
        'category': 'panels',
        'image_dir': CATALOG_DIR / 'ODEX-PANELS'
    },
    {
        'file': DATASETS_PATH / 'odex/odex-structures.json',
        'distributor': 'ODEX',
        'category': 'structures',
        'image_dir': CATALOG_DIR / 'ODEX-STRUCTURES'
    },
    {
        'file': DATASETS_PATH / 'solfacil/solfacil-inverters.json',
        'distributor': 'SOLFACIL',
        'category': 'inverters',
        'image_dir': CATALOG_DIR / 'SOLFACIL-INVERTERS'
    },
    {
        'file': DATASETS_PATH / 'solfacil/solfacil-panels.json',
        'distributor': 'SOLFACIL',
        'category': 'panels',
        'image_dir': CATALOG_DIR / 'SOLFACIL-PANELS'
    },
    {
        'file': DATASETS_PATH / 'fotus/fotus-kits.json',
        'distributor': 'FOTUS',
        'category': 'kits',
        'image_dir': CATALOG_DIR / 'FOTUS-KITS'
    },
]


def sanitize_filename(text):
    """Sanitiza texto para nome de arquivo"""
    if not text or text == 'N/A' or text == '':
        return ''
    
    text = str(text).upper()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = text.strip('-')
    
    return text[:50]


def extract_power_from_name(name):
    """Extrai potência do nome do produto"""
    patterns = [
        r'(\d+\.?\d*)\s*kW',
        r'(\d+\.?\d*)\s*KW',
        r'(\d+)\s*W(?!\w)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, name, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            unit = match.group(0)[-2:].upper()
            if 'KW' not in unit:
                value = value / 1000
            
            # Formatar
            if value >= 1:
                return f"{value:.1f}KW".replace('.0KW', 'KW')
            else:
                return f"{int(value * 1000)}W"
    
    return None


def generate_standard_name(product, distributor):
    """
    Gera nome padronizado:
    FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA-DISTRIBUIDOR
    """
    
    parts = []
    
    # 1. FABRICANTE
    manufacturer = (product.get('manufacturer') or 
                   product.get('brand') or '')
    if manufacturer and manufacturer != 'N/A':
        parts.append(sanitize_filename(manufacturer))
    
    # 2. CATEGORIA
    category = product.get('category', product.get('type', ''))
    if category and category != 'N/A':
        cat_clean = sanitize_filename(category)
        cat_map = {
            'INVERTERS': 'INV',
            'PANELS': 'PANEL',
            'KITS': 'KIT',
            'BATTERIES': 'BAT',
            'STRUCTURES': 'STRUCT',
            'CABLES': 'CABLE',
            'ACCESSORIES': 'ACC'
        }
        parts.append(cat_map.get(cat_clean, cat_clean))
    
    # 3. TIPO
    name = product.get('name', '')
    tipo = ''
    
    tipo_patterns = {
        'GRIDTIE': r'GRID[-\s]?TIE',
        'HIBRIDO': r'H[IÍ]BRIDO',
        'OFFGRID': r'OFF[-\s]?GRID',
        'BIFACIAL': r'BIFACIAL',
        'MICRO': r'MICRO[-\s]?INVERSOR',
    }
    
    for tipo_key, pattern in tipo_patterns.items():
        if re.search(pattern, name.upper()):
            tipo = tipo_key
            break
    
    if tipo:
        parts.append(tipo)
    
    # 4. MODELO
    model = product.get('model', '')
    if not model or model == 'N/A' or model == '':
        # Extrair do nome
        model_patterns = [
            r'([A-Z]+[0-9]+[A-Z0-9-]*)',  # Ex: R5-3K-T2, IQ8P-72
            r'([A-Z]{2,}[-\s]*\d+[\w-]*)',  # Ex: PRIMO 8.2
        ]
        for pattern in model_patterns:
            match = re.search(pattern, name.upper())
            if match:
                model = match.group(1).replace(' ', '-')
                break
    
    if model and model != 'N/A':
        parts.append(sanitize_filename(model)[:25])
    
    # 5. POTÊNCIA
    power = (product.get('potencia_kwp') or 
            product.get('power_w') or 
            product.get('kwp') or '')
    
    if not power or power == 'N/A':
        power = extract_power_from_name(name)
    else:
        try:
            power_val = float(power)
            if power_val >= 1:
                power = f"{power_val:.1f}KW".replace('.0KW', 'KW')
            else:
                power = f"{int(power_val * 1000)}W"
        except:
            power = None
    
    if power:
        parts.append(sanitize_filename(str(power)))
    
    # 6. DISTRIBUIDOR
    parts.append(sanitize_filename(distributor))
    
    # Juntar
    filename = '-'.join([p for p in parts if p])
    
    if not filename:
        filename = f"UNKNOWN-{sanitize_filename(distributor)}"
    
    return filename


def find_image_file(sku, image_dir):
    """Encontra arquivo de imagem por SKU"""
    if not image_dir.exists():
        return None
    
    # Tentar diferentes extensões
    for ext in ['.jpg', '.jpeg', '.png', '.webp']:
        # SKU exato
        img_path = image_dir / f'{sku}{ext}'
        if img_path.exists():
            return img_path
        
        # Variações case-insensitive
        for file in image_dir.glob(f'{sku}*{ext}'):
            if file.stem.upper() == sku.upper():
                return file
    
    return None


def rename_images(dry_run=True):
    """Renomeia imagens seguindo padrão padronizado"""
    
    print('='*80)
    print('📝 RENOMEAÇÃO INTELIGENTE DE IMAGENS')
    print('='*80)
    print(f'Modo: {"DRY RUN (simulação)" if dry_run else "PRODUÇÃO"}')
    print()
    
    # Carregar IMAGE_MAP atual
    with open(IMAGE_MAP_PATH, 'r', encoding='utf-8') as f:
        image_map = json.load(f)
    
    rename_log = []
    stats = {
        'total_products': 0,
        'renamed': 0,
        'skipped_no_image': 0,
        'skipped_not_found': 0,
        'errors': 0
    }
    
    for dataset_config in DATASETS:
        if not dataset_config['file'].exists():
            print(f"⚠️  Dataset não encontrado: {dataset_config['file']}")
            continue
        
        print(f'\n{"="*80}')
        print(f"📂 {dataset_config['distributor']} - "
              f"{dataset_config['category']}")
        print(f'{"="*80}')
        
        # Carregar produtos
        with open(dataset_config['file'], 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        stats['total_products'] += len(products)
        
        for product in products:
            # Gerar nome padronizado
            new_name = generate_standard_name(
                product, 
                dataset_config['distributor']
            )
            
            # Encontrar imagem atual
            image_path_str = product.get('image', '')
            if not image_path_str:
                stats['skipped_no_image'] += 1
                continue
            
            # Extrair SKU do caminho da imagem
            image_path = Path(image_path_str)
            old_sku = image_path.stem
            
            # Remover prefixos comuns
            for prefix in ['IMAGE_PRODUCT_', 'sku_', 'PRODUCT-']:
                if old_sku.startswith(prefix):
                    old_sku = old_sku[len(prefix):]
            
            # Encontrar arquivo físico
            old_file = find_image_file(old_sku, dataset_config['image_dir'])
            
            if not old_file:
                stats['skipped_not_found'] += 1
                continue
            
            # Novo caminho
            new_file = dataset_config['image_dir'] / f'{new_name}.webp'
            
            # Log
            rename_entry = {
                'old_sku': old_sku,
                'old_file': str(old_file),
                'new_name': new_name,
                'new_file': str(new_file),
                'product': product.get('name', '')[:60],
                'distributor': dataset_config['distributor']
            }
            rename_log.append(rename_entry)
            
            print(f'\n✅ {old_sku}')
            print(f'   → {new_name}.webp')
            print(f'   Produto: {product.get("name", "")[:70]}')
            
            if not dry_run:
                try:
                    # Renomear arquivo
                    shutil.move(str(old_file), str(new_file))
                    
                    # Atualizar IMAGE_MAP
                    if old_sku in image_map.get('mappings', {}):
                        entry = image_map['mappings'][old_sku]
                        
                        # Criar nova entrada com novo SKU
                        image_map['mappings'][new_name] = {
                            **entry,
                            'sku': new_name,
                            'images': {
                                'original': f'/static/images-catálogo_distribuidores/{dataset_config["image_dir"].name}/{new_name}.webp',
                                'thumb': f'/static/images-catálogo_distribuidores/{dataset_config["image_dir"].name}/{new_name}.webp',
                                'medium': f'/static/images-catálogo_distribuidores/{dataset_config["image_dir"].name}/{new_name}.webp',
                                'large': f'/static/images-catálogo_distribuidores/{dataset_config["image_dir"].name}/{new_name}.webp'
                            },
                            'optimization': {
                                **entry.get('optimization', {}),
                                'renamed_at': datetime.now().isoformat(),
                                'old_sku': old_sku
                            }
                        }
                        
                        # Remover entrada antiga
                        del image_map['mappings'][old_sku]
                    
                    stats['renamed'] += 1
                    
                except Exception as e:
                    print(f'   ❌ Erro: {e}')
                    stats['errors'] += 1
            else:
                stats['renamed'] += 1
    
    # Salvar relatório
    report_path = Path('static/images-renaming-report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'generated_at': datetime.now().isoformat(),
            'dry_run': dry_run,
            'stats': stats,
            'renames': rename_log
        }, f, ensure_ascii=False, indent=2)
    
    # Atualizar IMAGE_MAP se não for dry run
    if not dry_run:
        # Backup
        backup_path = IMAGE_MAP_PATH.parent / 'IMAGE_MAP.json.backup-v4'
        shutil.copy(IMAGE_MAP_PATH, backup_path)
        
        # Atualizar versão
        image_map['version'] = '5.0'
        image_map['generated_at'] = datetime.now().isoformat()
        
        # Salvar
        with open(IMAGE_MAP_PATH, 'w', encoding='utf-8') as f:
            json.dump(image_map, f, ensure_ascii=False, indent=2)
        
        print(f'\n✅ IMAGE_MAP.json atualizado para v5.0')
        print(f'💾 Backup salvo: {backup_path}')
    
    # Resumo
    print(f'\n{"="*80}')
    print('📊 RESUMO DA RENOMEAÇÃO')
    print(f'{"="*80}')
    print(f'\n📦 Total de produtos: {stats["total_products"]}')
    print(f'✅ Renomeados: {stats["renamed"]}')
    print(f'⚠️  Sem imagem: {stats["skipped_no_image"]}')
    print(f'⚠️  Não encontrados: {stats["skipped_not_found"]}')
    print(f'❌ Erros: {stats["errors"]}')
    print(f'\n📄 Relatório salvo: {report_path}')
    
    if dry_run:
        print(f'\n💡 Execute novamente com --apply para aplicar as mudanças')


def main():
    import sys
    
    dry_run = '--apply' not in sys.argv
    rename_images(dry_run=dry_run)


if __name__ == '__main__':
    main()
