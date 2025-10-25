import { NextRequest, NextResponse } from 'next/server'

// Cron job para limpeza de cache e manutenção
export async function GET(request: NextRequest) {
    try {
        // Verificar se é uma requisição autorizada (Vercel Cron)
        const authHeader = request.headers.get('authorization')
        const expectedAuth = `Bearer ${process.env.CRON_SECRET}`

        if (authHeader !== expectedAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Aqui você pode adicionar lógica de manutenção
        // Por exemplo: limpeza de cache, atualização de dados, etc.

        console.log('Cron job executed successfully at', new Date().toISOString())

        return NextResponse.json({
            success: true,
            message: 'Maintenance completed',
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}