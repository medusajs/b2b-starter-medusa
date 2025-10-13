import {
    ModuleManufacturer,
    ModuleSKU,
    ModuleDistributorOffer,
    ModuleKit,
} from "./module";

/**
 * Query types for unified catalog entities
 */
export interface QueryManufacturer extends ModuleManufacturer { }

export interface QuerySKU extends ModuleSKU { }

export interface QueryDistributorOffer extends ModuleDistributorOffer { }

export interface QueryKit extends ModuleKit { }