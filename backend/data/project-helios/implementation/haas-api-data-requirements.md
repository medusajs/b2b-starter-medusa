# 📊 HaaS Platform - API Data Requirements & Gap Analysis

**Date**: October 14, 2025  
**Version**: 1.0  
**Purpose**: Comprehensive mapping of data needed for automated homologation process

---

## 🎯 Executive Summary

Para automatizar o processo de homologação de sistemas de Geração Distribuída (GD), precisamos integrar dados de múltiplas fontes:

- **ANEEL**: Dados regulatórios, padrões, requisitos técnicos
- **Concessionárias**: Formulários, prazos, requisitos específicos
- **INMETRO**: Certificações de equipamentos

**Status Atual das APIs**:

- ✅ **ANEEL Data Fetcher**: Implementado (392 linhas)
- ⚠️ **Dados de Concessionárias**: Parcialmente mapeado
- ❌ **Validação INMETRO**: Não implementado
- ❌ **Geração Automática de Documentos**: Não implementado

---

## 📋 Table of Contents

1. [Dados ANEEL - Análise Atual](#1-dados-aneel---análise-atual)
2. [Dados Faltantes - Concessionárias](#2-dados-faltantes---concessionárias)
3. [Dados Faltantes - INMETRO](#3-dados-faltantes---inmetro)
4. [Dados Faltantes - Geração de Documentos](#4-dados-faltantes---geração-de-documentos)
5. [Arquitetura de APIs Proposta](#5-arquitetura-de-apis-proposta)
6. [Roadmap de Implementação](#6-roadmap-de-implementação)

---

## 1. Dados ANEEL - Análise Atual

### ✅ O Que Já Temos

```python
# API existente: aneel_data_fetcher.py

class ANEELDataFetcher:
    """
    Endpoints implementados:
    ✅ RSS Feed - Datasets mais recentes
    ✅ DCAT Catalog - Metadados estruturados
    ✅ Search API - Busca de datasets
    ✅ Generation Data - Unidades de GD conectadas
    ✅ Tariffs - Tarifas por concessionária
    ✅ Certifications - Certificações de equipamentos
    """
```

**Dados Coletados:**

- Lista de unidades de GD conectadas (histórico)
- Metadados de tarifas (mas não valores específicos)
- Referências a datasets de certificação
- Feed de atualizações regulatórias

### ❌ O Que Está Faltando

#### 1.1 Resolução Normativa Nº 1.000/2021 (Atualizada)

**Necessário para**: Validar requisitos técnicos dos projetos

**Dados Faltantes:**

```python
@dataclass
class ANEELRegulation:
    """Requisitos técnicos da REN 1.000/2021"""
    
    # LIMITES DE POTÊNCIA
    microgeracao_max_kw: float = 75.0  # Até 75 kW
    minigeracao_min_kw: float = 75.0   # Acima de 75 kW
    minigeracao_max_kw: float = 5000.0 # Até 5 MW
    
    # MODALIDADES DE COMPENSAÇÃO
    compensation_modalities: List[str] = [
        "mesma_unidade",          # Mesma unidade consumidora
        "empreendimento_multiplo", # Empreendimento múltiplo
        "geracao_compartilhada",   # Geração compartilhada
        "autoconsumo_remoto"       # Autoconsumo remoto
    ]
    
    # REQUISITOS TÉCNICOS POR POTÊNCIA
    technical_requirements: Dict[str, Any] = {
        "ate_75kw": {
            "estudos_required": ["formulario_basico"],
            "protecao_minima": ["disjuntor_termico", "DR_30mA"],
            "tempo_max_parecer_dias": 15,
            "art_required": True
        },
        "75kw_a_500kw": {
            "estudos_required": ["formulario_detalhado", "diagrama_unifilar"],
            "protecao_minima": ["disjuntor_termico", "DR_30mA", "DPS"],
            "tempo_max_parecer_dias": 30,
            "art_required": True,
            "vistoria_required": True
        },
        "500kw_a_5mw": {
            "estudos_required": [
                "estudo_fluxo_potencia",
                "estudo_curto_circuito",
                "diagrama_unifilar",
                "memorial_descritivo"
            ],
            "protecao_minima": ["completa"],
            "tempo_max_parecer_dias": 45,
            "art_required": True,
            "vistoria_required": True,
            "acordo_operacional": True
        }
    }
    
    # DOCUMENTOS OBRIGATÓRIOS
    mandatory_documents: Dict[str, List[str]] = {
        "todos": [
            "formulario_solicitacao_acesso",
            "art_anotacao_responsabilidade",
            "diagrama_unifilar",
            "memorial_descritivo",
            "datasheet_inversor",
            "certificado_inmetro_inversor"
        ],
        "acima_75kw": [
            "estudo_fluxo_potencia",
            "datasheet_modulos",
            "certificado_inmetro_modulos"
        ],
        "acima_500kw": [
            "estudo_curto_circuito",
            "plano_protecao",
            "acordo_operacional"
        ]
    }
    
    # PADRÕES TÉCNICOS OBRIGATÓRIOS
    technical_standards: Dict[str, str] = {
        "NBR_16149": "Sistemas fotovoltaicos - Características da interface",
        "NBR_16150": "Sistemas fotovoltaicos - Características da proteção",
        "NBR_10899": "Energia solar - Terminologia",
        "NBR_16274": "Sistemas fotovoltaicos conectados à rede",
        "ABNT_NBR_5410": "Instalações elétricas de baixa tensão",
        "ABNT_NBR_5419": "Proteção contra descargas atmosféricas"
    }
```

**API Necessária:**

```python
async def fetch_regulatory_requirements(
    self, 
    installed_power_kw: float,
    voltage_level: str = "baixa_tensao"
) -> Dict[str, Any]:
    """
    Busca requisitos regulatórios específicos para um projeto
    
    Args:
        installed_power_kw: Potência instalada em kW
        voltage_level: baixa_tensao | media_tensao
        
    Returns:
        Dict com requisitos técnicos, documentos obrigatórios, prazos
    """
    # TODO: Implementar scraping de resoluções ANEEL
    # ou manter cache local atualizado
```

#### 1.2 Validação de Dados Técnicos

**Necessário para**: Garantir conformidade antes de submissão

```python
class ANEELTechnicalValidator:
    """Valida dados técnicos contra normas ANEEL"""
    
    async def validate_system_design(
        self,
        system_data: Dict[str, Any]
    ) -> ValidationResult:
        """
        Valida projeto de sistema fotovoltaico
        
        Validações:
        - Potência dentro dos limites regulatórios
        - Tensão de conexão adequada
        - Fator de dimensionamento do inversor (0.8-1.2)
        - Proteções obrigatórias presentes
        - Documentação completa
        - Certificações válidas
        """
        
        validation_result = ValidationResult()
        
        # 1. Validar limites de potência
        power_kw = system_data.get("installed_power_kw")
        if power_kw > 5000:
            validation_result.add_error(
                "power_limit_exceeded",
                f"Potência {power_kw} kW excede limite de 5 MW (minigeração)"
            )
        
        # 2. Validar fator de dimensionamento
        inverter_power = system_data.get("inverter_power_kw")
        panel_power = system_data.get("panel_power_kwp")
        
        if inverter_power and panel_power:
            fdi = panel_power / inverter_power
            if not (0.8 <= fdi <= 1.35):
                validation_result.add_warning(
                    "fdi_out_of_range",
                    f"FDI {fdi:.2f} fora do range recomendado (0.8-1.35)"
                )
        
        # 3. Validar proteções obrigatórias
        required_protections = self._get_required_protections(power_kw)
        for protection in required_protections:
            if protection not in system_data.get("protections", []):
                validation_result.add_error(
                    f"missing_protection_{protection}",
                    f"Proteção obrigatória ausente: {protection}"
                )
        
        return validation_result
```

---

## 2. Dados Faltantes - Concessionárias

### 🎯 O Que Precisamos

Para cada concessionária (Enel SP, CEMIG, CPFL, etc.), precisamos:

#### 2.1 Formulários e Templates

```python
@dataclass
class UtilityForms:
    """Formulários específicos de cada concessionária"""
    
    utility_code: str  # Ex: "0266" (CPFL)
    utility_name: str  # Ex: "CPFL Paulista"
    
    # FORMULÁRIOS DIGITAIS
    forms: Dict[str, FormTemplate] = {
        "solicitacao_acesso": {
            "url": "https://servicosonline.cpfl.com.br/agencia-webapp/...",
            "format": "web_form",
            "fields": [
                {
                    "name": "nome_solicitante",
                    "type": "text",
                    "required": True,
                    "max_length": 100
                },
                {
                    "name": "cpf_cnpj",
                    "type": "text",
                    "required": True,
                    "mask": "999.999.999-99 | 99.999.999/9999-99",
                    "validation": "cpf_cnpj_validator"
                },
                {
                    "name": "numero_cliente",
                    "type": "text",
                    "required": True,
                    "length": 10,
                    "help_text": "Número do cliente na conta de energia"
                },
                {
                    "name": "endereco_instalacao",
                    "type": "address",
                    "required": True,
                    "fields": ["logradouro", "numero", "bairro", "cep", "cidade", "uf"]
                },
                {
                    "name": "potencia_instalada_kw",
                    "type": "number",
                    "required": True,
                    "min": 0,
                    "max": 5000,
                    "step": 0.01,
                    "unit": "kW"
                },
                {
                    "name": "tipo_geracao",
                    "type": "select",
                    "required": True,
                    "options": [
                        "solar_fotovoltaica",
                        "eolica",
                        "hibrida",
                        "outras"
                    ]
                },
                {
                    "name": "modalidade_compensacao",
                    "type": "select",
                    "required": True,
                    "options": [
                        "mesma_unidade",
                        "empreendimento_multiplo",
                        "geracao_compartilhada",
                        "autoconsumo_remoto"
                    ]
                }
            ],
            "attachments": [
                {
                    "name": "art_engenheiro",
                    "type": "pdf",
                    "required": True,
                    "max_size_mb": 5
                },
                {
                    "name": "diagrama_unifilar",
                    "type": "pdf|dwg",
                    "required": True,
                    "max_size_mb": 10
                },
                {
                    "name": "memorial_descritivo",
                    "type": "pdf|doc",
                    "required": True,
                    "max_size_mb": 10
                }
            ]
        },
        
        "complementacao_informacoes": {
            "url": "https://servicosonline.cpfl.com.br/agencia-webapp/complementacao",
            "format": "web_form",
            "used_when": "solicitacao_informacoes_adicionais"
        }
    }
    
    # PORTAIS DE ACESSO
    portals: Dict[str, str] = {
        "main": "https://servicosonline.cpfl.com.br/",
        "tracking": "https://servicosonline.cpfl.com.br/acompanhamento",
        "login": "https://servicosonline.cpfl.com.br/login"
    }
    
    # CREDENCIAIS DE AUTOMAÇÃO
    automation: Dict[str, Any] = {
        "login_type": "cpf_cnpj_senha",  # ou "api_key"
        "captcha": True,
        "mfa_enabled": False,
        "rate_limit_requests_per_minute": 10
    }
```

#### 2.2 Processos e Prazos

```python
@dataclass
class UtilityProcess:
    """Processo de homologação por concessionária"""
    
    utility_code: str
    utility_name: str
    
    # FLUXO DO PROCESSO
    workflow: List[ProcessStep] = [
        {
            "step": 1,
            "name": "submissao_solicitacao",
            "description": "Submissão de solicitação de acesso",
            "required_documents": ["form", "art", "diagrama", "memorial"],
            "sla_days": 0,
            "automated": True
        },
        {
            "step": 2,
            "name": "analise_documentacao",
            "description": "Análise da documentação pela concessionária",
            "sla_days": 15,  # Regulatório ANEEL
            "automated": False,
            "common_rejections": [
                "art_sem_assinatura",
                "diagrama_nao_conforme_nbr",
                "potencia_divergente",
                "endereco_incorreto"
            ]
        },
        {
            "step": 3,
            "name": "emissao_parecer_acesso",
            "description": "Emissão do parecer de acesso",
            "sla_days": 15,
            "document_generated": "parecer_acesso.pdf",
            "automated": False
        },
        {
            "step": 4,
            "name": "instalacao_sistema",
            "description": "Cliente instala o sistema",
            "sla_days": None,  # Depende do cliente
            "automated": False
        },
        {
            "step": 5,
            "name": "solicitacao_vistoria",
            "description": "Solicitação de vistoria após instalação",
            "required_documents": ["fotos_instalacao", "art_execucao"],
            "sla_days": 0,
            "automated": True
        },
        {
            "step": 6,
            "name": "vistoria_tecnica",
            "description": "Vistoria técnica pela concessionária",
            "sla_days": 7,
            "automated": False,
            "common_issues": [
                "aterramento_inadequado",
                "protecoes_ausentes",
                "instalacao_nao_conforme"
            ]
        },
        {
            "step": 7,
            "name": "troca_medidor",
            "description": "Troca/programação do medidor bidirecional",
            "sla_days": 7,
            "automated": False
        },
        {
            "step": 8,
            "name": "conexao_rede",
            "description": "Conexão final à rede e ativação",
            "sla_days": 2,
            "document_generated": "acordo_conexao.pdf",
            "automated": False
        }
    ]
    
    # HISTÓRICO DE PERFORMANCE
    performance_metrics: Dict[str, Any] = {
        "average_approval_time_days": 25,  # Média real observada
        "rejection_rate": 0.18,  # 18% de projetos rejeitados
        "common_rejection_reasons": [
            ("art_incompleta", 0.35),
            ("diagrama_nao_conforme", 0.28),
            ("documentacao_faltante", 0.22),
            ("dados_incorretos", 0.15)
        ],
        "reopening_success_rate": 0.82,  # Taxa de sucesso após correção
        "average_reopening_time_days": 7
    }
```

#### 2.3 Requisitos Específicos por Concessionária

```python
@dataclass
class UtilitySpecificRequirements:
    """Requisitos específicos além das normas ANEEL"""
    
    utility_code: str
    
    # REQUISITOS TÉCNICOS ADICIONAIS
    technical_extras: Dict[str, Any] = {
        "max_fdi": 1.35,  # Alguns mais restritivos
        "min_fdi": 0.80,
        "requires_string_monitoring": False,
        "requires_remote_disconnect": True,  # Acima de 100 kW
        "max_modules_per_string": 25,
        "requires_dps": True,
        "grounding_method": ["TN-S", "TN-C-S", "TT"]
    }
    
    # DOCUMENTAÇÃO ADICIONAL
    extra_documents: List[str] = [
        "declaracao_residuo_solido",  # Específico de algumas
        "laudo_estrutural",            # Para instalações em telhado
        "autorizacao_condominio"       # Se for condomínio
    ]
    
    # PARTICULARIDADES DE PREENCHIMENTO
    form_quirks: Dict[str, str] = {
        "cpf_formato": "sem_pontuacao",  # Outras aceitam com
        "potencia_unidade": "kW",         # Ou kVA em algumas
        "endereco_obrigatorio_complemento": True,
        "requer_coordenadas_gps": False
    }
```

### 📡 APIs Necessárias para Concessionárias

```python
class UtilityAPIIntegration:
    """Integração com sistemas das concessionárias"""
    
    async def get_utility_forms(
        self, 
        utility_code: str
    ) -> UtilityForms:
        """
        Retorna formulários e campos específicos da concessionária
        
        Args:
            utility_code: Código da concessionária (ex: "0266")
            
        Returns:
            UtilityForms com templates e validações
        """
        # TODO: Implementar scraping ou manter cache local
        pass
    
    async def submit_access_request(
        self,
        utility_code: str,
        project_data: Dict[str, Any],
        documents: List[FileUpload]
    ) -> SubmissionResult:
        """
        Submete solicitação de acesso à concessionária
        
        Args:
            utility_code: Código da concessionária
            project_data: Dados do projeto
            documents: Documentos anexos
            
        Returns:
            SubmissionResult com protocolo e status
        """
        # TODO: Implementar automação via Playwright/Selenium
        pass
    
    async def track_request_status(
        self,
        utility_code: str,
        protocol_number: str
    ) -> RequestStatus:
        """
        Consulta status de solicitação
        
        Args:
            utility_code: Código da concessionária
            protocol_number: Número de protocolo
            
        Returns:
            RequestStatus com etapa atual e prazos
        """
        # TODO: Implementar scraping de portais
        pass
    
    async def get_rejection_details(
        self,
        utility_code: str,
        protocol_number: str
    ) -> RejectionDetails:
        """
        Busca detalhes de rejeição se houver
        
        Returns:
            Motivos de rejeição e orientações para correção
        """
        # TODO: Implementar
        pass
```

---

## 3. Dados Faltantes - INMETRO

### 🎯 O Que Precisamos

#### 3.1 Certificações de Equipamentos

```python
@dataclass
class INMETROCertification:
    """Certificação INMETRO de equipamento fotovoltaico"""
    
    # IDENTIFICAÇÃO
    certificate_number: str  # Ex: "BRA/INMETRO-000123/2024"
    registration_number: str  # Número de registro
    status: str  # "valido" | "suspenso" | "cancelado"
    
    # EQUIPAMENTO
    equipment_type: str  # "inversor" | "modulo_fotovoltaico"
    manufacturer: str
    brand: str
    model: str
    
    # ESPECIFICAÇÕES TÉCNICAS (Inversor)
    inverter_specs: Optional[Dict[str, Any]] = {
        "rated_power_w": 5000,
        "max_dc_voltage_v": 1000,
        "mppt_channels": 2,
        "efficiency": 0.975,
        "input_voltage_range_v": [150, 800],
        "output_voltage_v": 220,
        "output_frequency_hz": 60,
        "thd_percent": 3.0,  # Total Harmonic Distortion
        "isolation_resistance_mohm": 1000
    }
    
    # ESPECIFICAÇÕES TÉCNICAS (Módulo)
    module_specs: Optional[Dict[str, Any]] = {
        "rated_power_wp": 550,
        "voc_v": 49.5,      # Tensão de circuito aberto
        "isc_a": 14.15,     # Corrente de curto-circuito
        "vmp_v": 41.8,      # Tensão no ponto de máxima potência
        "imp_a": 13.16,     # Corrente no ponto de máxima potência
        "efficiency_percent": 21.2,
        "temp_coef_power_percent": -0.34,
        "dimensions_mm": [2278, 1134, 35],
        "weight_kg": 28.5,
        "cell_type": "monocrystalline",
        "cells_per_module": 132
    }
    
    # NORMAS ATENDIDAS
    standards_compliance: List[str] = [
        "IEC_61215",   # Qualificação de projeto
        "IEC_61730",   # Segurança
        "ABNT_NBR_16274"  # Norma brasileira
    ]
    
    # ENSAIOS REALIZADOS
    tests_performed: List[Dict[str, Any]] = [
        {
            "test_name": "Inspeção visual",
            "result": "aprovado"
        },
        {
            "test_name": "Teste de isolação elétrica",
            "result": "aprovado",
            "value": "1200 MΩ"
        },
        {
            "test_name": "Teste de funcionamento",
            "result": "aprovado"
        }
    ]
    
    # VALIDADE
    issue_date: datetime
    expiry_date: datetime
    last_update: datetime
    
    # ORGANISMO CERTIFICADOR
    certifying_body: str  # Ex: "INMETRO/OCP-0001"
    laboratory: str
```

#### 3.2 API de Validação INMETRO

```python
class INMETROValidator:
    """Valida certificações de equipamentos no INMETRO"""
    
    BASE_URL = "http://www.inmetro.gov.br/consumidor/produtosCertificados.asp"
    
    async def validate_inverter(
        self,
        manufacturer: str,
        model: str
    ) -> ValidationResult:
        """
        Valida se inversor possui certificação INMETRO válida
        
        Args:
            manufacturer: Fabricante do inversor
            model: Modelo do inversor
            
        Returns:
            ValidationResult com certificação ou erro
        """
        
        # Buscar no banco de dados do INMETRO
        cert = await self._search_inmetro_database(
            category="inversores_fotovoltaicos",
            manufacturer=manufacturer,
            model=model
        )
        
        if not cert:
            return ValidationResult(
                valid=False,
                error="inversor_nao_certificado",
                message=f"Inversor {manufacturer} {model} não possui certificação INMETRO válida"
            )
        
        # Verificar validade
        if cert.expiry_date < datetime.now():
            return ValidationResult(
                valid=False,
                error="certificacao_expirada",
                message=f"Certificação expirou em {cert.expiry_date.strftime('%d/%m/%Y')}"
            )
        
        # Verificar suspensão/cancelamento
        if cert.status != "valido":
            return ValidationResult(
                valid=False,
                error=f"certificacao_{cert.status}",
                message=f"Certificação está {cert.status}"
            )
        
        return ValidationResult(
            valid=True,
            certification=cert,
            message="Inversor com certificação INMETRO válida"
        )
    
    async def validate_module(
        self,
        manufacturer: str,
        model: str
    ) -> ValidationResult:
        """Valida se módulo fotovoltaico possui certificação INMETRO válida"""
        # Similar ao validate_inverter
        pass
    
    async def get_certified_equipment_list(
        self,
        equipment_type: str,
        manufacturer: Optional[str] = None
    ) -> List[INMETROCertification]:
        """
        Lista equipamentos certificados
        
        Args:
            equipment_type: "inversores" | "modulos"
            manufacturer: Filtrar por fabricante (opcional)
            
        Returns:
            Lista de equipamentos certificados
        """
        # TODO: Implementar scraping ou API oficial se disponível
        pass
    
    async def _search_inmetro_database(
        self,
        category: str,
        manufacturer: str,
        model: str
    ) -> Optional[INMETROCertification]:
        """Busca no banco de dados do INMETRO"""
        
        # Estratégias:
        # 1. API oficial (se existir)
        # 2. Scraping do site
        # 3. Cache local atualizado periodicamente
        
        # TODO: Implementar
        pass
```

#### 3.3 Banco de Dados Local de Certificações

**Necessário porque**: INMETRO não tem API pública robusta

```sql
-- Schema PostgreSQL para cache de certificações

CREATE TABLE inmetro_certifications (
    id SERIAL PRIMARY KEY,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50),
    equipment_type VARCHAR(50) NOT NULL, -- 'inverter' | 'module'
    status VARCHAR(20) NOT NULL, -- 'valid' | 'suspended' | 'cancelled'
    
    -- Equipment identification
    manufacturer VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(200) NOT NULL,
    
    -- Technical specs (JSONB for flexibility)
    technical_specs JSONB NOT NULL,
    
    -- Standards
    standards_compliance TEXT[],
    
    -- Dates
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    last_verified TIMESTAMP DEFAULT NOW(),
    
    -- Metadata
    certifying_body VARCHAR(100),
    laboratory VARCHAR(200),
    data_source VARCHAR(50), -- 'inmetro_scrape' | 'manual_entry'
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Indexes for fast lookup
    INDEX idx_manufacturer_model (manufacturer, model),
    INDEX idx_equipment_type (equipment_type),
    INDEX idx_status (status),
    INDEX idx_expiry_date (expiry_date)
);

-- View para certificações válidas
CREATE VIEW valid_certifications AS
SELECT *
FROM inmetro_certifications
WHERE status = 'valid'
  AND expiry_date > CURRENT_DATE;
```

**Script de Atualização Periódica:**

```python
class INMETROCacheSynchronizer:
    """Mantém cache local sincronizado com INMETRO"""
    
    async def sync_certifications(self):
        """
        Sincroniza certificações do INMETRO
        
        Processo:
        1. Scrape do site INMETRO
        2. Parse de PDFs de certificados
        3. Atualização do banco local
        4. Notificação de mudanças
        """
        
        logger.info("Iniciando sincronização INMETRO...")
        
        # Buscar lista atualizada
        inverters = await self._scrape_inverter_list()
        modules = await self._scrape_module_list()
        
        # Atualizar banco de dados
        updated_count = 0
        new_count = 0
        
        for cert_data in inverters + modules:
            existing = await self.db.get_certification(
                certificate_number=cert_data['certificate_number']
            )
            
            if existing:
                if existing.last_update < cert_data['last_update']:
                    await self.db.update_certification(cert_data)
                    updated_count += 1
            else:
                await self.db.create_certification(cert_data)
                new_count += 1
        
        logger.info(f"Sincronização concluída: {new_count} novos, {updated_count} atualizados")
        
        return {
            'new': new_count,
            'updated': updated_count,
            'timestamp': datetime.now()
        }
```

---

## 4. Dados Faltantes - Geração de Documentos

### 🎯 O Que Precisamos

Para gerar automaticamente os documentos técnicos obrigatórios:

#### 4.1 Memorial Descritivo

```python
@dataclass
class MemorialDescritivoData:
    """Dados para geração de memorial descritivo"""
    
    # IDENTIFICAÇÃO DO PROJETO
    project_id: str
    project_name: str
    client_name: str
    client_cpf_cnpj: str
    installation_address: Address
    
    # CARACTERÍSTICAS DO SISTEMA
    system_type: str = "solar_fotovoltaico"
    installed_power_kwp: float
    inverter_power_kw: float
    num_modules: int
    module_power_wp: float
    
    # EQUIPAMENTOS (com certificações)
    modules: List[ModuleSpec] = [
        {
            "manufacturer": "Canadian Solar",
            "model": "HiKu6 CS6W-550MS",
            "power_wp": 550,
            "quantity": 20,
            "inmetro_cert": "BRA/INMETRO-123456/2024",
            "efficiency": 0.212,
            "dimensions_mm": [2278, 1134, 35]
        }
    ]
    
    inverters: List[InverterSpec] = [
        {
            "manufacturer": "Growatt",
            "model": "MID 10KTL3-X",
            "power_kw": 10,
            "quantity": 1,
            "inmetro_cert": "BRA/INMETRO-789012/2024",
            "efficiency": 0.984,
            "mppt_channels": 2
        }
    ]
    
    # PROTEÇÕES E SEGURANÇA
    protections: List[str] = [
        "Disjuntor termomagnético 25A",
        "DR 30mA",
        "DPS Classe II",
        "Seccionadora DC",
        "Aterramento TN-S"
    ]
    
    # DADOS ELÉTRICOS
    electrical_data: Dict[str, Any] = {
        "connection_voltage": "220V/380V",
        "connection_phase": "trifasico",
        "estimated_generation_kwh_month": 1400,
        "fdi": 1.1,  # Fator de dimensionamento
        "max_dc_voltage": 850,
        "strings_config": "2 strings de 10 módulos"
    }
    
    # ENGENHEIRO RESPONSÁVEL
    engineer: EngineerData = {
        "name": "João Silva",
        "crea_number": "SP-123456",
        "art_number": "SP-2024-001234",
        "contact": "joao@engenharia.com"
    }
    
    # NORMAS APLICÁVEIS
    applicable_standards: List[str] = [
        "NBR 16149:2013",
        "NBR 16150:2013",
        "NBR 16274:2014",
        "NBR 5410:2004",
        "NBR 5419:2015"
    ]
```

**Template Engine:**

```python
class DocumentGenerator:
    """Gerador de documentos técnicos"""
    
    async def generate_memorial_descritivo(
        self,
        project_data: MemorialDescritivoData
    ) -> bytes:
        """
        Gera memorial descritivo em PDF
        
        Args:
            project_data: Dados do projeto
            
        Returns:
            PDF bytes
        """
        
        # Template usando Jinja2 + ReportLab ou WeasyPrint
        template = self.jinja_env.get_template("memorial_descritivo.html")
        
        html_content = template.render(
            project=project_data,
            generation_date=datetime.now(),
            standards=project_data.applicable_standards
        )
        
        # Converter HTML para PDF
        pdf_bytes = HTML(string=html_content).write_pdf()
        
        return pdf_bytes
```

#### 4.2 Diagrama Unifilar

```python
class DiagramGenerator:
    """Gerador de diagramas unifilares"""
    
    async def generate_unifilar_diagram(
        self,
        system_data: Dict[str, Any]
    ) -> bytes:
        """
        Gera diagrama unifilar automaticamente
        
        Componentes:
        - Arranjo de módulos fotovoltaicos
        - Inversores
        - Proteções (disjuntores, DR, DPS)
        - Ponto de conexão
        - Medidor
        - Aterramento
        
        Output: PDF ou DWG
        """
        
        # Usar biblioteca de desenho técnico
        # Ex: matplotlib + custom shapes ou plotly
        
        diagram = self._create_base_diagram()
        
        # Adicionar componentes
        self._add_pv_array(diagram, system_data['modules'])
        self._add_inverter(diagram, system_data['inverter'])
        self._add_protections(diagram, system_data['protections'])
        self._add_connection_point(diagram)
        self._add_annotations(diagram)
        
        # Exportar para PDF
        pdf_bytes = diagram.export_pdf()
        
        return pdf_bytes
```

#### 4.3 Formulários Preenchidos

```python
class FormFiller:
    """Preenche formulários de concessionárias"""
    
    async def fill_utility_form(
        self,
        utility_code: str,
        form_type: str,
        project_data: Dict[str, Any]
    ) -> FilledForm:
        """
        Preenche formulário da concessionária
        
        Args:
            utility_code: Código da concessionária
            form_type: Tipo do formulário
            project_data: Dados do projeto
            
        Returns:
            Formulário preenchido (PDF ou dados estruturados)
        """
        
        # Carregar template do formulário
        form_template = await self.get_form_template(utility_code, form_type)
        
        # Mapear dados do projeto para campos do formulário
        field_mapping = self._map_project_data_to_form(
            project_data,
            form_template.fields
        )
        
        # Preencher formulário
        if form_template.format == "pdf":
            filled_pdf = self._fill_pdf_form(form_template.file, field_mapping)
            return filled_pdf
        elif form_template.format == "web_form":
            filled_data = self._prepare_web_form_data(field_mapping)
            return filled_data
```

---

## 5. Arquitetura de APIs Proposta

### 🏗️ Estrutura Completa

```
haas-platform/
├── apis/
│   ├── aneel/
│   │   ├── data_fetcher.py        ✅ Já implementado
│   │   ├── regulation_validator.py ❌ Faltando
│   │   └── technical_validator.py  ❌ Faltando
│   │
│   ├── utilities/
│   │   ├── form_manager.py         ❌ Faltando
│   │   ├── process_tracker.py      ❌ Faltando
│   │   ├── submission_automator.py ❌ Faltando
│   │   └── connectors/
│   │       ├── enel_sp.py
│   │       ├── cemig.py
│   │       ├── cpfl.py
│   │       └── generic.py
│   │
│   ├── inmetro/
│   │   ├── certification_validator.py ❌ Faltando
│   │   ├── cache_synchronizer.py      ❌ Faltando
│   │   └── database_scraper.py        ❌ Faltando
│   │
│   ├── documents/
│   │   ├── memorial_generator.py      ❌ Faltando
│   │   ├── diagram_generator.py       ❌ Faltando
│   │   ├── form_filler.py             ❌ Faltando
│   │   └── templates/
│   │       ├── memorial.html
│   │       ├── diagrama.svg
│   │       └── forms/
│   │
│   └── integration/
│       ├── medusa_sync.py
│       ├── notification_service.py
│       └── webhook_handler.py
│
├── database/
│   ├── models/
│   │   ├── projects.py
│   │   ├── certifications.py
│   │   ├── utilities.py
│   │   └── regulations.py
│   │
│   └── migrations/
│
├── workers/
│   ├── document_generation_worker.py
│   ├── submission_worker.py
│   └── tracking_worker.py
│
└── web/
    ├── api/
    │   ├── main.py            # FastAPI main
    │   ├── projects.py        # Project endpoints
    │   ├── validation.py      # Validation endpoints
    │   └── documents.py       # Document generation endpoints
    │
    └── frontend/
        └── (Portal do Integrador)
```

---

## 6. Roadmap de Implementação

### 📅 Fase 1: Validação e Dados (Mês 1-2)

**Prioridade: Alta**

```markdown
✅ Já Implementado:
- ANEEL Data Fetcher (básico)

❌ A Implementar:

1. ANEEL Regulation Validator (1 semana)
   - Parser de Resolução Normativa 1.000/2021
   - Validador de requisitos técnicos
   - Cache local de regulamentações

2. INMETRO Certification Validator (2 semanas)
   - Scraper do banco de dados INMETRO
   - Cache local de certificações
   - API de validação
   - Sincronizador automático (daily)

3. Utility Forms Manager (2 semanas)
   - Mapeamento de formulários CPFL, Enel SP, CEMIG
   - Estruturas de dados para formulários
   - Validadores de campos
```

### 📅 Fase 2: Geração de Documentos (Mês 2-3)

**Prioridade: Alta**

```markdown
1. Memorial Descritivo Generator (1 semana)
   - Template HTML/CSS
   - Engine Jinja2 + WeasyPrint
   - Validação de dados de entrada

2. Diagrama Unifilar Generator (2 semanas)
   - Biblioteca de símbolos elétricos
   - Algoritmo de layout automático
   - Export PDF/DWG
   - Conformidade com NBR 5410

3. Form Filler (1 semana)
   - Preenchimento de PDFs
   - Preparação de dados para web forms
   - Mapeamento de campos por concessionária
```

### 📅 Fase 3: Automação de Submissão (Mês 3-4)

**Prioridade: Média**

```markdown
1. Utility Portal Connectors (3 semanas)
   - Playwright/Selenium para automação web
   - Conectores para Enel SP, CEMIG, CPFL
   - Tratamento de CAPTCHAs
   - Retry logic e error handling

2. Process Tracker (1 semana)
   - Scraping de status de solicitações
   - Notificações de mudanças de status
   - Alertas de prazos

3. Submission Orchestrator (1 semana)
   - Workflow de submissão
   - Gerenciamento de anexos
   - Logging e auditoria
```

### 📅 Fase 4: Inteligência e Otimização (Mês 4-6)

**Prioridade: Baixa-Média**

```markdown
1. AI-Powered Document Review
   - LLM para revisar documentos antes de envio
   - Detecção de inconsistências
   - Sugestões de correção

2. Predictive Analytics
   - Previsão de tempo de aprovação
   - Análise de padrões de rejeição
   - Recomendações de melhoria

3. Auto-Correction System
   - Correção automática de erros comuns
   - Re-submissão inteligente
```

---

## 📊 Resumo Executivo de Gaps

### Dados Críticos Faltantes

| Categoria | Status Atual | Gap | Prioridade |
|-----------|--------------|-----|------------|
| **ANEEL Regulação** | ⚠️ Parcial | Validador de requisitos técnicos | 🔴 Alta |
| **ANEEL Certificações** | ⚠️ Metadados apenas | Dados técnicos detalhados | 🟡 Média |
| **Concessionárias - Formulários** | ❌ Não implementado | Estrutura completa de formulários | 🔴 Alta |
| **Concessionárias - Processos** | ❌ Não implementado | Workflow e prazos | 🔴 Alta |
| **Concessionárias - Automação** | ❌ Não implementado | Conectores web | 🟡 Média |
| **INMETRO - Validação** | ❌ Não implementado | API de validação + cache | 🔴 Alta |
| **Documentos - Memorial** | ❌ Não implementado | Gerador automático | 🔴 Alta |
| **Documentos - Diagrama** | ❌ Não implementado | Gerador automático | 🔴 Alta |
| **Documentos - Formulários** | ❌ Não implementado | Preenchimento automático | 🟡 Média |

### Métricas de Implementação

**Estimativa de Esforço:**

- **Fase 1 (Validação)**: 5 semanas × 1 dev = 200 horas
- **Fase 2 (Documentos)**: 4 semanas × 1 dev = 160 horas
- **Fase 3 (Automação)**: 5 semanas × 1 dev = 200 horas
- **Fase 4 (IA)**: 8 semanas × 1 dev = 320 horas
- **Total MVP (Fase 1-3)**: ~560 horas (14 semanas)

**Tecnologias Necessárias:**

- ✅ Python (async/await)
- ✅ FastAPI
- ⚠️ Playwright/Selenium (automação web)
- ⚠️ WeasyPrint/ReportLab (geração de PDF)
- ⚠️ Jinja2 (templates)
- ❌ CAD library (para diagramas DWG)
- ❌ OCR library (para parsear PDFs de regulação)

---

## 🚀 Próximos Passos Imediatos

### Semana 1-2: Pesquisa e Mapeamento

1. **Mapear Formulários das 3 Principais Concessionárias**
   - [ ] Enel SP: Criar estrutura completa de FormTemplate
   - [ ] CEMIG: Idem
   - [ ] CPFL: Idem

2. **Scrape INMETRO Database**
   - [ ] Desenvolver scraper para lista de inversores certificados
   - [ ] Desenvolver scraper para lista de módulos certificados
   - [ ] Popular banco de dados local

3. **Parser de Resolução Normativa ANEEL**
   - [ ] Extrair requisitos técnicos da REN 1.000/2021
   - [ ] Estruturar em formato JSON
   - [ ] Criar validadores

### Semana 3-4: MVP de Validação

1. **INMETRO Validator (MVP)**

   ```python
   # Implementar busca básica no cache local
   validator = INMETROValidator()
   result = await validator.validate_inverter("Growatt", "MID 10KTL3-X")
   ```

2. **ANEEL Validator (MVP)**

   ```python
   # Validar requisitos básicos
   validator = ANEELTechnicalValidator()
   result = await validator.validate_system_design(project_data)
   ```

### Semana 5-6: MVP de Documentos

1. **Memorial Generator (MVP)**

   ```python
   # Gerar memorial básico
   generator = DocumentGenerator()
   pdf = await generator.generate_memorial_descritivo(project_data)
   ```

2. **Form Filler (MVP)**

   ```python
   # Preencher formulário CPFL
   filler = FormFiller()
   form = await filler.fill_utility_form("0266", "solicitacao_acesso", data)
   ```

---

**Documento:** HaaS API Data Requirements  
**Versão:** 1.0  
**Status:** 📋 Análise Completa  
**Próxima Revisão:** Após implementação da Fase 1
