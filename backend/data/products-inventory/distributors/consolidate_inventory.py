import json
import os
from pathlib import Path
from collections import defaultdict

# Coletar estatísticas
stats = {
    'distribuidores': {},
    'fabricantes': defaultdict(lambda: {'produtos': 0, 'categorias': set()}),
    'categorias': defaultdict(int),
    'total_produtos': 0
}

dist_dir = Path('.')
for dist in ['fortlev', 'fotus', 'neosolar', 'odex', 'solfacil']:
    dist_path = dist_dir / dist
    if not dist_path.exists():
        continue
    
    stats['distribuidores'][dist] = {
        'kits': 0, 'paineis': 0, 'inversores': 0, 
        'baterias': 0, 'estruturas': 0, 'acessorios': 0
    }
    
    for json_file in dist_path.glob('*.json'):
        if 'schema' in json_file.name or 'mapping' in json_file.name:
            continue
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    count = len(data)
                    stats['total_produtos'] += count
                    
                    # Classificar por categoria
                    if 'kit' in json_file.name:
                        stats['distribuidores'][dist]['kits'] += count
                        stats['categorias']['Kits Solares'] += count
                    elif 'panel' in json_file.name:
                        stats['distribuidores'][dist]['paineis'] += count
                        stats['categorias']['Painéis Solares'] += count
                    elif 'inverter' in json_file.name or 'microinverter' in json_file.name:
                        stats['distribuidores'][dist]['inversores'] += count
                        stats['categorias']['Inversores'] += count
                    elif 'batter' in json_file.name:
                        stats['distribuidores'][dist]['baterias'] += count
                        stats['categorias']['Baterias'] += count
                    elif 'structure' in json_file.name:
                        stats['distribuidores'][dist]['estruturas'] += count
                        stats['categorias']['Estruturas'] += count
                    else:
                        stats['distribuidores'][dist]['acessorios'] += count
                        stats['categorias']['Acessórios'] += count
                    
                    # Extrair fabricantes
                    for item in data[:50]:  # Sample
                        if isinstance(item, dict):
                            brand = item.get('brand') or item.get('manufacturer') or item.get('panels', [{}])[0].get('brand')
                            if brand and brand != 'None':
                                cat = 'Kits' if 'kit' in json_file.name else json_file.stem.split('-')[-1].title()
                                stats['fabricantes'][brand]['produtos'] += 1
                                stats['fabricantes'][brand]['categorias'].add(cat)
        except Exception as e:
            pass

print(json.dumps(stats, indent=2, default=str))
