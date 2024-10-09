import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your Medusa Store account.",
}

export default function Login() {
  return <LoginTemplate />
}
