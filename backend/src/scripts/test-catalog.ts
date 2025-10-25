import YshCatalogModuleService from "../modules/ysh-catalog/service";
import * as path from "path";

// Test script to validate catalog service functionality
async function testCatalogService() {
    console.log("Testing YSH Catalog Service...");

    try {
        // Create service instance (mock container for testing)
        const mockContainer = {
            resolve: (key: string) => {
                if (key === "logger") {
                    return {
                        info: console.log,
                        warn: console.warn,
                        error: console.error
                    };
                }
                return null;
            }
        };

        const catalogService = new YshCatalogModuleService(mockContainer as any, {});

        // Test 1: List manufacturers
        console.log("\n=== Test 1: List Manufacturers ===");
        const manufacturers = await catalogService.getManufacturers();
        console.log("Manufacturers found:", manufacturers.length);
        console.log("Sample manufacturers:", manufacturers.slice(0, 5));

        // Test 2: List products by category
        console.log("\n=== Test 2: List Products by Category (kits) ===");
        const kits = await catalogService.listProductsByCategory("kits", { limit: 3 });
        console.log("Kits found:", kits.products.length);
        if (kits.products.length > 0) {
            console.log("First kit:", {
                name: kits.products[0].name,
                manufacturer: kits.products[0].manufacturer,
                price: kits.products[0].price
            });
        }

        // Test 3: Search products
        console.log("\n=== Test 3: Search Products ===");
        const searchResults = await catalogService.searchProducts("solar", { limit: 3 });
        console.log("Search results found:", searchResults.length);
        if (searchResults.length > 0) {
            console.log("First result:", {
                name: searchResults[0].name,
                manufacturer: searchResults[0].manufacturer
            });
        }        // Test 4: Get product by ID
        console.log("\n=== Test 4: Get Product by ID ===");
        if (kits.products.length > 0) {
            const productId = kits.products[0].id || kits.products[0].sku;
            if (productId) {
                const product = await catalogService.getProductById("kits", productId);
                console.log("Product found:", product ? "Yes" : "No");
                if (product) {
                    console.log("Product details:", {
                        name: product.name,
                        manufacturer: product.manufacturer,
                        price: product.price
                    });
                }
            }
        }

        console.log("\n=== All Tests Completed Successfully ===");

    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Run the test
testCatalogService();