#!/usr/bin/env python3
"""
Script para criar comparação visual direta entre otimizações
Usa imagens que já existem otimizadas
"""

from pathlib import Path
import json

# SKUs específicos para teste (já otimizados)
test_skus = [
    '112369',  # Inverter
    'FOTUS-KP02-1065kWp',  # Kit
    'ODEX-ODEX-INV-SAJ-17000W',  # Inverter (já re-otimizado)
    '124358',  # Structure
    'FOTUS-KP02-960KWP-MINITRILHO-KITS',  # Kit
]

# Criar HTML de comparação simples
html_content = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste Visual de Otimização</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1a1a1a;
            color: white;
            padding: 40px 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 50px;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header p {
            color: #999;
            font-size: 18px;
        }
        .comparison-container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .comparison-item {
            background: #2a2a2a;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .item-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #444;
        }
        .item-header h2 {
            font-size: 24px;
            color: #667eea;
            margin-bottom: 5px;
        }
        .item-header .category {
            color: #999;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }
        .image-box {
            background: #1a1a1a;
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid #444;
            transition: transform 0.2s, border-color 0.2s;
        }
        .image-box:hover {
            transform: scale(1.02);
            border-color: #667eea;
        }
        .image-box-header {
            padding: 15px;
            background: #333;
            font-weight: bold;
            text-align: center;
        }
        .image-box-header.old {
            background: #8b3a3a;
        }
        .image-box-header.new {
            background: #3a8b5b;
        }
        .image-wrapper {
            position: relative;
            background: #000;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .image-wrapper img {
            max-width: 100%;
            height: auto;
            display: block;
            image-rendering: -webkit-optimize-contrast;
        }
        .image-info {
            padding: 15px;
            font-size: 12px;
            color: #999;
        }
        .image-info div {
            margin-bottom: 5px;
        }
        .metric {
            display: inline-block;
            background: #444;
            padding: 3px 8px;
            border-radius: 3px;
            margin-right: 8px;
        }
        .metric.good { background: #2d5f3f; }
        .metric.bad { background: #5f2d2d; }
        .instructions {
            background: #2a2a2a;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        .instructions h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .instructions ul {
            list-style-position: inside;
            color: #ccc;
        }
        .instructions li {
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Teste Visual de Otimização</h1>
        <p>Compare a qualidade entre as otimizações</p>
    </div>
    
    <div class="comparison-container">
        <div class="instructions">
            <h3>📋 Como Avaliar:</h3>
            <ul>
                <li><strong>Logos:</strong> Devem estar nítidas e sem artefatos</li>
                <li><strong>Texto:</strong> Pequenos textos devem ser legíveis</li>
                <li><strong>Cores:</strong> Devem parecer naturais, não saturadas</li>
                <li><strong>Bordas:</strong> Não devem ter "halos" ou distorções</li>
                <li><strong>Zoom:</strong> Clique com botão direito > "Abrir imagem em nova aba"</li>
            </ul>
        </div>
"""

# Adicionar cada imagem de teste
for sku in test_skus:
    old_path = f"/static/images-intelligent-optimized/{sku}.webp"
    new_path = f"/static/images-test-comparison/new-optimization/{sku}.webp"
    
    # Verificar se existe
    old_exists = Path(f"static/images-intelligent-optimized/{sku}.webp").exists()
    
    if old_exists:
        html_content += f"""
        <div class="comparison-item">
            <div class="item-header">
                <h2>{sku}</h2>
                <div class="category">Teste de Qualidade Visual</div>
            </div>
            <div class="images-grid">
                <div class="image-box">
                    <div class="image-box-header old">Otimização Antiga (Agressiva)</div>
                    <div class="image-wrapper">
                        <img src="{old_path}" alt="{sku} - Antiga">
                    </div>
                    <div class="image-info">
                        <div><span class="metric bad">Denoise: 8</span></div>
                        <div><span class="metric bad">Sharpen: Alto</span></div>
                        <div><span class="metric bad">Quality: 80</span></div>
                    </div>
                </div>
                <div class="image-box">
                    <div class="image-box-header new">Otimização Nova (Conservadora)</div>
                    <div class="image-wrapper">
                        <img src="{new_path}" alt="{sku} - Nova">
                    </div>
                    <div class="image-info">
                        <div><span class="metric good">Denoise: 0-2</span></div>
                        <div><span class="metric good">Sharpen: 0</span></div>
                        <div><span class="metric good">Quality: 95-98</span></div>
                    </div>
                </div>
            </div>
        </div>
"""

html_content += """
    </div>
</body>
</html>
"""

# Salvar HTML
output_path = Path('static/images-test-comparison/visual-comparison.html')
output_path.parent.mkdir(exist_ok=True)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f'✅ HTML de comparação criado: {output_path}')
print(f'🌐 Abra: http://localhost:9000/images-test-comparison/visual-comparison.html')
