const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}) as T);
}
