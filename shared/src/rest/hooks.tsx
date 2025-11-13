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
  CanvasRosterResponse,
  RosterItem,
} from "./schema";

// Grades you allow in UI (reusable)
export const GRADE_OPTIONS = ["U", "G", "VG"] as const;

// Lokal "dagens datum" i YYYY-MM-DD (inte UTC-slice)
function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Epok modules for a course code (Epok)
 * @return modules, loading, error, reload
 */
export function useEpokModules(kurskod: string, onlyActive: boolean = true) {
  // State
  const [modules, setModules] = useState<EpokModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reload function
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

  // Effect to load on kurskod change
  useEffect(() => {
    reload();
  }, [reload]);

  // Memoized map of modules by code
  const modulesByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const mod of modules) m.set(mod.modulkod, mod.namn);
    return m;
  }, [modules]);

  return { modules, modulesByCode, loading, error, reload };
}

/**
 * Roster (Canvas -> StudentITS -> Ladok)
 * @return rows, loading, error, reload, toggleRow, setGrade, setDate, setRows
 */
export function useRoster(kurskod: string, modulkod: string) {
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reload function to fetch and build roster  
  const reload = useCallback(async () => {
    if (!kurskod || !modulkod) {
      setRows(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const canvasResp = (await CanvasApi.listRoster(kurskod)) as
        | CanvasRosterResponse
        | RosterItem[];

      // Normalize response
      const canvasRoster: RosterItem[] = Array.isArray(canvasResp)
        ? canvasResp
        : (canvasResp?.roster ?? []);

      // Clean Canvas data
      const cleanCanvas = canvasRoster
        .map((c) => ({
          studentId: String(c.studentId),
          name: String(c.name ?? "").trim(),
        }))
        .filter((c) => !!c.studentId && !!c.name);

      const studentIds = cleanCanvas.map((c) => c.studentId);

      // StudentITS – get personnummer
      let pnrByStudentId = new Map<string, string>();
      try {
        if (typeof (StudentITSApi as any).getPersonnummerBatch === "function") {
          const batch = await (StudentITSApi as any).getPersonnummerBatch(studentIds);
          pnrByStudentId = new Map(
            (batch as any[])
              .map((r) => {
                const key = r.studentId ?? r.stud_id ?? r.user_id ?? r.username ?? r.id ?? null;
                const pnr = r.personnummer ?? null;
                return key && pnr ? [String(key), String(pnr)] : null;
              })
              .filter(Boolean) as [string, string][]
          );
        } else {
          const pairs = await Promise.all(
            studentIds.map(async (studentId) => {
              try {
                const res = await StudentITSApi.getPersonnummer(studentId);
                return [studentId, res?.personnummer ?? null] as [string, string | null];
              } catch {
                return [studentId, null] as [string, null];
              }
            })
          );
          pnrByStudentId = new Map(pairs.filter(([, p]) => !!p) as [string, string][]);
        }
      } catch (e) {
        console.warn("StudentITS lookup failed", e);
      }

      // Ladok roster
      const ladokRoster = (await LadokApi.getRoster(
        kurskod,
        modulkod
      )) as LadokRosterItemDto[];

      // Map Ladok by personnummer
      const ladokByPnr = new Map<string, LadokRosterItemDto>();
      for (const dto of ladokRoster) {
        if (dto.personnummer) ladokByPnr.set(String(dto.personnummer), dto);
      }

      // Build table rows
      const table: RosterRow[] = cleanCanvas.map(({ studentId, name }) => {
        const personnummer = pnrByStudentId.get(studentId) ?? null;
        const ladok = personnummer ? ladokByPnr.get(personnummer) : undefined;

        return {
          studentId,
          name,
          personnummer,
          ladokBetygPreselect: ladok?.ladokBetyg ?? null,
          datum: ladok?.datum ?? todayISO(),
          selected: false,
          sent: ladok?.sent === true, // only true counts as sent
          ladokStatus: ladok?.ladokStatus ?? ladok?.registreringsStatus ?? null, // get latest status
          registeredAt: null,
        };
      });

      setRows(table);
    } catch (e: Error | any) {
      setError(e?.message || "Kunde inte hämta roster");
    } finally {
      setLoading(false);
    }
  }, [kurskod, modulkod]);

  // Effect to load on kurskod change
  useEffect(() => {
    reload();
  }, [reload]);

  // Helper to toggle row selection
  const toggleRow = useCallback(
    (studentId: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId ? { ...r, selected: !r.selected } : r
        ) ?? prev
      ),
    []
  );

  // Helper show grade in ladok if already sent
  const setGrade = useCallback(
    (studentId: string, grade: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId
            ? { ...r, ladokBetygPreselect: grade }
            : r
        ) ?? prev
      ),
    []
  );

  // Helper show date in ladok if already sent
  const setDate = useCallback(
    (studentId: string, date: string) =>
      setRows((prev) =>
        prev?.map((r) =>
          r.studentId === studentId ? { ...r, datum: date } : r
        ) ?? prev
      ),
    []
  );

  return { 
    rows, 
    loading, 
    error, 
    reload, 
    toggleRow, 
    setGrade, 
    setDate, 
    setRows 
  };
}

/**
 * Bulk register – calls LadokApi.postResult for every payload.
 * Returns summary (ok/fail) and message.
 * @returns register, busy, message, setMessage
 */
export function useBulkRegister() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Register function –  call LadokApi.postResult for each payload
  const register = useCallback(async (payloads: LadokResultRequestDto[]) => {
    setBusy(true);
    setMessage(null);
    let ok = 0,
      fail = 0;

    // Loop payloads and call LadokApi.postResult
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
    return { 
      ok, 
      fail 
    };
  }, []);

  // Return state and register function
  return { register, busy, message, setMessage };
}

/**
 * Converts UI-rows to Ladok-payloads (does not send already sent).
 * @return LadokResultRequestDto[]
 */
export function useRowsToLadokPayloads(
  rows: RosterRow[],
  kurskod: string,
  modulkod: string
): LadokResultRequestDto[] {
  // Filter and map to LadokResultRequestDto
  return rows
    .filter(
      (r) => r.selected && !!r.personnummer && !!r.ladokBetygPreselect && !r.sent
    ).map((r) => ({
      personnummer: r.personnummer!,
      kurskod,
      modulkod,
      datum: r.datum,
      betyg: r.ladokBetygPreselect!,
    }));
}
