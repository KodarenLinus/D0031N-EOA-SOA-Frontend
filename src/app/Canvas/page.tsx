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

export default function CanvasRosterToLadok() {
  const [kurskod, setKurskod] = useState("I0015N");
  const [modulKod, setModulKod] = useState("");

  const {
    modules: epokModules,
    loading: epokLoading,
    reload: reloadModules,
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
    const exists = epokModules.some((m) => m.modulkod === modulKod);
    if (!modulKod || !exists) setModulKod(epokModules[0].modulkod);
  }, [epokModules, modulKod]);

  // Selection/validation
  const selected = useMemo(() => rows?.filter((r) => r.selected) ?? [], [rows]);
  const ready = useMemo(
    () =>
      selected.filter(
        (r) => !!r.personnummer && !!r.ladokBetygPreselect && !!r.datum && !r.sent
      ),
    [selected]
  );
  // Blocked rows (Rows that are not allowed to be registered)
  const blocked = useMemo(() => selected.length - ready.length, [selected, ready]);

  // Bulk register
  const { 
    register, 
    busy, 
    message, 
    setMessage 
  } = useBulkRegister();

  // Renderer for register button
  const onRegisterSelected = async () => {
    if (!rows || !modulKod) return;
    setMessage(null);

    const validRows = rows.filter(
      (r) => r.selected && !!r.personnummer && !!r.ladokBetygPreselect && !!r.datum && !r.sent
    );
    if (validRows.length === 0) {
      setMessage("Inget att registrera – kontrollera betyg/datum/personnummer.");
      return;
    }

    try {
      const payloads = useRowsToLadokPayloads(validRows, kurskod, modulKod);
      const res = await register(payloads);

      // Markera lokalt först efter lyckat svar
      if (res.ok > 0) {
        const idSet = new Set(validRows.map((r) => r.studentId));
        setRows(
          (prev) =>
            prev?.map((r) =>
              idSet.has(r.studentId)
                ? { ...r, sent: true, ladokStatus: "registrerad", selected: false }
                : r
            ) ?? prev
        );
      }

      // Fetch latest roster 
      await reloadRoster();
    } catch (e: any) {
      setMessage(e?.message ?? "Något gick fel vid registrering.");
    }
  };

  return (
    <div className="min-h-screen">
      <Header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-black text-sm font-semibold text-cyan-100">
              CA
            </div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Canvas
            </h1>
          </div>
        </div>
      </Header>

      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        <Filters
          kurskod={kurskod}
          setKurskod={setKurskod}
          modulKod={modulKod}
          setModulKod={setModulKod}
          onReload={async () => {
            await reloadModules();
            await reloadRoster();
          }}
          epokModules={epokModules}
          epokLoading={epokLoading}
        />

        {!epokLoading && epokModules.length === 0 && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            Inga moduler hittades för kurskoden{" "}
            <span className="font-semibold">{kurskod}</span>. Kontrollera att kursen finns i Epok.
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
            className="rounded-2xl px-4 py-2 shadow-sm border hover:opacity-70 disabled:opacity-50"
            onClick={onRegisterSelected}
            disabled={busy || !modulKod || ready.length === 0}
          >
            {busy ? "Registrerar…" : "Registrera valda i Ladok"}
          </Button>

          <div className="text-sm text-gray-600">
            {selected.length > 0
              ? `${ready.length} redo · ${blocked} saknar info`
              : "Inga valda rader"}
          </div>

          {message && <span className="text-sm text-green-700">{message}</span>}
        </div>
      </div>
    </div>
  );
}
