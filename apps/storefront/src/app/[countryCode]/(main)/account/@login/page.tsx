import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { listRegions } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Medusa Store account.",
}

export default async function Login() {
  const regions = await listRegions()

  return <LoginTemplate regions={regions} />
}
