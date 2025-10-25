"use client"

import { ReactNode } from "react"
import PostHogScript from "./PostHogScript"

export function AnalyticsProvider({ children }: { children: ReactNode }) {
    return (
        <>
            <PostHogScript />
            {children}
        </>
    )
}
