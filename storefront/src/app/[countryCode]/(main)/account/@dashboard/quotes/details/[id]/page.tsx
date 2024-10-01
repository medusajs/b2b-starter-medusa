import { retrieveQuote, retrieveQuotePreview } from "@lib/data/quotes"
import QuoteDetails from "@modules/quotes/components/quote-details"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { quote } = await retrieveQuote(params.id)

  if (!quote) {
    notFound()
  }

  return {
    title: `Order #${quote.draft_order?.display_id}`,
    description: `View your quote`,
  }
}

export default async function QuoteDetailsPage({ params }: Props) {
  const { quote } = await retrieveQuote(params.id)
  const { preview } = await retrieveQuotePreview(params.id)

  if (!quote || !preview) {
    notFound()
  }

  return <QuoteDetails quote={quote} preview={preview} />
}
