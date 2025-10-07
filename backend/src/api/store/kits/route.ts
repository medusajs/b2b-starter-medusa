import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { RemoteQueryFunction } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    const query = req.scope.resolve<RemoteQueryFunction>(
        ContainerRegistrationKeys.QUERY
    );

    const { data: products } = await query.graph({
        entity: "product",
        fields: [
            "id",
            "title",
            "description",
            "handle",
            "status",
            "thumbnail",
            "metadata",
            "variants.id",
            "variants.title",
            "variants.sku",
            "variants.prices.amount",
            "variants.prices.currency_code",
            "images.url",
        ],
        filters: {
            // Add filters if needed, e.g., sales_channel_id
        },
    });

    res.json({ products });
};