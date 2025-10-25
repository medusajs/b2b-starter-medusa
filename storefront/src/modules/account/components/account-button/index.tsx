"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import User from "@/modules/common/icons/user"
import { B2BCustomer } from "@/types/global"

export default function AccountButton({
  customer,
}: {
  customer: B2BCustomer | null
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  if (!customer) {
    return (
      <LocalizedClientLink className="hover:text-ui-fg-base" href="/account/login">
        <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
          <User />
          <span className="hidden small:inline-block">Entrar</span>
        </button>
      </LocalizedClientLink>
    )
  }

  return (
    <div className="relative">
      <button
        className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : "false"}
      >
        <User />
        <span className="hidden small:inline-block">
          Olá, {customer.first_name}
        </span>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <LocalizedClientLink href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsOpen(false)}>
            Dashboard
          </LocalizedClientLink>
          <LocalizedClientLink href="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsOpen(false)}>
            Pedidos
          </LocalizedClientLink>
          <LocalizedClientLink href="/account/quotes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsOpen(false)}>
            Cotações
          </LocalizedClientLink>
          <LocalizedClientLink href="/account/approvals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" onClick={() => setIsOpen(false)}>
            Aprovações
          </LocalizedClientLink>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            role="menuitem"
            onClick={() => {
              // Handle logout
              setIsOpen(false)
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
