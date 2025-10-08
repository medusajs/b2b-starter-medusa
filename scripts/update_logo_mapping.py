"""
Atualiza o mapeamento de logos e gera relatório
"""
import json
from pathlib import Path

LOGOS_DIR = Path(r"C:\Users\fjuni\ysh_medusa\ysh-store\backend\static"
                 r"\manufacturer-logos")

# Lista de fabricantes esperados
MANUFACTURERS = [
    "BYD", "Canadian Solar", "CLAMPER", "DEYE", "EPEVER", "FOXESS",
    "GOODWE", "GROWATT", "HUAWEI", "JA SOLAR", "JINKO SOLAR",
    "K2 Systems", "NEOSOLAR", "OSDA", "Pratyc", "PYLONTECH",
    "RISEN ENERGY", "Romagnole", "SAJ", "SOLFACIL", "TECBOX",
    "Trina Solar", "ZTROON"
]


def normalize_name(name):
    """Normaliza nome para arquivo"""
    return name.lower().replace(' ', '-').replace('.', '')


def update_mapping():
    """Atualiza mapeamento de logos"""
    mapping = {}
    found_svg = []
    found_png = []
    not_found = []
    
    for manufacturer in MANUFACTURERS:
        normalized = normalize_name(manufacturer)
        found = False
        
        # Verificar SVG primeiro (preferência)
        for ext in ['svg', 'png', 'jpg', 'jpeg']:
            filepath = LOGOS_DIR / f"{normalized}.{ext}"
            
            if filepath.exists():
                mapping[manufacturer] = {
                    "filename": f"{normalized}.{ext}",
                    "path": f"/manufacturer-logos/{normalized}.{ext}",
                    "normalized_name": normalized,
                    "format": ext,
                    "size_kb": round(filepath.stat().st_size / 1024, 2)
                }
                
                if ext == 'svg':
                    found_svg.append(manufacturer)
                else:
                    found_png.append(manufacturer)
                
                found = True
                break
        
        if not found:
            not_found.append(manufacturer)
    
    # Salvar mapeamento
    mapping_file = LOGOS_DIR / "logo_mapping.json"
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)
    
    # Gerar relatório
    print("=" * 80)
    print("RELATÓRIO DE LOGOS DOS FABRICANTES")
    print("=" * 80)
    print()
    
    total = len(MANUFACTURERS)
    found_total = len(found_svg) + len(found_png)
    
    print(f"📊 ESTATÍSTICAS")
    print(f"   Total de fabricantes: {total}")
    print(f"   ✅ Logos encontrados: {found_total} ({found_total/total*100:.1f}%)")
    print(f"   📁 SVG (vetorial): {len(found_svg)}")
    print(f"   🖼️  PNG (bitmap): {len(found_png)}")
    print(f"   ❌ Faltando: {len(not_found)}")
    print()
    
    if found_svg:
        print(f"✅ LOGOS SVG ({len(found_svg)}) - ALTA QUALIDADE:")
        for m in found_svg:
            info = mapping[m]
            print(f"   • {m:20s} → {info['filename']:25s} "
                  f"({info['size_kb']} KB)")
        print()
    
    if found_png:
        print(f"🖼️  LOGOS PNG ({len(found_png)}) - CONSIDERAR CONVERSÃO:")
        for m in found_png:
            info = mapping[m]
            print(f"   • {m:20s} → {info['filename']:25s} "
                  f"({info['size_kb']} KB)")
        print()
    
    if not_found:
        print(f"❌ LOGOS FALTANDO ({len(not_found)}):")
        for m in not_found:
            print(f"   • {m}")
        print()
        print("   📖 Consulte DOWNLOAD_GUIDE.md para instruções")
    
    print()
    print("=" * 80)
    print(f"✓ Mapeamento atualizado: {mapping_file}")
    print("=" * 80)
    
    return mapping, found_total, total


def create_html_preview():
    """Cria preview HTML dos logos"""
    html = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - Logos dos Fabricantes</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 20px;
            flex-wrap: wrap;
        }
        
        .stat {
            background: rgba(255,255,255,0.2);
            padding: 15px 30px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
        }
        
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s, box-shadow 0.3s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        .card.missing {
            background: #f8f9fa;
            opacity: 0.6;
        }
        
        .logo-container {
            width: 180px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
        }
        
        .logo-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        
        .manufacturer-name {
            font-weight: 600;
            font-size: 1.1em;
            color: #333;
            text-align: center;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .badge-svg {
            background: #28a745;
            color: white;
        }
        
        .badge-png {
            background: #ffc107;
            color: #333;
        }
        
        .badge-missing {
            background: #dc3545;
            color: white;
        }
        
        .file-info {
            font-size: 0.85em;
            color: #666;
            text-align: center;
        }
        
        .missing-icon {
            font-size: 3em;
            color: #ccc;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🏭 Logos dos Fabricantes</h1>
            <p>Sistema B2B YSH - Catálogo Solar</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-number" id="total-count">23</div>
                    <div class="stat-label">Total</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="found-count">0</div>
                    <div class="stat-label">Disponíveis</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="svg-count">0</div>
                    <div class="stat-label">SVG</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="png-count">0</div>
                    <div class="stat-label">PNG</div>
                </div>
                <div class="stat">
                    <div class="stat-number" id="missing-count">0</div>
                    <div class="stat-label">Faltando</div>
                </div>
            </div>
        </header>
        
        <div class="grid" id="logos-grid">
            <!-- Logos serão inseridos aqui via JavaScript -->
        </div>
    </div>
    
    <script>
        // Dados dos logos
        const manufacturers = __MANUFACTURERS_DATA__;
        const mapping = __MAPPING_DATA__;
        
        let svgCount = 0;
        let pngCount = 0;
        let missingCount = 0;
        
        const grid = document.getElementById('logos-grid');
        
        manufacturers.forEach(manufacturer => {
            const card = document.createElement('div');
            const info = mapping[manufacturer];
            
            if (info) {
                const isSvg = info.format === 'svg';
                
                if (isSvg) svgCount++;
                else pngCount++;
                
                card.className = 'card';
                card.innerHTML = `
                    <div class="logo-container">
                        <img src="${info.path}" alt="${manufacturer}">
                    </div>
                    <div class="manufacturer-name">${manufacturer}</div>
                    <span class="badge ${isSvg ? 'badge-svg' : 'badge-png'}">
                        ${info.format.toUpperCase()}
                    </span>
                    <div class="file-info">
                        ${info.filename}<br>
                        ${info.size_kb} KB
                    </div>
                `;
            } else {
                missingCount++;
                card.className = 'card missing';
                card.innerHTML = `
                    <div class="logo-container">
                        <div class="missing-icon">❌</div>
                    </div>
                    <div class="manufacturer-name">${manufacturer}</div>
                    <span class="badge badge-missing">Faltando</span>
                    <div class="file-info">Logo não disponível</div>
                `;
            }
            
            grid.appendChild(card);
        });
        
        // Atualizar estatísticas
        document.getElementById('total-count').textContent = manufacturers.length;
        document.getElementById('found-count').textContent = svgCount + pngCount;
        document.getElementById('svg-count').textContent = svgCount;
        document.getElementById('png-count').textContent = pngCount;
        document.getElementById('missing-count').textContent = missingCount;
    </script>
</body>
</html>
"""
    
    # Carregar mapeamento
    mapping_file = LOGOS_DIR / "logo_mapping.json"
    with open(mapping_file, 'r', encoding='utf-8') as f:
        mapping = json.load(f)
    
    # Substituir placeholders
    html = html.replace('__MANUFACTURERS_DATA__',
                       json.dumps(MANUFACTURERS))
    html = html.replace('__MAPPING_DATA__', json.dumps(mapping))
    
    # Salvar HTML
    preview_file = LOGOS_DIR / "preview.html"
    with open(preview_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"\n🌐 Preview HTML criado: {preview_file}")
    print(f"   Abra em um navegador para visualizar os logos")


if __name__ == "__main__":
    mapping, found, total = update_mapping()
    create_html_preview()
    
    print()
    print("=" * 80)
    print("PRÓXIMAS AÇÕES:")
    print("=" * 80)
    
    if found < total:
        missing = total - found
        print(f"1. ❌ Baixar os {missing} logos faltantes")
        print("   📖 Consulte: DOWNLOAD_GUIDE.md")
        print()
    
    print("2. 🌐 Visualizar preview:")
    print(f"   Abra: {LOGOS_DIR / 'preview.html'}")
    print()
    print("3. 🔄 Sincronizar imagens de produtos")
    print("   Execute: python sync_product_images.py")
    print()
    print("4. 📦 Atualizar produtos no Medusa")
    print("   Execute: npm run catalog:import")
