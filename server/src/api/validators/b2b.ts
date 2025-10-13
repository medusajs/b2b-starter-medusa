export function isValidCNPJ(value: string): boolean {
  const onlyDigits = (value || "").replace(/\D/g, "");
  return onlyDigits.length === 14; // scaffold: validação simples
}

export function parsePagination(query: Record<string, any>) {
  const limit = Math.max(1, Math.min(100, Number(query.limit ?? 20)));
  const offset = Math.max(0, Number(query.offset ?? 0));
  const fields = (query.fields as string | undefined)?.split(",").filter(Boolean);
  return { limit, offset, fields } as const;
}

export function requiredString(val: any, label: string) {
  if (!val || typeof val !== "string") {
    throw new Error(`${label} is required`);
  }
  return val;
}

