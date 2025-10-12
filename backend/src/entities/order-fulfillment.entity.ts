import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core';
import { v4 } from 'uuid';

/**
 * OrderFulfillment Entity
 * 
 * Gerenciamento completo do ciclo de vida de fulfillment:
 * - Picking de itens
 * - Packing
 * - Shipping
 * - Tracking
 * - Delivery confirmation
 * 
 * Relacionamentos:
 * - RemoteLink → order (Medusa Order)
 * - OneToMany → order_shipments
 */
@Entity({ tableName: 'order_fulfillment' })
export class OrderFulfillment {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    // Order Reference (RemoteLink)
    @Property({ type: 'uuid' })
    order_id!: string;

    // Status
    @Property({ type: 'string', length: 50, default: 'pending' })
    status!: string; // pending, picking, packing, ready_to_ship, shipped, in_transit, delivered, cancelled

    // Picking
    @Property({ type: 'datetime', nullable: true })
    picking_started_at?: Date;

    @Property({ type: 'datetime', nullable: true })
    picking_completed_at?: Date;

    @Property({ type: 'string', length: 100, nullable: true })
    picked_by?: string;

    @Property({ type: 'jsonb', nullable: true })
    picked_items?: {
        item_id: string;
        sku: string;
        quantity: number;
        location: string;
        picked_at: string;
    }[];

    // Packing
    @Property({ type: 'datetime', nullable: true })
    packing_started_at?: Date;

    @Property({ type: 'datetime', nullable: true })
    packing_completed_at?: Date;

    @Property({ type: 'string', length: 100, nullable: true })
    packed_by?: string;

    @Property({ type: 'integer', default: 1 })
    number_of_packages!: number;

    @Property({ type: 'jsonb', nullable: true })
    package_dimensions?: {
        package_number: number;
        length_cm: number;
        width_cm: number;
        height_cm: number;
        weight_kg: number;
        items: string[];
    }[];

    // Warehouse
    @Property({ type: 'string', length: 100, nullable: true })
    warehouse_id?: string;

    @Property({ type: 'string', length: 255, nullable: true })
    warehouse_name?: string;

    @Property({ type: 'jsonb', nullable: true })
    warehouse_notes?: {
        note: string;
        created_by: string;
        created_at: string;
    }[];

    // Metadata
    @Property({ type: 'jsonb', nullable: true })
    fulfillment_metadata?: {
        version: string;
        wms_integration: boolean;
        automated: boolean;
    };

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;

    @Property({ type: 'datetime', onUpdate: () => new Date() })
    updated_at!: Date;

    // Shipments (OneToMany)
    @OneToMany(() => OrderShipment, shipment => shipment.fulfillment)
    shipments = new Collection<OrderShipment>(this);
}

/**
 * OrderShipment Entity
 * 
 * Dados de envio e tracking
 */
@Entity({ tableName: 'order_shipment' })
export class OrderShipment {
    @PrimaryKey({ type: 'uuid' })
    id: string = v4();

    @ManyToOne(() => OrderFulfillment)
    fulfillment!: OrderFulfillment;

    @Property({ type: 'uuid' })
    fulfillment_id!: string;    // Carrier
    @Property({ type: 'string', length: 100 })
    carrier!: string; // Correios, Jadlog, etc.

    @Property({ type: 'string', length: 50, nullable: true })
    carrier_code?: string;

    @Property({ type: 'string', length: 100, nullable: true })
    service_type?: string; // PAC, SEDEX, etc.

    // Tracking
    @Property({ type: 'string', length: 100, unique: true })
    tracking_code!: string;

    @Property({ type: 'text', nullable: true })
    tracking_url?: string;

    @Property({ type: 'string', length: 50, default: 'pending' })
    shipment_status!: string; // pending, in_transit, out_for_delivery, delivered, failed

    // Dates
    @Property({ type: 'datetime', nullable: true })
    shipped_at?: Date;

    @Property({ type: 'datetime', nullable: true })
    estimated_delivery_date?: Date;

    @Property({ type: 'datetime', nullable: true })
    actual_delivery_date?: Date;

    // Address
    @Property({ type: 'jsonb' })
    shipping_address!: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };

    // Tracking Events
    @Property({ type: 'jsonb', nullable: true })
    tracking_events?: {
        event: string;
        status: string;
        location: string;
        date: string;
        description: string;
    }[];

    // Delivery
    @Property({ type: 'string', length: 255, nullable: true })
    delivered_to?: string; // Nome do recebedor

    @Property({ type: 'text', nullable: true })
    delivery_notes?: string;

    @Property({ type: 'boolean', default: false })
    signature_required!: boolean;

    @Property({ type: 'text', nullable: true })
    signature_url?: string; // URL da assinatura (S3)

    // Cost
    @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    shipping_cost?: number;

    @Property({ type: 'string', length: 3, default: 'BRL' })
    currency_code!: string;

    // Timestamps
    @Property({ type: 'datetime', onCreate: () => new Date() })
    created_at!: Date;

    @Property({ type: 'datetime', onUpdate: () => new Date() })
    updated_at!: Date;
}
