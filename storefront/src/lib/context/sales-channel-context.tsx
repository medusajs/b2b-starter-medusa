"use client"

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react"

export type CustomerGroup =
    | "residencial-b1"
    | "rural-b2"
    | "comercial-b3"
    | "condominios"
    | "integradores"
    | "industria"

export type SalesChannel = "ysh-b2b" | "ysh-b2c"

interface SalesChannelContextType {
    channel: SalesChannel
    customerGroup: CustomerGroup | null
    setChannel: (channel: SalesChannel) => void
    setCustomerGroup: (group: CustomerGroup | null) => void
    isB2B: boolean
    isB2C: boolean
    canAccessBulkOrder: boolean
    canAccessQuotes: boolean
    canAccessApprovals: boolean
    priceListId: string | null
}

const SalesChannelContext = createContext<SalesChannelContextType | undefined>(undefined)

interface SalesChannelProviderProps {
    children: ReactNode
    initialChannel?: SalesChannel
    initialCustomerGroup?: CustomerGroup | null
}

export function SalesChannelProvider({
    children,
    initialChannel = "ysh-b2c",
    initialCustomerGroup = null
}: SalesChannelProviderProps) {
    const [channel, setChannel] = useState<SalesChannel>(initialChannel)
    const [customerGroup, setCustomerGroup] = useState<CustomerGroup | null>(initialCustomerGroup)

    const isB2B = channel === "ysh-b2b"
    const isB2C = channel === "ysh-b2c"

    // Recursos habilitados por canal/grupo
    const canAccessBulkOrder = isB2B && customerGroup !== "residencial-b1"
    const canAccessQuotes = isB2B || (isB2C && customerGroup !== null)
    const canAccessApprovals = isB2B && customerGroup !== null

    // Determinar Price List aplicável
    const getPriceListId = (): string | null => {
        if (!customerGroup) return null

        const priceListMap: Record<CustomerGroup, string> = {
            "residencial-b1": "residencial-promo",
            "rural-b2": "b2b-pme-patamar1",
            "comercial-b3": "b2b-pme-patamar1",
            "condominios": "b2b-pme-patamar1",
            "integradores": "b2b-integradores-2025q4",
            "industria": "b2b-enterprise-custom",
        }

        return priceListMap[customerGroup] || null
    }

    const priceListId = getPriceListId()

    return (
        <SalesChannelContext.Provider
            value={{
                channel,
                customerGroup,
                setChannel,
                setCustomerGroup,
                isB2B,
                isB2C,
                canAccessBulkOrder,
                canAccessQuotes,
                canAccessApprovals,
                priceListId,
            }}
        >
            {children}
        </SalesChannelContext.Provider>
    )
}

export function useSalesChannel() {
    const context = useContext(SalesChannelContext)
    if (!context) {
        throw new Error("useSalesChannel must be used within SalesChannelProvider")
    }
    return context
}
