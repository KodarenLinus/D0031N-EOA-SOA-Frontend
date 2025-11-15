// Create API base URL for fetch calls
export const getApiBase = () => ("http://localhost:8080");

export async function jsonFetch<T>(
  url: string, 
  init: RequestInit = {}
): Promise<T> {

  // Set up headers
  const headers =
    init.headers instanceof Headers
      ? Object.fromEntries(init.headers.entries())
      : (init.headers as Record<string, string> | undefined) ?? {};

  // Content-Type header for non-FormData bodies
  if (init.body) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json; charset=utf-8";
  }

  // Fetch the resource
  const res = await fetch(
      url, { 
      ...init, 
      headers, 
      cache: 
      "no-store" 
    }
  );

  // Handle errors
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
