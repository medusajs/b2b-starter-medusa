import { Metadata } from "next"
import { redirect } from "next/navigation"

export const dynamicParams = true

export const metadata: Metadata = {
  title: "Medusa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 14 and Medusa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  return redirect("/store")
}
