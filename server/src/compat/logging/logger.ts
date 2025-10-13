export function getRequestId(headers: Record<string, any>): string {
  return (headers["x-request-id"] as string) || `req_${Date.now()}`;
}

export function maskPIIEmail(email?: string) {
  if (!email) return email;
  const [u, d] = email.split("@");
  if (!d) return email;
  return `${u[0]}***@${d}`;
}

export function logRequest(ctx: { route: string; method: string; request_id: string; extra?: any }) {
  const { route, method, request_id, extra } = ctx;
  console.log(`[${method}] ${route} request_id=${request_id}`, extra ? { extra } : "");
}

