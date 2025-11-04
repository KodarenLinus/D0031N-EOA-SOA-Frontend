"use client";
import { useEffect, useMemo, useState } from "react";

type StudentItem = {
  username: string;
  namn: string;
  personnummer: string;
  canvasOmdome: string | null;
  ladokBetygPreselect: string | null;
  datum: string | null;
  status: "VALBAR" | "UTKAST" | "KLARMARKERAD" | "ATTESTERAD" | "HINDER";
  hinder: string | null;
};

type ListStudentsResponse = {
  students: StudentItem[];
  rules: { forbidFutureDate?: boolean; minDate?: string };
  meta: { kurskod: string; modulKod: string; assignmentId: string; canvasScale: string };
};

const API = (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080")) as string;

export default function ResultatPage() {
  // Filterbar
  const [kurskod, setKurskod] = useState("D0031N");
  const [assignmentId, setAssignmentId] = useState("uppgift-1"); // mockad Canvas-uppgift
  const [modulKod, setModulKod] = useState("0005");

  // Data
  const [students, setStudents] = useState<StudentItem[] | null>(null);
  const [rules, setRules] = useState<{ forbidFutureDate?: boolean; minDate?: string }>({});
  const [meta, setMeta] = useState<{ kurskod: string; modulKod: string; assignmentId: string; canvasScale: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // UI state
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkDate, setBulkDate] = useState<string>("");

  // Mode
  const [mode, setMode] = useState<"UTKAST" | "KLARMARKERA">("UTKAST");
  const [sendMsg, setSendMsg] = useState<string | null>(null);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const selCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const loadStudents = async () => {
    setLoading(true); setErr(null); setStudents(null); setSelected({});
    try {
      const res = await fetch(`${API}/api/v1/ws/list-students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kurskod, assignmentId, modulKod })
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: ListStudentsResponse = await res.json();
      setStudents(data.students);
      setRules(data.rules || {});
      setMeta(data.meta || null);
    } catch (e:any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { /* auto-load first time */ loadStudents(); /* eslint-disable-next-line */ }, []);

  const toggle = (pnr: string) =>
    setSelected(prev => ({ ...prev, [pnr]: !prev[pnr] }));

  const applyBulkDate = () => {
    if (!bulkDate || !students) return;
    setStudents(students.map(s => selected[s.personnummer] ? ({ ...s, datum: bulkDate }) : s));
  };

  const setBetyg = (pnr: string, betyg: string) => {
    if (!students) return;
    setStudents(students.map(s => s.personnummer === pnr ? ({ ...s, ladokBetygPreselect: betyg }) : s));
  };

  const setDatum = (pnr: string, ymd: string) => {
    if (!students) return;
    setStudents(students.map(s => s.personnummer === pnr ? ({ ...s, datum: ymd }) : s));
  };

  const futureInvalid = (ymd?: string | null) =>
    rules.forbidFutureDate && ymd ? (new Date(ymd) > new Date()) : false;

  const send = async () => {
    if (!students) return;
    setSendMsg(null); setSendErr(null);

    // plocka valda
    const items = students
      .filter(s => selected[s.personnummer])
      .map(s => ({ personnummer: s.personnummer, betyg: s.ladokBetygPreselect || "", datum: s.datum || "" }));

    if (items.length === 0) { setSendErr("Inga studenter valda."); return; }

    // vid KLARMARKERA: alla måste ha datum + betyg + ej framtid
    if (mode === "KLARMARKERA") {
      const bad = items.find(i => !i.datum || !i.betyg || futureInvalid(i.datum));
      if (bad) { setSendErr("Vänligen fyll i giltigt datum/betyg för alla valda."); return; }
    }

    try {
      const res = await fetch(`${API}/api/v1/ws/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, kurskod, modulKod, items })
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setSendErr(`Fel vid överföring. OK=${body.ok}, sent=${body.sent}, errors=${(body.errors||[]).length}`);
      } else {
        setSendMsg(`Överfört: ${body.sent} st`);
        // uppdatera vy (ex. ladda om listan)
        loadStudents();
      }
    } catch (e:any) {
      setSendErr(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Resultat → Ladok</h1>
          <span className="text-xs text-gray-500">{API}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Filterbar */}
        <div className="bg-white rounded-2xl shadow p-4 border">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Kurskod</label>
              <input className="w-full border rounded-xl px-3 py-2"
                     value={kurskod} onChange={e=>setKurskod(e.target.value)} placeholder="D0031N"/>
            </div>
            <div>
              <label className="text-sm font-medium">Canvas-uppgift</label>
              <input className="w-full border rounded-xl px-3 py-2"
                     value={assignmentId} onChange={e=>setAssignmentId(e.target.value)} placeholder="uppgift-1"/>
            </div>
            <div>
              <label className="text-sm font-medium">Ladok-modul</label>
              <input className="w-full border rounded-xl px-3 py-2"
                     value={modulKod} onChange={e=>setModulKod(e.target.value)} placeholder="0005"/>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={loadStudents}
                    className="rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90"
                    disabled={loading}>
              {loading ? "Laddar…" : "Ladda studenter"}
            </button>
            {err && <span className="text-red-600 text-sm">{err}</span>}
            {meta && <span className="text-xs text-gray-600">Skala: {meta.canvasScale}</span>}
          </div>
        </div>

        {/* Bulk-datum + Mode */}
        <div className="bg-white rounded-2xl shadow p-4 border flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm font-medium">Datum för markerade</label>
            <input type="date" className="border rounded-xl px-3 py-2"
                   value={bulkDate} onChange={e=>setBulkDate(e.target.value)} />
          </div>
          <button className="rounded-2xl px-4 py-2 shadow-sm border bg-white hover:bg-gray-50"
                  onClick={applyBulkDate}>Applicera</button>

          <div className="ml-auto flex items-center gap-3">
            <label className="text-sm">Läge:</label>
            <select value={mode} onChange={e=>setMode(e.target.value as any)}
                    className="border rounded-xl px-3 py-2">
              <option value="UTKAST">Spara som utkast</option>
              <option value="KLARMARKERA">Klarmarkera</option>
            </select>
            <button className="rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90"
                    onClick={send}>
              Överför {selCount > 0 ? `(${selCount})` : ""}
            </button>
          </div>
          {sendMsg && <div className="w-full text-green-700 text-sm">{sendMsg}</div>}
          {sendErr && <div className="w-full text-red-600 text-sm">{sendErr}</div>}
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
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
            {(!students || students.length === 0) && (
              <tr><td className="px-3 py-4 text-gray-500" colSpan={7}>
                {loading ? "Laddar…" : "Ingen data – välj filter och klicka Ladda studenter."}
              </td></tr>
            )}
            {students?.map((s) => {
              const disabled = s.status !== "VALBAR";
              const invalidDate = futureInvalid(s.datum);
              return (
                <tr key={s.personnummer} className="border-t align-top">
                  <td className="px-3 py-2">
                    <input type="checkbox" disabled={disabled}
                           checked={!!selected[s.personnummer]}
                           onChange={()=>toggle(s.personnummer)} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{s.namn}</div>
                    <div className="text-xs text-gray-500">{s.username}</div>
                  </td>
                  <td className="px-3 py-2 font-mono">{s.personnummer}</td>
                  <td className="px-3 py-2">{s.canvasOmdome ?? "-"}</td>
                  <td className="px-3 py-2">
                    <select
                      disabled={disabled}
                      className="border rounded-xl px-2 py-1"
                      value={s.ladokBetygPreselect ?? ""}
                      onChange={e=>setBetyg(s.personnummer, e.target.value)}>
                      <option value="">(välj)</option>
                      <option>A</option><option>B</option><option>C</option>
                      <option>D</option><option>E</option><option>F</option>
                      <option>G</option><option>U</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input type="date" disabled={disabled}
                           className={`border rounded-xl px-2 py-1 ${invalidDate ? "border-red-500" : ""}`}
                           value={s.datum ?? ""}
                           onChange={e=>setDatum(s.personnummer, e.target.value)} />
                    {invalidDate && <div className="text-xs text-red-600">Ej framtid</div>}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100">{s.status}</span>
                    {s.hinder && <div className="text-xs text-amber-700 mt-1">Hinder: {s.hinder}</div>}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
