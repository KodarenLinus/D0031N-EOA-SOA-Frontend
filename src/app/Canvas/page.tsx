"use client";
import { useState, useEffect, useMemo } from "react";
import {
  useRoster,
  useBulkRegister,
  useRowsToLadokPayloads,
  useEpokModules,
} from "@shared/src/rest/hooks";
import { Filters } from "@src/app/Canvas/filters";
import { RosterTable } from "@src/app/Canvas/rosterTable";
import { Header } from "@shared/src/componets/UI/Header";   
import { Button } from "@shared/src/componets/UI/Button";     
import { Toast } from "@shared/src/componets/UI/Toast";
import { H1, Span } from "@shared/src/componets/typography/typography";

export default function CanvasRosterToLadok() {
  const [kurskod, setKurskod] = useState("I0015N");
  const [modulKod, setModulKod] = useState("");

  const {
    modules: epokModules,
    loading: epokLoading,
  } = useEpokModules(kurskod, true);

  const {
    rows,
    loading: rosterLoading,
    reload: reloadRoster,
    toggleRow,
    setGrade,
    setDate,
    setRows,
  } = useRoster(kurskod, modulKod);

  // Reset modulKod when kurskod changes
  useEffect(() => {
    setModulKod("");
  }, [kurskod]);

  // Auto select first module
  useEffect(() => {
    if (epokModules.length === 0) return;
    const exists = epokModules.some((module) => module.modulkod === modulKod);
    if (!modulKod || !exists) setModulKod(epokModules[0].modulkod);
  }, [epokModules, modulKod]);

  // Selection/validation
  const selected = useMemo(() => rows?.filter((row) => row.selected) ?? [], [rows]);
  const ready = useMemo(
    () =>
      selected.filter(
        (row) => !!row.personnummer && !!row.ladokBetygPreselect && !!row.datum && !row.sent
      ),
    [selected]
  );
  
  // Bulk register
  const { 
    register, 
    busy, 
    message, 
    setMessage 
  } = useBulkRegister();

  // Get the payload generator function from the hook at the top level
  const getRowsToLadokPayloads = useRowsToLadokPayloads;

  // Renderer for register button
  const onRegisterSelected = async () => {
    if (!rows || !modulKod) return;
    setMessage(null);

    const validRows = rows.filter(
      (row) => row.selected && !!row.personnummer && !!row.ladokBetygPreselect && !!row.datum && !row.sent
    );
    try {
      const payloads = getRowsToLadokPayloads(validRows, kurskod, modulKod);
      const res = await register(payloads);

      if (res.ok > 0) {
        const idSet = new Set(validRows.map((row) => row.studentId));
        setRows(
          (prev) =>
            prev?.map((row) =>
              idSet.has(row.studentId)
                ? { ...row, sent: true, ladokStatus: "registrerad", selected: false }
                : row
            ) ?? prev
        );
      }
      await reloadRoster();
    } catch (e: unknown) {
      if (e && typeof e === "object" && "message" in e && typeof (e as { message: string }).message === "string") {
        setMessage((e as { message: string }).message);
      } else {
        setMessage("Något gick fel vid registrering.");
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-white/40 blur-md opacity-60"
                aria-hidden
              />
              <div className="flex h-20 w-20 items-center justify-center rounded-md bg-[#12365a] shadow-md">
                <Span className="text-7xl font-serif text-white leading-none">
                  L
                </Span>
              </div>
            </div>
            <div>
              <H1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                Canvas Admin WS
              </H1>
              <Span className="mt-1 text-sm bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">
                Snabb registrering av kursbetyg från Canvas till Ladok
              </Span>
            </div>
          </div>
        </div>
      </Header>
      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        <Filters
          kurskod={kurskod}
          setKurskod={setKurskod}
          modulKod={modulKod}
          setModulKod={setModulKod}
          epokModules={epokModules}
          epokLoading={epokLoading}
        />

        {!epokLoading && epokModules.length === 0 && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            Inga moduler hittades för kurskoden{" "}
            <Span className="font-semibold">{kurskod}</Span>. Kontrollera att kursen finns i Epok.
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        {rosterLoading && <div className="text-sm text-gray-500">Laddar roster…</div>}
        <RosterTable
          rows={rows}
          loading={rosterLoading}
          onToggle={toggleRow}
          onSetGrade={setGrade}
          onSetDate={setDate}
        />

        <div className="flex items-center gap-3">
          <Button
            className="mb-4"
            onClick={onRegisterSelected}
            disabled={busy || !modulKod || ready.length === 0}
          >
            {busy ? "Registrerar…" : "Registrera valda i Ladok"}
          </Button>
          {message && (
            <Toast
              open={!!message}
              title={`Betyg underlag skickat för modul ${modulKod}`}
              description={message}
              type="success"
              onOpenChange={() => setMessage(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
