"use client";
import React from "react";
import type { RosterRow } from "@shared/src/rest/schema";
import { GRADE_OPTIONS } from "@shared/src/rest/hooks";

type Props = {
  rows: RosterRow[] | null;
  loading?: boolean;
  onToggle: (studentId: string) => void;
  onSetGrade: (studentId: string, grade: string) => void;
  onSetDate: (studentId: string, date: string) => void;
};

export function RosterTable({ rows, loading, onToggle, onSetGrade, onSetDate }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow border overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left">Val</th>
            <th className="px-3 py-2 text-left">Student</th>
            <th className="px-3 py-2 text-left">Personnummer</th>
            <th className="px-3 py-2 text-left">Canvas</th>
            <th className="px-3 py-2 text-left">Ladok betyg</th>
            <th className="px-3 py-2 text-left">Datum</th>
          </tr>
        </thead>
        <tbody>
          {(!rows || rows.length === 0) && (
            <tr>
              <td className="px-3 py-4 text-gray-500" colSpan={6}>
                {loading ? "Laddar…" : "Ingen data – välj kurs/uppgift och ladda."}
              </td>
            </tr>
          )}
          {rows?.map(r => (
            <tr key={r.studentId} className="border-t align-top">
              <td className="px-3 py-2">
                <input type="checkbox" checked={r.selected} onChange={()=>onToggle(r.studentId)} disabled={!r.personnummer}/>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.studentId}</div>
              </td>
              <td className="px-3 py-2 font-mono">{r.personnummer ?? "—"}</td>
              <td className="px-3 py-2">{r.canvasOmdome ?? "-"}</td>
              <td className="px-3 py-2">
                <select className="border rounded-xl px-2 py-1"
                        value={r.ladokBetygPreselect ?? ""}
                        onChange={e=>onSetGrade(r.studentId, e.target.value)}>
                  <option value="">(välj)</option>
                  {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </td>
              <td className="px-3 py-2">
                <input type="date" className="border rounded-xl px-2 py-1"
                       value={r.datum}
                       onChange={e=>onSetDate(r.studentId, e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
