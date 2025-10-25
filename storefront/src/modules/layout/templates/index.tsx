import React from "react"

import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"

const Layout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <>
      <NavigationHeader />
      {children}
      <Footer />
    </>
  )
}

export default Layout
