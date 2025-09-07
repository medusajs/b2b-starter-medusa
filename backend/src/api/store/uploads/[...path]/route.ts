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

    // Set appropriate headers based on file type
    const ext = path.extname(fullPath).toLowerCase()
    
    // Set Content-Type based on file extension
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        res.setHeader('Content-Type', 'image/jpeg')
        break
      case '.png':
        res.setHeader('Content-Type', 'image/png')
        break
      case '.gif':
        res.setHeader('Content-Type', 'image/gif')
        break
      case '.webp':
        res.setHeader('Content-Type', 'image/webp')
        break
      case '.svg':
        res.setHeader('Content-Type', 'image/svg+xml')
        break
      case '.pdf':
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`)
        break
      default:
        // For other files, let the browser determine the type
        res.setHeader('Content-Type', 'application/octet-stream')
    }

    // Stream the file
    const fileStream = fs.createReadStream(fullPath)
    fileStream.pipe(res)
  } catch (error) {
    console.error('[UploadsRoute] Error serving file:', error)
    res.status(500).json({ message: "Internal server error" })
  }
}
