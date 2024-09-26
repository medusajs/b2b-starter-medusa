import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={GeistSans.variable}>
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
