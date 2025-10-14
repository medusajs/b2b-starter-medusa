const fs = require('fs');
const path = require('path');

// This function assumes you have a mapping of your component SKUs to Medusa inventory_item_ids
// In a real scenario, you would fetch this from your database or a pre-generated map.
const skuToInventoryIdMap = {
    // Example mapping - this needs to be populated with all your components
    "GROWATT-5K-MTL": "inv_item_growatt_5k",
    "CS-550W-PERC": "inv_item_cs_550w",
    "SG-CER-STRUCT": "inv_item_sg_ceramic_structure",
    "CLAMPER-SB-2E": "inv_item_clamper_sb_2e",
    "NEXANS-CABLE-6MM-RED": "inv_item_cable_6mm_red",
    "NEXANS-CABLE-6MM-BLK": "inv_item_cable_6mm_black",
};

function getInventoryItemId(componentSku) {
    return skuToInventoryIdMap[componentSku] || `inv_item_${componentSku.toLowerCase()}`;
}

function convertKitsToMedusa(sourceKits) {
    return sourceKits.map(kit => {
        const handle = kit.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const inventoryItems = Object.values(kit.components).map(component => {
            if (!component.sku || !component.quantity) {
                return null;
            }
            return {
                inventory_item_id: getInventoryItemId(component.sku),
                required_quantity: component.quantity
            };
        }).filter(Boolean); // Filter out nulls if a component is missing info

        return {
            product: {
                title: kit.name,
                subtitle: `Kit Fotovoltaico de ${kit.system_power_kwp}kWp`,
                handle: handle,
                description: `Kit completo para geração de energia solar com potência de ${kit.system_power_kwp}kWp. Inclui painéis, inversor e componentes essenciais.`,
                status: "published",
                variants: [
                    {
                        title: `Configuração Padrão`,
                        sku: kit.id, // Using the original kit ID as SKU
                        prices: [
                            {
                                currency_code: "BRL",
                                amount: Math.round(kit.pricing.total * 100)
                            }
                        ],
                        inventory_items: inventoryItems
                    }
                ],
                categories: [
                    "cat_kits",
                    "cat_kits_grid_tie" // Assuming all are grid-tie for this example
                ],
                tags: [
                    kit.components.panel.manufacturer.toLowerCase(),
                    kit.components.inverter.manufacturer.toLowerCase(),
                    `${kit.system_power_kwp}kwp`
                ],
                metadata: {
                    kit_type: "grid_tie",
                    system_power_kw: kit.system_power_kwp,
                    application: "residencial" // Default, could be inferred from power
                }
            }
        };
    });
}

// Example Usage
/*
const sourceFilePath = path.join(__dirname, '..', 'distributors', 'fotus', 'fotus-kits.json');
const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));

const medusaKits = convertKitsToMedusa(sourceData);

const outputFilePath = path.join(__dirname, 'example-kits-medusa.json');
fs.writeFileSync(outputFilePath, JSON.stringify(medusaKits, null, 2));

console.log(`Successfully converted ${medusaKits.length} kits to Medusa.js format.`);
*/
