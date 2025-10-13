#!/usr/bin/env python3
"""
Script de teste para diferentes perfis de otimização
Processa amostras aleatórias e gera comparação visual
"""

import json
import random
import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from datetime import datetime


class OptimizationTester:
    def __init__(self, output_dir: str = 'static/images-test-comparison'):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Criar subdiretórios
        (self.output_dir / 'original').mkdir(exist_ok=True)
        (self.output_dir / 'old-optimization').mkdir(exist_ok=True)
        (self.output_dir / 'new-optimization').mkdir(exist_ok=True)
        
        self.results = []
    
    def get_random_samples(self, image_map_path: str, samples_per_category: int = 2):
        """Seleciona amostras aleatórias por categoria"""
        with open(image_map_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Agrupar por categoria
        by_category = {}
        for sku, entry in data['mappings'].items():
            category = entry.get('category', 'unknown')
            if category not in by_category:
                by_category[category] = []
            by_category[category].append(sku)
        
        # Selecionar amostras
        samples = []
        priority_categories = ['inverters', 'kits', 'panels', 'chargers', 'controllers']
        
        for cat in priority_categories:
            if cat in by_category:
                available = by_category[cat]
                selected = random.sample(available, min(samples_per_category, len(available)))
                for sku in selected:
                    samples.append({
                        'sku': sku,
                        'category': cat,
                        'data': data['mappings'][sku]
                    })
        
        return samples
    
    def apply_profile_logo_simples(self, img_array):
        """Perfil conservador para logos e produtos simples"""
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # SEM denoise
        # SEM sharpen
        # SEM ajuste de contraste
        # Apenas converter para RGB
        
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    
    def apply_profile_diagrama_tecnico(self, img_array):
        """Perfil para diagramas técnicos"""
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Denoise muito leve
        img_denoised = cv2.fastNlMeansDenoisingColored(img_bgr, None, 1, 1, 7, 21)
        
        # Contraste mínimo
        lab = cv2.cvtColor(img_denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.02, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        img_enhanced = cv2.merge([l_enhanced, a, b])
        img_enhanced = cv2.cvtColor(img_enhanced, cv2.COLOR_LAB2BGR)
        
        return cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2RGB)
    
    def apply_profile_produto_fotografia(self, img_array):
        """Perfil para fotos de produtos"""
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # Denoise leve
        img_denoised = cv2.fastNlMeansDenoisingColored(img_bgr, None, 2, 2, 7, 21)
        
        # Contraste suave
        lab = cv2.cvtColor(img_denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.05, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l)
        img_enhanced = cv2.merge([l_enhanced, a, b])
        img_enhanced = cv2.cvtColor(img_enhanced, cv2.COLOR_LAB2BGR)
        
        # Sharpen muito suave
        kernel = np.array([[-0.5, -0.5, -0.5],
                          [-0.5, 5.0, -0.5],
                          [-0.5, -0.5, -0.5]])
        img_sharpened = cv2.filter2D(img_enhanced, -1, kernel * 0.5)
        
        return cv2.cvtColor(img_sharpened, cv2.COLOR_BGR2RGB)
    
    def get_profile_for_category(self, category: str):
        """Retorna perfil e qualidade baseado na categoria"""
        profiles = {
            'inverters': ('logo_simples', 98, self.apply_profile_logo_simples),
            'panels': ('logo_simples', 98, self.apply_profile_logo_simples),
            'stringboxes': ('logo_simples', 98, self.apply_profile_logo_simples),
            'kits': ('diagrama_tecnico', 95, self.apply_profile_diagrama_tecnico),
            'kits-hibridos': ('diagrama_tecnico', 95, self.apply_profile_diagrama_tecnico),
            'chargers': ('produto_fotografia', 90, self.apply_profile_produto_fotografia),
            'controllers': ('produto_fotografia', 90, self.apply_profile_produto_fotografia),
            'batteries': ('produto_fotografia', 90, self.apply_profile_produto_fotografia),
        }
        return profiles.get(category, ('logo_simples', 95, self.apply_profile_logo_simples))
    
    def process_sample(self, sample):
        """Processa uma amostra individual"""
        sku = sample['sku']
        category = sample['category']
        
        print(f'\n📸 Processando: {sku} ({category})')
        
        # Encontrar original
        original_paths = list(Path('static/images-catálogo_distribuidores').rglob(f'{sku}.*'))
        original_paths = [p for p in original_paths if p.suffix != '.webp']
        
        if not original_paths:
            print(f'  ❌ Original não encontrado')
            return None
        
        original_path = original_paths[0]
        
        # Carregar original
        pil_original = Image.open(original_path)
        original_array = np.array(pil_original)
        
        print(f'  📐 Dimensões: {pil_original.size[0]}x{pil_original.size[1]}')
        print(f'  📦 Tamanho original: {original_path.stat().st_size / 1024:.2f} KB')
        
        # Verificar se existe otimização antiga
        old_webp_path = Path('static/images-intelligent-optimized') / f'{sku}.webp'
        old_webp_exists = old_webp_path.exists()
        
        if old_webp_exists:
            old_size = old_webp_path.stat().st_size / 1024
            print(f'  🔄 Otimização antiga: {old_size:.2f} KB')
        
        # Aplicar perfil novo
        profile_name, quality, profile_func = self.get_profile_for_category(category)
        print(f'  🎨 Perfil aplicado: {profile_name} (quality={quality})')
        
        processed_array = profile_func(original_array)
        pil_processed = Image.fromarray(processed_array)
        
        # Salvar versões para comparação
        # 1. Original (cópia)
        original_copy_path = self.output_dir / 'original' / f'{sku}.jpg'
        pil_original.save(original_copy_path, 'JPEG', quality=95)
        
        # 2. Otimização antiga (cópia se existir)
        if old_webp_exists:
            old_copy_path = self.output_dir / 'old-optimization' / f'{sku}.webp'
            pil_old = Image.open(old_webp_path)
            pil_old.save(old_copy_path, 'WEBP', quality=quality)
        
        # 3. Nova otimização
        new_webp_path = self.output_dir / 'new-optimization' / f'{sku}.webp'
        pil_processed.save(new_webp_path, 'WEBP', quality=quality, method=6)
        
        new_size = new_webp_path.stat().st_size / 1024
        print(f'  ✅ Nova otimização: {new_size:.2f} KB')
        
        # Calcular métricas
        original_gray = cv2.cvtColor(np.array(pil_original), cv2.COLOR_RGB2GRAY)
        processed_gray = cv2.cvtColor(processed_array, cv2.COLOR_RGB2GRAY)
        
        # SSIM
        from skimage.metrics import structural_similarity as ssim
        ssim_value = ssim(original_gray, processed_gray)
        
        # Contraste
        original_contrast = float(original_gray.std())
        processed_contrast = float(processed_gray.std())
        contrast_change = ((processed_contrast - original_contrast) / original_contrast) * 100
        
        # Nitidez
        original_sharpness = cv2.Laplacian(original_gray, cv2.CV_64F).var()
        processed_sharpness = cv2.Laplacian(processed_gray, cv2.CV_64F).var()
        sharpness_change = ((processed_sharpness - original_sharpness) / original_sharpness) * 100
        
        print(f'  📊 SSIM: {ssim_value:.4f}')
        print(f'  📊 Contraste: {contrast_change:+.2f}%')
        print(f'  📊 Nitidez: {sharpness_change:+.2f}%')
        
        result = {
            'sku': sku,
            'category': category,
            'profile': profile_name,
            'quality': quality,
            'original_size_kb': original_path.stat().st_size / 1024,
            'old_size_kb': old_webp_path.stat().st_size / 1024 if old_webp_exists else None,
            'new_size_kb': new_size,
            'ssim': ssim_value,
            'contrast_change': contrast_change,
            'sharpness_change': sharpness_change,
            'paths': {
                'original': str(original_copy_path.relative_to('static')),
                'old': str(old_copy_path.relative_to('static')) if old_webp_exists else None,
                'new': str(new_webp_path.relative_to('static'))
            }
        }
        
        self.results.append(result)
        return result
    
    def generate_html_comparison(self):
        """Gera HTML para comparação visual"""
        html = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comparação de Otimização de Imagens</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 { margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        .comparison-card {
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .card-header {
            background: #667eea;
            color: white;
            padding: 15px;
        }
        .card-header h3 { margin-bottom: 5px; }
        .card-header .category {
            opacity: 0.9;
            font-size: 14px;
            text-transform: uppercase;
        }
        .card-header .profile {
            font-size: 12px;
            background: rgba(255,255,255,0.2);
            padding: 3px 8px;
            border-radius: 3px;
            display: inline-block;
            margin-top: 5px;
        }
        .image-container {
            position: relative;
            background: #f0f0f0;
        }
        .image-container img {
            width: 100%;
            height: auto;
            display: block;
        }
        .image-label {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
        }
        .metrics {
            padding: 15px;
        }
        .metric-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .metric-row:last-child { border-bottom: none; }
        .metric-label { color: #666; font-size: 14px; }
        .metric-value { font-weight: bold; }
        .metric-value.good { color: #22c55e; }
        .metric-value.warning { color: #f59e0b; }
        .metric-value.bad { color: #ef4444; }
        .summary {
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .summary h2 {
            margin-bottom: 15px;
            color: #667eea;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .summary-item .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Teste de Otimização de Imagens</h1>
        <p>Comparação entre Otimização Antiga vs Nova (Perfis Específicos)</p>
        <p><small>Gerado em """ + datetime.now().strftime('%d/%m/%Y às %H:%M:%S') + """</small></p>
    </div>
"""
        
        # Cards de comparação
        html += '<div class="comparison-grid">\n'
        
        for result in self.results:
            sku = result['sku']
            category = result['category']
            profile = result['profile']
            quality = result['quality']
            
            # Determinar classe de cor para métricas
            ssim_class = 'good' if result['ssim'] >= 0.99 else ('warning' if result['ssim'] >= 0.95 else 'bad')
            contrast_class = 'good' if abs(result['contrast_change']) < 5 else ('warning' if abs(result['contrast_change']) < 15 else 'bad')
            
            old_path = f"/{result['paths']['old']}" if result['paths']['old'] else None
            
            html += f"""
    <div class="comparison-card">
        <div class="card-header">
            <h3>{sku}</h3>
            <div class="category">{category}</div>
            <span class="profile">{profile} | Q:{quality}</span>
        </div>
        <div class="image-container">
            <img src="/{result['paths']['new']}" alt="{sku}">
            <div class="image-label">Nova Otimização</div>
        </div>
        <div class="metrics">
            <div class="metric-row">
                <span class="metric-label">SSIM (qualidade)</span>
                <span class="metric-value {ssim_class}">{result['ssim']:.4f}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Contraste</span>
                <span class="metric-value {contrast_class}">{result['contrast_change']:+.2f}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Nitidez</span>
                <span class="metric-value">{result['sharpness_change']:+.2f}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Tamanho Novo</span>
                <span class="metric-value good">{result['new_size_kb']:.2f} KB</span>
            </div>
"""
            if result['old_size_kb']:
                reduction = ((result['original_size_kb'] - result['new_size_kb']) / result['original_size_kb']) * 100
                html += f"""
            <div class="metric-row">
                <span class="metric-label">Redução</span>
                <span class="metric-value good">{reduction:.1f}%</span>
            </div>
"""
            html += """
        </div>
    </div>
"""
        
        html += '</div>\n'
        
        # Sumário
        avg_ssim = sum(r['ssim'] for r in self.results) / len(self.results)
        avg_contrast = sum(abs(r['contrast_change']) for r in self.results) / len(self.results)
        avg_reduction = sum(((r['original_size_kb'] - r['new_size_kb']) / r['original_size_kb']) * 100 for r in self.results) / len(self.results)
        
        html += f"""
    <div class="summary">
        <h2>📊 Resumo Geral</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">Amostras Testadas</div>
                <div class="value">{len(self.results)}</div>
            </div>
            <div class="summary-item">
                <div class="label">SSIM Médio</div>
                <div class="value">{avg_ssim:.4f}</div>
            </div>
            <div class="summary-item">
                <div class="label">Contraste Médio</div>
                <div class="value">{avg_contrast:.2f}%</div>
            </div>
            <div class="summary-item">
                <div class="label">Redução Média</div>
                <div class="value">{avg_reduction:.1f}%</div>
            </div>
        </div>
    </div>
</body>
</html>
"""
        
        return html
    
    def run_test(self, image_map_path: str, samples_per_category: int = 2):
        """Executa teste completo"""
        print('='*80)
        print('🧪 TESTE DE OTIMIZAÇÃO COM PERFIS ESPECÍFICOS')
        print('='*80)
        
        # Selecionar amostras
        samples = self.get_random_samples(image_map_path, samples_per_category)
        print(f'\n✅ Selecionadas {len(samples)} amostras para teste')
        
        # Processar cada amostra
        for sample in samples:
            self.process_sample(sample)
        
        # Gerar HTML
        html = self.generate_html_comparison()
        html_path = self.output_dir / 'comparison.html'
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        # Salvar JSON
        json_path = self.output_dir / 'results.json'
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump({
                'generated_at': datetime.now().isoformat(),
                'total_samples': len(self.results),
                'results': self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f'\n{"="*80}')
        print('✅ TESTE CONCLUÍDO!')
        print(f'{"="*80}')
        print(f'\n📄 Relatório HTML: {html_path}')
        print(f'📄 Dados JSON: {json_path}')
        print(f'\n🌐 Abra no navegador: http://localhost:9000/{html_path.relative_to("static")}')
        print()


if __name__ == '__main__':
    tester = OptimizationTester()
    tester.run_test(
        image_map_path='static/images-catálogo_distribuidores/IMAGE_MAP.json',
        samples_per_category=2
    )
