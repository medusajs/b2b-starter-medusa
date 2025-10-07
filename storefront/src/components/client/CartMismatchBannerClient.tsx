"use client"

import dynamic from "next/dynamic"
import React from "react"

const DynamicCartMismatchBanner = dynamic(
    () => import("@/modules/layout/components/cart-mismatch-banner"),
    {
        loading: () => null,
        ssr: false,
    }
)

export default function CartMismatchBannerClient(props: any) {
    return <DynamicCartMismatchBanner {...props} />
}
