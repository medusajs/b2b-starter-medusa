"use client"

import { CheckCircleSolid, XMark } from "@medusajs/icons"
import { StoreCart, StorePrice } from "@medusajs/types"
import { Button, clx } from "@medusajs/ui"
import { formatAmount } from "@/modules/common/components/amount-cell"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"
import { useState } from "react"

export default function FreeShippingPriceNudge({
  variant = "inline",
  cart,
  freeShippingPrices,
}: {
  variant?: "popup" | "inline"
  cart: StoreCart
  freeShippingPrices: StoreFreeShippingPrice[]
}) {
  if (!cart || !freeShippingPrices?.length) {
    return
  }

  // For the starter, we are only going to focus on a singular shipping option
  const freeShippingPrice =
    freeShippingPrices[0] as unknown as StoreFreeShippingPrice

  if (!freeShippingPrice) {
    return
  }

  if (variant === "popup") {
    return <FreeShippingPopup cart={cart} price={freeShippingPrice} />
  } else {
    return <FreeShippingInline cart={cart} price={freeShippingPrice} />
  }
}

function FreeShippingInline({
  cart,
  price,
}: {
  cart: StoreCart
  price: StorePrice & {
    target_reached: boolean
    target_remaining: number
    remaining_percentage: number
  }
}) {
  return (
    <div className="bg-neutral-100 p-2 rounded-lg border">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-neutral-600">
          <div>
            {price.target_reached ? (
              <div className="flex items-center gap-1.5">
                <CheckCircleSolid className="text-green-500 inline-block" />{" "}
                Free Shipping unlocked!
              </div>
            ) : (
              `Unlock Free Shipping`
            )}
          </div>

          <div
            className={clx("visible", {
              "opacity-0 invisible": price.target_reached,
            })}
          >
            Only{" "}
            <span className="text-neutral-950">
              {formatAmount(price.target_remaining, cart.currency_code)}
            </span>{" "}
            away
          </div>
        </div>
        <div className="flex justify-between gap-1">
          <div
            className={clx(
              "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1 rounded-full max-w-full duration-500 ease-in-out",
              {
                "from-green-400 to-green-500": price.target_reached,
              }
            )}
            style={{ width: `${price.remaining_percentage}%` }}
          ></div>
          <div className="bg-neutral-300 h-1 rounded-full w-fit flex-grow"></div>
        </div>
      </div>
    </div>
  )
}

function FreeShippingPopup({
  cart,
  price,
}: {
  cart: StoreCart
  price: StorePrice & {
    target_reached: boolean
    target_remaining: number
    remaining_percentage: number
  }
}) {
  const [isClosed, setIsClosed] = useState(false)

  if (cart.items?.length === 0) {
    return
  }

  return (
    <div
      className={clx(
        "fixed bottom-5 right-5 flex flex-col items-end gap-2 transition-all duration-500 ease-in-out",
        {
          "opacity-0 invisible delay-1000": price.target_reached,
          "opacity-0 invisible": isClosed,
          "opacity-100 visible": !price.target_reached && !isClosed,
        }
      )}
    >
      <div>
        <Button
          className="rounded-full bg-neutral-900 shadow-none outline-none border-none text-[15px] p-2"
          onClick={() => setIsClosed(true)}
        >
          <XMark />
        </Button>
      </div>

      <div className="w-[400px] bg-black text-white p-6 rounded-lg ">
        <div className="pb-4">
          <div className="space-y-3">
            <div className="flex justify-between text-[15px] text-neutral-400">
              <div>
                {price.target_reached ? (
                  <div className="flex items-center gap-1.5">
                    <CheckCircleSolid className="text-green-500 inline-block" />{" "}
                    Free Shipping unlocked!
                  </div>
                ) : (
                  `Unlock Free Shipping`
                )}
              </div>

              <div
                className={clx("visible", {
                  "opacity-0 invisible": price.target_reached,
                })}
              >
                Only{" "}
                <span className="text-white">
                  {formatAmount(price.target_remaining, cart.currency_code)}
                </span>{" "}
                away
              </div>
            </div>
            <div className="flex justify-between gap-1">
              <div
                className={clx(
                  "bg-gradient-to-r from-zinc-400 to-zinc-500 h-1.5 rounded-full max-w-full duration-500 ease-in-out",
                  {
                    "from-green-400 to-green-500": price.target_reached,
                  }
                )}
                style={{ width: `${price.remaining_percentage}%` }}
              ></div>
              <div className="bg-zinc-600 h-1.5 rounded-full w-fit flex-grow"></div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <LocalizedClientLink
            className="rounded-2xl bg-transparent shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4"
            href="/cart"
          >
            View cart
          </LocalizedClientLink>

          <LocalizedClientLink
            className="flex-grow rounded-2xl bg-white text-neutral-950 shadow-none outline-none border-[1px] border-white text-[15px] py-2.5 px-4 text-center"
            href="/store"
          >
            View Products
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
