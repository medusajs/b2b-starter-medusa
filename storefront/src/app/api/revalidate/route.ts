import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
    try {
        const { secret, paths, tags } = await request.json()

        // Verificar secret para segurança
        if (secret !== process.env.REVALIDATE_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Revalidar paths específicos
        if (paths && Array.isArray(paths)) {
            paths.forEach((path: string) => {
                revalidatePath(path)
            })
        }

        // Revalidar tags específicas
        if (tags && Array.isArray(tags)) {
            tags.forEach((tag: string) => {
                revalidateTag(tag)
            })
        }

        // Revalidar tudo se nenhum parâmetro específico
        if (!paths && !tags) {
            revalidatePath('/', 'layout')
        }

        return NextResponse.json({
            success: true,
            message: 'Cache revalidated successfully',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Revalidation error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}