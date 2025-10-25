export function clx(...args: Array<string | undefined | null | false | Record<string, boolean>>) {
  const out: string[] = []
  for (const a of args) {
    if (!a) continue
    if (typeof a === "string") out.push(a)
    else if (typeof a === "object") {
      for (const [k, v] of Object.entries(a)) if (v) out.push(k)
    }
  }
  return out.join(" ")
}

