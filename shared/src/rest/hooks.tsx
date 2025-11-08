import { useCallback, useEffect, useMemo, useState } from "react";
import { CanvasApi } from "./canvas";
import { StudentITSApi } from "./studentits";
import { LadokApi } from "./ladok";
import { EpokApi } from "./epok";
import type {
  EpokModule,
  RosterRow,
  LadokResultRequestDto,
  LadokRosterItemDto,
} from "./schema";

// Grades you allow in UI (reusable)
export const GRADE_OPTIONS = ["U", "G", "VG"] as const;

/**
 * Epok modules for a course code (Epok)
 */
export function useEpokModules(kurskod: string, onlyActive: boolean = true) {
  const [modules, setModules] = useState<EpokModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!kurskod) {
      setModules([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await EpokApi.listModules(kurskod, onlyActive);
      setModules(data);
    } catch (e: any) {
      setError(e.message || "Kunde inte hämta Epok-moduler");
    } finally {
      setLoading(false);
    }
  }, [kurskod, onlyActive]);

  useEffect(() => {
    reload();
  }, [reload]);

  const modulesByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const mod of modules) m.set(mod.modulkod, mod.namn);
    return m;
  }, [modules]);

  return { modules, modulesByCode, loading, error, reload };
}

/**
 * Roster (från Ladok) + ev. enrich från Canvas/StudentITS.
 * Returnerar UI-klara rader inkl. sent/ladokStatus.
 */
export function useRoster(kurskod: string, modulkod: string) {
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!kurskod || !modulkod) {
      setRows(null);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1) Ladok-roster med sent/ladokStatus/ev. betyg/registeredAt
      const ladokRoster = await LadokApi.getRoster(kurskod, modulkod);

      // 2) Canvas roster för namn/studentId om du vill snygga till visningen
      let canvasByPnr = new Map<string, string>();
      try {
        const canvas = await CanvasApi.listRoster(kurskod); // [{studentId, name, personnummer?}]
        canvasByPnr = new Map(
          canvas
            .filter((c: any) => !!c.personnummer && !!c.name)
            .map((c: any) => [c.personnummer as string, c.name as string])
        );
      } catch {
        // frivilligt – om Canvas inte finns, skippa
      }

      const today = new Date().toISOString().slice(0, 10);

      const table: RosterRow[] = (ladokRoster as LadokRosterItemDto[]).map((dto) => {
        const fullName =
          canvasByPnr.get(dto.personnummer ?? "") ||
          [dto.fornamn, dto.efternamn].filter(Boolean).join(" ").trim() ||
          dto.personnummer ||
          "";

        const sent =
          !!(dto as any).sent ||
          dto.ladokStatus?.toLowerCase() === "registrerad" ||
          Boolean(dto.registeredAt);

        return {
          studentId: dto.personnummer ?? dto.kurstillfalleId.toString(),
          name: fullName,
          personnummer: dto.personnummer ?? null,
          datum: dto.registeredAt ? dto.registeredAt.slice(0, 10) : today,
          ladokBetygPreselect: dto.ladokBetyg ?? null,
          selected: !!dto.personnummer && !sent, // välj bara icke-skickade per default
          sent,
          ladokStatus: dto.ladokStatus ?? null,
          registeredAt: dto.registeredAt ?? null,
        } as RosterRow;
      });

      setRows(table);
    } catch (e: any) {
      setError(e.message || "Kunde inte hämta roster");
    } finally {
      setLoading(false);
    }
  }, [kurskod, modulkod]);

  useEffect(() => {
    reload();
  }, [reload]);

  // local row mutators (stable fns)
  const toggleRow = useCallback(
    (studentId: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId ? { ...r, selected: !r.selected } : r
        ) ?? prev
      ),
    []
  );

  const setGrade = useCallback(
    (studentId: string, grade: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId ? { ...r, ladokBetygPreselect: grade } : r
        ) ?? prev
      ),
    []
  );

  const setDate = useCallback(
    (studentId: string, date: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId ? { ...r, datum: date } : r
        ) ?? prev
      ),
    []
  );

  return { rows, loading, error, reload, toggleRow, setGrade, setDate, setRows };
}

/**
 * Bulk register – anropar LadokApi.postResult för varje payload.
 * Returnerar summering (ok/fail) och meddelande.
 */
export function useBulkRegister() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const register = useCallback(async (payloads: LadokResultRequestDto[]) => {
    setBusy(true);
    setMessage(null);
    let ok = 0,
      fail = 0;

    for (const body of payloads) {
      try {
        const res = await LadokApi.postResult(body);
        if (
          res.status.toLowerCase() === "registrerad" ||
          /redan/i.test(res.message)
        ) {
          ok++;
        } else {
          fail++;
        }
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

/**
 * Konverterar UI-rader till Ladok-payloads (skickar inte redan skickade).
 */
export function rowsToLadokPayloads(
  rows: RosterRow[],
  kurskod: string,
  modulkod: string
): LadokResultRequestDto[] {
  return rows
    .filter(
      (r) => r.selected && !!r.personnummer && !!r.ladokBetygPreselect && !r.sent
    )
    .map((r) => ({
      personnummer: r.personnummer!,
      kurskod,
      modulkod,
      datum: r.datum,
      betyg: r.ladokBetygPreselect!,
    }));
}
