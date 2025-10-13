const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export async function fetcher(path: string, init?: RequestInit) {
    const res = await fetch(`${API}${path}`, init);
    if (!res.ok) {
        throw new Error(`API ${path} -> ${res.status}`);
    }
    return res.json();
}