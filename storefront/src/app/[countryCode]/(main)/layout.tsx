import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yellosolarhub.com'),
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Pular para o conteúdo principal
      </a>
      <main id="main-content">
        {children}
      </main>
    </>
  )
}
