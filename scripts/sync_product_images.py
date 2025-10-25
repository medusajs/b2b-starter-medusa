"""
Script para sincronizar imagens de produtos com o novo diretório
Mapeia SKUs para imagens e cria estrutura otimizada
"""
import os
import json
import shutil
from pathlib import Path
from collections import defaultdict

# Diretórios
IMAGE_SOURCE = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                    r"\images-catálogo_distribuidores")
LOGO_SOURCE = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                   r"\manufacturer-logos")
IMAGE_DEST = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                  r"\products")

# Criar diretório de destino
IMAGE_DEST.mkdir(parents=True, exist_ok=True)


def load_image_map():
    """Carrega mapeamento de imagens"""
    map_file = IMAGE_SOURCE / "IMAGE_MAP.json"
    
    if map_file.exists():
        with open(map_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    return {}


def load_logo_map():
    """Carrega mapeamento de logos"""
    map_file = LOGO_SOURCE / "logo_mapping.json"
    
    if map_file.exists():
        with open(map_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    return {}


def scan_images():
    """Escaneia todas as imagens disponíveis"""
    images = []
    
    for root, dirs, files in os.walk(IMAGE_SOURCE):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                rel_path = os.path.relpath(
                    os.path.join(root, file),
                    IMAGE_SOURCE
                )
                images.append({
                    'filename': file,
                    'path': rel_path,
                    'full_path': os.path.join(root, file),
                    'category': os.path.basename(root)
                })
    
    return images


def normalize_sku(sku):
    """Normaliza SKU para matching"""
    return sku.upper().replace('-', '').replace('_', '').replace(' ', '')


def extract_sku_from_filename(filename):
    """Extrai SKU do nome do arquivo"""
    # Remove extensão
    name = os.path.splitext(filename)[0]
    
    # Remove sufixos comuns
    for suffix in ['_1', '_2', '_3', '-1', '-2', '-3', '_main', '_alt']:
        name = name.replace(suffix, '')
    
    return normalize_sku(name)


def sync_images():
    """Sincroniza imagens para estrutura de produtos"""
    
    print("=" * 80)
    print("SINCRONIZAÇÃO DE IMAGENS DE PRODUTOS")
    print("=" * 80)
    print()
    
    # Carregar mapeamentos
    image_map = load_image_map()
    logo_map = load_logo_map()
    images = scan_images()
    
    print(f"📊 Estatísticas:")
    print(f"   Imagens encontradas: {len(images)}")
    print(f"   Logos disponíveis: {len(logo_map)}")
    print()
    
    # Agrupar por categoria
    by_category = defaultdict(list)
    for img in images:
        by_category[img['category']].append(img)
    
    print(f"📁 Categorias de imagens:")
    for category, imgs in sorted(by_category.items()):
        print(f"   {category:30s} {len(imgs):4d} imagens")
    print()
    
    # Criar estrutura de destino
    categories = {
        'INVERTERS': 'inversores',
        'PANELS': 'paineis',
        'STRINGBOXES': 'stringboxes',
        'STRUCTURES': 'estruturas',
        'BATTERIES': 'baterias',
        'CABLES': 'cabos',
        'ACCESSORIES': 'acessorios',
        'KITS': 'kits',
        'CONTROLLERS': 'controladores',
        'CHARGERS': 'carregadores',
        'PUMPS': 'bombas',
        'STATIONS': 'estacoes',
        'POSTS': 'postes',
    }
    
    # Criar diretórios
    for dest_cat in categories.values():
        (IMAGE_DEST / dest_cat).mkdir(exist_ok=True)
    
    # Copiar imagens
    copied = 0
    skipped = 0
    errors = []
    
    print("🔄 Copiando imagens...")
    
    for img in images:
        try:
            # Determinar categoria de destino
            dest_cat = None
            for key, value in categories.items():
                if key in img['category'].upper():
                    dest_cat = value
                    break
            
            if not dest_cat:
                dest_cat = 'outros'
                (IMAGE_DEST / dest_cat).mkdir(exist_ok=True)
            
            # Caminho de destino
            dest_path = IMAGE_DEST / dest_cat / img['filename']
            
            # Copiar se não existir
            if not dest_path.exists():
                shutil.copy2(img['full_path'], dest_path)
                copied += 1
                
                if copied % 50 == 0:
                    print(f"   Copiadas: {copied}")
            else:
                skipped += 1
                
        except Exception as e:
            errors.append((img['filename'], str(e)))
    
    print(f"\n✅ Cópia concluída:")
    print(f"   ✓ Copiadas: {copied}")
    print(f"   ⊘ Já existiam: {skipped}")
    print(f"   ✗ Erros: {len(errors)}")
    
    if errors:
        print(f"\n⚠️  Erros encontrados:")
        for filename, error in errors[:10]:
            print(f"   • {filename}: {error}")
    
    # Criar mapeamento consolidado
    create_consolidated_map(images, logo_map)
    
    print()
    print("=" * 80)
    print("SINCRONIZAÇÃO CONCLUÍDA")
    print("=" * 80)


def create_consolidated_map(images, logo_map):
    """Cria mapeamento consolidado de produtos"""
    
    product_map = {
        'images': {},
        'logos': logo_map,
        'categories': {}
    }
    
    # Mapear imagens por SKU
    for img in images:
        sku = extract_sku_from_filename(img['filename'])
        
        if sku not in product_map['images']:
            product_map['images'][sku] = []
        
        product_map['images'][sku].append({
            'filename': img['filename'],
            'path': img['path'],
            'category': img['category']
        })
    
    # Agrupar por categoria
    by_cat = defaultdict(list)
    for img in images:
        by_cat[img['category']].append(img['filename'])
    
    product_map['categories'] = dict(by_cat)
    
    # Salvar mapeamento
    map_file = IMAGE_DEST / "product_image_map.json"
    with open(map_file, 'w', encoding='utf-8') as f:
        json.dump(product_map, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Mapeamento consolidado: {map_file}")
    print(f"   SKUs mapeados: {len(product_map['images'])}")
    print(f"   Categorias: {len(product_map['categories'])}")


def generate_report():
    """Gera relatório de imagens"""
    
    report = []
    report.append("# Relatório de Sincronização de Imagens\n")
    report.append(f"Data: {Path().cwd()}\n\n")
    
    # Estatísticas
    images = scan_images()
    logo_map = load_logo_map()
    
    report.append("## Estatísticas\n\n")
    report.append(f"- **Total de imagens**: {len(images)}\n")
    report.append(f"- **Logos disponíveis**: {len(logo_map)}\n")
    report.append(f"- **Diretório origem**: `{IMAGE_SOURCE}`\n")
    report.append(f"- **Diretório destino**: `{IMAGE_DEST}`\n\n")
    
    # Por categoria
    by_category = defaultdict(list)
    for img in images:
        by_category[img['category']].append(img)
    
    report.append("## Imagens por Categoria\n\n")
    report.append("| Categoria | Quantidade |\n")
    report.append("|-----------|------------|\n")
    
    for category, imgs in sorted(by_category.items()):
        report.append(f"| {category} | {len(imgs)} |\n")
    
    report.append("\n")
    
    # Salvar relatório
    report_file = IMAGE_DEST / "SYNC_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.writelines(report)
    
    print(f"\n📄 Relatório gerado: {report_file}")


if __name__ == "__main__":
    sync_images()
    generate_report()
    
    print()
    print("=" * 80)
    print("PRÓXIMOS PASSOS:")
    print("=" * 80)
    print("1. 📝 Revise o mapeamento:")
    print(f"   {IMAGE_DEST / 'product_image_map.json'}")
    print()
    print("2. 🔍 Verifique o relatório:")
    print(f"   {IMAGE_DEST / 'SYNC_REPORT.md'}")
    print()
    print("3. 🔄 Importe para o Medusa:")
    print("   cd ../backend")
    print("   npm run catalog:import")
    print()
    print("4. 🌐 Teste no frontend:")
    print("   cd ../storefront")
    print("   npm run dev")
