"use client"

import { useEffect } from "react"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[PDP] Error:", error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4">
      <div className="max-w-md text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Erro ao carregar produto
        </h2>
        <p className="mt-2 text-gray-600">
          Não foi possível carregar as informações deste produto. 
          Por favor, tente novamente.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voltar para home
          </a>
        </div>
      </div>
    </div>
  )
}
