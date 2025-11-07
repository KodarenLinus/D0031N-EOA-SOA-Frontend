export const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080");

export async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg += `: ${text}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}