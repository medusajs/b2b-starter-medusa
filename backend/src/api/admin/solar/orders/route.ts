import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { getSolarOrdersWithCompanyWorkflow } from "../../../../workflows/solar/index-queries";

/**
 * GET /admin/solar/orders
 * 
 * Pedidos solares com dados de empresa via Index Module
 * Uma query cross-module vs múltiplas queries sequenciais
 * 
 * Query params:
 * - customer_id: Filtrar por cliente
 * - status: Status do pedido (pending, completed, etc)
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { customer_id, status } = req.query;
  
  const { result } = await getSolarOrdersWithCompanyWorkflow(req.scope).run({
    input: {
      customer_id: customer_id as string,
      status: status as string,
    },
  });
  
  res.json({
    orders: result.orders,
    count: result.orders.length,
  });
};