import { jsonFetch, getApiBase } from "./fetch";
import type { Assignment, RosterItem } from "./schema";
/**
 * Canvas REST-klient (matchar våra Spring controllers)
 */
const API = () => getApiBase();

export const CanvasApi = {
  listAssignments: (kurskod: string) =>
    jsonFetch<Assignment[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/assignments`
    ),

  listRosterWithGrades: (kurskod: string, assignmentId: number) =>
    jsonFetch<RosterItem[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/roster?assignmentId=${assignmentId}`
    ),
};
