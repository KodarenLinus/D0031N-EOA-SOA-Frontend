import { jsonFetch, getApiBase } from "./fetch";
import type { Assignment, RosterItem } from "./schema";
/**
 * Canvas REST-klient (matchar våra Spring controllers)
 */
const API = () => getApiBase();

export const CanvasApi = {
  listRoster: (kurskod: string) =>
    jsonFetch<RosterItem[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/roster`
    ),
};
