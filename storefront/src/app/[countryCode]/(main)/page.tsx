import { listRegions } from "@/lib/data/regions"
import FeaturedProducts from "@/modules/home/components/featured-products"
import Hero from "@/modules/home/components/hero"
import OnboardingCTA from "@/modules/home/components/onboarding-cta"
import SolutionsByClass from "@/modules/home/components/solutions-by-class"
import ModalidadesGrid from "@/modules/home/components/modalidades-grid"
import VideosStrip from "@/modules/home/components/videos-strip"
import VideosByClass from "@/modules/home/components/videos-by-class"
// import SolarStats from "@/modules/home/components/solar-stats"
import Testimonials from "@/modules/home/components/testimonials"
import DesignSystemTest from "@/components/DesignSystemTest"
import { Metadata } from "next"
import { Suspense } from "react"
import React from "react"

export const dynamicParams = true

export const metadata: Metadata = {
  title: "Yello Solar Hub - Energia Solar sob Medida | Kits Solares Completos",
  description:
    "Transforme sua conta de luz com soluções solares completas. Kits prontos, painéis de alta eficiência, inversores premium e dimensionamento personalizado. 713 produtos de 5 distribuidores certificados.",
  keywords:
    "energia solar, kits solares, painéis solares, inversores, dimensionamento solar, Yello Solar Hub, economia energia",
  openGraph: {
    title: "Yello Solar Hub - Energia Solar sob Medida",
    description:
      "Kits solares completos para máxima economia na sua conta de energia. Dimensionamento personalizado e instalação profissional.",
    type: "website",
  },
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )
  return countryCodes.map((countryCode) => ({ countryCode }))
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Yello Solar Hub',
            url: 'https://yellohub.com.br',
            logo: '/opengraph-image.jpg',
            sameAs: ['https://www.linkedin.com/company/yello-solar-hub'],
          }),
        }}
      />
      <Hero />
      <OnboardingCTA />
      <SolutionsByClass />
      <VideosByClass />
      <ModalidadesGrid />
      {/* <SolarStats /> */}
      <DesignSystemTest />
      <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse rounded-lg m-4"></div>}>
        <FeaturedProducts countryCode={countryCode} />
      </Suspense>
      <VideosStrip />
      <Testimonials />
      {/* WebSite schema with SearchAction (basic) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Yello Solar Hub',
            url: 'https://yellohub.com.br',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://yellohub.com.br/search?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          }),
        }}
      />
    </div>
  )
}
