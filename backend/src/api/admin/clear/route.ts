import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    await execAsync("medusa exec ./src/scripts/clear-database.ts");
    await execAsync("medusa exec ./src/scripts/seed.ts");

    res.json({ success: true });
  } catch (error) {
    console.error("Error executing scripts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
