"use client";
import { useState, useEffect } from "react";
import {
  useAssignments,
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
  const [kurskod, setKurskod] = useState("D0031N");
  const [modulKod, setModulKod] = useState("");        
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  const { assignments, error: assignErr, reload: reloadAssignments } = useAssignments(kurskod);
  const { rows, loading, error: rosterErr, reload: reloadRoster, toggleRow, setGrade, setDate } =
    useRoster(kurskod, assignmentId);

  const { modules: epokModules, loading: epokLoading } = useEpokModules(kurskod, true);

  useEffect(() => {
    if (!assignmentId && assignments.length > 0) {
      setAssignmentId(assignments[0].id);
    }
  }, [assignments, assignmentId]);

  useEffect(() => {
    if (!modulKod && epokModules.length > 0) {
      setModulKod(epokModules[0].modulkod);
    }
  }, [epokModules, modulKod]);

  const { register, busy, message, setMessage } = useBulkRegister();

  const onReloadAll = () => {
    reloadAssignments();
    if (assignmentId) reloadRoster();
  };

  const onRegisterSelected = async () => {
    if (!rows || !modulKod) return;
    setMessage(null);
    const payloads = rowsToLadokPayloads(rows, kurskod, modulKod);
    await register(payloads);
  };

  return (
    <div className="min-h-screen">
      <Header>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-black text-sm font-semibold text-blue-400">
              CA
            </div>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Canvas</h1>
          </div>
        </div>
      </Header>
      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        <Filters
          kurskod={kurskod}
          setKurskod={setKurskod}
          modulKod={modulKod}
          setModulKod={setModulKod}
          assignments={assignments}
          assignmentId={assignmentId}
          setAssignmentId={setAssignmentId}
          onReload={onReloadAll}
          error={assignErr || rosterErr}
          epokModules={epokModules}        
          epokLoading={epokLoading}         
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4 space-y-6">
        <RosterTable
          rows={rows}
          loading={loading}
          onToggle={toggleRow}
          onSetGrade={setGrade}
          onSetDate={setDate}
        />

        <div className="flex items-center gap-3">
          <Button
            className="rounded-2xl px-4 py-2 shadow-sm border hover:opacity-70 disabled:opacity-50"
            onClick={onRegisterSelected}
            disabled={busy || !modulKod || !rows?.some(r => r.selected)}
          >
            {busy ? "Registrerar…" : "Registrera valda i Ladok"}
          </Button>
          {message && <span className="text-sm text-green-700">{message}</span>}
        </div>
      </div>
    </div>
  );
}
