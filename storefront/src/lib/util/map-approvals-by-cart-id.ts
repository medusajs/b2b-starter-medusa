import { QueryApproval } from "@/types/approval"

export const mapApprovalsByCartId = (approvals: QueryApproval[]) => {
  const map = new Map<string, QueryApproval[]>()

  approvals.forEach((a) => {
    if (map.has(a.cart_id)) {
      map.get(a.cart_id)?.push(a)
    } else {
      map.set(a.cart_id, [a])
    }
  })

  return map
}
