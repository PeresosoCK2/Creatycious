const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) }
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => ({}));
}
