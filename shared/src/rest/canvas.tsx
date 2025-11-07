import { jsonFetch, getApiBase } from "./fetch";
import type { Assignment, RosterItem } from "./schema";

const API = () => getApiBase();

/**
 * Canvas REST-klient (matchar våra Spring controllers)
 */
export const CanvasApi = {
  /** Hämta assignments för kurs */
  listAssignments: (kurskod: string) =>
    jsonFetch<Assignment[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/assignments`
    ),

  /** Hämta roster + eventuella betyg för ett assignment i kursen */
  listRosterWithGrades: (kurskod: string, assignmentId: number) =>
    jsonFetch<RosterItem[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/roster?assignmentId=${assignmentId}`
    ),
};
