"""
Script avançado para baixar logos SVG de alta qualidade sem background
Usa múltiplas fontes: Clearbit, Brandfetch, VectorLogo, e sites oficiais
"""
import os
import requests
import csv
import json
from pathlib import Path
import time
from urllib.parse import quote

# Diretório de destino
LOGOS_DIR = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                 r"\manufacturer-logos")
LOGOS_DIR.mkdir(parents=True, exist_ok=True)

# URLs diretas conhecidas de logos SVG oficiais de alta qualidade
PREMIUM_SVG_LOGOS = {
    "BYD": [
        "https://www.byd.com/content/dam/byd-site/eu/logo/BYD_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/1/11/BYD_logo.svg",
    ],
    "Canadian Solar": [
        "https://www.canadiansolar.com/wp-content/themes/"
        "canadian-solar/images/logo.svg",
        "https://seeklogo.com/images/C/canadian-solar-logo-"
        "8B5E5C5F5F-seeklogo.com.svg",
    ],
    "CLAMPER": [
        "https://clamper.com.br/wp-content/themes/clamper/images/logo.svg",
    ],
    "DEYE": [
        "https://www.deyeinverter.com/static/image/logo.svg",
        "https://seeklogo.com/images/D/deye-logo-seeklogo.com.svg",
    ],
    "EPEVER": [
        "https://www.epever.com/images/logo.svg",
    ],
    "FOXESS": [
        "https://www.fox-ess.com/static/images/logo.svg",
    ],
    "GOODWE": [
        "https://www.goodwe.com/static/images/logo.svg",
        "https://seeklogo.com/images/G/goodwe-logo-seeklogo.com.svg",
    ],
    "GROWATT": [
        "https://www.growatt.com/static/images/logo.svg",
        "https://seeklogo.com/images/G/growatt-logo-seeklogo.com.svg",
    ],
    "HUAWEI": [
        "https://www-file.huawei.com/-/media/corp2020/logo/huawei_logo.svg",
        "https://upload.wikimedia.org/wikipedia/commons/0/04/"
        "Huawei_Standard_logo.svg",
    ],
    "JA SOLAR": [
        "https://www.jasolar.com/uploadfile/2021/0809/logo.svg",
        "https://seeklogo.com/images/J/ja-solar-logo-seeklogo.com.svg",
    ],
    "JINKO SOLAR": [
        "https://seeklogo.com/images/J/jinko-solar-logo-seeklogo.com.svg",
        "https://www.jinkosolar.com/static/images/logo.svg",
    ],
    "K2 Systems": [
        "https://www.k2-systems.com/typo3conf/ext/tw_k2base/"
        "Resources/Public/Images/logo.svg",
    ],
    "NEOSOLAR": [
        "https://www.neosolar.com.br/assets/images/logo.svg",
    ],
    "OSDA": [
        "https://www.osda-solar.com/static/images/logo.svg",
    ],
    "Pratyc": [
        "https://pratyc.com.br/wp-content/themes/pratyc/images/logo.svg",
    ],
    "PYLONTECH": [
        "https://www.pylontech.com.cn/static/images/logo.svg",
        "https://seeklogo.com/images/P/pylontech-logo-seeklogo.com.svg",
    ],
    "RISEN ENERGY": [
        "https://www.risenenergy.com/static/images/logo.svg",
        "https://seeklogo.com/images/R/risen-energy-logo-seeklogo.com.svg",
    ],
    "Romagnole": [
        "https://www.romagnole.com.br/assets/images/logo.svg",
    ],
    "SAJ": [
        "https://www.saj-electric.com/static/images/logo.svg",
    ],
    "SOLFACIL": [
        "https://www.solfacil.com.br/static/images/logo.svg",
    ],
    "TECBOX": [
        "https://tecbox.com.br/wp-content/themes/tecbox/images/logo.svg",
    ],
    "Trina Solar": [
        "https://www.trinasolar.com/static/images/logo.svg",
        "https://seeklogo.com/images/T/trina-solar-logo-seeklogo.com.svg",
    ],
    "ZTROON": [
        "https://www.ztroon.com/static/images/logo.svg",
    ],
}


def normalize_name(name):
    """Normaliza nome para busca"""
    return name.lower().replace(' ', '').replace('.', '')


def get_alternative_sources(manufacturer):
    """Gera URLs alternativas de fontes premium"""
    clean_name = normalize_name(manufacturer)
    spaced_name = manufacturer.lower().replace(' ', '-')
    
    return [
        # Clearbit (empresas públicas)
        f"https://logo.clearbit.com/{clean_name}.com",
        
        # VectorLogo.zone (SVGs curados)
        f"https://vectorlogo.zone/logos/{spaced_name}/{spaced_name}-icon.svg",
        f"https://vectorlogo.zone/logos/{spaced_name}/{spaced_name}-ar21.svg",
        
        # Seeklogo (grande base de SVGs)
        f"https://seeklogo.com/images/{manufacturer[0]}/"
        f"{spaced_name}-logo-seeklogo.com.svg",
        
        # SimpleIcons (ícones de marcas)
        f"https://cdn.simpleicons.org/{clean_name}",
        
        # Wikipedia Commons
        f"https://upload.wikimedia.org/wikipedia/commons/thumb/"
        f"{manufacturer.replace(' ', '_')}_logo.svg/500px-"
        f"{manufacturer.replace(' ', '_')}_logo.svg.png",
    ]


def is_valid_svg(content):
    """Verifica se o conteúdo é um SVG válido"""
    if not content:
        return False
    
    svg_indicators = [b'<svg', b'<?xml', b'viewBox', b'xmlns']
    content_lower = content[:500].lower()
    
    return any(indicator in content_lower for indicator in svg_indicators)


def download_logo(manufacturer, url, session):
    """Baixa um logo de uma URL"""
    try:
        print(f"  Tentando: {url[:70]}...")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                         'AppleWebKit/537.36',
            'Accept': 'image/svg+xml,image/*,*/*',
        }
        
        response = session.get(
            url,
            headers=headers,
            timeout=15,
            allow_redirects=True
        )
        
        if response.status_code == 200 and len(response.content) > 100:
            content_type = response.headers.get('content-type', '').lower()
            
            # Preferir SVG
            if 'svg' in content_type or url.endswith('.svg'):
                if is_valid_svg(response.content):
                    return response.content, 'svg'
            
            # Aceitar PNG se for de boa qualidade (> 10KB)
            elif ('png' in content_type or url.endswith('.png')) and \
                 len(response.content) > 10000:
                return response.content, 'png'
        
        return None, None
        
    except Exception as e:
        print(f"    ✗ Erro: {str(e)[:50]}")
        return None, None


def download_all_logos(csv_path):
    """Processo principal de download"""
    
    print("=" * 80)
    print("DOWNLOAD DE LOGOS SVG PREMIUM - SEM BACKGROUND")
    print("=" * 80)
    print(f"Destino: {LOGOS_DIR}\n")
    
    # Ler fabricantes
    manufacturers = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        manufacturers = [row['manufacturer'] for row in reader
                        if row['manufacturer'].strip()]
    
    print(f"Total de fabricantes: {len(manufacturers)}\n")
    
    session = requests.Session()
    results = {
        'success': [],
        'partial': [],
        'failed': []
    }
    
    for i, manufacturer in enumerate(manufacturers, 1):
        print(f"\n[{i}/{len(manufacturers)}] {manufacturer}")
        print("-" * 60)
        
        downloaded = False
        content = None
        ext = None
        
        # Tentar URLs premium conhecidas primeiro
        if manufacturer in PREMIUM_SVG_LOGOS:
            for url in PREMIUM_SVG_LOGOS[manufacturer]:
                content, ext = download_logo(manufacturer, url, session)
                if content and ext == 'svg':
                    print(f"  ✓ SVG encontrado em fonte premium!")
                    downloaded = True
                    break
                elif content:
                    print(f"  ⚠ Formato {ext} encontrado (preferível SVG)")
        
        # Tentar fontes alternativas
        if not downloaded:
            for url in get_alternative_sources(manufacturer):
                content, ext = download_logo(manufacturer, url, session)
                if content and ext == 'svg':
                    print(f"  ✓ SVG encontrado em fonte alternativa!")
                    downloaded = True
                    break
                time.sleep(0.3)
        
        # Salvar arquivo
        if content:
            normalized = normalize_name(manufacturer)
            filename = f"{normalized}.{ext}"
            filepath = LOGOS_DIR / filename
            
            with open(filepath, 'wb') as f:
                f.write(content)
            
            file_size = len(content) / 1024
            print(f"  💾 Salvo: {filename} ({file_size:.1f} KB)")
            
            if ext == 'svg':
                results['success'].append(manufacturer)
            else:
                results['partial'].append(manufacturer)
        else:
            print(f"  ❌ Nenhum logo encontrado")
            results['failed'].append(manufacturer)
        
        time.sleep(0.5)
    
    # Resumo
    print("\n" + "=" * 80)
    print("RESUMO DO DOWNLOAD")
    print("=" * 80)
    print(f"✓ SVG de alta qualidade: {len(results['success'])}")
    print(f"⚠ Outros formatos: {len(results['partial'])}")
    print(f"❌ Não encontrados: {len(results['failed'])}")
    
    if results['failed']:
        print("\n📝 Fabricantes que precisam de download manual:")
        for m in results['failed']:
            print(f"  • {m}")
    
    if results['partial']:
        print("\n⚠️  Fabricantes com formato não-SVG (considerar substituir):")
        for m in results['partial']:
            print(f"  • {m}")
    
    # Criar mapeamento
    create_mapping(manufacturers)
    
    print("\n" + "=" * 80)
    print("PRÓXIMOS PASSOS:")
    print("=" * 80)
    print("1. Revise os logos em:", LOGOS_DIR)
    print("2. Para logos faltantes, baixe manualmente de:")
    print("   • Sites oficiais dos fabricantes")
    print("   • https://seeklogo.com")
    print("   • https://vectorlogo.zone")
    print("   • https://worldvectorlogo.com")
    print("   • https://brandfetch.com")
    print("3. Garanta que sejam SVG sem background")
    print("4. Execute novamente para atualizar o mapeamento")


def create_mapping(manufacturers):
    """Cria mapeamento JSON"""
    mapping = {}
    
    for manufacturer in manufacturers:
        normalized = normalize_name(manufacturer)
        
        for ext in ['svg', 'png', 'jpg']:
            filepath = LOGOS_DIR / f"{normalized}.{ext}"
            if filepath.exists():
                mapping[manufacturer] = {
                    "filename": f"{normalized}.{ext}",
                    "path": f"/manufacturer-logos/{normalized}.{ext}",
                    "normalized_name": normalized,
                    "format": ext
                }
                break
    
    mapping_file = LOGOS_DIR / "logo_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Mapeamento criado: {mapping_file}")


if __name__ == "__main__":
    csv_path = r"C:\Users\fjuni\Downloads\FABRICANTES_CONSOLIDADOS_CANON.csv"
    
    if not os.path.exists(csv_path):
        print(f"❌ Arquivo não encontrado: {csv_path}")
        exit(1)
    
    download_all_logos(csv_path)
