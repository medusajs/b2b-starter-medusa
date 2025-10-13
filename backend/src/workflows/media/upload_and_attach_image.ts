/**
 * Workflow para upload e anexação de imagens a produtos
 * Garante atomicidade com rollback em caso de falha
 */

import {
    createStep,
    StepResponse,
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

interface ImageFile {
    buffer?: Buffer
    filename?: string
    mime?: string
    alt?: string
}

interface WorkflowInput {
    product_id: string
    files: ImageFile[]
    variant_id?: string
}

interface UploadResult {
    uploads: Array<{ url: string; alt?: string }>
}

interface AttachResult {
    image_ids: string[]
}

/**
 * Step 1: Upload de arquivos via File Module
 */
const uploadStep = createStep<WorkflowInput, UploadResult>(
    "upload-media",
    async (input, ctx) => {
        const fileModule = ctx.container.resolve(Modules.FILE)
        const uploads: Array<{ url: string; alt?: string }> = []

        for (const f of input.files) {
            if (!f.buffer || !f.filename) {
                continue
            }

            try {
                // Upload via File Module (adaptará ao provider configurado - S3, etc)
                const res = await fileModule.upload({
                    filename: f.filename,
                    contentType: f.mime ?? "application/octet-stream",
                    body: f.buffer,
                })

                uploads.push({
                    url: res.url,
                    alt: f.alt,
                })
            } catch (error) {
                console.error(`Failed to upload file ${f.filename}:`, error)
            }
        }

        return new StepResponse({ uploads }, { uploads })
    },
    async (compensateData, ctx) => {
        // Rollback: deletar arquivos upados
        if (!compensateData?.uploads) return

        const fileModule = ctx.container.resolve(Modules.FILE)

        for (const upload of compensateData.uploads) {
            try {
                await fileModule.delete(upload.url)
            } catch (error) {
                console.error(`Failed to delete file ${upload.url} during rollback:`, error)
            }
        }
    }
)

/**
 * Step 2: Anexar imagens ao produto
 */
const attachStep = createStep<
    { product_id: string; variant_id?: string; uploads: Array<{ url: string; alt?: string }> },
    AttachResult
>(
    "attach-images",
    async (input, ctx) => {
        const productModule = ctx.container.resolve(Modules.PRODUCT)

        const images = input.uploads.map((u, i) => ({
            url: u.url,
            metadata: { alt: u.alt },
            rank: i,
        }))

        // Buscar produto atual para preservar imagens existentes
        const product = await productModule.retrieveProduct(input.product_id, {
            relations: ["images"],
        })

        const existingImages = product.images ?? []
        const allImages = [...existingImages, ...images]

        // Atualizar produto com novas imagens
        await productModule.updateProducts(input.product_id, {
            images: allImages,
        })

        return new StepResponse(
            { image_ids: images.map((img) => img.url) },
            { product_id: input.product_id, image_urls: images.map((img) => img.url) }
        )
    },
    async (compensateData, ctx) => {
        // Rollback: remover imagens anexadas
        if (!compensateData) return

        const productModule = ctx.container.resolve(Modules.PRODUCT)

        try {
            const product = await productModule.retrieveProduct(compensateData.product_id, {
                relations: ["images"],
            })

            const remainingImages = (product.images ?? []).filter(
                (img) => !compensateData.image_urls.includes(img.url)
            )

            await productModule.updateProducts(compensateData.product_id, {
                images: remainingImages,
            })
        } catch (error) {
            console.error(`Failed to remove images during rollback:`, error)
        }
    }
)

/**
 * Workflow completo: upload + attach
 */
export const uploadAndAttachImageWorkflow = createWorkflow(
    "upload-and-attach-image",
    (input: WorkflowInput) => {
        const { uploads } = uploadStep(input)
        const out = attachStep({
            product_id: input.product_id,
            variant_id: input.variant_id,
            uploads,
        })
        return new WorkflowResponse(out)
    }
)
