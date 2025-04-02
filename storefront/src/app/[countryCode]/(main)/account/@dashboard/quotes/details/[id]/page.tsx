import { fetchQuote, fetchQuotePreview } from "@/lib/data/quotes"
import { notFound } from "next/navigation"
import QuoteDetails from "../../components/quote-details"

type Props = {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function QuoteDetailsPage(props: Props) {
  const params = await props.params
  const { quote } = await fetchQuote(params.id, {})
  const {
    quote: { order_preview: quotePreview },
  } = await fetchQuotePreview(params.id, {})

  if (!quote || !quotePreview) {
    notFound()
  }

  return (
    <QuoteDetails
      quote={quote}
      preview={quotePreview}
      countryCode={params.countryCode}
    />
  )
}
