"use client"

import dynamic from "next/dynamic"

const DimensionamentoClient = dynamic(
    () => import("@/modules/onboarding/components/DimensionamentoClient"),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando calculadora...</p>
                </div>
            </div>
        ),
    }
)

export default function DimensionamentoWrapper() {
    return <DimensionamentoClient />
}
