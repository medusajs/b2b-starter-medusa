"use client"

import { useMemo, useState } from "react"
import { Container, Heading, Text } from "@medusajs/ui"
import Button from "@/modules/common/components/button"

type Step = {
  id: string
  label: string
  description?: string
  required?: boolean
}

const STEPS: Step[] = [
  { id: "cep", label: "Informar CEP", required: true },
  { id: "consumo", label: "Consumo médio (kWh/mês)", required: true },
  { id: "telhado", label: "Tipo/Inclinação/Orientação do telhado" },
  { id: "fase", label: "Fase/Tensão" },
  { id: "objetivo", label: "Objetivo (Economia/Investimento/Backup)" },
  { id: "tarifa", label: "Validar TE/TUSD (ANEEL)" },
  { id: "proposta", label: "Gerar proposta + ROI" },
]

export default function ChecklistOnboarding({
  onComplete,
}: {
  onComplete?: (data: Record<string, boolean>) => void
}) {
  const [checks, setChecks] = useState<Record<string, boolean>>({})

  const doneCount = useMemo(
    () => Object.values(checks).filter(Boolean).length,
    [checks]
  )
  const progress = Math.round((doneCount / STEPS.length) * 100)

  const toggle = (id: string) => setChecks((p) => ({ ...p, [id]: !p[id] }))

  const missingRequired = useMemo(
    () => STEPS.filter((s) => s.required).some((s) => !checks[s.id]),
    [checks]
  )

  return (
    <Container className="rounded-2xl p-4 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Heading level="h2" className="text-lg">Onboarding Solar — Passo a passo</Heading>
        <Text className="txt-compact-small">{progress}% concluído</Text>
      </div>
      <div className="relative w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="space-y-2">
        {STEPS.map((s) => (
          <label
            key={s.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={!!checks[s.id]}
              onChange={() => toggle(s.id)}
              className="mt-1 w-4 h-4 accent-amber-500"
            />
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-50">
                {s.label}
                {s.required && <span className="text-amber-600"> *</span>}
              </div>
              {s.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.description}</p>
              )}
            </div>
          </label>
        ))}
        <div className="flex items-center gap-3 pt-2">
          <Button
            className="rounded-full"
            onClick={() => onComplete?.(checks)}
            disabled={missingRequired}
          >
            Continuar para simulação
          </Button>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Campos com * são obrigatórios.
          </span>
        </div>
      </div>
    </Container>
  )
}

