"use client"

import React from "react"

export type ChecklistItem = {
  id: string
  label: string
  done?: boolean
  hint?: string
}

export function Checklist(props: {
  title?: string
  items: ChecklistItem[]
  onToggle?: (id: string, next: boolean) => void
}) {
  const { title = "Onboarding", items, onToggle } = props
  return (
    <div className="rounded-2xl p-4 bg-[var(--surface)]/80 border border-[var(--border)] backdrop-blur-sm shadow-lg">
      <div className="mb-3 text-zinc-900 dark:text-zinc-50 font-medium">{title}</div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between rounded-xl px-3 py-2 bg-[var(--surface)]/70 border border-[var(--border)]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 accent-amber-500"
                checked={!!it.done}
                onChange={(e) => onToggle?.(it.id, e.target.checked)}
              />
              <span className="text-sm text-zinc-800 dark:text-zinc-200">{it.label}</span>
            </div>
            {it.hint && <span className="text-xs text-zinc-500 dark:text-zinc-400">{it.hint}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Checklist

