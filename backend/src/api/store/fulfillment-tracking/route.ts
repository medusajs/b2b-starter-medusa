import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Client } from "pg"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { fulfillment_id } = req.query

  if (!fulfillment_id) {
    return res.status(400).json({
      message: "fulfillment_id is required"
    })
  }

  try {
    const connectionString = process.env.DATABASE_URL as string | undefined;
    if (!connectionString) {
      return res.status(500).json({ message: "Database connection not configured" })
    }

    const client = new Client({ connectionString });
    await client.connect();
    
    const result = await client.query(`
      SELECT tracking_number
      FROM fulfillment_label
      WHERE fulfillment_id = $1
    `, [fulfillment_id]);
    
    await client.end();
    
    const trackingNumbers = result.rows.map((row: any) => row.tracking_number)
    
    return res.json({ 
      tracking_numbers: trackingNumbers 
    })
  } catch (error) {
    console.error('[FulfillmentTrackingRoute] Error retrieving tracking numbers:', error)
    res.status(500).json({
      message: "Failed to retrieve tracking numbers",
      error: error.message
    })
  }
}
