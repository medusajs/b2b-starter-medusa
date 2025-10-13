// Legacy adapter for Company operations. Replace internals by calling existing services.

export type Company = { id: string; name: string; cnpj: string; metadata?: Record<string, any> };

export async function listCompanies(_opts: {
  limit: number;
  offset: number;
  fields?: string[];
}): Promise<{ companies: Company[]; count: number }> {
  // TODO: call legacy service + map to v2 shape
  return { companies: [], count: 0 };
}

export async function getCompany(id: string): Promise<Company | null> {
  // TODO: call legacy service
  return null;
}

export async function createCompany(input: { name: string; cnpj: string }): Promise<Company> {
  // TODO: call legacy create
  return { id: "comp_" + Date.now(), ...input };
}

export async function updateCompany(id: string, patch: Partial<Company>): Promise<Company> {
  // TODO: call legacy update
  return { id, name: patch.name || "", cnpj: patch.cnpj || "" };
}

export async function deleteCompany(id: string): Promise<{ id: string; deleted: boolean }> {
  // TODO: call legacy delete
  return { id, deleted: true };
}

