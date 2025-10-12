import { Modules } from "@medusajs/framework/utils";
import { MedusaModule } from "@medusajs/modules-sdk";
import { QUOTE_MODULE } from "../modules/quote";

/**
 * RemoteLink Definitions for Solar Journey 360º
 * 
 * Links entre entities customizadas e módulos Medusa core:
 * - SolarCalculation ↔ Customer, Quote, Product
 * - CreditAnalysis ↔ Customer, Quote, SolarCalculation
 * - FinancingApplication ↔ Customer, Quote, CreditAnalysis, Order
 * - OrderFulfillment ↔ Order
 * 
 * Usando MedusaModule.setCustomLink para integração com RemoteQuery
 */

// ============================================
// 1. SOLAR CALCULATION MODULE LINKS
// ============================================

MedusaModule.setCustomLink(() => {
    return {
        isLink: true,
        isReadOnlyLink: false,
        extends: [
            // SolarCalculation → Customer
            {
                serviceName: "solar",
                relationship: {
                    serviceName: Modules.CUSTOMER,
                    entity: "Customer",
                    primaryKey: "id",
                    foreignKey: "customer_id",
                    alias: "customer",
                    args: {
                        methodSuffix: "Customers",
                    },
                },
            },
            // SolarCalculation → Quote
            {
                serviceName: "solar",
                relationship: {
                    serviceName: QUOTE_MODULE,
                    entity: "Quote",
                    primaryKey: "id",
                    foreignKey: "quote_id",
                    alias: "quote",
                    args: {
                        methodSuffix: "Quotes",
                    },
                },
            },
            // SolarCalculationKit → Product
            {
                serviceName: "solar",
                relationship: {
                    serviceName: Modules.PRODUCT,
                    entity: "Product",
                    primaryKey: "id",
                    foreignKey: "product_id",
                    alias: "product",
                    args: {
                        methodSuffix: "Products",
                    },
                },
            },
        ],
    };
});

// ============================================
// 2. CREDIT ANALYSIS MODULE LINKS
// ============================================

MedusaModule.setCustomLink(() => {
    return {
        isLink: true,
        isReadOnlyLink: false,
        extends: [
            // CreditAnalysis → Customer
            {
                serviceName: "credit-analysis",
                relationship: {
                    serviceName: Modules.CUSTOMER,
                    entity: "Customer",
                    primaryKey: "id",
                    foreignKey: "customer_id",
                    alias: "customer",
                    args: {
                        methodSuffix: "Customers",
                    },
                },
            },
            // CreditAnalysis → Quote
            {
                serviceName: "credit-analysis",
                relationship: {
                    serviceName: QUOTE_MODULE,
                    entity: "Quote",
                    primaryKey: "id",
                    foreignKey: "quote_id",
                    alias: "quote",
                    args: {
                        methodSuffix: "Quotes",
                    },
                },
            },
            // CreditAnalysis → SolarCalculation
            {
                serviceName: "credit-analysis",
                relationship: {
                    serviceName: "solar",
                    entity: "SolarCalculation",
                    primaryKey: "id",
                    foreignKey: "solar_calculation_id",
                    alias: "solar_calculation",
                    args: {
                        methodSuffix: "SolarCalculations",
                    },
                },
            },
        ],
    };
});

// ============================================
// 3. FINANCING APPLICATION MODULE LINKS
// ============================================

MedusaModule.setCustomLink(() => {
    return {
        isLink: true,
        isReadOnlyLink: false,
        extends: [
            // FinancingApplication → Customer
            {
                serviceName: "financing",
                relationship: {
                    serviceName: Modules.CUSTOMER,
                    entity: "Customer",
                    primaryKey: "id",
                    foreignKey: "customer_id",
                    alias: "customer",
                    args: {
                        methodSuffix: "Customers",
                    },
                },
            },
            // FinancingApplication → Quote
            {
                serviceName: "financing",
                relationship: {
                    serviceName: QUOTE_MODULE,
                    entity: "Quote",
                    primaryKey: "id",
                    foreignKey: "quote_id",
                    alias: "quote",
                    args: {
                        methodSuffix: "Quotes",
                    },
                },
            },
            // FinancingApplication → CreditAnalysis
            {
                serviceName: "financing",
                relationship: {
                    serviceName: "credit-analysis",
                    entity: "CreditAnalysis",
                    primaryKey: "id",
                    foreignKey: "credit_analysis_id",
                    alias: "credit_analysis",
                    args: {
                        methodSuffix: "CreditAnalyses",
                    },
                },
            },
            // FinancingApplication → Order
            {
                serviceName: "financing",
                relationship: {
                    serviceName: Modules.ORDER,
                    entity: "Order",
                    primaryKey: "id",
                    foreignKey: "order_id",
                    alias: "order",
                    args: {
                        methodSuffix: "Orders",
                    },
                },
            },
        ],
    };
});

// ============================================
// 4. ORDER FULFILLMENT MODULE LINKS
// ============================================

MedusaModule.setCustomLink(() => {
    return {
        isLink: true,
        isReadOnlyLink: false,
        extends: [
            // OrderFulfillment → Order
            {
                serviceName: "order-fulfillment",
                relationship: {
                    serviceName: Modules.ORDER,
                    entity: "Order",
                    primaryKey: "id",
                    foreignKey: "order_id",
                    alias: "order",
                    args: {
                        methodSuffix: "Orders",
                    },
                },
            },
        ],
    };
});

/**
 * Usage Examples:
 * 
 * // Query with RemoteQuery
 * const query = container.resolve(ContainerRegistrationKeys.QUERY);
 * 
 * // 1. Get customer with solar calculations
 * const { data: [customer] } = await query.graph({
 *   entity: "customer",
 *   fields: ["id", "email", "solar_calculations.*"],
 *   filters: { id: "cus_123" }
 * });
 * 
 * // 2. Get quote with credit analysis
 * const { data: [quote] } = await query.graph({
 *   entity: "quote",
 *   fields: ["id", "status", "credit_analyses.*", "credit_analyses.financing_offers.*"],
 *   filters: { id: "quo_456" }
 * });
 * 
 * // 3. Get solar calculation with customer and recommended kits
 * const { data: [calculation] } = await query.graph({
 *   entity: "solar_calculation",
 *   fields: ["id", "potencia_instalada_kwp", "customer.*", "kits_recomendados.*", "kits_recomendados.product.*"],
 *   filters: { id: "sc_789" }
 * });
 * 
 * // 4. Get order with financing and fulfillment
 * const { data: [order] } = await query.graph({
 *   entity: "order",
 *   fields: ["id", "status", "financing_application.*", "fulfillments.*", "fulfillments.shipments.*"],
 *   filters: { id: "order_abc" }
 * });
 */
