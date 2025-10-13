#!/usr/bin/env python3
"""
Normalização e Padronização Medusa.js v2.10.3 - Yello Solar Hub
================================================================

Script Python para normalizar estrutura backend Medusa.js seguindo
melhores práticas v2.10.3 e padrões do repositório YSH B2B.

Funcionalidades:
- Normaliza estrutura de diretórios
- Padroniza imports e exports
- Valida convenções de nomenclatura
- Organiza módulos customizados
- Verifica configurações v2.10.3
- Gera relatório de normalização

Uso:
    python tools/normalize-medusa.py --workspace backend --dry-run
    python tools/normalize-medusa.py --workspace backend --fix
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Set
from datetime import datetime
import shutil

class MedusaNormalizer:
    """Normalizador Medusa.js v2.10.3"""
    
    def __init__(self, workspace_path: str, dry_run: bool = True):
        self.workspace = Path(workspace_path).resolve()
        self.dry_run = dry_run
        self.issues: List[Dict] = []
        self.fixes: List[Dict] = []
        
        # Convenções Medusa v2.10.3
        self.conventions = {
            'modules': {
                'directory': 'src/modules',
                'structure': ['index.ts', 'service.ts', 'models/', 'types/'],
                'prefix_pattern': r'^[a-z]+$'
            },
            'workflows': {
                'directory': 'src/workflows',
                'naming': r'^[a-z-]+\.ts$',
                'export_pattern': r'^export (const|default)'
            },
            'api': {
                'directory': 'src/api',
                'routes': ['store/', 'admin/'],
                'naming': r'^route\.ts$'
            },
            'links': {
                'directory': 'src/links',
                'naming': r'^[a-z]+-[a-z]+\.ts$'
            }
        }
        
    def scan(self) -> Dict:
        """Escaneia workspace e identifica issues"""
        print(f"🔍 Escaneando workspace: {self.workspace}")
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'workspace': str(self.workspace),
            'checks': {
                'structure': self._check_structure(),
                'modules': self._check_modules(),
                'workflows': self._check_workflows(),
                'api_routes': self._check_api_routes(),
                'links': self._check_links(),
                'config': self._check_config(),
                'imports': self._check_imports(),
                'naming': self._check_naming()
            },
            'issues_count': len(self.issues),
            'issues': self.issues
        }
        
        return report
    
    def _check_structure(self) -> Dict:
        """Verifica estrutura de diretórios"""
        expected_dirs = [
            'src/api/store',
            'src/api/admin',
            'src/modules',
            'src/workflows',
            'src/links',
            'src/types',
            'src/utils'
        ]
        
        results = {'status': 'pass', 'missing': [], 'extra': []}
        
        for dir_path in expected_dirs:
            full_path = self.workspace / dir_path
            if not full_path.exists():
                results['missing'].append(dir_path)
                self.issues.append({
                    'type': 'structure',
                    'severity': 'warning',
                    'message': f'Diretório esperado não encontrado: {dir_path}',
                    'fix': f'Criar diretório {dir_path}'
                })
        
        if results['missing']:
            results['status'] = 'warning'
            
        return results
    
    def _check_modules(self) -> Dict:
        """Verifica módulos customizados"""
        modules_dir = self.workspace / 'src/modules'
        results = {'status': 'pass', 'modules': [], 'issues': []}
        
        if not modules_dir.exists():
            return {'status': 'error', 'message': 'Diretório modules não encontrado'}
        
        for module_dir in modules_dir.iterdir():
            if not module_dir.is_dir() or module_dir.name.startswith('_'):
                continue
                
            module_info = {
                'name': module_dir.name,
                'has_index': (module_dir / 'index.ts').exists(),
                'has_service': (module_dir / 'service.ts').exists(),
                'has_models': (module_dir / 'models').exists(),
                'status': 'valid'
            }
            
            # Valida estrutura mínima
            if not module_info['has_index']:
                issue = f"Módulo '{module_dir.name}' sem index.ts"
                results['issues'].append(issue)
                module_info['status'] = 'invalid'
                self.issues.append({
                    'type': 'module',
                    'severity': 'error',
                    'module': module_dir.name,
                    'message': issue,
                    'fix': f'Criar {module_dir}/index.ts com exportação do módulo'
                })
            
            if not module_info['has_service']:
                issue = f"Módulo '{module_dir.name}' sem service.ts"
                results['issues'].append(issue)
                self.issues.append({
                    'type': 'module',
                    'severity': 'warning',
                    'module': module_dir.name,
                    'message': issue
                })
            
            results['modules'].append(module_info)
        
        if results['issues']:
            results['status'] = 'warning'
            
        return results
    
    def _check_workflows(self) -> Dict:
        """Verifica workflows"""
        workflows_dir = self.workspace / 'src/workflows'
        results = {'status': 'pass', 'workflows': [], 'issues': []}
        
        if not workflows_dir.exists():
            return {'status': 'warning', 'message': 'Diretório workflows não encontrado'}
        
        # Escaneia workflows recursivamente
        for workflow_file in workflows_dir.rglob('*.ts'):
            if workflow_file.name.startswith('_'):
                continue
                
            content = workflow_file.read_text(encoding='utf-8')
            
            # Verifica padrões de workflow
            has_create_workflow = 'createWorkflow' in content
            has_create_step = 'createStep' in content
            has_export = re.search(r'^export (const|default)', content, re.MULTILINE)
            
            workflow_info = {
                'file': str(workflow_file.relative_to(self.workspace)),
                'has_create_workflow': has_create_workflow,
                'has_create_step': has_create_step,
                'has_export': bool(has_export),
                'status': 'valid'
            }
            
            if has_create_workflow and not has_export:
                workflow_info['status'] = 'invalid'
                self.issues.append({
                    'type': 'workflow',
                    'severity': 'error',
                    'file': workflow_info['file'],
                    'message': 'Workflow sem export',
                    'fix': 'Adicionar export const ou export default'
                })
            
            results['workflows'].append(workflow_info)
        
        return results
    
    def _check_api_routes(self) -> Dict:
        """Verifica rotas API"""
        api_dir = self.workspace / 'src/api'
        results = {'status': 'pass', 'routes': {'store': [], 'admin': []}, 'issues': []}
        
        if not api_dir.exists():
            return {'status': 'error', 'message': 'Diretório api não encontrado'}
        
        for api_type in ['store', 'admin']:
            type_dir = api_dir / api_type
            if not type_dir.exists():
                continue
            
            for route_file in type_dir.rglob('route.ts'):
                rel_path = route_file.relative_to(type_dir)
                content = route_file.read_text(encoding='utf-8')
                
                # Verifica exports de métodos HTTP
                methods = []
                for method in ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']:
                    if re.search(rf'^export (const|async function) {method}\s*=', content, re.MULTILINE):
                        methods.append(method)
                
                route_info = {
                    'path': str(rel_path.parent),
                    'methods': methods,
                    'file': str(route_file.relative_to(self.workspace))
                }
                
                if not methods:
                    self.issues.append({
                        'type': 'api_route',
                        'severity': 'warning',
                        'file': route_info['file'],
                        'message': 'Route sem métodos HTTP exportados'
                    })
                
                results['routes'][api_type].append(route_info)
        
        return results
    
    def _check_links(self) -> Dict:
        """Verifica module links"""
        links_dir = self.workspace / 'src/links'
        results = {'status': 'pass', 'links': [], 'issues': []}
        
        if not links_dir.exists():
            return {'status': 'warning', 'message': 'Diretório links não encontrado'}
        
        for link_file in links_dir.glob('*.ts'):
            if link_file.name.startswith('_'):
                continue
            
            content = link_file.read_text(encoding='utf-8')
            has_define_link = 'defineLink' in content
            has_export_default = 'export default' in content
            
            link_info = {
                'file': link_file.name,
                'has_define_link': has_define_link,
                'has_export_default': has_export_default,
                'status': 'valid'
            }
            
            if has_define_link and not has_export_default:
                link_info['status'] = 'invalid'
                self.issues.append({
                    'type': 'link',
                    'severity': 'error',
                    'file': link_file.name,
                    'message': 'Link sem export default',
                    'fix': 'Adicionar export default defineLink(...)'
                })
            
            # Valida nomenclatura (module1-module2.ts)
            if not re.match(r'^[a-z]+-[a-z]+\.ts$', link_file.name):
                self.issues.append({
                    'type': 'link',
                    'severity': 'warning',
                    'file': link_file.name,
                    'message': 'Nomenclatura de link não segue padrão module1-module2.ts'
                })
            
            results['links'].append(link_info)
        
        return results
    
    def _check_config(self) -> Dict:
        """Verifica medusa-config.ts"""
        config_file = self.workspace / 'medusa-config.ts'
        results = {'status': 'pass', 'checks': []}
        
        if not config_file.exists():
            self.issues.append({
                'type': 'config',
                'severity': 'error',
                'message': 'medusa-config.ts não encontrado',
                'fix': 'Criar medusa-config.ts na raiz do workspace'
            })
            return {'status': 'error', 'message': 'Arquivo não encontrado'}
        
        content = config_file.read_text(encoding='utf-8')
        
        # Verifica configurações essenciais v2.10.3
        checks = {
            'has_define_config': 'defineConfig' in content,
            'has_modules': 'modules:' in content or 'modules {' in content,
            'has_project_config': 'projectConfig' in content,
            'has_feature_flags': 'featureFlags' in content
        }
        
        for check, passed in checks.items():
            results['checks'].append({'name': check, 'passed': passed})
            if not passed and check != 'has_feature_flags':  # feature flags são opcionais
                self.issues.append({
                    'type': 'config',
                    'severity': 'warning',
                    'message': f'medusa-config.ts sem {check.replace("has_", "")}'
                })
        
        return results
    
    def _check_imports(self) -> Dict:
        """Verifica padrões de import"""
        results = {'status': 'pass', 'issues': []}
        
        # Padrões de import preferidos
        preferred_imports = {
            '@medusajs/framework': ['MedusaService', 'defineConfig', 'model'],
            '@medusajs/workflows-sdk': ['createWorkflow', 'createStep', 'StepResponse'],
            '@medusajs/framework/utils': ['defineLink', 'Modules']
        }
        
        # Escaneia todos os arquivos .ts
        for ts_file in self.workspace.rglob('src/**/*.ts'):
            if ts_file.name.startswith('_'):
                continue
            
            content = ts_file.read_text(encoding='utf-8')
            
            # Verifica imports deprecados
            deprecated_patterns = [
                (r'from ["\']@medusajs/medusa["\']', '@medusajs/framework'),
                (r'from ["\']@medusajs/medusa/dist', '@medusajs/framework ou @medusajs/workflows-sdk')
            ]
            
            for pattern, replacement in deprecated_patterns:
                if re.search(pattern, content):
                    self.issues.append({
                        'type': 'import',
                        'severity': 'warning',
                        'file': str(ts_file.relative_to(self.workspace)),
                        'message': f'Import deprecado encontrado',
                        'fix': f'Substituir por {replacement}'
                    })
        
        return results
    
    def _check_naming(self) -> Dict:
        """Verifica convenções de nomenclatura"""
        results = {'status': 'pass', 'issues': []}
        
        # Verifica nomenclatura de arquivos
        naming_rules = {
            'workflows': r'^[a-z-]+\.ts$',
            'models': r'^[a-z-]+\.ts$',
            'types': r'^[a-z-]+\.ts$',
            'utils': r'^[a-z-]+\.ts$'
        }
        
        for dir_name, pattern in naming_rules.items():
            dir_path = self.workspace / 'src' / dir_name
            if not dir_path.exists():
                continue
            
            for ts_file in dir_path.rglob('*.ts'):
                if not re.match(pattern, ts_file.name):
                    self.issues.append({
                        'type': 'naming',
                        'severity': 'info',
                        'file': str(ts_file.relative_to(self.workspace)),
                        'message': f'Nome não segue convenção kebab-case: {ts_file.name}',
                        'expected': pattern
                    })
        
        return results
    
    def fix_issues(self):
        """Aplica correções automáticas"""
        if self.dry_run:
            print("⚠️  Modo dry-run ativo. Nenhuma mudança será aplicada.")
            return
        
        print(f"🔧 Aplicando {len(self.issues)} correções...")
        
        for issue in self.issues:
            if 'fix' in issue:
                self._apply_fix(issue)
        
        print(f"✅ Correções aplicadas: {len(self.fixes)}")
    
    def _apply_fix(self, issue: Dict):
        """Aplica correção individual"""
        # Implementação de fixes automáticos
        if issue['type'] == 'structure' and 'Criar diretório' in issue['fix']:
            dir_match = re.search(r'Criar diretório (.+)', issue['fix'])
            if dir_match:
                dir_path = self.workspace / dir_match.group(1)
                dir_path.mkdir(parents=True, exist_ok=True)
                self.fixes.append({'type': 'directory_created', 'path': str(dir_path)})
                print(f"  ✓ Criado diretório: {dir_path.relative_to(self.workspace)}")
    
    def generate_report(self, report: Dict, output_file: str = None):
        """Gera relatório de normalização"""
        if output_file:
            output_path = Path(output_file)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            print(f"📄 Relatório salvo em: {output_path}")
        
        # Console summary
        print("\n" + "="*70)
        print("RELATÓRIO DE NORMALIZAÇÃO MEDUSA.JS v2.10.3".center(70))
        print("="*70)
        print(f"Workspace: {report['workspace']}")
        print(f"Timestamp: {report['timestamp']}")
        print(f"\nTotal de Issues: {report['issues_count']}")
        
        # Agrupa issues por severidade
        by_severity = {}
        for issue in report['issues']:
            severity = issue.get('severity', 'info')
            by_severity[severity] = by_severity.get(severity, 0) + 1
        
        print("\nPor Severidade:")
        for severity in ['error', 'warning', 'info']:
            count = by_severity.get(severity, 0)
            if count > 0:
                icon = '🔴' if severity == 'error' else '🟡' if severity == 'warning' else '🔵'
                print(f"  {icon} {severity.upper()}: {count}")
        
        # Agrupa issues por tipo
        by_type = {}
        for issue in report['issues']:
            itype = issue.get('type', 'other')
            by_type[itype] = by_type.get(itype, 0) + 1
        
        print("\nPor Tipo:")
        for itype, count in sorted(by_type.items()):
            print(f"  • {itype}: {count}")
        
        print("\n" + "="*70)
        
        # Top issues
        if report['issues']:
            print("\nTop 10 Issues:")
            for i, issue in enumerate(report['issues'][:10], 1):
                severity_icon = '🔴' if issue['severity'] == 'error' else '🟡' if issue['severity'] == 'warning' else '🔵'
                print(f"\n{i}. {severity_icon} [{issue['type']}] {issue['message']}")
                if 'file' in issue:
                    print(f"   Arquivo: {issue['file']}")
                if 'fix' in issue:
                    print(f"   Fix: {issue['fix']}")
        
        print("\n" + "="*70 + "\n")

def main():
    parser = argparse.ArgumentParser(
        description='Normalização Medusa.js v2.10.3 - Yello Solar Hub'
    )
    parser.add_argument(
        '--workspace',
        required=True,
        help='Caminho do workspace backend'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        default=True,
        help='Modo dry-run (padrão: True)'
    )
    parser.add_argument(
        '--fix',
        action='store_true',
        help='Aplicar correções automáticas'
    )
    parser.add_argument(
        '--output',
        help='Arquivo de saída para relatório JSON'
    )
    
    args = parser.parse_args()
    
    # Se --fix foi passado, desativa dry-run
    dry_run = not args.fix
    
    print("="*70)
    print("MEDUSA.JS v2.10.3 NORMALIZER - YELLO SOLAR HUB".center(70))
    print("="*70)
    print(f"\nWorkspace: {args.workspace}")
    print(f"Modo: {'DRY-RUN (somente análise)' if dry_run else 'FIX (aplica correções)'}\n")
    
    normalizer = MedusaNormalizer(args.workspace, dry_run=dry_run)
    
    # Escaneia e gera relatório
    report = normalizer.scan()
    
    # Aplica fixes se solicitado
    if args.fix:
        normalizer.fix_issues()
        report['fixes_applied'] = len(normalizer.fixes)
        report['fixes'] = normalizer.fixes
    
    # Gera relatório
    output_file = args.output or f'normalization-report-{datetime.now().strftime("%Y%m%d-%H%M%S")}.json'
    normalizer.generate_report(report, output_file)
    
    # Exit code baseado em severidade
    has_errors = any(i['severity'] == 'error' for i in report['issues'])
    exit(1 if has_errors else 0)

if __name__ == '__main__':
    main()
