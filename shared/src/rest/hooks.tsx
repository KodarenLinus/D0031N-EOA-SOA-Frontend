import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasApi } from "./canvas";
import { LadokApi, LadokRegisterBody } from "./ladok";
import type { Assignment, RosterItem, RosterRow } from "./schema";

// Grades you allow in UI (reusable)
export const GRADE_OPTIONS = ["A","B","C","D","E","F","G","U"] as const;

/** Assignments for a course code */
export function useAssignments(kurskod: string) {
  const [data, setData] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await CanvasApi.listAssignments(kurskod);
      setData(res);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [kurskod]);

  useEffect(() => { reload(); }, [reload]);

  return { assignments: data, loading, error, reload };
}

/** Roster + personnummer enrichment, returns UI-ready rows */
export function useRoster(kurskod: string, assignmentId: number | null) {
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!assignmentId) { setRows(null); return; }
    setLoading(true); setError(null);

    try {
      const roster = await CanvasApi.listRosterWithGrades(kurskod, assignmentId);

      // fetch personnummer in parallel
      const pairs = await Promise.all(
        roster.map(async r => {
          try {
            const dto = await CanvasApi.getPersonnummer(r.studentId);
            return [r.studentId, dto.personnummer] as const;
          } catch {
            return [r.studentId, null] as const;
          }
        })
      );
      const pnrMap = new Map(pairs);
      const today = new Date().toISOString().slice(0,10);

      const table: RosterRow[] = roster.map(r => ({
        studentId: r.studentId,
        name: r.name || r.studentId,
        personnummer: pnrMap.get(r.studentId) ?? null,
        canvasOmdome: r.canvasGrade ?? null,
        datum: today,
        ladokBetygPreselect: r.canvasGrade ?? null,
        selected: !!pnrMap.get(r.studentId),
      }));

      setRows(table);
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  }, [kurskod, assignmentId]);

  // local row mutators (stable fns)
  const toggleRow = useCallback((studentId: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, selected: !r.selected } : r) ?? prev)
  , []);

  const setGrade = useCallback((studentId: string, grade: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, ladokBetygPreselect: grade } : r) ?? prev)
  , []);

  const setDate = useCallback((studentId: string, date: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, datum: date } : r) ?? prev)
  , []);

  return { rows, loading, error, reload, toggleRow, setGrade, setDate, setRows };
}

/** Bulk register (reusable anywhere) */
export function useBulkRegister() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const register = useCallback(async (payloads: LadokRegisterBody[]) => {
    setBusy(true); setMessage(null);
    let ok = 0, fail = 0;

    for (const body of payloads) {
      try {
        await LadokApi.registerResult(body);
        ok++;
      } catch {
        fail++;
      }
    }
    setBusy(false);
    setMessage(`Klar: ${ok} registrerade, ${fail} fel`);
    return { ok, fail };
  }, []);

  return { register, busy, message, setMessage };
}

/** Helper to assemble Ladok payloads from rows */
export function rowsToLadokPayloads(rows: RosterRow[], kurskod: string, modul: string) {
  return rows
    .filter(r => r.selected && r.personnummer && (r.ladokBetygPreselect || r.canvasOmdome))
    .map(r => ({
      personnummer: r.personnummer!,
      kurskod,
      modul,
      datum: r.datum,
      betyg: r.ladokBetygPreselect || r.canvasOmdome || "",
    }));
}
