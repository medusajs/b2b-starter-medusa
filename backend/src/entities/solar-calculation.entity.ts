import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';

/**
 * SolarCalculation Entity
 * 
 * Armazena resultados de cálculos solares com:
 * - Dimensionamento técnico
 * - Análise financeira
 * - Kits recomendados
 * - Impacto ambiental
 * 
 * Relacionamentos:
 * - RemoteLink → customer (Medusa Customer)
 * - RemoteLink → quote (Quote Module)
 * - OneToMany → solar_calculation_kits
 */
@Entity({ tableName: 'solar_calculation' })
export class SolarCalculation {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    // Customer Reference (RemoteLink)
    @Property({ type: 'uuid' })
    customer_id!: string;

    // Quote Reference (Optional, RemoteLink)
    @Property({ type: 'uuid', nullable: true })
    quote_id?: string;

    // Input Data
    @Property({ type: 'decimal', precision: 10, scale: 2 })
    consumo_kwh_mes!: number;

    @Property({ type: 'string', length: 2 })
    uf!: string;

    @Property({ type: 'string', length: 10, nullable: true })
    cep?: string;

    @Property({ type: 'string', length: 50 })
    tipo_telhado!: string; // ceramico, metalico, laje, solo

    @Property({ type: 'decimal', precision: 5, scale: 2, default: 1.2 })
    oversizing_target!: number;

    // Geographic Data
    @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    latitude?: number;

    @Property({ type: 'decimal', precision: 10, scale: 6, nullable: true })
    longitude?: number;

    @Property({ type: 'decimal', precision: 6, scale: 2, nullable: true })
    irradiacao_media_kwh_m2_dia?: number;

    @Property({ type: 'string', length: 100, nullable: true })
    concessionaria?: string;

    // Tariff Data
    @Property({ type: 'decimal', precision: 10, scale: 4, nullable: true })
    tarifa_energia_kwh?: number;

    @Property({ type: 'string', length: 50, nullable: true })
    modalidade_tarifaria?: string; // convencional, branca

    // Dimensioning Results
    @Property({ type: 'decimal', precision: 10, scale: 2 })
    potencia_instalada_kwp!: number;

    @Property({ type: 'integer' })
    numero_modulos!: number;

    @Property({ type: 'integer' })
    numero_inversores!: number;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    area_necessaria_m2!: number;

    @Property({ type: 'decimal', precision: 10, scale: 2 })
    geracao_anual_kwh!: number;

    // Financial Analysis
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    investimento_total!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    economia_mensal!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    economia_anual!: number;

    @Property({ type: 'decimal', precision: 5, scale: 2 })
    payback_anos!: number;

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    economia_25_anos!: number;

    @Property({ type: 'decimal', precision: 8, scale: 4 })
    tir_percent!: number; // Taxa Interna de Retorno

    @Property({ type: 'decimal', precision: 12, scale: 2 })
    vpl!: number; // Valor Presente Líquido

    // Environmental Impact
    @Property({ type: 'decimal', precision: 10, scale: 2 })
    co2_evitado_kg_ano!: number;

    @Property({ type: 'integer' })
    arvores_equivalentes!: number;

    // Metadata
    @Property({ type: 'jsonb', nullable: true })
    calculation_metadata?: {
        version: string;
        service: string;
        duration_ms: number;
        data_sources: string[];
    };

    // Status
    @Property({ type: 'string', length: 50, default: 'completed' })
    status!: string; // completed, pending, error

    @Property({ type: 'text', nullable: true })
    error_message?: string;

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;

    @Property({ type: 'datetime', onUpdate: () => new Date() })
    updated_at!: Date;

    // Kits Recomendados (OneToMany)
    @OneToMany(() => SolarCalculationKit, kit => kit.calculation)
    kits_recomendados = new Collection<SolarCalculationKit>(this);
}

/**
 * SolarCalculationKit Entity
 * 
 * Kits recomendados para um cálculo solar
 */
@Entity({ tableName: 'solar_calculation_kit' })
export class SolarCalculationKit {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    @ManyToOne(() => SolarCalculation, { deleteRule: 'cascade' })
    calculation!: SolarCalculation; @Property({ type: 'uuid' })
    calculation_id!: string;

    // Kit Reference (RemoteLink to Product)
    @Property({ type: 'uuid' })
    product_id!: string;

    @Property({ type: 'string', length: 100 })
    kit_sku!: string;

    @Property({ type: 'string', length: 255 })
    kit_name!: string;

    // Match Score
    @Property({ type: 'decimal', precision: 5, scale: 2 })
    match_score!: number; // 0-100

    @Property({ type: 'integer', default: 0 })
    rank!: number; // Posição no ranking (1, 2, 3...)

    // Pricing
    @Property({ type: 'decimal', precision: 12, scale: 2 })
    price!: number;

    @Property({ type: 'string', length: 3, default: 'BRL' })
    currency_code!: string;

    // Kit Details
    @Property({ type: 'jsonb', nullable: true })
    kit_details?: {
        modulos: {
            modelo: string;
            quantidade: number;
            potencia_wp: number;
        };
        inversores: {
            modelo: string;
            quantidade: number;
            potencia_w: number;
        };
        acessorios: string[];
    };

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;
}
