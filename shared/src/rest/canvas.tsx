import { jsonFetch, getApiBase } from "./fetch";
import type { CanvasRosterItem } from "./schema";
/**
 * Canvas REST-klient (matchar våra Spring controllers)
 */
const API = () => getApiBase();
const CANVAS_BASE = `${API()}/canvas`;

export const CanvasApi = {
  listRoster: (kurskod: string) =>
    jsonFetch<CanvasRosterItem[]>(
      `${CANVAS_BASE}/courses/${encodeURIComponent(kurskod)}/roster`
    ),
};
