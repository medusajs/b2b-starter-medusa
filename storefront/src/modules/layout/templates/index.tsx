import React from "react"

import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div>
      <NavigationHeader />
      <main className="relative">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
