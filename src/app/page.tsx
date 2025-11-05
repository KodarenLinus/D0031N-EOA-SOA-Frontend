"use client";
import React, { useEffect, useMemo, useState } from "react";

const useApiBase = () =>
  useMemo(() => (process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080"), []);

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

type Assignment = { id: number; name: string; scaleHint?: string | null; type?: string | null };
type RosterItem = { studentId: string; name: string; email?: string | null; canvasGrade?: string | null; gradedAt?: string | null };

type Row = {
  studentId: string;
  name: string;
  personnummer: string | null;
  canvasOmdome: string | null;
  datum: string;
  ladokBetygPreselect: string | null;
  selected: boolean;
};

export default function CanvasRosterToLadok() {
  const API = useApiBase();

  // Filter
  const [kurskod, setKurskod] = useState("D0031N");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentId, setAssignmentId] = useState<number | null>(null);
  const [modulKod, setModulKod] = useState("0005");

  // Data
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Ladder messages
  const [msg, setMsg] = useState<string | null>(null);

  // 1) Hämta assignments för kurskod
  const loadAssignments = async () => {
    setErr(null);
    try {
      const data = await jsonFetch<Assignment[]>(`${API}/canvas/courses/${encodeURIComponent(kurskod)}/assignments`);
      setAssignments(data);
      if (!assignmentId && data.length > 0) setAssignmentId(data[0].id);
    } catch (e:any) {
      setErr(e.message);
    }
  };

  // 2) Hämta roster från Canvas (och Canvas-betyg för vald assignment)
  const loadRoster = async () => {
    if (!assignmentId) { setRows(null); return; }
    setLoading(true); setErr(null); setRows(null); setMsg(null);
    try {
      const roster = await jsonFetch<RosterItem[]>(
        `${API}/canvas/courses/${encodeURIComponent(kurskod)}/roster?assignmentId=${assignmentId}`
      );
      // slå upp pnr parallellt
      const pnrPairs = await Promise.all(
        roster.map(async r => {
          try {
            const dto = await jsonFetch<{ username: string; personnummer: string }>(
              `${API}/studentits/users/${encodeURIComponent(r.studentId)}/personnummer`
            );
            return [r.studentId, dto.personnummer] as const;
          } catch {
            return [r.studentId, null] as const;
          }
        })
      );
      const pnrMap = new Map(pnrPairs);

      const today = new Date().toISOString().slice(0,10);
      const table: Row[] = roster.map(r => ({
        studentId: r.studentId,
        name: r.name || r.studentId,
        personnummer: pnrMap.get(r.studentId) ?? null,
        canvasOmdome: r.canvasGrade ?? null,
        datum: today,
        ladokBetygPreselect: r.canvasGrade ?? null,
        selected: !!pnrMap.get(r.studentId),
      }));
      setRows(table);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3) Registrera valda till Ladok (en-och-en, matchar din backend)
  const registerSelected = async () => {
    if (!rows) return;
    setMsg(null); setErr(null);
    let okCount = 0, failCount = 0;

    for (const r of rows.filter(x => x.selected && x.personnummer && (x.ladokBetygPreselect || x.canvasOmdome))) {
      const body = {
        personnummer: r.personnummer!,
        kurskod,
        modul: modulKod,
        datum: r.datum,
        betyg: r.ladokBetygPreselect || r.canvasOmdome || ""
      };
      try {
        const res = await fetch(`${API}/ladok/results`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || res.statusText);
        okCount++;
      } catch {
        failCount++;
      }
    }
    setMsg(`Klar: ${okCount} registrerade, ${failCount} fel`);
  };

  // 4) UI-hjälpare
  const toggleRow = (studentId: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, selected: !r.selected } : r) ?? prev);

  const setGrade = (studentId: string, grade: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, ladokBetygPreselect: grade } : r) ?? prev);

  const setDate = (studentId: string, date: string) =>
    setRows(prev => prev?.map(r => r.studentId === studentId ? { ...r, datum: date } : r) ?? prev);

  useEffect(() => { loadAssignments(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { if (assignmentId) loadRoster(); /* eslint-disable-next-line */ }, [assignmentId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Canvas roster → Ladok</h1>
          <span className="text-xs text-gray-500">{API}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Filter */}
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
                    onClick={() => { loadAssignments(); if (assignmentId) loadRoster(); }}>
              Ladda om
            </button>
            {err && <span className="ml-3 text-sm text-red-600">{err}</span>}
          </div>
        </div>

        {/* Tabell */}
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
              <tr><td className="px-3 py-4 text-gray-500" colSpan={6}>
                {loading ? "Laddar…" : "Ingen data – välj kurs/uppgift och ladda."}
              </td></tr>
            )}
            {rows?.map(r => (
              <tr key={r.studentId} className="border-t align-top">
                <td className="px-3 py-2">
                  <input type="checkbox" checked={r.selected} onChange={()=>toggleRow(r.studentId)}
                         disabled={!r.personnummer}/>
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.studentId}</div>
                </td>
                <td className="px-3 py-2 font-mono">{r.personnummer ?? "—"}</td>
                <td className="px-3 py-2">
                  {r.canvasOmdome ?? "-"}
                </td>
                <td className="px-3 py-2">
                  <select className="border rounded-xl px-2 py-1"
                          value={r.ladokBetygPreselect ?? ""}
                          onChange={e=>setGrade(r.studentId, e.target.value)}>
                    <option value="">(välj)</option>
                    <option>A</option><option>B</option><option>C</option>
                    <option>D</option><option>E</option><option>F</option>
                    <option>G</option><option>U</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="date" className="border rounded-xl px-2 py-1"
                         value={r.datum}
                         onChange={e=>setDate(r.studentId, e.target.value)} />
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90"
                  onClick={registerSelected} disabled={!rows?.some(r => r.selected)}>
            Registrera valda i Ladok
          </button>
          {msg && <span className="text-sm text-green-700">{msg}</span>}
        </div>
      </main>
    </div>
  );
}
