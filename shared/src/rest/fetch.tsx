export const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080");

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
