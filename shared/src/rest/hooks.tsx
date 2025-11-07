import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasApi } from "./canvas";
import { StudentITSApi } from "./studentits";
import { LadokApi, LadokRegisterBody } from "./ladok";
import { EpokApi } from "./epok";
import type { Assignment, RosterItem, EpokModule, RosterRow } from "./schema";

// Grades you allow in UI (reusable)
export const GRADE_OPTIONS = ["U","G","VG"] as const;

/** 🔹 Epok: moduler för en kurskod */
export function useEpokModules(kurskod: string, onlyActive: boolean = true) {
  const [modules, setModules] = useState<EpokModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!kurskod) { setModules([]); return; }
    setLoading(true); setError(null);
    try {
      const data = await EpokApi.listModules(kurskod, onlyActive);
      setModules(data);
    } catch (e: any) {
      setError(e.message || "Kunde inte hämta Epok-moduler");
    } finally {
      setLoading(false);
    }
  }, [kurskod, onlyActive]);

  useEffect(() => { reload(); }, [reload]);

  const modulesByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const mod of modules) m.set(mod.modulkod, mod.namn);
    return m;
  }, [modules]);

  return { modules, modulesByCode, loading, error, reload };
}

/** Assignments for a course code (Canvas) */
export function useAssignments(kurskod: string) {
  const [data, setData] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!kurskod) { setData([]); return; }
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
    if (!kurskod || !assignmentId) { setRows(null); return; }
    setLoading(true); setError(null);

    try {
      const roster = await CanvasApi.listRosterWithGrades(kurskod, assignmentId);

      // fetch personnummer in parallel
      const pairs = await Promise.all(
        roster.map(async r => {
          try {
            const dto = await StudentITSApi.getPersonnummer(r.studentId);
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
