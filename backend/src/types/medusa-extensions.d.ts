/**
 * Type extensions for Medusa core types
 * These extend HttpTypes with custom module relationships
 */

import "@medusajs/types";
import { HttpTypes } from "@medusajs/types";
import { QueryEmployee, QueryCompany, QueryApproval, QueryApprovalStatus } from "./index";

declare module "@medusajs/types" {
    namespace HttpTypes {
        // Extend StoreCustomer with employee relationship
        interface StoreCustomer {
            employee?: QueryEmployee;
        }

        // Extend Customer interface
        interface Customer {
            employee?: QueryEmployee;
        }

        // Extend StoreCart with custom relationships
        interface StoreCart {
            approval_status?: QueryApprovalStatus;
            approvals?: QueryApproval[];
            company?: QueryCompany;
        }

        // Extend Cart interface
        interface Cart {
            approval_status?: QueryApprovalStatus;
            approvals?: QueryApproval[];
            company?: QueryCompany;
        }

        // Extend StoreOrder with custom relationships  
        interface StoreOrder {
            company?: QueryCompany;
        }

        // Extend ProductVariant with prices (already exists but might be optional)
        interface StoreProductVariant {
            prices?: Array<{
                id: string;
                amount: number;
                currency_code: string;
                [key: string]: any;
            }>;
        }

        // Extend ProductVariantDTO with prices
        interface ProductVariantDTO {
            prices?: Array<{
                id: string;
                amount: number;
                currency_code: string;
                [key: string]: any;
            }>;
        }
    }
}
