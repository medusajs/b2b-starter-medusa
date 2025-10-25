// This script would convert a proprietary structures data format to the Medusa.js format.
// Since we don't have a source file for structures, this is a template.

const fs = require('fs');
const path = require('path');

function convertStructuresToMedusa(sourceData) {
    return sourceData.map(struct => {
        const handle = struct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        return {
            product: {
                title: struct.name,
                subtitle: `Estrutura para ${struct.roof_type}`,
                handle: handle,
                description: struct.description || `Estrutura de fixação para painéis solares em telhados do tipo ${struct.roof_type}. Fabricado por ${struct.manufacturer}.`,
                status: "published",
                variants: [
                    {
                        title: `Kit para ${struct.panel_quantity} painéis`,
                        sku: struct.sku,
                        prices: [
                            {
                                currency_code: "BRL",
                                amount: Math.round(struct.price * 100) // Assuming price is in BRL
                            }
                        ],
                        inventory_quantity: struct.stock
                    }
                ],
                categories: [
                    "cat_estruturas",
                    `cat_estruturas_${struct.roof_type.toLowerCase().replace(' ', '_')}`
                ],
                tags: [
                    struct.manufacturer.toLowerCase(),
                    `telhado_${struct.roof_type.toLowerCase()}`
                ],
                metadata: {
                    manufacturer: struct.manufacturer,
                    material: struct.material,
                    roof_type: struct.roof_type
                }
            }
        };
    });
}

// Example Usage (replace with actual data loading)
/*
const sourceFilePath = path.join(__dirname, '..', 'distributors', 'odex', 'odex-structures.json');
const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf-8'));

const medusaStructures = convertStructuresToMedusa(sourceData);

const outputFilePath = path.join(__dirname, 'example-structures-medusa.json');
fs.writeFileSync(outputFilePath, JSON.stringify(medusaStructures, null, 2));

console.log(`Successfully converted ${medusaStructures.length} structures to Medusa.js format.`);
*/
