import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getCatalogService } from "../../_catalog-service";

/**
 * GET /store/catalog/kits/:id
 * Retorna detalhes de um kit com componentes expandidos
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const catalogService = getCatalogService();

    const { id } = req.params;

    const kit = await catalogService.getKitWithComponents(id);

    res.json({ kit });
};
