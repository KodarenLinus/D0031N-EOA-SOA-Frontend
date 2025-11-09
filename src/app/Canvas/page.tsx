"use client";
import { useState, useEffect } from "react";
import {
  useRoster,
  useBulkRegister,
  rowsToLadokPayloads,
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

  useEffect(() => {
    setModulKod("");
  }, [kurskod]);

  useEffect(() => {
    if (epokModules.length === 0) return;
    const exists = epokModules.some((m) => m.modulkod === modulKod);
    if (!modulKod || !exists) {
      setModulKod(epokModules[0].modulkod);
    }
  }, [epokModules, modulKod]);

  const { register, busy, message, setMessage } = useBulkRegister();

  const onRegisterSelected = async () => {
    if (!rows || !modulKod) return;
    setMessage(null);

    const payloads = rowsToLadokPayloads(rows, kurskod, modulKod);
    const res = await register(payloads);

    if (res.ok > 0) {
      const pnrSet = new Set(payloads.map((p) => p.personnummer));
      setRows(
        (prev) =>
          prev?.map((r) =>
            pnrSet.has(r.personnummer ?? "")
              ? {
                  ...r,
                  sent: true,
                  ladokStatus: "registrerad",
                  selected: false,
                }
              : r
          ) ?? prev
      );
    }
    await reloadRoster();
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
          onReload={() => {
            reloadModules();
            reloadRoster();
          }}
          epokModules={epokModules}
          epokLoading={epokLoading}
        />

        {!epokLoading && epokModules.length === 0 && (
          <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            Inga moduler hittades för kurskoden{" "}
            <span className="font-semibold">{kurskod}</span>. Kontrollera att kursen
            finns i Epok.
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
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
            disabled={busy || !modulKod || !rows?.some((r) => r.selected)}
          >
            {busy ? "Registrerar…" : "Registrera valda i Ladok"}
          </Button>
          {message && <span className="text-sm text-green-700">{message}</span>}
        </div>
      </div>
    </div>
  );
}
