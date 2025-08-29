import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import fs from "fs"
import path from "path"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { path: filePath } = req.params
  
  if (!filePath || !Array.isArray(filePath)) {
    return res.status(400).json({ message: "Invalid file path" })
  }

  const fullPath = path.join(process.cwd(), "uploads", ...filePath)
  
  // Security check: ensure the path is within the uploads directory
  const uploadsDir = path.resolve(process.cwd(), "uploads")
  if (!fullPath.startsWith(uploadsDir)) {
    return res.status(403).json({ message: "Access denied" })
  }

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: "File not found" })
    }

    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) {
      return res.status(400).json({ message: "Not a file" })
    }

    // Set appropriate headers for PDF files
    if (fullPath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`)
    }

    // Stream the file
    const fileStream = fs.createReadStream(fullPath)
    fileStream.pipe(res)
  } catch (error) {
    console.error('[UploadsRoute] Error serving file:', error)
    res.status(500).json({ message: "Internal server error" })
  }
}
