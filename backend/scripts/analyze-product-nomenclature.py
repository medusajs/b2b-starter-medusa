#!/usr/bin/env python3
"""
Análise de Nomenclatura de Produtos
Examina datasets de distribuidores e cria padrão de nomenclatura
"""

import json
from pathlib import Path
from collections import defaultdict
import re


def analyze_dataset(file_path, distributor):
    """Analisa um dataset e extrai campos disponíveis"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not data:
            return None
        
        # Pegar primeiro item como exemplo
        sample = data[0]
        
        # Campos disponíveis
        fields = list(sample.keys())
        
        # Extrair informações chave
        info = {
            'distributor': distributor,
            'total_items': len(data),
            'fields': fields,
            'sample': {
                'name': sample.get('name', 'N/A'),
                'manufacturer': sample.get('manufacturer', sample.get('brand', 'N/A')),
                'model': sample.get('model', 'N/A'),
                'category': sample.get('category', sample.get('type', 'N/A')),
                'price': sample.get('price', sample.get('price_brl', 'N/A')),
                'image': sample.get('image', 'N/A'),
                'power': sample.get('potencia_kwp', sample.get('power_w', sample.get('kwp', 'N/A')))
            }
        }
        
        return info
        
    except Exception as e:
        print(f'❌ Erro ao processar {file_path}: {e}')
        return None


def extract_power_from_name(name):
    """Extrai potência do nome do produto"""
    # Padrões comuns: 5kW, 550W, 5.5KW, etc
    patterns = [
        r'(\d+\.?\d*)\s*kW',
        r'(\d+\.?\d*)\s*KW',
        r'(\d+)\s*W(?!\w)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, name, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            # Normalizar para kW
            if 'w' in match.group(0).lower() and 'kw' not in match.group(0).lower():
                value = value / 1000
            return f"{value}KW"
    
    return None


def sanitize_filename(text):
    """Sanitiza texto para nome de arquivo"""
    if not text or text == 'N/A':
        return ''
    
    # Remover caracteres especiais
    text = str(text).upper()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = text.strip('-')
    
    return text[:50]  # Limitar tamanho


def generate_standard_name(product, distributor):
    """
    Gera nome padronizado seguindo o padrão:
    FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA-DISTRIBUIDOR
    
    Exemplo:
    - FRONIUS-INVERTER-GRIDTIE-PRIMO82-8.2KW-ODEX
    - DAH-PANEL-BIFACIAL-DHN72X16-585W-SOLFACIL
    - FOTUS-KIT-HIBRIDO-KP04-5.7KW-FOTUS
    """
    
    parts = []
    
    # 1. FABRICANTE
    manufacturer = product.get('manufacturer', product.get('brand', ''))
    if manufacturer and manufacturer != 'N/A':
        parts.append(sanitize_filename(manufacturer))
    
    # 2. CATEGORIA
    category = product.get('category', product.get('type', ''))
    if category and category != 'N/A':
        cat_clean = sanitize_filename(category)
        # Normalizar categorias comuns
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
    
    # 3. TIPO (extraído do nome se disponível)
    name = product.get('name', '')
    tipo = ''
    if 'GRID-TIE' in name.upper() or 'GRIDTIE' in name.upper():
        tipo = 'GRIDTIE'
    elif 'HÍBRIDO' in name.upper() or 'HIBRIDO' in name.upper():
        tipo = 'HIBRIDO'
    elif 'OFF-GRID' in name.upper() or 'OFFGRID' in name.upper():
        tipo = 'OFFGRID'
    elif 'BIFACIAL' in name.upper():
        tipo = 'BIFACIAL'
    elif 'MONOFACIAL' in name.upper():
        tipo = 'MONO'
    elif 'MICROINVERSOR' in name.upper():
        tipo = 'MICRO'
    
    if tipo:
        parts.append(tipo)
    
    # 4. MODELO
    model = product.get('model', '')
    if not model or model == 'N/A':
        # Tentar extrair do nome
        # Exemplo: "Inversor Fronius Primo 8.2-1" -> "PRIMO82"
        model_patterns = [
            r'([A-Z][A-Z0-9-]+\d+[A-Z0-9-]*)',  # Ex: R5-3K-T2, IQ8P-72
            r'([A-Z]{2,}\s*\d+[\w-]*)',  # Ex: PRIMO 8.2
        ]
        for pattern in model_patterns:
            match = re.search(pattern, name.upper())
            if match:
                model = match.group(1).replace(' ', '')
                break
    
    if model and model != 'N/A':
        parts.append(sanitize_filename(model)[:20])
    
    # 5. POTÊNCIA
    power = product.get('potencia_kwp', product.get('power_w', product.get('kwp', '')))
    if not power or power == 'N/A':
        # Tentar extrair do nome
        power = extract_power_from_name(name)
    else:
        # Formatar potência
        try:
            power_val = float(power)
            if power_val >= 1:
                power = f"{power_val}KW"
            else:
                power = f"{int(power_val * 1000)}W"
        except:
            power = None
    
    if power:
        parts.append(sanitize_filename(str(power)))
    
    # 6. DISTRIBUIDOR
    parts.append(sanitize_filename(distributor))
    
    # Juntar partes com hífen
    filename = '-'.join([p for p in parts if p])
    
    # Garantir que não está vazio
    if not filename:
        filename = f"UNKNOWN-{sanitize_filename(distributor)}"
    
    return filename


def main():
    print('='*80)
    print('📊 ANÁLISE DE NOMENCLATURA DE PRODUTOS')
    print('='*80)
    
    # Datasets para analisar
    datasets = [
        ('data/catalog/data/catalog/distributor_datasets/odex/odex-inverters.json', 'ODEX', 'inverters'),
        ('data/catalog/data/catalog/distributor_datasets/odex/odex-panels.json', 'ODEX', 'panels'),
        ('data/catalog/data/catalog/distributor_datasets/solfacil/solfacil-inverters.json', 'SOLFACIL', 'inverters'),
        ('data/catalog/data/catalog/distributor_datasets/solfacil/solfacil-panels.json', 'SOLFACIL', 'panels'),
        ('data/catalog/data/catalog/distributor_datasets/fotus/fotus-kits.json', 'FOTUS', 'kits'),
    ]
    
    all_results = []
    
    for file_path, distributor, category in datasets:
        print(f'\n{"="*80}')
        print(f'📂 {distributor} - {category}')
        print(f'{"="*80}')
        
        path = Path(file_path)
        if not path.exists():
            print(f'⚠️  Arquivo não encontrado: {file_path}')
            continue
        
        # Analisar dataset
        info = analyze_dataset(path, distributor)
        if not info:
            continue
        
        print(f'\n✅ Total de itens: {info["total_items"]}')
        print(f'📋 Campos disponíveis: {", ".join(info["fields"])}')
        
        print(f'\n📦 EXEMPLO DE PRODUTO:')
        print(f'   Nome: {info["sample"]["name"]}')
        print(f'   Fabricante: {info["sample"]["manufacturer"]}')
        print(f'   Modelo: {info["sample"]["model"]}')
        print(f'   Categoria: {info["sample"]["category"]}')
        print(f'   Potência: {info["sample"]["power"]}')
        print(f'   Preço: {info["sample"]["price"]}')
        print(f'   Imagem atual: {info["sample"]["image"]}')
        
        # Carregar produtos para gerar exemplos
        with open(path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Gerar exemplos de nomenclatura padronizada
        print(f'\n🎯 EXEMPLOS DE NOMENCLATURA PADRONIZADA:')
        for i, product in enumerate(products[:5]):
            old_img = product.get('image', '')
            old_name = Path(old_img).stem if old_img else 'N/A'
            
            new_name = generate_standard_name(product, distributor)
            
            print(f'\n   [{i+1}] {product.get("name", "")[:70]}')
            print(f'       Antigo: {old_name}')
            print(f'       Novo: {new_name}')
            
            all_results.append({
                'distributor': distributor,
                'category': category,
                'old_name': old_name,
                'new_name': new_name,
                'product': product.get('name', '')
            })
    
    # Resumo final
    print(f'\n{"="*80}')
    print('📊 RESUMO DO PADRÃO DE NOMENCLATURA')
    print(f'{"="*80}')
    print('\n✅ ESTRUTURA PADRÃO:')
    print('   FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA-DISTRIBUIDOR')
    print('\n📝 COMPONENTES:')
    print('   1. FABRICANTE: Nome do fabricante (ex: FRONIUS, SAJ, DAH)')
    print('   2. CATEGORIA: INV, PANEL, KIT, BAT, STRUCT, CABLE, ACC')
    print('   3. TIPO: GRIDTIE, HIBRIDO, OFFGRID, BIFACIAL, MICRO (opcional)')
    print('   4. MODELO: Código do modelo (ex: PRIMO82, R5-3K-T2)')
    print('   5. POTÊNCIA: Valor em KW ou W (ex: 8.2KW, 550W)')
    print('   6. DISTRIBUIDOR: ODEX, SOLFACIL, FOTUS, NEOSOLAR, FORTLEV')
    
    print('\n💡 EXEMPLOS REAIS:')
    for result in all_results[:10]:
        print(f'   • {result["new_name"]}.webp')
    
    print(f'\n✅ Total de {len(all_results)} nomes gerados')
    print('\n📄 Padrão salvo para implementação no script de renomeação')


if __name__ == '__main__':
    main()
