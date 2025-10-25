import {
    QueryManufacturer,
    QuerySKU,
    QueryDistributorOffer,
    QueryKit,
} from "./query";

/**
 * HTTP types for unified catalog API responses
 */
export interface StoreManufacturer extends QueryManufacturer { }

export interface StoreSKU extends QuerySKU { }

export interface StoreDistributorOffer extends QueryDistributorOffer { }

export interface StoreKit extends QueryKit { }

/**
 * Admin types for unified catalog (full access)
 */
export interface AdminManufacturer extends QueryManufacturer { }

export interface AdminSKU extends QuerySKU { }

export interface AdminDistributorOffer extends QueryDistributorOffer { }

export interface AdminKit extends QueryKit { }