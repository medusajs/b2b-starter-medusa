import { Metadata } from \"next\"
import { NavigationHeader } from \"@/modules/layout/templates/nav\"
import Footer from \"@/modules/layout/templates/footer\"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://yellosolarhub.com'),
}

export default function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { countryCode: string }
}) {
  return (
    <div className=\"flex flex-col min-h-screen\">
      <NavigationHeader />
      <main id=\"main-content\" className=\"flex-1\">
        {children}
      </main>
      <Footer />
    </div>
  )
}
