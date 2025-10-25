#!/usr/bin/env python3
"""
Script direto para testar imagens específicas que sabemos que existem
"""

import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from skimage.metrics import structural_similarity as ssim
from datetime import datetime


# SKUs confirmados que existem
TEST_SKUS = [
    ('112369', 'ODEX-INVERTERS', 'inverters'),
    ('124358', 'ODEX-STRUCTURES', 'structures'),
    ('152147', 'ODEX-INVERTERS', 'inverters'),
    ('192068', 'ODEX-INVERTERS', 'inverters'),
    ('192576', 'ODEX-INVERTERS', 'inverters'),
    ('215563', 'ODEX-INVERTERS', 'inverters'),
    ('246764', 'ODEX-INVERTERS', 'inverters'),
    ('276954', 'ODEX-INVERTERS', 'inverters'),
    ('289241', 'ODEX-INVERTERS', 'inverters'),
    ('299586', 'ODEX-PANELS', 'panels'),
]


def apply_conservative_profile(img_array, category):
    """Aplica perfil conservador baseado na categoria"""
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    if category in ['inverters', 'panels', 'structures']:
        # Perfil Logo Simples - SEM processamento
        quality = 98
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB), quality
    else:
        # Perfil genérico
        quality = 95
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB), quality


def process_image(sku, folder, category):
    """Processa uma imagem específica"""
    print(f'\n{"="*60}')
    print(f'📸 {sku} ({category})')
    print(f'{"="*60}')
    
    # Paths
    original_dir = Path(f'static/images-catálogo_distribuidores/{folder}')
    original_files = list(original_dir.glob(f'{sku}.*'))
    original_files = [f for f in original_files if f.suffix != '.webp']
    
    if not original_files:
        print(f'❌ Original não encontrado em {original_dir}')
        return None
    
    original_path = original_files[0]
    old_webp_path = Path(f'static/images-intelligent-optimized/{sku}.webp')
    new_webp_path = Path(f'static/images-test-comparison/{sku}-new.webp')
    
    # Criar diretório
    new_webp_path.parent.mkdir(exist_ok=True)
    
    # Carregar original
    try:
        pil_original = Image.open(original_path)
        original_array = np.array(pil_original)
    except Exception as e:
        print(f'❌ Erro ao carregar: {e}')
        return None
    
    print(f'📐 Dimensões: {pil_original.size[0]}x{pil_original.size[1]}')
    print(f'📦 Original: {original_path.stat().st_size / 1024:.2f} KB')
    
    # Tamanho antigo se existir
    if old_webp_path.exists():
        print(f'🔄 Otimização antiga: {old_webp_path.stat().st_size / 1024:.2f} KB')
    
    # Aplicar perfil novo
    processed_array, quality = apply_conservative_profile(original_array, category)
    pil_processed = Image.fromarray(processed_array)
    
    print(f'🎨 Perfil: Logo Simples (quality={quality})')
    
    # Salvar nova otimização
    pil_processed.save(new_webp_path, 'WEBP', quality=quality, method=6)
    
    print(f'✅ Nova otimização: {new_webp_path.stat().st_size / 1024:.2f} KB')
    
    # Calcular SSIM
    original_gray = cv2.cvtColor(np.array(pil_original), cv2.COLOR_RGB2GRAY)
    processed_gray = cv2.cvtColor(processed_array, cv2.COLOR_RGB2GRAY)
    
    ssim_value = ssim(original_gray, processed_gray)
    
    # Contraste
    original_contrast = float(original_gray.std())
    processed_contrast = float(processed_gray.std())
    contrast_change = ((processed_contrast - original_contrast) / original_contrast) * 100
    
    # Nitidez
    original_sharpness = cv2.Laplacian(original_gray, cv2.CV_64F).var()
    processed_sharpness = cv2.Laplacian(processed_gray, cv2.CV_64F).var()
    sharpness_change = ((processed_sharpness - original_sharpness) / original_sharpness) * 100
    
    print(f'📊 SSIM: {ssim_value:.4f}')
    print(f'📊 Contraste: {contrast_change:+.2f}%')
    print(f'📊 Nitidez: {sharpness_change:+.2f}%')
    
    return {
        'sku': sku,
        'category': category,
        'ssim': ssim_value,
        'contrast_change': contrast_change,
        'sharpness_change': sharpness_change,
        'original_size': original_path.stat().st_size / 1024,
        'old_size': old_webp_path.stat().st_size / 1024 if old_webp_path.exists() else None,
        'new_size': new_webp_path.stat().st_size / 1024,
        'quality': quality
    }


def generate_html(results):
    """Gera HTML de comparação"""
    
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Visual - Otimização Conservadora</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            max-width: 1200px;
            margin: 0 auto 60px;
        }}
        .header h1 {{
            font-size: 48px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
        }}
        .header p {{
            color: #888;
            font-size: 18px;
        }}
        .summary {{
            max-width: 1200px;
            margin: 0 auto 40px;
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
            border: 2px solid #333;
        }}
        .summary h2 {{
            color: #667eea;
            margin-bottom: 20px;
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }}
        .summary-item {{
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }}
        .summary-item .label {{
            color: #888;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }}
        .summary-item .value {{
            font-size: 32px;
            font-weight: bold;
            color: #fff;
        }}
        .comparison-grid {{
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            gap: 40px;
        }}
        .comparison-card {{
            background: #1a1a1a;
            border-radius: 15px;
            overflow: hidden;
            border: 2px solid #333;
        }}
        .card-header {{
            background: #667eea;
            padding: 20px;
        }}
        .card-header h3 {{
            font-size: 24px;
            margin-bottom: 8px;
        }}
        .card-header .meta {{
            opacity: 0.9;
            font-size: 14px;
        }}
        .images-row {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px;
            background: #0a0a0a;
        }}
        .image-panel {{
            background: #000;
            position: relative;
        }}
        .image-panel.old {{ background: #1a0a0a; }}
        .image-panel.new {{ background: #0a1a0a; }}
        .image-label {{
            background: rgba(0,0,0,0.8);
            padding: 12px 20px;
            font-weight: bold;
            text-align: center;
            border-bottom: 2px solid #333;
        }}
        .image-label.old {{ background: #8b3a3a; }}
        .image-label.new {{ background: #3a8b5b; }}
        .image-wrapper {{
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }}
        .image-wrapper img {{
            max-width: 100%;
            height: auto;
            display: block;
            border: 1px solid #333;
            image-rendering: -webkit-optimize-contrast;
        }}
        .metrics-panel {{
            padding: 20px;
            background: #2a2a2a;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }}
        .metric {{
            text-align: center;
            padding: 15px;
            background: #1a1a1a;
            border-radius: 8px;
        }}
        .metric .label {{
            color: #888;
            font-size: 12px;
            margin-bottom: 8px;
            text-transform: uppercase;
        }}
        .metric .value {{
            font-size: 24px;
            font-weight: bold;
        }}
        .metric .value.good {{ color: #4ade80; }}
        .metric .value.warning {{ color: #fbbf24; }}
        .metric .value.bad {{ color: #f87171; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Teste Visual de Qualidade</h1>
        <p>Comparação: Otimização Agressiva × Conservadora</p>
        <p><small>Gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}</small></p>
    </div>
"""
    
    # Sumário
    avg_ssim = sum(r['ssim'] for r in results) / len(results)
    avg_contrast = sum(abs(r['contrast_change']) for r in results) / len(results)
    avg_old_reduction = sum(((r['original_size'] - r['old_size']) / r['original_size']) * 100 for r in results if r['old_size']) / len([r for r in results if r['old_size']])
    avg_new_reduction = sum(((r['original_size'] - r['new_size']) / r['original_size']) * 100 for r in results) / len(results)
    
    html += f"""
    <div class="summary">
        <h2>📊 Resumo dos Testes</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">Imagens Testadas</div>
                <div class="value">{len(results)}</div>
            </div>
            <div class="summary-item">
                <div class="label">SSIM Médio</div>
                <div class="value">{avg_ssim:.4f}</div>
            </div>
            <div class="summary-item">
                <div class="label">Contraste Preservado</div>
                <div class="value">{avg_contrast:.1f}%</div>
            </div>
            <div class="summary-item">
                <div class="label">Redução Antiga</div>
                <div class="value">{avg_old_reduction:.1f}%</div>
            </div>
            <div class="summary-item">
                <div class="label">Redução Nova</div>
                <div class="value">{avg_new_reduction:.1f}%</div>
            </div>
        </div>
    </div>
    
    <div class="comparison-grid">
"""
    
    # Cards individuais
    for r in results:
        sku = r['sku']
        ssim_class = 'good' if r['ssim'] >= 0.99 else ('warning' if r['ssim'] >= 0.95 else 'bad')
        contrast_class = 'good' if abs(r['contrast_change']) < 5 else ('warning' if abs(r['contrast_change']) < 15 else 'bad')
        
        html += f"""
        <div class="comparison-card">
            <div class="card-header">
                <h3>{sku}</h3>
                <div class="meta">{r['category'].upper()} | Quality: {r['quality']}</div>
            </div>
            <div class="images-row">
                <div class="image-panel old">
                    <div class="image-label old">Otimização ANTIGA (Agressiva)</div>
                    <div class="image-wrapper">
                        <img src="/static/images-intelligent-optimized/{sku}.webp" alt="{sku} - Antiga">
                    </div>
                </div>
                <div class="image-panel new">
                    <div class="image-label new">Otimização NOVA (Conservadora)</div>
                    <div class="image-wrapper">
                        <img src="/static/images-test-comparison/{sku}-new.webp" alt="{sku} - Nova">
                    </div>
                </div>
            </div>
            <div class="metrics-panel">
                <div class="metric">
                    <div class="label">SSIM</div>
                    <div class="value {ssim_class}">{r['ssim']:.4f}</div>
                </div>
                <div class="metric">
                    <div class="label">Contraste</div>
                    <div class="value {contrast_class}">{r['contrast_change']:+.1f}%</div>
                </div>
                <div class="metric">
                    <div class="label">Tamanho Antigo</div>
                    <div class="value">{r['old_size']:.1f} KB</div>
                </div>
                <div class="metric">
                    <div class="label">Tamanho Novo</div>
                    <div class="value">{r['new_size']:.1f} KB</div>
                </div>
            </div>
        </div>
"""
    
    html += """
    </div>
</body>
</html>
"""
    
    return html


def main():
    print('='*60)
    print('🧪 TESTE DE OTIMIZAÇÃO CONSERVADORA')
    print('='*60)
    
    results = []
    
    for sku, folder, category in TEST_SKUS:
        result = process_image(sku, folder, category)
        if result:
            results.append(result)
    
    if not results:
        print('\n❌ Nenhuma imagem processada com sucesso')
        return
    
    # Gerar HTML
    html = generate_html(results)
    html_path = Path('static/images-test-comparison/comparison-visual.html')
    html_path.parent.mkdir(exist_ok=True)
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f'\n{"="*60}')
    print('✅ TESTE CONCLUÍDO!')
    print(f'{"="*60}')
    print(f'\n📄 Comparação visual: {html_path}')
    print(f'🌐 Abra: http://localhost:9000/images-test-comparison/comparison-visual.html')
    print()


if __name__ == '__main__':
    main()
