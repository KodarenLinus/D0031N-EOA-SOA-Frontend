"use client";
import React, { useMemo, useState, useEffect } from "react";
import { getApiBase } from "@shared/src/rest/fetch";
import { useAssignments, useRoster, useBulkRegister, rowsToLadokPayloads } from "@shared/src/rest/hooks";
import { Filters } from "@src/app/Canvas/filters";
import { RosterTable } from "@src/app/Canvas/rosterTable";

export default function CanvasRosterToLadok() {
  const API = useMemo(() => getApiBase(), []);
  const [kurskod, setKurskod] = useState("D0031N");
  const [modulKod, setModulKod] = useState("0005");
  const [assignmentId, setAssignmentId] = useState<number | null>(null);

  // data hooks
  const { assignments, error: assignErr, reload: reloadAssignments } = useAssignments(kurskod);
  const { rows, loading, error: rosterErr, reload: reloadRoster, toggleRow, setGrade, setDate } =
    useRoster(kurskod, assignmentId);

  // set default assignment when list loads
  useEffect(() => {
    if (!assignmentId && assignments.length > 0) {
      setAssignmentId(assignments[0].id);
    }
  }, [assignments, assignmentId]);

  const { register, busy, message, setMessage } = useBulkRegister();

  const onReloadAll = () => {
    reloadAssignments();
    if (assignmentId) reloadRoster();
  };

  const onRegisterSelected = async () => {
    if (!rows) return;
    setMessage(null);
    const payloads = rowsToLadokPayloads(rows, kurskod, modulKod);
    await register(payloads);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Filters
        apiLabel={API}
        kurskod={kurskod}
        setKurskod={setKurskod}
        modulKod={modulKod}
        setModulKod={setModulKod}
        assignments={assignments}
        assignmentId={assignmentId}
        setAssignmentId={setAssignmentId}
        onReload={onReloadAll}
        error={assignErr || rosterErr}
      />

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <RosterTable
          rows={rows}
          loading={loading}
          onToggle={toggleRow}
          onSetGrade={setGrade}
          onSetDate={setDate}
        />

        <div className="flex items-center gap-3">
          <button
            className="rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90 disabled:opacity-50"
            onClick={onRegisterSelected}
            disabled={busy || !rows?.some(r => r.selected)}
          >
            {busy ? "Registrerar…" : "Registrera valda i Ladok"}
          </button>
          {message && <span className="text-sm text-green-700">{message}</span>}
        </div>
      </main>
    </div>
  );
}
