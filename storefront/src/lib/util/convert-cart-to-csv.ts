import { B2BCart } from "@/types/global"
import { HttpTypes } from "@medusajs/types"

// Function to convert the cart items into CSV format
export function cartToCsv(cart: B2BCart) {
  const items = cart.items

  // Map each cart item to a structure suitable for CSV
  const itemData =
    items?.map((item: HttpTypes.StoreCartLineItem) => {
      const taxRate = item.tax_lines?.[0]?.rate || 0
      const totalPrice = item.quantity * item.unit_price
      const totalTax = totalPrice * taxRate

      return {
        id: item.id,
        variant_id: item.variant_id,
        product_title: item.product_title,
        product_description: item.product_description?.replace(/\n/g, " "), // Replace newlines with spaces for CSV
        variant_sku: item.variant_sku || "",
        variant_title: item.variant_title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        tax_rate: taxRate,
        total_price: totalPrice,
        total_tax: totalTax,
      }
    }) || []

  // Create CSV header
  const header = [
    "Item ID",
    "Variant ID",
    "Product Title",
    "Product Description",
    "Variant SKU",
    "Variant Title",
    "Quantity",
    "Unit Price",
    "Tax Rate",
    "Total Price",
    "Total Tax",
  ].join(",")

  // Create CSV rows
  const rows = itemData.map((item) =>
    [
      item.id,
      item.variant_id,
      `"${item.product_title}"`, // Wrapping in quotes for safety
      `"${item.product_description}"`, // Wrapping in quotes for safety
      item.variant_sku,
      `"${item.variant_title}"`, // Wrapping in quotes for safety
      item.quantity,
      item.unit_price.toFixed(2),
      item.tax_rate?.toFixed(2),
      item.total_price.toFixed(2),
      item.total_tax.toFixed(2),
    ].join(",")
  )

  // Combine header and rows
  const csv = [header, ...rows].join("\n")

  return csv
}
