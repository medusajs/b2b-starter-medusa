import {
    BaseFilterable,
    Context,
    FindConfig,
    IModuleService,
    RestoreReturn,
} from "@medusajs/types";
import {
    ModuleManufacturer,
    ModuleCreateManufacturer,
    ModuleUpdateManufacturer,
    ModuleSKU,
    ModuleCreateSKU,
    ModuleUpdateSKU,
    ModuleDistributorOffer,
    ModuleCreateDistributorOffer,
    ModuleUpdateDistributorOffer,
    ModuleKit,
    ModuleCreateKit,
    ModuleUpdateKit,
} from "./module";

export interface ModuleManufacturerFilters
    extends BaseFilterable<ModuleManufacturerFilters> {
    q?: string;
    id?: string | string[];
    tier?: string;
    country?: string;
    is_active?: boolean;
}

export interface ModuleSKUFilters
    extends BaseFilterable<ModuleSKUFilters> {
    q?: string;
    id?: string | string[];
    category?: string;
    manufacturer_id?: string;
    sku_code?: string | string[];
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
}

export interface ModuleDistributorOfferFilters
    extends BaseFilterable<ModuleDistributorOfferFilters> {
    q?: string;
    id?: string | string[];
    sku_id?: string;
    distributor_slug?: string;
    stock_status?: string;
}

export interface ModuleKitFilters
    extends BaseFilterable<ModuleKitFilters> {
    q?: string;
    id?: string | string[];
    category?: string;
    target_consumer_class?: string;
    min_capacity?: number;
    max_capacity?: number;
}

/**
 * The main service interface for the Unified Catalog Module.
 */
export interface IUnifiedCatalogModuleService extends IModuleService {
    /* Entity: Manufacturers */
    createManufacturers(
        data: ModuleCreateManufacturer,
        sharedContext?: Context
    ): Promise<ModuleManufacturer>;

    createManufacturers(
        data: ModuleCreateManufacturer[],
        sharedContext?: Context
    ): Promise<ModuleManufacturer[]>;

    retrieveManufacturer(
        id: string,
        config?: FindConfig<ModuleManufacturer>,
        sharedContext?: Context
    ): Promise<ModuleManufacturer>;

    updateManufacturers(
        data: ModuleUpdateManufacturer,
        sharedContext?: Context
    ): Promise<ModuleManufacturer>;

    updateManufacturers(
        data: ModuleUpdateManufacturer[],
        sharedContext?: Context
    ): Promise<ModuleManufacturer[]>;

    listManufacturers(
        filters?: ModuleManufacturerFilters,
        config?: FindConfig<ModuleManufacturer>,
        sharedContext?: Context
    ): Promise<ModuleManufacturer[]>;

    listAndCountManufacturers(
        filters?: ModuleManufacturerFilters,
        config?: FindConfig<ModuleManufacturer>,
        sharedContext?: Context
    ): Promise<[ModuleManufacturer[], number]>;

    deleteManufacturers(ids: string[], sharedContext?: Context): Promise<void>;

    softDeleteManufacturers(ids: string[], sharedContext?: Context): Promise<void>;

    restoreManufacturers<TReturnableLinkableKeys extends string = string>(
        ids: string[],
        config?: RestoreReturn<TReturnableLinkableKeys>,
        sharedContext?: Context
    ): Promise<Record<TReturnableLinkableKeys, string[]> | void>;

    /* Entity: SKUs */
    createSKUs(
        data: ModuleCreateSKU,
        sharedContext?: Context
    ): Promise<ModuleSKU>;

    createSKUs(
        data: ModuleCreateSKU[],
        sharedContext?: Context
    ): Promise<ModuleSKU[]>;

    retrieveSKU(
        id: string,
        config?: FindConfig<ModuleSKU>,
        sharedContext?: Context
    ): Promise<ModuleSKU>;

    updateSKUs(
        data: ModuleUpdateSKU,
        sharedContext?: Context
    ): Promise<ModuleSKU>;

    updateSKUs(
        data: ModuleUpdateSKU[],
        sharedContext?: Context
    ): Promise<ModuleSKU[]>;

    listSKUs(
        filters?: ModuleSKUFilters,
        config?: FindConfig<ModuleSKU>,
        sharedContext?: Context
    ): Promise<ModuleSKU[]>;

    listAndCountSKUs(
        filters?: ModuleSKUFilters,
        config?: FindConfig<ModuleSKU>,
        sharedContext?: Context
    ): Promise<[ModuleSKU[], number]>;

    deleteSKUs(ids: string[], sharedContext?: Context): Promise<void>;

    softDeleteSKUs(ids: string[], sharedContext?: Context): Promise<void>;

    restoreSKUs<TReturnableLinkableKeys extends string = string>(
        ids: string[],
        config?: RestoreReturn<TReturnableLinkableKeys>,
        sharedContext?: Context
    ): Promise<Record<TReturnableLinkableKeys, string[]> | void>;

    /* Entity: Distributor Offers */
    createDistributorOffers(
        data: ModuleCreateDistributorOffer,
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer>;

    createDistributorOffers(
        data: ModuleCreateDistributorOffer[],
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer[]>;

    retrieveDistributorOffer(
        id: string,
        config?: FindConfig<ModuleDistributorOffer>,
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer>;

    updateDistributorOffers(
        data: ModuleUpdateDistributorOffer,
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer>;

    updateDistributorOffers(
        data: ModuleUpdateDistributorOffer[],
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer[]>;

    listDistributorOffers(
        filters?: ModuleDistributorOfferFilters,
        config?: FindConfig<ModuleDistributorOffer>,
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer[]>;

    deleteDistributorOffers(ids: string[], sharedContext?: Context): Promise<void>;

    softDeleteDistributorOffers(ids: string[], sharedContext?: Context): Promise<void>;

    restoreDistributorOffers<TReturnableLinkableKeys extends string = string>(
        ids: string[],
        config?: RestoreReturn<TReturnableLinkableKeys>,
        sharedContext?: Context
    ): Promise<Record<TReturnableLinkableKeys, string[]> | void>;

    /* Entity: Kits */
    createKits(
        data: ModuleCreateKit,
        sharedContext?: Context
    ): Promise<ModuleKit>;

    createKits(
        data: ModuleCreateKit[],
        sharedContext?: Context
    ): Promise<ModuleKit[]>;

    retrieveKit(
        id: string,
        config?: FindConfig<ModuleKit>,
        sharedContext?: Context
    ): Promise<ModuleKit>;

    updateKits(
        data: ModuleUpdateKit,
        sharedContext?: Context
    ): Promise<ModuleKit>;

    updateKits(
        data: ModuleUpdateKit[],
        sharedContext?: Context
    ): Promise<ModuleKit[]>;

    listKits(
        filters?: ModuleKitFilters,
        config?: FindConfig<ModuleKit>,
        sharedContext?: Context
    ): Promise<ModuleKit[]>;

    listAndCountKits(
        filters?: ModuleKitFilters,
        config?: FindConfig<ModuleKit>,
        sharedContext?: Context
    ): Promise<[ModuleKit[], number]>;

    deleteKits(ids: string[], sharedContext?: Context): Promise<void>;

    softDeleteKits(ids: string[], sharedContext?: Context): Promise<void>;

    restoreKits<TReturnableLinkableKeys extends string = string>(
        ids: string[],
        config?: RestoreReturn<TReturnableLinkableKeys>,
        sharedContext?: Context
    ): Promise<Record<TReturnableLinkableKeys, string[]> | void>;

    /* Custom methods */
    listManufacturersWithFilters(
        filters?: { tier?: string; country?: string; is_active?: boolean },
        config?: { relations?: string[]; skip?: number; take?: number },
        sharedContext?: Context
    ): Promise<ModuleManufacturer[]>;

    listAndCountManufacturersWithFilters(
        filters?: { tier?: string; country?: string },
        config?: { skip?: number; take?: number },
        sharedContext?: Context
    ): Promise<[ModuleManufacturer[], number]>;

    listSKUsWithFilters(
        filters?: {
            category?: string;
            manufacturer_id?: string;
            sku_code?: string | string[];
            is_active?: boolean;
        },
        config?: { relations?: string[]; skip?: number; take?: number },
        sharedContext?: Context
    ): Promise<ModuleSKU[]>;

    listAndCountSKUsWithFilters(
        filters?: {
            category?: string;
            manufacturer_id?: string;
            min_price?: number;
            max_price?: number;
            is_active?: boolean;
        },
        config?: { skip?: number; take?: number; relations?: string[] },
        sharedContext?: Context
    ): Promise<[ModuleSKU[], number]>;

    retrieveSKUByIdOrCode(
        skuId: string,
        config?: { relations?: string[] },
        sharedContext?: Context
    ): Promise<ModuleSKU | null>;

    listDistributorOffersWithFilters(
        filters?: {
            sku_id?: string;
            distributor_slug?: string;
            stock_status?: string;
        },
        config?: { orderBy?: Record<string, "ASC" | "DESC"> },
        sharedContext?: Context
    ): Promise<ModuleDistributorOffer[]>;

    listKitsWithFilters(
        filters?: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        },
        config?: { skip?: number; take?: number },
        sharedContext?: Context
    ): Promise<ModuleKit[]>;

    listAndCountKitsWithFilters(
        filters?: {
            category?: string;
            target_consumer_class?: string;
            min_capacity?: number;
            max_capacity?: number;
        },
        config?: { skip?: number; take?: number },
        sharedContext?: Context
    ): Promise<[ModuleKit[], number]>;

    retrieveKitByIdOrCode(
        kitId: string,
        sharedContext?: Context
    ): Promise<ModuleKit | null>;

    updateSKUPricingStats(
        skuId: string,
        sharedContext?: Context
    ): Promise<void>;

    searchSKUs(
        filters: {
            category?: string;
            manufacturer_id?: string;
            min_price?: number;
            max_price?: number;
            search?: string;
        },
        sharedContext?: Context
    ): Promise<ModuleSKU[]>;

    getSKUWithOffers(
        skuId: string,
        sharedContext?: Context
    ): Promise<{ sku: ModuleSKU | null; offers: ModuleDistributorOffer[] }>;

    compareSKUPrices(
        skuId: string,
        sharedContext?: Context
    ): Promise<{
        sku: ModuleSKU | null;
        offers: unknown[];
        comparison: unknown | null;
    }>;

    searchKits(
        filters: {
            category?: string;
            min_capacity?: number;
            max_capacity?: number;
            target_consumer_class?: string;
        },
        sharedContext?: Context
    ): Promise<ModuleKit[]>;

    getKitWithComponents(
        kitId: string,
        sharedContext?: Context
    ): Promise<unknown | null>;

    recommendKitsByConsumption(
        monthlyConsumptionKwh: number,
        sharedContext?: Context
    ): Promise<ModuleKit[]>;
}