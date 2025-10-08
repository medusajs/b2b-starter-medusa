/**
 * Manufacturers Data Layer
 * Extrai lista de fabricantes dos produtos
 */

import { listProducts } from "./products"

/**
 * Retorna lista única de fabricantes dos produtos
 * @param categoryId - ID da categoria para filtrar (opcional)
 * @returns Array de nomes de fabricantes ordenados
 */
export async function getManufacturers(categoryId?: string): Promise<string[]> {
    try {
        const result = await listProducts({
            countryCode: "br",
            queryParams: {
                limit: 1000,
            },
        })

        const manufacturersSet = new Set<string>()

        // listProducts retorna { response: { products: [] } }
        const products = result.response.products || []

        products.forEach((product: any) => {
            // Tenta extrair manufacturer de diferentes locais
            const manufacturer =
                product.metadata?.manufacturer ||
                product.metadata?.fabricante ||
                product.metadata?.brand

            if (manufacturer && typeof manufacturer === "string") {
                manufacturersSet.add(manufacturer.trim())
            }
        })

        // Converte para array e ordena alfabeticamente
        return Array.from(manufacturersSet).sort((a, b) =>
            a.localeCompare(b, "pt-BR")
        )
    } catch (error) {
        console.error("Error fetching manufacturers:", error)
        return []
    }
}

/**
 * Retorna contagem de produtos por fabricante
 * @param categoryId - ID da categoria para filtrar (opcional)
 * @returns Map de fabricante → contagem
 */
export async function getManufacturerCounts(
    categoryId?: string
): Promise<Map<string, number>> {
    try {
        const result = await listProducts({
            countryCode: "br",
            queryParams: {
                limit: 1000,
            },
        })

        const counts = new Map<string, number>()

        // listProducts retorna { response: { products: [] } }
        const products = result.response.products || []

        products.forEach((product: any) => {
            const manufacturer =
                product.metadata?.manufacturer ||
                product.metadata?.fabricante ||
                product.metadata?.brand

            if (manufacturer && typeof manufacturer === "string") {
                const name = manufacturer.trim()
                counts.set(name, (counts.get(name) || 0) + 1)
            }
        })

        return counts
    } catch (error) {
        console.error("Error counting manufacturers:", error)
        return new Map()
    }
}
