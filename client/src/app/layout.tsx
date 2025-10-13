import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
    title: "YSH - Yello Solar Hub",
    description: "Plataforma B2B para Energia Solar",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    )
}
