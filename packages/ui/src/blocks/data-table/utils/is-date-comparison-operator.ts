import { DataTableDateComparisonOperator } from "../types";

export function isDateComparisonOperator(
  value: unknown
): value is DataTableDateComparisonOperator {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const validOperators = ["$gte", "$lte", "$gt", "$lt"]
  const hasAtLeastOneOperator = validOperators.some((op) => op in value)
  
  const allPropertiesValid = Object.entries(value as Record<string, unknown>)
    .every(([key, val]) => 
      validOperators.includes(key) && (typeof val === "string" || val === undefined)
    )

  return hasAtLeastOneOperator && allPropertiesValid
}
