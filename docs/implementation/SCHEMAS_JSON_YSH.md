# 📋 Schemas JSON - YSH System

**Data:** 07/10/2025  
**Fonte:** storefront/AGENTS.md  
**Contexto:** Hélio Copiloto Solar - Sistema de Agentes

---

## 📦 1. Lead Schema (`lead.json`)

**Descrição:** Estrutura para captura e qualificação de leads B2B/B2C

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "nome", "contato", "cep", "consumo_kwh_m"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Identificador único do lead"
    },
    "nome": {
      "type": "string",
      "description": "Nome completo ou razão social"
    },
    "contato": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email"
        },
        "telefone": {
          "type": "string",
          "pattern": "^\\+?[1-9]\\d{1,14}$"
        }
      }
    },
    "cpf_cnpj_hash": {
      "type": "string",
      "description": "Hash SHA-256 do CPF/CNPJ para privacidade"
    },
    "cep": {
      "type": "string",
      "pattern": "^[0-9]{5}-?[0-9]{3}$",
      "description": "CEP para geolocalização"
    },
    "consumo_kwh_m": {
      "type": "number",
      "minimum": 0,
      "description": "Consumo médio mensal em kWh"
    },
    "classe": {
      "type": "string",
      "enum": ["B1", "B2", "B3", "A4", "A3", "A3a", "A2", "A1"],
      "description": "Classe consumidora ANEEL"
    },
    "distribuidora": {
      "type": "string",
      "description": "Nome da distribuidora de energia"
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "id": "lead_abc123",
  "nome": "João Silva",
  "contato": {
    "email": "joao@empresa.com.br",
    "telefone": "+5511987654321"
  },
  "cpf_cnpj_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "cep": "01310-100",
  "consumo_kwh_m": 450,
  "classe": "B1",
  "distribuidora": "ENEL SP"
}
```

---

## ⚡ 2. PV Design Schema (`pv_design.json`)

**Descrição:** Resultado do dimensionamento fotovoltaico

```json
{
  "type": "object",
  "required": ["proposal_kwp", "expected_gen_mwh_y", "inverters", "strings"],
  "properties": {
    "proposal_kwp": {
      "type": "number",
      "minimum": 0,
      "description": "Potência proposta em kWp"
    },
    "expected_gen_mwh_y": {
      "type": "number",
      "minimum": 0,
      "description": "Geração esperada anual em MWh"
    },
    "pr": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Performance Ratio (taxa de desempenho)"
    },
    "losses": {
      "type": "object",
      "properties": {
        "soiling": {
          "type": "number",
          "description": "Perdas por sujeira (0-1)"
        },
        "temp": {
          "type": "number",
          "description": "Perdas por temperatura (0-1)"
        },
        "ohmic": {
          "type": "number",
          "description": "Perdas ôhmicas (0-1)"
        }
      }
    },
    "inverters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "model": {
            "type": "string",
            "description": "Modelo do inversor"
          },
          "phase": {
            "type": "string",
            "enum": ["mono", "bi", "tri"],
            "description": "Tipo de fase"
          },
          "mppt": {
            "type": "integer",
            "minimum": 1,
            "description": "Número de MPPTs"
          }
        }
      }
    },
    "strings": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "modules": {
            "type": "integer",
            "minimum": 1,
            "description": "Quantidade de módulos na string"
          },
          "model": {
            "type": "string",
            "description": "Modelo do módulo fotovoltaico"
          }
        }
      }
    },
    "oversizing_ratio": {
      "type": "number",
      "minimum": 1.0,
      "maximum": 1.6,
      "description": "Taxa de oversizing (1.14 a 1.60)"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string",
        "format": "uri"
      },
      "description": "PDFs e documentos técnicos"
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "proposal_kwp": 6.0,
  "expected_gen_mwh_y": 8.9,
  "pr": 0.82,
  "losses": {
    "soiling": 0.03,
    "temp": 0.08,
    "ohmic": 0.02
  },
  "inverters": [
    {
      "model": "Growatt X2 5kW",
      "phase": "mono",
      "mppt": 2
    }
  ],
  "strings": [
    {
      "modules": 10,
      "model": "BYD 600 Wp"
    }
  ],
  "oversizing_ratio": 1.30,
  "attachments": [
    "viability_summary.pdf"
  ]
}
```

---

## 📊 3. MMGD Packet Schema (`mmgd_packet.json`)

**Descrição:** Pacote para homologação de micro/minigeração distribuída

```json
{
  "type": "object",
  "required": ["IdcClasse", "IdcSubgrupo", "IdcModalidade", "MdaPotenciaInstalada"],
  "properties": {
    "IdcClasse": {
      "type": "string",
      "enum": ["B1", "B2", "B3", "A4", "A3", "A3a", "A2", "A1"],
      "description": "Classe consumidora ANEEL"
    },
    "IdcSubgrupo": {
      "type": "string",
      "description": "Subgrupo tarifário"
    },
    "IdcModalidade": {
      "type": "string",
      "enum": ["branca", "convencional", "horaria_azul", "horaria_verde"],
      "description": "Modalidade tarifária"
    },
    "MdaPotenciaInstalada": {
      "type": "number",
      "minimum": 0,
      "maximum": 5000,
      "description": "Potência instalada em kW (até 5MW)"
    },
    "CSV": {
      "type": "string",
      "description": "Conteúdo do CSV para INCLUIRUSINA/ALTERAR/INATIVAR"
    },
    "DadosUC": {
      "type": "object",
      "properties": {
        "numero_uc": {
          "type": "string",
          "description": "Número da unidade consumidora"
        },
        "titular": {
          "type": "string",
          "description": "Nome do titular"
        },
        "cpf_cnpj": {
          "type": "string",
          "description": "CPF ou CNPJ do titular"
        },
        "endereco": {
          "type": "object",
          "properties": {
            "logradouro": { "type": "string" },
            "numero": { "type": "string" },
            "complemento": { "type": "string" },
            "bairro": { "type": "string" },
            "cidade": { "type": "string" },
            "uf": { "type": "string", "pattern": "^[A-Z]{2}$" },
            "cep": { "type": "string", "pattern": "^[0-9]{5}-?[0-9]{3}$" }
          }
        }
      }
    },
    "DadosUsina": {
      "type": "object",
      "properties": {
        "tecnologia": {
          "type": "string",
          "enum": ["fotovoltaica", "eolica", "hidreletrica", "biogas"],
          "description": "Tecnologia de geração"
        },
        "quantidade_modulos": {
          "type": "integer",
          "minimum": 1,
          "description": "Quantidade de módulos/painéis"
        },
        "quantidade_inversores": {
          "type": "integer",
          "minimum": 1,
          "description": "Quantidade de inversores"
        }
      }
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "IdcClasse": "B1",
  "IdcSubgrupo": "Residencial",
  "IdcModalidade": "convencional",
  "MdaPotenciaInstalada": 6.0,
  "CSV": "INCLUIRUSINA;123456789;...",
  "DadosUC": {
    "numero_uc": "123456789",
    "titular": "João Silva",
    "cpf_cnpj": "123.456.789-00",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "100",
      "complemento": "Apto 12",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "uf": "SP",
      "cep": "01310-100"
    }
  },
  "DadosUsina": {
    "tecnologia": "fotovoltaica",
    "quantidade_modulos": 10,
    "quantidade_inversores": 1
  }
}
```

---

## 💰 4. ROI Result Schema (`roi_result.json`)

**Descrição:** Resultado da análise de retorno sobre investimento

```json
{
  "type": "object",
  "required": ["payback_anos", "tir", "parcela_mensal"],
  "properties": {
    "payback_anos": {
      "type": "number",
      "minimum": 0,
      "description": "Tempo de retorno do investimento em anos"
    },
    "tir": {
      "type": "number",
      "description": "Taxa Interna de Retorno (decimal)"
    },
    "vpl": {
      "type": "number",
      "description": "Valor Presente Líquido em BRL"
    },
    "parcela_mensal": {
      "type": "number",
      "minimum": 0,
      "description": "Parcela mensal do financiamento em BRL"
    },
    "economia_mensal": {
      "type": "number",
      "minimum": 0,
      "description": "Economia média mensal na conta de energia em BRL"
    },
    "economia_anual": {
      "type": "number",
      "minimum": 0,
      "description": "Economia anual estimada em BRL"
    },
    "cenarios": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "oversizing": {
            "type": "number",
            "enum": [1.14, 1.30, 1.45, 1.60],
            "description": "Taxa de oversizing"
          },
          "kwp": {
            "type": "number",
            "description": "Potência instalada em kWp"
          },
          "capex": {
            "type": "number",
            "description": "Investimento total em BRL"
          },
          "payback_anos": {
            "type": "number",
            "description": "Payback para este cenário"
          },
          "tir": {
            "type": "number",
            "description": "TIR para este cenário"
          }
        }
      },
      "description": "Cenários de oversizing (114%, 130%, 145%, 160%)"
    },
    "financiamento": {
      "type": "object",
      "properties": {
        "tipo": {
          "type": "string",
          "enum": ["cdc", "leasing", "eaas"],
          "description": "Tipo de financiamento"
        },
        "prazo_meses": {
          "type": "integer",
          "minimum": 12,
          "maximum": 120,
          "description": "Prazo do financiamento em meses"
        },
        "taxa_anual": {
          "type": "number",
          "minimum": 0,
          "description": "Taxa de juros anual (%)"
        },
        "entrada": {
          "type": "number",
          "minimum": 0,
          "description": "Valor da entrada em BRL"
        }
      }
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "payback_anos": 4.8,
  "tir": 0.215,
  "vpl": 87500.00,
  "parcela_mensal": 520.00,
  "economia_mensal": 650.00,
  "economia_anual": 7800.00,
  "cenarios": [
    {
      "oversizing": 1.14,
      "kwp": 5.5,
      "capex": 22000.00,
      "payback_anos": 5.2,
      "tir": 0.198
    },
    {
      "oversizing": 1.30,
      "kwp": 6.0,
      "capex": 23800.00,
      "payback_anos": 4.8,
      "tir": 0.215
    },
    {
      "oversizing": 1.45,
      "kwp": 6.8,
      "capex": 26500.00,
      "payback_anos": 4.5,
      "tir": 0.228
    },
    {
      "oversizing": 1.60,
      "kwp": 7.5,
      "capex": 29200.00,
      "payback_anos": 4.3,
      "tir": 0.235
    }
  ],
  "financiamento": {
    "tipo": "cdc",
    "prazo_meses": 60,
    "taxa_anual": 17.5,
    "entrada": 5000.00
  }
}
```

---

## 📡 5. Orquestração - Task Message Schema

**Descrição:** Contrato de mensagem entre agentes

```json
{
  "task_id": {
    "type": "string",
    "format": "uuid",
    "description": "Identificador único da tarefa"
  },
  "actor_id": {
    "type": "string",
    "enum": [
      "helio.core",
      "lead.origination",
      "viability.pv",
      "tariffs.aneel",
      "catalog.curator",
      "finance.credit",
      "logistics.fulfillment",
      "legal.compliance",
      "insurance.risk",
      "om.monitor",
      "solar.panel_detection",
      "solar.thermal_analysis",
      "solar.photogrammetry"
    ],
    "description": "ID do agente executor"
  },
  "intent": {
    "type": "string",
    "description": "Intenção da tarefa (ex: proposta_residencial, dimensionamento_comercial)"
  },
  "locale": {
    "type": "string",
    "pattern": "^[a-z]{2}-[A-Z]{2}$",
    "default": "pt-BR",
    "description": "Localização (pt-BR, en-US, es-ES)"
  },
  "currency": {
    "type": "string",
    "pattern": "^[A-Z]{3}$",
    "default": "BRL",
    "description": "Moeda (BRL, USD, EUR)"
  },
  "inputs": {
    "type": "object",
    "description": "Dados de entrada específicos da tarefa"
  },
  "targets": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "Lista de agentes a serem invocados"
  },
  "constraints": {
    "type": "object",
    "properties": {
      "oversizing_max": {
        "type": "number",
        "minimum": 1.14,
        "maximum": 1.60,
        "description": "Limite máximo de oversizing"
      },
      "budget_max": {
        "type": "number",
        "description": "Orçamento máximo em BRL"
      },
      "deadline": {
        "type": "string",
        "format": "date-time",
        "description": "Prazo limite para conclusão"
      }
    }
  },
  "artifacts": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["pdf", "csv", "json", "image"]
        },
        "url": {
          "type": "string",
          "format": "uri"
        },
        "name": {
          "type": "string"
        }
      }
    },
    "description": "Artefatos gerados ou anexados"
  },
  "telemetry": {
    "type": "object",
    "properties": {
      "ts": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp ISO-8601"
      },
      "duration_ms": {
        "type": "integer",
        "description": "Duração da execução em milissegundos"
      },
      "retries": {
        "type": "integer",
        "minimum": 0,
        "description": "Número de tentativas"
      }
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "task_id": "550e8400-e29b-41d4-a716-446655440000",
  "actor_id": "helio.core",
  "intent": "proposta_residencial",
  "locale": "pt-BR",
  "currency": "BRL",
  "inputs": {
    "cep": "01001-000",
    "consumo_kwh_m": 450,
    "classe": "B1",
    "distribuidora": "ENEL SP"
  },
  "targets": [
    "viability.pv",
    "tariffs.aneel",
    "catalog.curator",
    "finance.credit"
  ],
  "constraints": {
    "oversizing_max": 1.60,
    "budget_max": 35000.00,
    "deadline": "2025-10-15T17:00:00-03:00"
  },
  "artifacts": [],
  "telemetry": {
    "ts": "2025-10-07T14:30:00-03:00",
    "duration_ms": 2450,
    "retries": 0
  }
}
```

---

## 🔍 6. Solar Panel Detection Schema (`panel_detection.json`)

**Descrição:** Resultado da detecção de painéis solares via IA

```json
{
  "type": "object",
  "required": ["panels", "total_area_m2", "processing_time_s"],
  "properties": {
    "panels": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Identificador único do painel detectado"
          },
          "bbox": {
            "type": "array",
            "items": {
              "type": "number"
            },
            "minItems": 4,
            "maxItems": 4,
            "description": "Bounding box [x1, y1, x2, y2] em pixels"
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Confiança da detecção (0-1)"
          },
          "area_m2": {
            "type": "number",
            "minimum": 0,
            "description": "Área estimada em m²"
          }
        }
      }
    },
    "total_area_m2": {
      "type": "number",
      "minimum": 0,
      "description": "Área total de painéis detectados em m²"
    },
    "processing_time_s": {
      "type": "number",
      "minimum": 0,
      "description": "Tempo de processamento em segundos"
    },
    "image_resolution_m": {
      "type": "number",
      "minimum": 0,
      "description": "Resolução da imagem em metros por pixel"
    },
    "coordinates": {
      "type": "object",
      "properties": {
        "latitude": {
          "type": "number",
          "minimum": -90,
          "maximum": 90
        },
        "longitude": {
          "type": "number",
          "minimum": -180,
          "maximum": 180
        }
      }
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "panels": [
    {
      "id": "panel_001",
      "bbox": [100, 200, 150, 250],
      "confidence": 0.92,
      "area_m2": 18.5
    },
    {
      "id": "panel_002",
      "bbox": [160, 200, 210, 250],
      "confidence": 0.89,
      "area_m2": 18.5
    }
  ],
  "total_area_m2": 156.8,
  "processing_time_s": 1.2,
  "image_resolution_m": 0.5,
  "coordinates": {
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}
```

---

## 🌡️ 7. Thermal Analysis Schema (`thermal_analysis.json`)

**Descrição:** Resultado da análise térmica de sistemas FV

```json
{
  "type": "object",
  "required": ["anomalies", "processing_time_s"],
  "properties": {
    "anomalies": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Identificador da anomalia"
          },
          "type": {
            "type": "string",
            "enum": ["hotspot", "coldspot", "bypass_diode", "junction_box", "shading"],
            "description": "Tipo de anomalia detectada"
          },
          "severity": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"],
            "description": "Severidade da anomalia"
          },
          "temperature_c": {
            "type": "number",
            "description": "Temperatura em °C"
          },
          "delta_t": {
            "type": "number",
            "description": "Diferença de temperatura vs. módulo normal"
          },
          "location": {
            "type": "object",
            "properties": {
              "module_id": {
                "type": "string"
              },
              "string_id": {
                "type": "string"
              },
              "bbox": {
                "type": "array",
                "items": { "type": "number" },
                "minItems": 4,
                "maxItems": 4
              }
            }
          },
          "recommendation": {
            "type": "string",
            "description": "Recomendação de ação"
          }
        }
      }
    },
    "processing_time_s": {
      "type": "number",
      "minimum": 0,
      "description": "Tempo de análise em segundos"
    },
    "ambient_temp_c": {
      "type": "number",
      "description": "Temperatura ambiente em °C"
    },
    "inspection_date": {
      "type": "string",
      "format": "date-time",
      "description": "Data/hora da inspeção"
    },
    "summary": {
      "type": "object",
      "properties": {
        "total_anomalies": {
          "type": "integer"
        },
        "critical_count": {
          "type": "integer"
        },
        "high_count": {
          "type": "integer"
        },
        "medium_count": {
          "type": "integer"
        },
        "low_count": {
          "type": "integer"
        }
      }
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "anomalies": [
    {
      "id": "anom_001",
      "type": "hotspot",
      "severity": "high",
      "temperature_c": 85.5,
      "delta_t": 25.3,
      "location": {
        "module_id": "MOD-A12",
        "string_id": "STRING-1",
        "bbox": [250, 100, 300, 150]
      },
      "recommendation": "Substituir módulo com urgência - risco de incêndio"
    },
    {
      "id": "anom_002",
      "type": "bypass_diode",
      "severity": "medium",
      "temperature_c": 72.0,
      "delta_t": 12.0,
      "location": {
        "module_id": "MOD-B05",
        "string_id": "STRING-2",
        "bbox": [450, 200, 500, 250]
      },
      "recommendation": "Agendar manutenção preventiva - diodo de bypass em falha"
    }
  ],
  "processing_time_s": 2.8,
  "ambient_temp_c": 28.5,
  "inspection_date": "2025-10-07T10:30:00-03:00",
  "summary": {
    "total_anomalies": 2,
    "critical_count": 0,
    "high_count": 1,
    "medium_count": 1,
    "low_count": 0
  }
}
```

---

## 📐 8. Photogrammetry Result Schema (`photogrammetry.json`)

**Descrição:** Resultado da modelagem 3D de telhados

```json
{
  "type": "object",
  "required": ["model_url", "roof_specs", "processing_time_s"],
  "properties": {
    "model_url": {
      "type": "string",
      "format": "uri",
      "description": "URL do modelo 3D (OBJ, PLY, etc.)"
    },
    "roof_specs": {
      "type": "object",
      "properties": {
        "total_area_m2": {
          "type": "number",
          "minimum": 0,
          "description": "Área total disponível em m²"
        },
        "usable_area_m2": {
          "type": "number",
          "minimum": 0,
          "description": "Área útil para instalação em m²"
        },
        "orientation": {
          "type": "number",
          "minimum": 0,
          "maximum": 360,
          "description": "Azimute em graus (0=Norte, 90=Leste, 180=Sul, 270=Oeste)"
        },
        "tilt": {
          "type": "number",
          "minimum": 0,
          "maximum": 90,
          "description": "Inclinação em graus"
        },
        "obstructions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": {
                "type": "string",
                "enum": ["chimney", "vent", "antenna", "tree", "building"]
              },
              "area_m2": {
                "type": "number"
              },
              "coordinates": {
                "type": "array",
                "items": { "type": "number" }
              }
            }
          }
        }
      }
    },
    "processing_time_s": {
      "type": "number",
      "minimum": 0,
      "description": "Tempo de processamento em segundos"
    },
    "accuracy_cm": {
      "type": "number",
      "minimum": 0,
      "description": "Precisão do modelo em centímetros (±)"
    },
    "images_processed": {
      "type": "integer",
      "minimum": 1,
      "description": "Número de imagens processadas"
    },
    "ground_control_points": {
      "type": "integer",
      "minimum": 0,
      "description": "Número de pontos de controle utilizados"
    }
  }
}
```

**Exemplo de uso:**

```json
{
  "model_url": "https://storage.ysh.com.br/models/roof_abc123.obj",
  "roof_specs": {
    "total_area_m2": 120.5,
    "usable_area_m2": 95.2,
    "orientation": 180,
    "tilt": 15,
    "obstructions": [
      {
        "type": "chimney",
        "area_m2": 2.5,
        "coordinates": [45.2, 30.1, 2.8]
      },
      {
        "type": "vent",
        "area_m2": 0.8,
        "coordinates": [60.5, 50.3, 2.5]
      }
    ]
  },
  "processing_time_s": 245.6,
  "accuracy_cm": 3.2,
  "images_processed": 87,
  "ground_control_points": 6
}
```

---

## 🎯 Uso Prático dos Schemas

### Para Validação

```typescript
import Ajv from 'ajv'

const ajv = new Ajv()
const validateLead = ajv.compile(leadSchema)

const isValid = validateLead(leadData)
if (!isValid) {
  console.error('Validation errors:', validateLead.errors)
}
```

### Para TypeScript Types

```typescript
import { JSONSchemaType } from 'ajv'

type Lead = {
  id: string
  nome: string
  contato: {
    email: string
    telefone: string
  }
  cep: string
  consumo_kwh_m: number
  classe: 'B1' | 'B2' | 'B3' | 'A4' | 'A3' | 'A3a' | 'A2' | 'A1'
  distribuidora: string
}

const leadSchema: JSONSchemaType<Lead> = { /* ... */ }
```

### Para API Validation

```typescript
// Express middleware
app.post('/api/leads', validateSchema(leadSchema), (req, res) => {
  // req.body já validado pelo schema
  const lead = req.body as Lead
  // processar lead...
})
```

---

## 📚 Referências

- **JSON Schema Spec:** <https://json-schema.org/>
- **AJV Validator:** <https://ajv.js.org/>
- **ANEEL Classes:** <https://www.aneel.gov.br/>
- **MMGD Normativas:** Lei 14.300/2022
- **NREL APIs:** <https://developer.nrel.gov/>

---

**Documentação completa dos schemas utilizados no sistema YSH** 📋✅
