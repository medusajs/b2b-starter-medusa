export type Approval = { id: string; status: "pending" | "approved" | "rejected" };

export async function listApprovals(_opts: { limit: number; offset: number; userToken: string }) {
  // TODO: call legacy
  return { approvals: [], count: 0 } as { approvals: Approval[]; count: number };
}

export async function approve(id: string, _userToken: string): Promise<Approval> {
  // TODO: call legacy
  return { id, status: "approved" };
}

export async function reject(id: string, _userToken: string): Promise<Approval> {
  // TODO: call legacy
  return { id, status: "rejected" };
}

export async function upsertSettings(input: any) {
  // TODO: call legacy admin settings storage
  return { id: "aps_" + Date.now(), ...input };
}

