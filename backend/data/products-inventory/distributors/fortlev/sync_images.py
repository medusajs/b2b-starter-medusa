#!/usr/bin/env python3
"""
Sincroniza dados JSON com imagens locais e cria combinações visuais.
Mapeia imagens de painéis + inversores já baixadas localmente.
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
from PIL import Image


class ImageSyncManager:
    """Gerenciador de sincronização de imagens locais."""
    
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        
        # Diretórios de imagens locais
        self.kits_dir = base_dir / "KITS_Fortlev Solar - 13-10-2025 21-15-47"
        self.inverters_dir = base_dir / "INVERTERS_Fortlev Solar - 13-10-2025 21-18-17"
        self.panels_dir = base_dir / "Fortlev Solar - 13-10-2025 21-21-37"
        
        # Diretórios organizados
        self.organized_dir = base_dir / "organized_images"
        self.panels_organized = self.organized_dir / "panels"
        self.inverters_organized = self.organized_dir / "inverters"
        self.combinations_dir = self.organized_dir / "kit_combinations"
        
        # Criar diretórios
        for d in [self.panels_organized, self.inverters_organized, self.combinations_dir]:
            d.mkdir(parents=True, exist_ok=True)
        
        # Mapear imagens disponíveis
        self.panel_images = self._scan_images(self.kits_dir, "IMO")
        self.inverter_images = self._scan_images(self.inverters_dir, "IIN")
        
        print(f"📁 Imagens locais encontradas:")
        print(f"   Painéis: {len(self.panel_images)} arquivos")
        print(f"   Inversores: {len(self.inverter_images)} arquivos")
    
    def _scan_images(self, directory: Path, prefix: str) -> Dict[str, Path]:
        """Escaneia diretório em busca de imagens com prefixo."""
        images = {}
        
        if not directory.exists():
            return images
        
        for file in directory.iterdir():
            if file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp']:
                name = file.stem
                # Extrair ID (ex: IMO00135 ou IIN00384)
                if prefix in name.upper():
                    # Pegar código após o prefixo
                    parts = name.upper().split(prefix)
                    if len(parts) > 1:
                        code = parts[1].split('-')[0].split('_')[0].split('.')[0]
                        # Limpar para pegar apenas números
                        code_clean = ''.join(c for c in code if c.isdigit())
                        if code_clean:
                            key = f"{prefix}{code_clean.zfill(5)}"
                            images[key] = file
        
        return images
    
    def find_local_image(self, component: str, filename: str) -> Optional[Path]:
        """Encontra imagem local baseado no componente e filename."""
        if not filename:
            return None
        
        # Extrair código do filename
        filename_upper = filename.upper()
        
        if component == 'panel':
            # Procurar por IMO
            for key, path in self.panel_images.items():
                if key in filename_upper or filename_upper.replace('.PNG', '') in path.name.upper():
                    return path
        
        elif component == 'inverter':
            # Procurar por IIN
            for key, path in self.inverter_images.items():
                if key in filename_upper or filename_upper.replace('.PNG', '') in path.name.upper():
                    return path
        
        return None
    
    def organize_images(self):
        """Organiza imagens em diretórios por categoria."""
        print("\n📂 Organizando imagens...")
        
        # Copiar painéis
        for key, src_path in self.panel_images.items():
            dst_path = self.panels_organized / f"{key}.png"
            if not dst_path.exists():
                shutil.copy2(src_path, dst_path)
        
        print(f"   ✓ {len(self.panel_images)} painéis organizados")
        
        # Copiar inversores
        for key, src_path in self.inverter_images.items():
            dst_path = self.inverters_organized / f"{key}.png"
            if not dst_path.exists():
                shutil.copy2(src_path, dst_path)
        
        print(f"   ✓ {len(self.inverter_images)} inversores organizados")
    
    def create_kit_combination(
        self, 
        kit_id: str,
        panel_path: Path,
        inverter_path: Path
    ) -> Optional[Path]:
        """Cria imagem combinada de painel + inversor."""
        try:
            output_path = self.combinations_dir / f"{kit_id}_combination.png"
            
            if output_path.exists():
                return output_path
            
            # Abrir imagens
            panel_img = Image.open(panel_path)
            inverter_img = Image.open(inverter_path)
            
            # Redimensionar para tamanho padrão (manter aspecto)
            max_width = 800
            max_height = 600
            
            # Redimensionar painel
            panel_ratio = panel_img.width / panel_img.height
            if panel_img.width > max_width:
                panel_img = panel_img.resize(
                    (max_width, int(max_width / panel_ratio)),
                    Image.Resampling.LANCZOS
                )
            
            # Redimensionar inversor
            inv_ratio = inverter_img.width / inverter_img.height
            if inverter_img.width > max_width:
                inverter_img = inverter_img.resize(
                    (max_width, int(max_width / inv_ratio)),
                    Image.Resampling.LANCZOS
                )
            
            # Criar imagem combinada (lado a lado)
            total_width = panel_img.width + inverter_img.width + 40  # 20px padding cada
            total_height = max(panel_img.height, inverter_img.height) + 40
            
            combined = Image.new('RGB', (total_width, total_height), 'white')
            
            # Colar imagens centralizadas verticalmente
            panel_y = (total_height - panel_img.height) // 2
            inv_y = (total_height - inverter_img.height) // 2
            
            combined.paste(panel_img, (20, panel_y))
            combined.paste(inverter_img, (panel_img.width + 40, inv_y))
            
            # Salvar
            combined.save(output_path, 'PNG', optimize=True)
            
            return output_path
        
        except Exception as e:
            print(f"      ⚠ Erro ao criar combinação: {e}")
            return None


class KitImageSync:
    """Sincroniza kits com imagens locais."""
    
    def __init__(self, image_manager: ImageSyncManager):
        self.image_manager = image_manager
    
    def sync_kit(self, kit: Dict[str, Any]) -> Dict[str, Any]:
        """Sincroniza um kit com imagens locais."""
        kit_id = kit['id']
        synced_kit = kit.copy()
        
        # Dados do painel
        panel = synced_kit['components']['panel']
        panel_filename = panel.get('image_filename', '')
        
        # Dados do inversor
        inverter = synced_kit['components']['inverter']
        inverter_filename = inverter.get('image_filename', '')
        
        # Buscar imagens locais
        panel_local = self.image_manager.find_local_image('panel', panel_filename)
        inverter_local = self.image_manager.find_local_image('inverter', inverter_filename)
        
        # Atualizar paths
        if panel_local:
            panel['local_image'] = str(panel_local.absolute())
            panel['image_available'] = True
        else:
            panel['image_available'] = False
        
        if inverter_local:
            inverter['local_image'] = str(inverter_local.absolute())
            inverter['image_available'] = True
        else:
            inverter['image_available'] = False
        
        # Criar combinação se ambas as imagens existem
        if panel_local and inverter_local:
            combination = self.image_manager.create_kit_combination(
                kit_id, panel_local, inverter_local
            )
            if combination:
                synced_kit['combination_image'] = str(combination.absolute())
                synced_kit['combination_available'] = True
        else:
            synced_kit['combination_available'] = False
        
        return synced_kit
    
    def sync_all_kits(
        self, 
        input_file: Path, 
        output_file: Path
    ) -> Dict[str, Any]:
        """Sincroniza todos os kits."""
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"\n{'='*70}")
        print(f"🔄 Sincronização de Kits com Imagens Locais")
        print(f"{'='*70}")
        print(f"Total de kits: {len(kits)}")
        print(f"{'='*70}\n")
        
        synced_kits = []
        stats = {
            'total': len(kits),
            'with_panel_image': 0,
            'with_inverter_image': 0,
            'with_both_images': 0,
            'combinations_created': 0
        }
        
        for idx, kit in enumerate(kits, 1):
            print(f"[{idx}/{len(kits)}] {kit['id']}")
            
            synced = self.sync_kit(kit)
            synced_kits.append(synced)
            
            # Atualizar stats
            if synced['components']['panel'].get('image_available'):
                stats['with_panel_image'] += 1
                print(f"   ✓ Painel: {Path(synced['components']['panel']['local_image']).name}")
            else:
                print(f"   ✗ Painel: não encontrado")
            
            if synced['components']['inverter'].get('image_available'):
                stats['with_inverter_image'] += 1
                print(f"   ✓ Inversor: {Path(synced['components']['inverter']['local_image']).name}")
            else:
                print(f"   ✗ Inversor: não encontrado")
            
            if synced['components']['panel'].get('image_available') and \
               synced['components']['inverter'].get('image_available'):
                stats['with_both_images'] += 1
            
            if synced.get('combination_available'):
                stats['combinations_created'] += 1
                print(f"   🎨 Combinação criada")
            
            # Salvar periodicamente
            if idx % 20 == 0:
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(synced_kits, f, indent=2, ensure_ascii=False)
                print(f"\n   💾 Checkpoint salvo\n")
        
        # Salvar final
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(synced_kits, f, indent=2, ensure_ascii=False)
        
        return stats


def main():
    """Execução principal."""
    base_dir = Path(__file__).parent
    
    print(f"\n{'='*70}")
    print(f"🖼️  YSH Image Sync & Combination Tool")
    print(f"{'='*70}\n")
    
    # Inicializar gerenciador
    image_manager = ImageSyncManager(base_dir)
    
    # Organizar imagens
    image_manager.organize_images()
    
    # Sincronizar kits
    sync = KitImageSync(image_manager)
    
    input_file = base_dir / "fortlev-kits.json"
    output_file = base_dir / "fortlev-kits-synced.json"
    
    if not input_file.exists():
        print(f"\n❌ Erro: {input_file} não encontrado")
        return
    
    stats = sync.sync_all_kits(input_file, output_file)
    
    # Relatório final
    print(f"\n{'='*70}")
    print(f"📊 Relatório de Sincronização")
    print(f"{'='*70}")
    print(f"Total de kits processados: {stats['total']}")
    print(f"Kits com imagem de painel: {stats['with_panel_image']} ({stats['with_panel_image']/stats['total']*100:.1f}%)")
    print(f"Kits com imagem de inversor: {stats['with_inverter_image']} ({stats['with_inverter_image']/stats['total']*100:.1f}%)")
    print(f"Kits com ambas as imagens: {stats['with_both_images']} ({stats['with_both_images']/stats['total']*100:.1f}%)")
    print(f"Combinações criadas: {stats['combinations_created']}")
    print(f"\n✓ Arquivo sincronizado: {output_file}")
    print(f"✓ Imagens organizadas em: {image_manager.organized_dir}")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
