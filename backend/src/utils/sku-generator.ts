/**
 * YSH B2B - Dynamic SKU Generator
 * Generates SKUs with tier and INMETRO certification flags
 * Format: {DIST}-{TYPE}-{POWER}-{BRAND}-{TIER}-{CERT}-{SEQ}
 */

/**
 * Distributor code mappings
 */
const DISTRIBUTOR_CODES: Record<string, string> = {
  fortlev: "FLV",
  neosolar: "NEO",
  fotus: "FTS"
}

/**
 * Product type codes
 */
const PRODUCT_TYPE_CODES: Record<string, string> = {
  kit: "KIT",
  panel: "PNL",
  inverter: "INV",
  battery: "BAT",
  structure: "STR",
  cable: "CAB",
  connector: "CON"
}

/**
 * Tier suffix codes
 */
const TIER_CODES: Record<string, string> = {
  bronze: "BRZ",
  silver: "SLV",
  gold: "GLD",
  platinum: "PLT"
}

/**
 * INMETRO certification flags
 */
const CERT_FLAGS: Record<string, string> = {
  certified: "CERT",
  pending: "PEND",
  expired: "EXPR",
  not_required: "NONE"
}

/**
 * Format power value for SKU
 */
function formatPowerForSKU(powerKwp: number): string {
  if (powerKwp < 1) {
    // Less than 1kWp, use Watts
    return `${Math.round(powerKwp * 1000)}W`
  }
  // Use kWp, remove decimal if whole number
  const rounded = Math.round(powerKwp * 100) / 100
  return rounded % 1 === 0 ? `${rounded}KWP` : `${rounded}KWP`.replace('.', '')
}

/**
 * Sanitize brand name for SKU
 */
function sanitizeBrandForSKU(brand: string): string {
  return brand
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8) // Max 8 characters
}

/**
 * Generate SKU interface
 */
interface GenerateSKUInput {
  distributor: string // "fortlev", "neosolar", "fotus"
  product_type: string // "kit", "panel", "inverter"
  power_kwp?: number // Power in kWp (optional for non-power products)
  brand?: string // Brand name (optional)
  tier: string // "bronze", "silver", "gold", "platinum"
  inmetro_status: string // "certified", "pending", "expired", "not_required"
  sequence?: number // Sequence number (auto-generated if not provided)
}

interface GenerateSKUOutput {
  sku: string
  components: {
    distributor: string
    type: string
    power: string
    brand: string
    tier: string
    certification: string
    sequence: string
  }
}

/**
 * Generate dynamic SKU
 */
export function generateDynamicSKU(input: GenerateSKUInput): GenerateSKUOutput {
  const {
    distributor,
    product_type,
    power_kwp = 0,
    brand = "GENERIC",
    tier,
    inmetro_status,
    sequence = 1
  } = input
  
  // Validate inputs
  if (!DISTRIBUTOR_CODES[distributor.toLowerCase()]) {
    throw new Error(`Invalid distributor: ${distributor}`)
  }
  
  if (!PRODUCT_TYPE_CODES[product_type.toLowerCase()]) {
    throw new Error(`Invalid product type: ${product_type}`)
  }
  
  if (!TIER_CODES[tier.toLowerCase()]) {
    throw new Error(`Invalid tier: ${tier}`)
  }
  
  if (!CERT_FLAGS[inmetro_status.toLowerCase()]) {
    throw new Error(`Invalid INMETRO status: ${inmetro_status}`)
  }
  
  // Build SKU components
  const components = {
    distributor: DISTRIBUTOR_CODES[distributor.toLowerCase()],
    type: PRODUCT_TYPE_CODES[product_type.toLowerCase()],
    power: power_kwp > 0 ? formatPowerForSKU(power_kwp) : "000KWP",
    brand: sanitizeBrandForSKU(brand),
    tier: TIER_CODES[tier.toLowerCase()],
    certification: CERT_FLAGS[inmetro_status.toLowerCase()],
    sequence: sequence.toString().padStart(3, "0")
  }
  
  // Assemble SKU
  const sku = [
    components.distributor,
    components.type,
    components.power,
    components.brand,
    components.tier,
    components.certification,
    components.sequence
  ].join("-")
  
  return { sku, components }
}

/**
 * Parse SKU into components
 */
export function parseSKU(sku: string): GenerateSKUOutput["components"] | null {
  const parts = sku.split("-")
  
  if (parts.length !== 7) {
    return null
  }
  
  return {
    distributor: parts[0],
    type: parts[1],
    power: parts[2],
    brand: parts[3],
    tier: parts[4],
    certification: parts[5],
    sequence: parts[6]
  }
}

/**
 * Generate SKU for product variant based on customer tier
 */
export function generateTieredSKU(
  baseSKU: string,
  customerTier: string
): string {
  const components = parseSKU(baseSKU)
  
  if (!components) {
    throw new Error(`Invalid base SKU format: ${baseSKU}`)
  }
  
  // Update tier component
  if (TIER_CODES[customerTier.toLowerCase()]) {
    components.tier = TIER_CODES[customerTier.toLowerCase()]
  }
  
  return [
    components.distributor,
    components.type,
    components.power,
    components.brand,
    components.tier,
    components.certification,
    components.sequence
  ].join("-")
}

/**
 * Batch generate SKUs for product catalog
 */
export async function generateSKUsForCatalog(
  products: Array<{
    distributor: string
    product_type: string
    power_kwp?: number
    brand?: string
    inmetro_status: string
  }>,
  tiers: string[] = ["bronze", "silver", "gold", "platinum"]
): Promise<Array<{
  product_index: number
  tier: string
  sku: string
  components: any
}>> {
  const results: any[] = []
  let sequenceCounter = 1
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    
    // Generate SKU for each tier
    for (const tier of tiers) {
      const { sku, components } = generateDynamicSKU({
        ...product,
        tier,
        sequence: sequenceCounter
      })
      
      results.push({
        product_index: i,
        tier,
        sku,
        components
      })
      
      sequenceCounter++
    }
  }
  
  return results
}

/**
 * Validate SKU format
 */
export function validateSKUFormat(sku: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  const components = parseSKU(sku)
  if (!components) {
    errors.push("Invalid SKU format - must have 7 components separated by hyphens")
    return { valid: false, errors }
  }
  
  // Validate distributor code
  const validDistributors = Object.values(DISTRIBUTOR_CODES)
  if (!validDistributors.includes(components.distributor)) {
    errors.push(`Invalid distributor code: ${components.distributor}`)
  }
  
  // Validate product type
  const validTypes = Object.values(PRODUCT_TYPE_CODES)
  if (!validTypes.includes(components.type)) {
    errors.push(`Invalid product type: ${components.type}`)
  }
  
  // Validate tier
  const validTiers = Object.values(TIER_CODES)
  if (!validTiers.includes(components.tier)) {
    errors.push(`Invalid tier code: ${components.tier}`)
  }
  
  // Validate certification flag
  const validCertFlags = Object.values(CERT_FLAGS)
  if (!validCertFlags.includes(components.certification)) {
    errors.push(`Invalid certification flag: ${components.certification}`)
  }
  
  // Validate sequence is numeric
  if (!/^\d{3}$/.test(components.sequence)) {
    errors.push(`Invalid sequence format: ${components.sequence} (must be 3 digits)`)
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get SKU display name for UI
 */
export function getSKUDisplayName(sku: string): string {
  const components = parseSKU(sku)
  if (!components) return sku
  
  // Reverse map tier code to name
  const tierNames: Record<string, string> = {
    BRZ: "Bronze",
    SLV: "Silver",
    GLD: "Gold",
    PLT: "Platinum"
  }
  
  // Reverse map cert code to name
  const certNames: Record<string, string> = {
    CERT: "✓ Certificado INMETRO",
    PEND: "⏳ Certificação Pendente",
    EXPR: "⚠️ Certificação Expirada",
    NONE: ""
  }
  
  const parts = [
    components.brand,
    components.power !== "000KWP" ? components.power : "",
    tierNames[components.tier] || components.tier,
    certNames[components.certification] || ""
  ].filter(Boolean)
  
  return parts.join(" • ")
}

// Export types
export type {
  GenerateSKUInput,
  GenerateSKUOutput
}

// Export constants for external use
export {
  DISTRIBUTOR_CODES,
  PRODUCT_TYPE_CODES,
  TIER_CODES,
  CERT_FLAGS
}
