/**
 * YSH Agent System - Data Schemas
 * Schemas JSON para validação e tipagem dos dados dos agentes
 */

import { z } from 'zod';

// Schema para lead/cotação
export const LeadSchema = z.object({
    id: z.string(),
    nome: z.string(),
    contato: z.object({
        email: z.string().email(),
        telefone: z.string().optional()
    }),
    cpf_cnpj_hash: z.string().describe('hash SHA-256 para privacidade'),
    cep: z.string().regex(/^\d{5}-\d{3}$/),
    consumo_kwh_m: z.number().positive(),
    classe: z.enum(['B1', 'B2', 'B3', 'A4', 'A3', 'A3a', 'A2', 'A1']).default('B1'),
    distribuidora: z.string().optional(),
    telhado: z.enum(['laje', 'ceramica', 'metalico', 'solo']).default('laje'),
    fase: z.enum(['monofasica', 'bifasica', 'trifasica']).default('monofasica'),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional()
});

export type Lead = z.infer<typeof LeadSchema>;

// Schema para design FV
export const PVDesignSchema = z.object({
    proposal_kwp: z.number().positive(),
    expected_gen_mwh_y: z.number().positive(),
    pr: z.number().min(0).max(1),
    losses: z.object({
        soiling: z.number().min(0).max(1),
        temp: z.number().min(0).max(1),
        ohmic: z.number().min(0).max(1),
        mismatch: z.number().min(0).max(1).optional(),
        degradation: z.number().min(0).max(1).optional()
    }),
    inverters: z.array(z.object({
        model: z.string(),
        phase: z.enum(['mono', 'tri']),
        mppt: z.number().int().positive(),
        power_kw: z.number().positive()
    })),
    strings: z.array(z.object({
        modules: z.number().int().positive(),
        model: z.string(),
        power_wp: z.number().positive()
    })),
    oversizing_ratio: z.number().min(1.14).max(1.60),
    area_required_m2: z.number().positive(),
    orientation_deg: z.number().min(0).max(360),
    tilt_deg: z.number().min(0).max(90),
    attachments: z.array(z.string()).optional() // URLs ou paths para PDFs/imagens
});

export type PVDesign = z.infer<typeof PVDesignSchema>;

// Schema para pacote MMGD
export const MMGDPacketSchema = z.object({
    IdcClasse: z.string(),
    IdcSubgrupo: z.string(),
    IdcModalidade: z.string(),
    CSV: z.string(), // Conteúdo do CSV para ANEEL
    MdaPotenciaInstalada: z.number().positive(),
    MdaPotenciaModulos: z.number().positive(),
    MdaPotenciaInversor: z.number().positive(),
    CodigoDistribuidora: z.string(),
    NumeroUC: z.string(),
    DataConexao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    TipoOperacao: z.enum(['INCLUIRUSINA', 'ALTERAR', 'INATIVAR']),
    checklist_prodist: z.object({
        item_3a: z.boolean(),
        item_3b: z.boolean(),
        item_3c: z.boolean()
    })
});

export type MMGDPacket = z.infer<typeof MMGDPacketSchema>;

// Schema para resultado de ROI
export const ROIResultSchema = z.object({
    payback_anos: z.number().positive(),
    tir: z.number().min(-1).max(1), // Taxa Interna de Retorno
    vpl: z.number(), // Valor Presente Líquido
    parcela_mensal: z.number().positive(),
    economia_mensal: z.number().positive(),
    cenarios: z.array(z.object({
        oversizing_ratio: z.number(),
        payback_anos: z.number(),
        tir: z.number(),
        parcela_mensal: z.number(),
        recomendado: z.boolean()
    })),
    sensibilidade: z.object({
        juros_mais_1pct: z.object({
            payback_anos: z.number(),
            parcela_mensal: z.number()
        }),
        geracao_menos_5pct: z.object({
            payback_anos: z.number(),
            parcela_mensal: z.number()
        })
    }).optional(),
    attachments: z.array(z.string()).optional() // PDFs financeiros
});

export type ROIResult = z.infer<typeof ROIResultSchema>;

// Schema para detecção de painéis
export const PanelDetectionSchema = z.object({
    panels: z.array(z.object({
        id: z.string(),
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]), // [x1, y1, x2, y2]
        confidence: z.number().min(0).max(1),
        area_m2: z.number().positive(),
        orientation: z.number().min(0).max(360).optional()
    })),
    total_area_m2: z.number().positive(),
    processing_time_s: z.number().positive(),
    image_resolution_m: z.number().positive(),
    geojson: z.object({
        type: z.literal('FeatureCollection'),
        features: z.array(z.object({
            type: z.literal('Feature'),
            geometry: z.object({
                type: z.literal('Polygon'),
                coordinates: z.array(z.array(z.tuple([z.number(), z.number()])))
            }),
            properties: z.record(z.any())
        }))
    }).optional()
});

export type PanelDetection = z.infer<typeof PanelDetectionSchema>;

// Schema para análise térmica
export const ThermalAnalysisSchema = z.object({
    anomalies: z.array(z.object({
        id: z.string(),
        type: z.enum(['hotspot', 'coldspot', 'string_failure', 'module_failure']),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        temperature_delta_c: z.number(),
        bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
        confidence: z.number().min(0).max(1),
        recommendations: z.array(z.string())
    })),
    summary: z.object({
        total_anomalies: z.number(),
        critical_count: z.number(),
        average_temp_c: z.number(),
        max_temp_c: z.number(),
        min_temp_c: z.number()
    }),
    processing_time_s: z.number().positive(),
    recommendations: z.array(z.string())
});

export type ThermalAnalysis = z.infer<typeof ThermalAnalysisSchema>;

// Schema para fotogrametria 3D
export const PhotogrammetrySchema = z.object({
    roof_model: z.object({
        area_m2: z.number().positive(),
        orientation_deg: z.number().min(0).max(360),
        tilt_deg: z.number().min(0).max(90),
        perimeter_m: z.number().positive(),
        bounding_box: z.tuple([z.number(), z.number(), z.number(), z.number()])
    }),
    attachment_points: z.array(z.object({
        id: z.string(),
        position: z.tuple([z.number(), z.number(), z.number()]), // [x, y, z]
        type: z.enum(['rafter', 'joist', 'beam', 'wall']),
        load_capacity_kg: z.number().positive()
    })),
    orthophoto_url: z.string().url(),
    model_3d_url: z.string().url().optional(),
    processing_time_s: z.number().positive(),
    accuracy_cm: z.number().positive(),
    geojson: z.object({
        type: z.literal('Feature'),
        geometry: z.object({
            type: z.literal('Polygon'),
            coordinates: z.array(z.array(z.tuple([z.number(), z.number(), z.number()])))
        }),
        properties: z.record(z.any())
    })
});

export type Photogrammetry = z.infer<typeof PhotogrammetrySchema>;

// Schema para catálogo de produtos
export const CatalogItemSchema = z.object({
    sku: z.string(),
    marca: z.string(),
    serie: z.string(),
    modelo: z.string(),
    tipo: z.enum(['painel', 'inversor', 'bateria', 'estrutura', 'cabo', 'conector']),
    potencia_wp: z.number().positive().optional(), // Para painéis
    potencia_kw: z.number().positive().optional(), // Para inversores
    capacidade_wh: z.number().positive().optional(), // Para baterias
    tensao_v: z.number().positive().optional(),
    corrente_a: z.number().positive().optional(),
    eficiencia_pct: z.number().min(0).max(100).optional(),
    tecnologia: z.enum(['Mono PERC', 'TOPCon', 'HJT', 'Policristalino', 'Microinversor', 'String']).optional(),
    certificacoes: z.array(z.string()), // ['INMETRO', 'IEC 61215', 'IEC 61730', etc.]
    garantia_anos: z.object({
        produto: z.number().positive(),
        performance: z.number().positive()
    }),
    preco_brl: z.number().positive(),
    disponibilidade: z.enum(['disponivel', 'indisponivel', 'sob_encomenda']),
    datasheet_url: z.string().url().optional(),
    imagem_url: z.string().url().optional(),
    updated_at: z.string().datetime()
});

export type CatalogItem = z.infer<typeof CatalogItemSchema>;

// Funções utilitárias para validação
export function validateLead(data: unknown): Lead {
    return LeadSchema.parse(data);
}

export function validatePVDesign(data: unknown): PVDesign {
    return PVDesignSchema.parse(data);
}

export function validateMMGDPacket(data: unknown): MMGDPacket {
    return MMGDPacketSchema.parse(data);
}

export function validateROIResult(data: unknown): ROIResult {
    return ROIResultSchema.parse(data);
}

export function validatePanelDetection(data: unknown): PanelDetection {
    return PanelDetectionSchema.parse(data);
}

export function validateThermalAnalysis(data: unknown): ThermalAnalysis {
    return ThermalAnalysisSchema.parse(data);
}

export function validatePhotogrammetry(data: unknown): Photogrammetry {
    return PhotogrammetrySchema.parse(data);
}

export function validateCatalogItem(data: unknown): CatalogItem {
    return CatalogItemSchema.parse(data);
}