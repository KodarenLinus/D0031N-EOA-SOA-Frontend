import { jsonFetch, getApiBase } from "./fetch";
import type { Assignment, RosterItem } from "./schema";

const API = () => getApiBase();

export const CanvasApi = {
  listAssignments: (kurskod: string) =>
    jsonFetch<Assignment[]>(`${API()}/canvas/courses/${encodeURIComponent(kurskod)}/assignments`),

  listRosterWithGrades: (kurskod: string, assignmentId: number) =>
    jsonFetch<RosterItem[]>(
      `${API()}/canvas/courses/${encodeURIComponent(kurskod)}/roster?assignmentId=${assignmentId}`
    ),

  getPersonnummer: (studentId: string) =>
    jsonFetch<{ username: string; personnummer: string }>(
      `${API()}/studentits/users/${encodeURIComponent(studentId)}/personnummer`
    ),
};
