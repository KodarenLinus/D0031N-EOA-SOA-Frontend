export const getApiBase = () =>
  ("http://localhost:8080");

function isFormLike(body: any) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

// Generic JSON fetcher
export async function jsonFetch<T>(url: string, init: RequestInit = {}): Promise<T> {

  // Set up headers
  const headers =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init.headers as Record<string, string> | undefined) ?? {};

  // Default headers
  headers["Accept"] = headers["Accept"] ?? "application/json";

  // Content-Type header for non-FormData bodies
  if (init.body && !isFormLike(init.body)) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json; charset=utf-8";
  }

  // Fetch the resource
  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  // Handle errors
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      if (text) msg += `: ${text}`;
    } catch {}
    throw new Error(msg);
  }

  // Handle no-content and parse JSON
  if (res.status === 204) return undefined as unknown as T;
  
  // Handle 404 specifically for clearer error
  if (res.status === 404) {
    console.warn("404 from:", url);
    throw Object.assign(new Error("Not Found"), { status: 404 });
  }
  return res.json() as Promise<T>;
}
