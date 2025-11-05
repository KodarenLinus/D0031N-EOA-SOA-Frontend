"use client";
import React from "react";
import type { Assignment } from "@shared/src/rest/schema";

type Props = {
  apiLabel: string;
  kurskod: string;
  setKurskod: (v: string) => void;
  modulKod: string;
  setModulKod: (v: string) => void;
  assignments: Assignment[];
  assignmentId: number | null;
  setAssignmentId: (v: number | null) => void;
  onReload: () => void;
  error?: string | null;
};

export function Filters({
  apiLabel, kurskod, setKurskod, modulKod, setModulKod,
  assignments, assignmentId, setAssignmentId, onReload, error
}: Props) {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Canvas roster → Ladok</h1>
          <span className="text-xs text-gray-500">{apiLabel}</span>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow p-4 border grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-1">
          <label className="text-sm font-medium">Kurskod</label>
          <input className="w-full border rounded-xl px-3 py-2"
                 value={kurskod} onChange={e=>setKurskod(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium">Canvas-uppgift</label>
          <select className="w-full border rounded-xl px-3 py-2"
                  value={assignmentId ?? ""}
                  onChange={e=>setAssignmentId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">(välj)</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.name}{a.scaleHint ? ` (${a.scaleHint})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Ladok-modul</label>
          <input className="w-full border rounded-xl px-3 py-2"
                 value={modulKod} onChange={e=>setModulKod(e.target.value)} />
        </div>
        <div className="sm:col-span-4">
          <button className="rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90"
                  onClick={onReload}>
            Ladda om
          </button>
          {error && <span className="ml-3 text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </>
  );
}
