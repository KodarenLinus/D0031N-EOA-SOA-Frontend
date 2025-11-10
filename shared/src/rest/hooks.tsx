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
 * - name, studentId: Canvas
 * - personnummer: StudentITS (via studentId)
 * - betyg/status/sent: Ladok (match via personnummer)
 * - sent = true endast om Ladok skickar true
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
      // 1️⃣ Canvas roster
      const canvasResp = (await CanvasApi.listRoster(kurskod)) as
        | CanvasRosterResponse
        | RosterItem[];

      const canvasRoster: RosterItem[] = Array.isArray(canvasResp)
        ? canvasResp
        : (canvasResp?.roster ?? []);

      const cleanCanvas = canvasRoster
        .map((c) => ({
          studentId: String(c.studentId),
          name: String(c.name ?? "").trim(),
        }))
        .filter((c) => !!c.studentId && !!c.name);

      const studentIds = cleanCanvas.map((c) => c.studentId);

      // 2️⃣ StudentITS – hämta personnummer
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

      // 3️⃣ Ladok roster
      const ladokRoster = (await LadokApi.getRoster(
        kurskod,
        modulkod
      )) as LadokRosterItemDto[];

      const ladokByPnr = new Map<string, LadokRosterItemDto>();
      for (const dto of ladokRoster) {
        if (dto.personnummer) ladokByPnr.set(String(dto.personnummer), dto);
      }

      // 4️⃣ Bygg UI-rader
      const today = todayISO();
      const table: RosterRow[] = cleanCanvas.map(({ studentId, name }) => {
        const personnummer = pnrByStudentId.get(studentId) ?? null;
        const ladok = personnummer ? ladokByPnr.get(personnummer) : undefined;

        const ladokStatus =
          ladok?.ladokStatus ?? ladok?.registreringsStatus ?? null;

        // ✅ sent endast true om Ladok skickar exakt true
        const sent = ladok?.sent === true;

        return {
          studentId,
          name,
          personnummer,
          datum: today,
          ladokBetygPreselect: ladok?.ladokBetyg ?? null,
          selected: false,
          sent,
          ladokStatus,
          registeredAt: null,
        };
      });

      setRows(table);
    } catch (e: any) {
      setError(e?.message || "Kunde inte hämta roster");
    } finally {
      setLoading(false);
    }
  }, [kurskod, modulkod]);

  useEffect(() => {
    reload();
  }, [reload]);

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
          r.studentId === studentId
            ? { ...r, ladokBetygPreselect: grade }
            : r
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
 * @returns register, busy, message, setMessage
 */
export function useBulkRegister() {
  // State
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
        // Call LadokApi.postResult
        const res = await LadokApi.postResult(body);
        if (
          // Success status
          res.status.toLowerCase() === "registrerad" ||
          /redan/i.test(res.message)
        ) {
          // Count as ok
          ok++;
        } else {
          // Count as fail
          fail++;
        }
      } catch {
        // Count as fail
        fail++;
      }
    }
    // Set state 
    setBusy(false);
    
    // Set message
    setMessage(`Klar: ${ok} registrerade, ${fail} fel`);

    // Return summary
    return { ok, fail };
  }, []);

  // Return state and register function
  return { register, busy, message, setMessage };
}

/**
 * Konverterar UI-rader till Ladok-payloads (skickar inte redan skickade).
 * @return LadokResultRequestDto[]
 */
export function rowsToLadokPayloads(
  rows: RosterRow[],
  kurskod: string,
  modulkod: string
): LadokResultRequestDto[] {
  // Filter and map to LadokResultRequestDto
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
