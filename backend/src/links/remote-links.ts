import { Modules } from "@medusajs/framework/utils";
import { MedusaModule } from "@medusajs/modules-sdk";

/**
 * RemoteLink Definitions for Solar Journey 360º
 * 
 * Links entre entities customizadas e módulos Medusa core:
 * - SolarCalculation ↔ Customer, Quote
 * - CreditAnalysis ↔ Customer, Quote, SolarCalculation
 * - FinancingApplication ↔ Customer, Quote, CreditAnalysis, Order
 * - OrderFulfillment ↔ Order
 * 
 * Nota: Links customizados são criados via MedusaModule.setCustomLink
 * para permitir queries cross-module com RemoteQuery
 */

// ============================================
// 1. SOLAR CALCULATION LINKS
// ============================================

/**
 * Solar Calculation Links
 * Permite:
 * - customer.solar_calculations
 * - quote.solar_calculations
 * - product.solar_calculation_kits
 */
MedusaModule.setCustomLink(() => {
  return {
    isLink: true,
    isReadOnlyLink: false,
    extends: [
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
      {
        serviceName: "solar",
        relationship: {
          serviceName: "quote",
          entity: "Quote",
          primaryKey: "id",
          foreignKey: "quote_id",
          alias: "quote",
          args: {
            methodSuffix: "Quotes",
          },
        },
      },
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
});/**
 * Link: SolarCalculation → Quote
 * Permite: quote.solar_calculations
 */
export const SolarCalculationQuoteLink = defineLink({
    linkable: {
        service: "quote",
        field: "quote_id",
    },
    linkable: {
        service: "solar",
        field: "quote_id",
    },
    database: {
        table: "link_solar_calculation_quote",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: SolarCalculationKit → Product
 * Permite: product.solar_calculation_kits
 */
export const SolarCalculationKitProductLink = defineLink({
    linkable: {
        service: "product",
        field: "product_id",
    },
    linkable: {
        service: "solar",
        field: "product_id",
    },
    database: {
        table: "link_solar_calculation_kit_product",
        idColumn: "id",
        extraColumns: {
            calculation_id: { type: "uuid" },
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

// ============================================
// 2. CREDIT ANALYSIS LINKS
// ============================================

/**
 * Link: CreditAnalysis → Customer
 * Permite: customer.credit_analyses
 */
export const CreditAnalysisCustomerLink = defineLink({
    linkable: {
        service: "customer",
        field: "customer_id",
    },
    linkable: {
        service: "credit-analysis",
        field: "customer_id",
    },
    database: {
        table: "link_credit_analysis_customer",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: CreditAnalysis → Quote
 * Permite: quote.credit_analyses
 */
export const CreditAnalysisQuoteLink = defineLink({
    linkable: {
        service: "quote",
        field: "quote_id",
    },
    linkable: {
        service: "credit-analysis",
        field: "quote_id",
    },
    database: {
        table: "link_credit_analysis_quote",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: CreditAnalysis → SolarCalculation
 * Permite: solar_calculation.credit_analyses
 */
export const CreditAnalysisSolarCalculationLink = defineLink({
    linkable: {
        service: "solar",
        field: "solar_calculation_id",
    },
    linkable: {
        service: "credit-analysis",
        field: "solar_calculation_id",
    },
    database: {
        table: "link_credit_analysis_solar_calculation",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

// ============================================
// 3. FINANCING APPLICATION LINKS
// ============================================

/**
 * Link: FinancingApplication → Customer
 * Permite: customer.financing_applications
 */
export const FinancingApplicationCustomerLink = defineLink({
    linkable: {
        service: "customer",
        field: "customer_id",
    },
    linkable: {
        service: "financing",
        field: "customer_id",
    },
    database: {
        table: "link_financing_application_customer",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: FinancingApplication → Quote
 * Permite: quote.financing_applications
 */
export const FinancingApplicationQuoteLink = defineLink({
    linkable: {
        service: "quote",
        field: "quote_id",
    },
    linkable: {
        service: "financing",
        field: "quote_id",
    },
    database: {
        table: "link_financing_application_quote",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: FinancingApplication → CreditAnalysis
 * Permite: credit_analysis.financing_applications
 */
export const FinancingApplicationCreditAnalysisLink = defineLink({
    linkable: {
        service: "credit-analysis",
        field: "credit_analysis_id",
    },
    linkable: {
        service: "financing",
        field: "credit_analysis_id",
    },
    database: {
        table: "link_financing_application_credit_analysis",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

/**
 * Link: FinancingApplication → Order
 * Permite: order.financing_application
 */
export const FinancingApplicationOrderLink = defineLink({
    linkable: {
        service: "order",
        field: "order_id",
    },
    linkable: {
        service: "financing",
        field: "order_id",
    },
    database: {
        table: "link_financing_application_order",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

// ============================================
// 4. ORDER FULFILLMENT LINKS
// ============================================

/**
 * Link: OrderFulfillment → Order
 * Permite: order.fulfillments
 */
export const OrderFulfillmentOrderLink = defineLink({
    linkable: {
        service: "order",
        field: "order_id",
    },
    linkable: {
        service: "fulfillment",
        field: "order_id",
    },
    database: {
        table: "link_order_fulfillment_order",
        idColumn: "id",
        extraColumns: {
            created_at: { type: "timestamp", default: () => new Date() },
        },
    },
});

// Export all links
export const remoteLinks = [
    // Solar
    SolarCalculationCustomerLink,
    SolarCalculationQuoteLink,
    SolarCalculationKitProductLink,

    // Credit
    CreditAnalysisCustomerLink,
    CreditAnalysisQuoteLink,
    CreditAnalysisSolarCalculationLink,

    // Financing
    FinancingApplicationCustomerLink,
    FinancingApplicationQuoteLink,
    FinancingApplicationCreditAnalysisLink,
    FinancingApplicationOrderLink,

    // Fulfillment
    OrderFulfillmentOrderLink,
];
