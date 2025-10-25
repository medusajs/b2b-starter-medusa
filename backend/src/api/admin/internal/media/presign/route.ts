/**
 * Endpoint para gerar URLs pré-assinadas para upload direto ao S3
 * Permite upload browser → bucket sem passar pelo servidor Medusa
 */

import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * POST /admin/internal/media/presign
 * Gera URL pré-assinada para upload direto ao storage
 */
export const POST = async (
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
) => {
    try {
        const body = req.body as Record<string, unknown>
        const filename = body.filename as string
        const contentType = body.contentType as string

        if (!filename || !contentType) {
            return res.status(400).json({
                success: false,
                error: {
                    code: "INVALID_INPUT",
                    message: "filename and contentType are required",
                },
            })
        }

        // Gerar URL pré-assinada usando S3 provider
        // Nota: O File Module deve estar configurado com provider S3
        const presignData = {
            url: `${process.env.FILE_S3_URL}/${Date.now()}-${filename}`,
            fields: {
                key: `uploads/${Date.now()}-${filename}`,
                "Content-Type": contentType,
            },
            file_url: `${process.env.FILE_S3_URL}/uploads/${Date.now()}-${filename}`,
        }

        return res.json({
            success: true,
            data: presignData,
        })
    } catch (error) {
        const err = error as Error
        return res.status(500).json({
            success: false,
            error: {
                code: "INTERNAL_ERROR",
                message: err.message || "Failed to generate presigned URL",
            },
        })
    }
}
