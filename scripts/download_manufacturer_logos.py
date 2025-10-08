"""
Script para baixar logos oficiais de fabricantes de equipamentos solares
"""
import os
import requests
import csv
from pathlib import Path
import time
from urllib.parse import quote

# Diretório de destino para os logos
LOGOS_DIR = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static\manufacturer-logos")
LOGOS_DIR.mkdir(parents=True, exist_ok=True)

# Mapeamento de fabricantes com URLs oficiais conhecidas
OFFICIAL_LOGOS = {
    "BYD": "https://www.byd.com/content/dam/byd-site/eu/logo/BYD_logo.svg",
    "Canadian Solar": "https://www.canadiansolar.com/wp-content/themes/canadian-solar/images/logo.svg",
    "DEYE": "https://www.deyeinverter.com/static/image/logo.png",
    "FOXESS": "https://www.fox-ess.com/static/images/logo.png",
    "GOODWE": "https://www.goodwe.com/static/images/logo.png",
    "GROWATT": "https://www.growatt.com/static/images/logo.png",
    "HUAWEI": "https://www-file.huawei.com/-/media/corp2020/logo/huawei_logo.svg",
    "JA SOLAR": "https://www.jasolar.com/uploadfile/2021/0809/logo.png",
    "JINKO SOLAR": "https://www.jinkosolar.com/en/site/logo",
    "K2 Systems": "https://www.k2-systems.com/typo3conf/ext/tw_k2base/Resources/Public/Images/logo.svg",
    "PYLONTECH": "https://www.pylontech.com.cn/static/images/logo.png",
    "RISEN ENERGY": "https://www.risenenergy.com/static/images/logo.png",
    "SAJ": "https://www.saj-electric.com/static/images/logo.png",
    "SOLFACIL": "https://www.solfacil.com.br/static/images/logo.svg",
    "Trina Solar": "https://www.trinasolar.com/static/images/logo.png",
}

# URLs alternativas de busca (usar Wikipedia, sites oficiais, etc)
def get_logo_search_urls(manufacturer_name):
    """Gera URLs de busca alternativas para logos"""
    encoded_name = quote(f"{manufacturer_name} solar logo")
    
    return [
        # Clearbit Logo API (muito confiável para empresas)
        f"https://logo.clearbit.com/{manufacturer_name.lower().replace(' ', '')}.com",
        
        # Wikipedia Commons (fonte livre)
        f"https://en.wikipedia.org/wiki/File:{manufacturer_name.replace(' ', '_')}_logo.svg",
    ]

def normalize_filename(manufacturer):
    """Normaliza nome do fabricante para nome de arquivo"""
    return manufacturer.lower().replace(' ', '-').replace('.', '')

def download_logo(manufacturer, url, session):
    """Baixa um logo de uma URL"""
    try:
        print(f"Tentando baixar logo de {manufacturer} de {url}")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = session.get(url, headers=headers, timeout=10, allow_redirects=True)
        
        if response.status_code == 200:
            # Determinar extensão do arquivo
            content_type = response.headers.get('content-type', '').lower()
            
            if 'svg' in content_type or url.endswith('.svg'):
                ext = 'svg'
            elif 'png' in content_type or url.endswith('.png'):
                ext = 'png'
            elif 'jpeg' in content_type or 'jpg' in content_type or url.endswith(('.jpg', '.jpeg')):
                ext = 'jpg'
            else:
                ext = 'png'  # padrão
            
            filename = f"{normalize_filename(manufacturer)}.{ext}"
            filepath = LOGOS_DIR / filename
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✓ Logo salvo: {filepath}")
            return True
        else:
            print(f"✗ Erro {response.status_code} ao baixar de {url}")
            return False
            
    except Exception as e:
        print(f"✗ Erro ao baixar logo: {e}")
        return False

def download_all_logos(csv_path):
    """Baixa logos de todos os fabricantes do CSV"""
    
    print("=" * 80)
    print("DOWNLOAD DE LOGOS DE FABRICANTES")
    print("=" * 80)
    print(f"Diretório de destino: {LOGOS_DIR}")
    print()
    
    manufacturers = []
    
    # Ler CSV
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        manufacturers = [row['manufacturer'] for row in reader if row['manufacturer'].strip()]
    
    print(f"Total de fabricantes: {len(manufacturers)}")
    print()
    
    session = requests.Session()
    success_count = 0
    failed = []
    
    for manufacturer in manufacturers:
        print(f"\n{'=' * 80}")
        print(f"Processando: {manufacturer}")
        print(f"{'=' * 80}")
        
        downloaded = False
        
        # Tentar URL oficial primeiro
        if manufacturer in OFFICIAL_LOGOS:
            url = OFFICIAL_LOGOS[manufacturer]
            downloaded = download_logo(manufacturer, url, session)
        
        # Tentar URLs alternativas
        if not downloaded:
            for url in get_logo_search_urls(manufacturer):
                if download_logo(manufacturer, url, session):
                    downloaded = True
                    break
                time.sleep(0.5)  # Pausa entre tentativas
        
        if downloaded:
            success_count += 1
        else:
            failed.append(manufacturer)
            print(f"⚠ Não foi possível baixar logo para {manufacturer}")
        
        time.sleep(1)  # Pausa entre fabricantes
    
    # Resumo
    print("\n" + "=" * 80)
    print("RESUMO")
    print("=" * 80)
    print(f"Total: {len(manufacturers)}")
    print(f"Sucesso: {success_count}")
    print(f"Falhas: {len(failed)}")
    
    if failed:
        print("\nFabricantes sem logo baixado:")
        for m in failed:
            print(f"  - {m}")
        print("\n⚠ Para estes fabricantes, você precisará:")
        print("  1. Buscar manualmente nos sites oficiais")
        print("  2. Ou usar serviços como Clearbit, Brandfetch")
        print("  3. Ou extrair da Wikipedia/Commons")
    
    print(f"\nLogos salvos em: {LOGOS_DIR}")
    
    # Criar arquivo de mapeamento
    create_logo_mapping(manufacturers)

def create_logo_mapping(manufacturers):
    """Cria arquivo JSON com mapeamento de logos"""
    import json
    
    mapping = {}
    
    for manufacturer in manufacturers:
        normalized = normalize_filename(manufacturer)
        
        # Verificar quais extensões existem
        for ext in ['svg', 'png', 'jpg']:
            filepath = LOGOS_DIR / f"{normalized}.{ext}"
            if filepath.exists():
                mapping[manufacturer] = {
                    "filename": f"{normalized}.{ext}",
                    "path": f"/manufacturer-logos/{normalized}.{ext}",
                    "normalized_name": normalized
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
    
    print("\n" + "=" * 80)
    print("PRÓXIMOS PASSOS:")
    print("=" * 80)
    print("1. Revise os logos baixados")
    print("2. Para logos faltantes, baixe manualmente de:")
    print("   - Sites oficiais dos fabricantes")
    print("   - https://clearbit.com/logo")
    print("   - https://brandfetch.com/")
    print("   - https://commons.wikimedia.org/")
    print("3. Salve com o nome normalizado (ex: canadian-solar.png)")
    print("4. Execute novamente para atualizar o mapeamento")
