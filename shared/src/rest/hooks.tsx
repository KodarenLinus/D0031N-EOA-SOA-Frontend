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
  BaseRow,
  studentitsBatchResponse,
  studentitsResponse,
} from "./schema";

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Kunde inte hämta Epok-moduler");
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

  return {
    modules,
    modulesByCode,
    loading,
    error,
    reload,
  };
}

/**
 * Roster (Canvas -> StudentITS -> Ladok)
 * @return rows, loading, error, reload, toggleRow, setGrade, setDate, setRows
 */
export function useRoster(kurskod: string, modulkod: string) {
  const [baseRows, setBaseRows] = useState<BaseRow[] | null>(null);
  const [rows, setRows] = useState<RosterRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ladda Canvas + StudentITS när kurskod ändras
  useEffect(() => {
    if (!kurskod) {
      setBaseRows(null);
      setRows(null);
      return;
    }

    let cancelled = false;

    // Load Canvas roster and enrich with StudentITS personnummer
    const loadBase = async () => {
      setLoading(true);
      setError(null);

      try {
        const canvasResp = (await CanvasApi.listRoster(kurskod)) as
          | CanvasRosterResponse
          | RosterItem[];

        const canvasRoster: RosterItem[] = Array.isArray(canvasResp)
          ? canvasResp
          : canvasResp?.roster ?? [];

        const cleanCanvas = canvasRoster
          .map((c) => ({
            studentId: String(c.studentId),
            name: String(c.name ?? "").trim(),
          }))
          .filter((c) => !!c.studentId && !!c.name);

        const studentIds = cleanCanvas.map((c) => c.studentId);

        let pnrByStudentId = new Map<string, string>();

        try {
            const apiWithBatch = StudentITSApi as unknown as {
              getPersonnummerBatch: (studentIds: string[]) => Promise<studentitsResponse[]>;
            };

            const batch = await apiWithBatch.getPersonnummerBatch(studentIds);

            pnrByStudentId = new Map(
              batch
                .map((row) => {
                  const key = row.studentId ?? null;
                  const pnr = row.personnummer ?? null;
                  return key && pnr ? [String(key), String(pnr)] : null;
                })
                .filter((pair): pair is [string, string] => pair !== null)
            );
          } catch (e) {
            console.warn("StudentITS lookup failed", e);
          }

        if (cancelled) return;

        const base: BaseRow[] = cleanCanvas.map(({ studentId, name }) => ({
          studentId,
          name,
          personnummer: pnrByStudentId.get(studentId) ?? null,
        }));

        setBaseRows(base);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Kunde inte hämta roster");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadBase();

    return () => {
      cancelled = true;
    };
  }, [kurskod]);

  // Ladda Ladok när baseRows + modulkod är klara
  const reload = useCallback(async () => {
    if (!kurskod || !modulkod || !baseRows) {
      setRows(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const ladokRoster = (await LadokApi.getRoster(
        kurskod,
        modulkod
      )) as LadokRosterItemDto[];

      const ladokByPnr = new Map<string, LadokRosterItemDto>();
      for (const dto of ladokRoster) {
        if (dto.personnummer) ladokByPnr.set(String(dto.personnummer), dto);
      }

      const table: RosterRow[] = baseRows.map(
        ({ studentId, name, personnummer }) => {
          const ladok = personnummer
            ? ladokByPnr.get(personnummer)
            : undefined;

          return {
            studentId,
            name,
            personnummer,
            ladokBetygPreselect: ladok?.ladokBetyg ?? null,
            datum: ladok?.datum ?? todayISO(),
            selected: false,
            sent: ladok?.sent === true,
            ladokStatus:
              ladok?.ladokStatus ?? ladok?.registreringsStatus ?? null,
            registeredAt: null,
          };
        }
      );

      setRows(table);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kunde inte hämta roster";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [kurskod, modulkod, baseRows]);

  useEffect(() => {
    if (baseRows && modulkod) {
      reload();
    } else {
      setRows(null);
    }
  }, [baseRows, modulkod, reload]);

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

  return {
    rows,
    loading,
    error,
    reload,
    toggleRow,
    setGrade,
    setDate,
    setRows,
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

  const register = useCallback(async (payloads: LadokResultRequestDto[]) => {
    setBusy(true);
    setMessage(null);
    let ok = 0;
    let fail = 0;

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
 * Converts UI-rows to Ladok-payloads (does not send already sent).
 * @return LadokResultRequestDto[]
 */
export function useRowsToLadokPayloads(
  rows: RosterRow[],
  kurskod: string,
  modulkod: string
): LadokResultRequestDto[] {
  return rows
    .filter(
      (r) =>
        r.selected &&
        !!r.personnummer &&
        !!r.ladokBetygPreselect &&
        !r.sent
    )
    .map((r) => ({
      personnummer: r.personnummer!,
      kurskod,
      modulkod,
      datum: r.datum,
      betyg: r.ladokBetygPreselect!,
    }));
}
