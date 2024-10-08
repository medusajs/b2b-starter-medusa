"use client"

import { useQuote, useQuotePreview } from "@lib/hooks/api/quotes"
import { notFound } from "next/navigation"
import { GeneralQuoteType } from "types/global"
import QuoteDetails from "../../components/quote-details"

type Props = {
  params: { id: string }
  quote: GeneralQuoteType
}

export default function QuoteDetailsPage({ params }: Props) {
  const { quote, isLoading } = useQuote(params.id)
  const { preview: quotePreview, isLoading: isPreviewLoading } =
    useQuotePreview(params.id)

  if (isLoading || isPreviewLoading) {
    return <></>
  }

  if (!quote || !quotePreview) {
    notFound()
  }

  return <QuoteDetails quote={quote} preview={quotePreview} />
}
