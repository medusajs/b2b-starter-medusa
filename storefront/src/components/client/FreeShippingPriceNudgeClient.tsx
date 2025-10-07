"use client"

import dynamic from "next/dynamic"
import React from "react"

const DynamicFreeShippingPriceNudge = dynamic(
    () => import("@/modules/shipping/components/free-shipping-price-nudge"),
    {
        loading: () => null,
        ssr: false,
    }
)

export default function FreeShippingPriceNudgeClient(props: any) {
    return <DynamicFreeShippingPriceNudge {...props} />
}
