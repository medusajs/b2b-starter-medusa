import Bancontact from "@/modules/common/icons/bancontact"
import FilePlus from "@/modules/common/icons/file-plus"
import Ideal from "@/modules/common/icons/ideal"
import PayPal from "@/modules/common/icons/paypal"
import { CreditCard } from "@medusajs/icons"
import React from "react"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  // Stripe removido temporariamente para evitar conflitos de dependência
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "Pagar por fatura",
    icon: <FilePlus />,
  },
  // Add more payment providers here
}

// Stripe removido temporariamente
export const isStripe = (providerId?: string) => {
  return providerId?.startsWith("pp_stripe")
}
export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

export const currencySymbolMap: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cad: "C$",
  aud: "A$",
  jpy: "¥",
  cny: "¥",
  chf: "CHF",
  hkd: "HK$",
  nzd: "NZ$",
  sek: "kr",
  krw: "₩",
  sgd: "S$",
  nok: "kr",
  mxn: "$",
  inr: "₹",
  rub: "₽",
  zar: "R",
  try: "₺",
  brl: "R$",
  twd: "NT$",
  dkk: "kr",
  pln: "zł",
  thb: "฿",
  idr: "Rp",
  huf: "Ft",
  czk: "Kč",
  ils: "₪",
  clp: "$",
  php: "₱",
  aed: "د.إ",
  cop: "$",
  sar: "﷼",
  myr: "RM",
  ron: "lei",
  vnd: "₫",
  egp: "£",
  pkr: "₨",
  ngn: "₦",
  bdt: "৳",
  uah: "₴",
  kes: "KSh",
  ars: "$",
  qar: "﷼",
  kwd: "د.ك",
  omr: "﷼",
  bhd: "ب.د",
  lkr: "₨",
  mmk: "K",
  uzs: "лв",
}
