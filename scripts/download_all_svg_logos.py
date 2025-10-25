"""
Script avançado para download de logos SVG de alta qualidade
Usa múltiplas APIs e fontes, depois remove PNGs
"""
import os
import requests
import time
import json
from pathlib import Path
from urllib.parse import quote

LOGOS_DIR = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                 r"\manufacturer-logos")

# Configuração de fabricantes
MANUFACTURERS = {
    "BYD": ["byd", "byd-company"],
    "Canadian Solar": ["canadian-solar", "canadiansolar"],
    "CLAMPER": ["clamper"],
    "DEYE": ["deye", "deye-inverter"],
    "EPEVER": ["epever", "epsolar"],
    "FOXESS": ["foxess", "fox-ess"],
    "GOODWE": ["goodwe", "good-we"],
    "GROWATT": ["growatt"],
    "HUAWEI": ["huawei"],
    "JA SOLAR": ["ja-solar", "jasolar"],
    "JINKO SOLAR": ["jinko-solar", "jinkosolar", "jinko"],
    "K2 Systems": ["k2-systems", "k2systems"],
    "NEOSOLAR": ["neosolar"],
    "OSDA": ["osda"],
    "Pratyc": ["pratyc"],
    "PYLONTECH": ["pylontech", "pylon-tech"],
    "RISEN ENERGY": ["risen-energy", "risenenergy", "risen"],
    "Romagnole": ["romagnole"],
    "SAJ": ["saj-electric", "saj"],
    "SOLFACIL": ["solfacil"],
    "TECBOX": ["tecbox"],
    "Trina Solar": ["trina-solar", "trinasolar", "trina"],
    "ZTROON": ["ztroon"],
}


def normalize_name(name):
    """Normaliza nome para arquivo"""
    return name.lower().replace(' ', '-').replace('.', '')


class LogoDownloader:
    """Classe para download de logos de múltiplas fontes"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                         'AppleWebKit/537.36 (KHTML, like Gecko) '
                         'Chrome/119.0.0.0 Safari/537.36'
        })
        self.stats = {
            'success': [],
            'failed': [],
            'sources': {}
        }
    
    def get_clearbit_logo(self, variants):
        """Tenta buscar logo via Clearbit"""
        for variant in variants:
            urls = [
                f"https://logo.clearbit.com/{variant}.com",
                f"https://logo.clearbit.com/{variant}.com.br",
                f"https://logo.clearbit.com/{variant}.cn",
            ]
            for url in urls:
                try:
                    resp = self.session.get(url, timeout=10)
                    if resp.status_code == 200 and len(resp.content) > 1000:
                        return resp.content, 'png', 'Clearbit'
                except:
                    pass
        return None, None, None
    
    def get_seeklogo(self, name, variants):
        """Busca no Seeklogo"""
        search_terms = [name] + variants
        
        for term in search_terms:
            # Buscar página de resultados
            search_url = f"https://seeklogo.com/search?q={quote(term)}"
            try:
                resp = self.session.get(search_url, timeout=10)
                if resp.status_code == 200:
                    # Procurar por links SVG na página
                    content = resp.text
                    
                    # Padrões comuns de URLs do Seeklogo
                    import re
                    patterns = [
                        r'href="(/images/[A-Z]/[^"]+\.svg)"',
                        r'src="(https://seeklogo\.com/images/[^"]+\.svg)"',
                    ]
                    
                    for pattern in patterns:
                        matches = re.findall(pattern, content)
                        if matches:
                            svg_url = matches[0]
                            if not svg_url.startswith('http'):
                                svg_url = f"https://seeklogo.com{svg_url}"
                            
                            # Baixar SVG
                            svg_resp = self.session.get(svg_url, timeout=10)
                            if (svg_resp.status_code == 200 and 
                                b'<svg' in svg_resp.content[:500]):
                                return svg_resp.content, 'svg', 'Seeklogo'
            except:
                pass
        
        return None, None, None
    
    def get_vectorlogo(self, variants):
        """Busca no VectorLogo.zone"""
        for variant in variants:
            urls = [
                f"https://vectorlogo.zone/logos/{variant}/{variant}-icon.svg",
                f"https://vectorlogo.zone/logos/{variant}/{variant}-ar21.svg",
                f"https://vectorlogo.zone/logos/{variant}/{variant}.svg",
            ]
            
            for url in urls:
                try:
                    resp = self.session.get(url, timeout=10)
                    if (resp.status_code == 200 and 
                        b'<svg' in resp.content[:500]):
                        return resp.content, 'svg', 'VectorLogo'
                except:
                    pass
        
        return None, None, None
    
    def get_simpleicons(self, variants):
        """Busca no SimpleIcons"""
        for variant in variants:
            urls = [
                f"https://cdn.simpleicons.org/{variant}",
                f"https://cdn.simpleicons.org/{variant.replace('-', '')}",
            ]
            
            for url in urls:
                try:
                    resp = self.session.get(url, timeout=10)
                    if (resp.status_code == 200 and 
                        b'<svg' in resp.content[:500]):
                        return resp.content, 'svg', 'SimpleIcons'
                except:
                    pass
        
        return None, None, None
    
    def get_wikimedia(self, name):
        """Busca na Wikimedia Commons - SEGUNDA PRIORIDADE"""
        # Variações de busca
        search_terms = [
            f"{name} logo",
            f"{name} Logo",
            f"{name}",
            f"File:{name}_logo.svg",
            f"File:{name} logo.svg",
        ]
        
        for search_term in search_terms:
            try:
                # Buscar arquivo na Wikimedia
                search_url = (
                    f"https://commons.wikimedia.org/w/api.php"
                    f"?action=query&list=search&srsearch={quote(search_term)}"
                    f"&format=json&srlimit=10&srnamespace=6"
                )
                
                resp = self.session.get(search_url, timeout=15)
                if resp.status_code == 200:
                    data = resp.json()
                    if 'query' in data and 'search' in data['query']:
                        for result in data['query']['search']:
                            title = result['title']
                            
                            # Preferir SVG, mas aceitar PNG
                            if '.svg' in title.lower() or '.png' in title.lower():
                                # Obter URL do arquivo
                                file_url = (
                                    f"https://commons.wikimedia.org/w/api.php"
                                    f"?action=query&titles={quote(title)}"
                                    f"&prop=imageinfo&iiprop=url"
                                    f"&format=json"
                                )
                                
                                file_resp = self.session.get(file_url, timeout=10)
                                if file_resp.status_code == 200:
                                    file_data = file_resp.json()
                                    pages = file_data.get('query', {}).get('pages', {})
                                    
                                    for page in pages.values():
                                        if 'imageinfo' in page:
                                            file_url = page['imageinfo'][0]['url']
                                            
                                            # Baixar arquivo
                                            file_download = self.session.get(
                                                file_url,
                                                timeout=15
                                            )
                                            
                                            if file_download.status_code == 200:
                                                # Verificar tipo
                                                content = file_download.content
                                                
                                                if b'<svg' in content[:500]:
                                                    return content, 'svg', 'Wikimedia'
                                                elif len(content) > 5000 and title.lower().endswith('.png'):
                                                    return content, 'png', 'Wikimedia'
                                
                                time.sleep(0.3)
            except Exception:
                pass
        
        return None, None, None
    
    def get_brandfetch(self, variants):
        """Busca via Brandfetch - PRIORIDADE MÁXIMA"""
        for variant in variants:
            # Múltiplas variações de domínio
            domains = [
                f"{variant}.com",
                f"{variant}.com.br",
                f"{variant}.cn",
                f"{variant}.solar",
                f"{variant}solar.com",
            ]
            
            for domain in domains:
                # Tentar diferentes endpoints do Brandfetch
                urls = [
                    f"https://asset.brandfetch.io/{domain}/logo",
                    f"https://asset.brandfetch.io/{domain}/icon",
                    f"https://logo.brandfetch.io/{domain}",
                    f"https://cdn.brandfetch.io/{domain}/fallback/transparent/",
                    # URLs diretas de busca
                    f"https://brandfetch.com/api/v1/brand/{domain}",
                ]
                
                for url in urls:
                    try:
                        resp = self.session.get(url, timeout=15)
                        
                        if resp.status_code == 200 and len(resp.content) > 500:
                            content_type = resp.headers.get('content-type', '').lower()
                            
                            # Preferir SVG
                            if 'svg' in content_type or b'<svg' in resp.content[:500]:
                                return resp.content, 'svg', 'Brandfetch'
                            
                            # Aceitar PNG de alta qualidade
                            elif 'png' in content_type and len(resp.content) > 5000:
                                return resp.content, 'png', 'Brandfetch'
                    except Exception:
                        pass
                    
                    time.sleep(0.2)  # Rate limiting
        
        return None, None, None
    
    def download_logo(self, manufacturer, variants):
        """Tenta baixar logo de todas as fontes"""
        print(f"\n{'='*70}")
        print(f"🔍 {manufacturer}")
        print('-'*70)
        
        # Lista de métodos a tentar (ordem de prioridade)
        # 1. Brandfetch (prioridade máxima)
        # 2. Wikimedia Commons (segunda prioridade)
        # 3. Outras fontes
        methods = [
            ('Brandfetch', lambda: self.get_brandfetch(variants)),
            ('Wikimedia', lambda: self.get_wikimedia(manufacturer)),
            ('VectorLogo', lambda: self.get_vectorlogo(variants)),
            ('SimpleIcons', lambda: self.get_simpleicons(variants)),
            ('Seeklogo', lambda: self.get_seeklogo(manufacturer, variants)),
            ('Clearbit', lambda: self.get_clearbit_logo(variants)),
        ]
        
        best_content = None
        best_format = None
        best_source = None
        
        for method_name, method in methods:
            print(f"   Tentando {method_name}...", end=' ')
            
            try:
                content, format_type, source = method()
                
                if content:
                    if format_type == 'svg':
                        # SVG encontrado - MELHOR opção, salvar imediatamente
                        normalized = normalize_name(manufacturer)
                        filepath = LOGOS_DIR / f"{normalized}.svg"
                        
                        with open(filepath, 'wb') as f:
                            f.write(content)
                        
                        size_kb = len(content) / 1024
                        print(f"✅ SVG baixado! ({size_kb:.1f} KB)")
                        
                        self.stats['success'].append(manufacturer)
                        self.stats['sources'][manufacturer] = source
                        
                        return True
                    
                    elif format_type == 'png' and not best_content:
                        # PNG encontrado - guardar como backup
                        best_content = content
                        best_format = format_type
                        best_source = source
                        print(f"⚠️  PNG encontrado ({len(content)/1024:.1f} KB) - continuando busca por SVG")
                    else:
                        print("❌")
                else:
                    print("❌")
                    
            except Exception as e:
                print(f"❌ Erro: {str(e)[:30]}")
            
            time.sleep(0.5)
        
        # Se não encontrou SVG mas tem PNG, usar PNG
        if best_content and best_format == 'png':
            normalized = normalize_name(manufacturer)
            filepath = LOGOS_DIR / f"{normalized}.png"
            
            with open(filepath, 'wb') as f:
                f.write(best_content)
            
            size_kb = len(best_content) / 1024
            print(f"   💾 Salvando PNG como fallback ({size_kb:.1f} KB)")
            
            self.stats['success'].append(manufacturer)
            self.stats['sources'][manufacturer] = f"{best_source} (PNG)"
            
            return True
        
        print(f"   ❌ Logo não encontrado em nenhuma fonte")
        self.stats['failed'].append(manufacturer)
        return False
    
    def download_all(self):
        """Baixa todos os logos"""
        print("="*80)
        print("DOWNLOAD MASSIVO DE LOGOS SVG")
        print("="*80)
        print(f"Total de fabricantes: {len(MANUFACTURERS)}\n")
        
        for i, (manufacturer, variants) in enumerate(MANUFACTURERS.items(), 1):
            print(f"\n[{i}/{len(MANUFACTURERS)}]", end=' ')
            self.download_logo(manufacturer, variants)
            time.sleep(1)  # Respeitar rate limits
        
        return self.stats


def remove_png_logos():
    """Remove logos PNG após download de SVGs"""
    print("\n" + "="*80)
    print("REMOÇÃO DE LOGOS PNG")
    print("="*80)
    
    removed = []
    kept = []
    
    for png_file in LOGOS_DIR.glob("*.png"):
        # Verificar se existe versão SVG
        svg_file = png_file.with_suffix('.svg')
        
        if svg_file.exists():
            # Remover PNG
            png_file.unlink()
            removed.append(png_file.name)
            print(f"   ✓ Removido: {png_file.name}")
        else:
            kept.append(png_file.name)
            print(f"   ⚠ Mantido (sem SVG): {png_file.name}")
    
    print(f"\n📊 Resumo:")
    print(f"   Removidos: {len(removed)}")
    print(f"   Mantidos: {len(kept)}")
    
    return removed, kept


def update_mapping():
    """Atualiza mapeamento após downloads"""
    mapping = {}
    
    for manufacturer in MANUFACTURERS.keys():
        normalized = normalize_name(manufacturer)
        
        # Verificar SVG primeiro
        for ext in ['svg', 'png', 'jpg']:
            filepath = LOGOS_DIR / f"{normalized}.{ext}"
            if filepath.exists():
                mapping[manufacturer] = {
                    "filename": f"{normalized}.{ext}",
                    "path": f"/manufacturer-logos/{normalized}.{ext}",
                    "normalized_name": normalized,
                    "format": ext,
                    "size_kb": round(filepath.stat().st_size / 1024, 2)
                }
                break
    
    # Salvar
    mapping_file = LOGOS_DIR / "logo_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    return mapping


def print_final_report(stats, mapping):
    """Imprime relatório final"""
    print("\n" + "="*80)
    print("RELATÓRIO FINAL")
    print("="*80)
    
    total = len(MANUFACTURERS)
    svg_count = sum(1 for m in mapping.values() if m['format'] == 'svg')
    png_count = sum(1 for m in mapping.values() if m['format'] == 'png')
    missing = total - len(mapping)
    
    print(f"\n📊 ESTATÍSTICAS FINAIS:")
    print(f"   Total de fabricantes: {total}")
    print(f"   ✅ Logos SVG: {svg_count} ({svg_count/total*100:.1f}%)")
    print(f"   🖼️  Logos PNG: {png_count} ({png_count/total*100:.1f}%)")
    print(f"   ❌ Faltando: {missing}")
    
    if stats['sources']:
        print(f"\n📡 FONTES UTILIZADAS:")
        sources_count = {}
        for source in stats['sources'].values():
            sources_count[source] = sources_count.get(source, 0) + 1
        
        for source, count in sorted(sources_count.items(),
                                    key=lambda x: x[1],
                                    reverse=True):
            print(f"   {source:15s} {count:3d} logos")
    
    if stats['failed']:
        print(f"\n❌ FABRICANTES SEM LOGO ({len(stats['failed'])}):")
        for m in stats['failed']:
            print(f"   • {m}")
        print("\n   💡 Estes precisam ser baixados manualmente")
        print("   📖 Consulte: DOWNLOAD_GUIDE.md")
    
    print("\n" + "="*80)
    print("✅ PROCESSO CONCLUÍDO COM SUCESSO!")
    print("="*80)


if __name__ == "__main__":
    print("\n🚀 Iniciando download massivo de logos SVG...")
    
    # Download de logos
    downloader = LogoDownloader()
    stats = downloader.download_all()
    
    # Aguardar um pouco
    print("\n⏳ Aguardando 3 segundos...")
    time.sleep(3)
    
    # Remover PNGs
    removed, kept = remove_png_logos()
    
    # Atualizar mapeamento
    print("\n🔄 Atualizando mapeamento...")
    mapping = update_mapping()
    
    # Relatório final
    print_final_report(stats, mapping)
    
    print("\n🎉 Todos os passos concluídos!")
    print(f"📁 Logos em: {LOGOS_DIR}")
    print(f"📄 Mapeamento: {LOGOS_DIR / 'logo_mapping.json'}")
    print(f"🌐 Preview: {LOGOS_DIR / 'preview.html'}")
