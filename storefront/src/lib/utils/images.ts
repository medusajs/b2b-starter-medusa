/**
 * Utilitários para construção de URLs de imagens otimizadas
 * Suporta transformações via query params (width, quality, format)
 */

export interface ImageOptions {
    w?: number // largura
    h?: number // altura
    q?: number // qualidade (1-100)
    fm?: "webp" | "avif" | "jpeg" | "png" // formato
    fit?: "contain" | "cover" | "fill" | "inside" | "outside"
}

/**
 * Constrói URL de imagem com transformações
 * Compatível com Next/Image e serviços de CDN
 */
export const buildImageUrl = (src: string, opts?: ImageOptions): string => {
    if (!src) return ""

    try {
        const url = new URL(src)

        if (opts?.w) url.searchParams.set("w", String(opts.w))
        if (opts?.h) url.searchParams.set("h", String(opts.h))
        if (opts?.q) url.searchParams.set("q", String(opts.q))
        if (opts?.fm) url.searchParams.set("fm", opts.fm)
        if (opts?.fit) url.searchParams.set("fit", opts.fit)

        return url.toString()
    } catch {
        // Se não for URL válida, retornar como está
        return src
    }
}

/**
 * Gera srcSet para imagens responsivas
 */
export const buildSrcSet = (
    src: string,
    widths: number[] = [320, 640, 768, 1024, 1280, 1536],
    format?: "webp" | "avif"
): string => {
    return widths
        .map((w) => `${buildImageUrl(src, { w, fm: format })} ${w}w`)
        .join(", ")
}

/**
 * Gera conjunto de sources para <picture>
 */
export const buildPictureSources = (
    src: string,
    widths: number[] = [320, 640, 768, 1024, 1280, 1536]
) => {
    return [
        {
            type: "image/avif",
            srcSet: buildSrcSet(src, widths, "avif"),
        },
        {
            type: "image/webp",
            srcSet: buildSrcSet(src, widths, "webp"),
        },
    ]
}

/**
 * Valida se URL é de imagem válida
 */
export const isValidImageUrl = (url: string): boolean => {
    if (!url) return false
    try {
        const parsed = new URL(url)
        return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(parsed.pathname)
    } catch {
        return false
    }
}

/**
 * Extrai dimensões de imagem via atributos HTML ou URL
 */
export const extractImageDimensions = (
    url: string
): { width?: number; height?: number } => {
    try {
        const parsed = new URL(url)
        const w = parsed.searchParams.get("w")
        const h = parsed.searchParams.get("h")

        return {
            width: w ? parseInt(w, 10) : undefined,
            height: h ? parseInt(h, 10) : undefined,
        }
    } catch {
        return {}
    }
}

/**
 * Thumbnail presets comuns
 */
export const thumbnailPresets = {
    xs: { w: 64, h: 64, fm: "webp" as const, fit: "cover" as const },
    sm: { w: 128, h: 128, fm: "webp" as const, fit: "cover" as const },
    md: { w: 256, h: 256, fm: "webp" as const, fit: "cover" as const },
    lg: { w: 512, h: 512, fm: "webp" as const, fit: "cover" as const },
    xl: { w: 1024, h: 1024, fm: "webp" as const, fit: "cover" as const },
} as const

/**
 * Gera URL de thumbnail com preset
 */
export const buildThumbnail = (
    src: string,
    size: keyof typeof thumbnailPresets = "md"
): string => {
    return buildImageUrl(src, thumbnailPresets[size])
}

/**
 * Placeholder blur data URL (base64)
 */
export const placeholderDataUrl =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiLz48L3N2Zz4="
