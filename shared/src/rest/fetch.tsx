/**
 * Rest utility functions
 */
export const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080");

function isFormLike(body: any) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

export async function jsonFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init.headers as Record<string, string> | undefined) ?? {};

  headers["Accept"] = headers["Accept"] ?? "application/json";

  if (init.body && !isFormLike(init.body)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json; charset=utf-8";
  }

  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg += `: ${text}`;
    } catch {}
    throw new Error(msg);
  }
  // 204 No Content etc.
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
