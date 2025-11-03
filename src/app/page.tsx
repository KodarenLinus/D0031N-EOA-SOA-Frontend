"use client";
import React, { useEffect, useMemo, useState } from "react";

/**
 * CanvasDashboard.tsx
 * Next.js (App Router) friendly single-file dashboard for Epok / StudentITS / Ladok
 * - Reads API base from NEXT_PUBLIC_API_BASE (default http://localhost:8080)
 * - Shows /status
 * - Lists Epok modules for a given kurskod
 * - Looks up personnummer in StudentITS
 * - Registers a result in Ladok
 * Styling: Tailwind CSS (minimal, clean)
 */

// --- Small helpers ---------------------------------------------------------
const useApiBase = () =>
  useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "http://localhost:8080",
    []
  );

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function Card({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
      {footer && <div className="mt-4 pt-3 border-t text-sm text-gray-600">{footer}</div>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-gray-700 mb-1 block">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10 ${
        props.className || ""
      }`}
    />
  );
}

function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className, children, ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-2xl px-4 py-2 shadow-sm border bg-black text-white hover:opacity-90 disabled:opacity-50 ${
        className || ""
      }`}
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">{children}</span>;
}

// --- Types -----------------------------------------------------------------
interface StatusPayload {
  server: string;
  epok: string;
  studentits: string;
  ladok: string;
}

interface ModuleDto {
  kod: string;
  namn: string;
  hp: number;
  aktiv: boolean;
}

interface StudentDto {
  username: string;
  personnummer: string;
}

// --- Dashboard --------------------------------------------------------------
export default function CanvasDashboard() {
  const API = useApiBase();

  // Status
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [statusErr, setStatusErr] = useState<string | null>(null);

  useEffect(() => {
    jsonFetch<StatusPayload>(`${API}/status`)
      .then(setStatus)
      .catch((e) => setStatusErr(e.message));
  }, [API]);

  // Epok
  const [kurskod, setKurskod] = useState("D0031N");
  const [modules, setModules] = useState<ModuleDto[] | null>(null);
  const [modulesErr, setModulesErr] = useState<string | null>(null);
  const loadModules = async () => {
    setModulesErr(null);
    setModules(null);
    try {
      const data = await jsonFetch<ModuleDto[]>(`${API}/epok/courses/${encodeURIComponent(kurskod)}/modules`);
      setModules(data);
    } catch (e) {
      setModulesErr(e instanceof Error ? e.message : String(e));
    }
  };
  useEffect(() => { loadModules(); /* auto-load on mount */ }, []);

  // StudentITS
  const [username, setUsername] = useState("sveedz-4");
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [studentErr, setStudentErr] = useState<string | null>(null);
  const lookupStudent = async () => {
    setStudentErr(null);
    setStudent(null);
    try {
      const data = await jsonFetch<StudentDto>(`${API}/studentits/users/${encodeURIComponent(username)}/personnummer`);
      setStudent(data);
    } catch (e) {
      setStudentErr(e instanceof Error ? e.message : String(e));
    }
  };

  // Ladok (register result)
  const [ladokBusy, setLadokBusy] = useState(false);
  const [ladokMsg, setLadokMsg] = useState<string | null>(null);
  const [ladokErr, setLadokErr] = useState<string | null>(null);
  const [ladokForm, setLadokForm] = useState({
    personnummer: "",
    kurskod: "D0031N",
    modul: "0005",
    datum: new Date().toISOString().slice(0, 10),
    betyg: "A",
  });

  useEffect(() => {
    if (student?.personnummer) setLadokForm((f) => ({ ...f, personnummer: student.personnummer }));
  }, [student]);

  const registerResult = async () => {
    setLadokBusy(true);
    setLadokMsg(null);
    setLadokErr(null);
    try {
      const res = await fetch(`${API}/ladok/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ladokForm),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || res.statusText);
      setLadokMsg(`${body.status}: ${body.message}`);
    } catch (e) {
      setLadokErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLadokBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Canvas Dashboard · Epok · StudentITS · Ladok</h1>
          <Badge>{API}</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status */}
        <Card title="Systemstatus">
          {status && (
            <ul className="text-sm space-y-1">
              <li><strong>Server:</strong> {status.server}</li>
              <li><strong>Epok:</strong> {status.epok}</li>
              <li><strong>StudentITS:</strong> {status.studentits}</li>
              <li><strong>Ladok:</strong> {status.ladok}</li>
            </ul>
          )}
          {!status && !statusErr && <p className="text-sm text-gray-500">Laddar status…</p>}
          {statusErr && <p className="text-sm text-red-600">{statusErr}</p>}
        </Card>

        {/* StudentITS Lookup */}
        <Card title="StudentITS · Hämta personnummer" footer={<p>Exempel: <code>sveedz-4</code></p>}>
          <div className="space-y-2">
            <div>
              <Label>Användarnamn</Label>
              <div className="flex gap-2">
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="t.ex. sveedz-4" />
                <Button onClick={lookupStudent}>Sök</Button>
              </div>
            </div>

            {student && (
              <div className="text-sm bg-gray-50 rounded-xl p-3 border">
                <div><strong>username:</strong> {student.username}</div>
                <div><strong>personnummer:</strong> {student.personnummer}</div>
              </div>
            )}
            {studentErr && <p className="text-sm text-red-600">{studentErr}</p>}
          </div>
        </Card>

        {/* Ladok Register */}
        <Card title="Ladok · Registrera resultat" footer={<p>Fyll i fält och klicka <em>Registrera</em>.</p>}>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label>Personnummer</Label>
              <Input value={ladokForm.personnummer}
                     onChange={(e) => setLadokForm({ ...ladokForm, personnummer: e.target.value })}
                     placeholder="YYYYMMDD-XXXX" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kurskod</Label>
                <Input value={ladokForm.kurskod} onChange={(e) => setLadokForm({ ...ladokForm, kurskod: e.target.value })} />
              </div>
              <div>
                <Label>Modul</Label>
                <Input value={ladokForm.modul} onChange={(e) => setLadokForm({ ...ladokForm, modul: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Datum</Label>
                <Input type="date" value={ladokForm.datum} onChange={(e) => setLadokForm({ ...ladokForm, datum: e.target.value })} />
              </div>
              <div>
                <Label>Betyg</Label>
                <Input value={ladokForm.betyg} onChange={(e) => setLadokForm({ ...ladokForm, betyg: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={registerResult} disabled={ladokBusy}>Registrera</Button>
              {ladokMsg && <span className="text-sm text-green-700">{ladokMsg}</span>}
              {ladokErr && <span className="text-sm text-red-600">{ladokErr}</span>}
            </div>
          </div>
        </Card>

        {/* Epok Modules */}
        <div className="lg:col-span-3">
          <Card title="Epok · Kursmoduler">
            <div className="mb-3 flex items-end gap-2">
              <div className="w-56">
                <Label>Kurskod</Label>
                <Input value={kurskod} onChange={(e) => setKurskod(e.target.value)} placeholder="t.ex. D0031N" />
              </div>
              <Button onClick={loadModules}>Ladda moduler</Button>
            </div>

            {!modules && !modulesErr && <p className="text-sm text-gray-500">Laddar…</p>}
            {modulesErr && <p className="text-sm text-red-600">{modulesErr}</p>}

            {modules && (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2">Modulkod</th>
                      <th className="text-left px-4 py-2">Namn</th>
                      <th className="text-right px-4 py-2">HP</th>
                      <th className="text-left px-4 py-2">Aktiv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((m) => (
                      <tr key={m.kod} className="border-t">
                        <td className="px-4 py-2 font-mono">{m.kod}</td>
                        <td className="px-4 py-2">{m.namn}</td>
                        <td className="px-4 py-2 text-right">{m.hp}</td>
                        <td className="px-4 py-2">{m.aktiv ? "✅" : "❌"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 pb-10 text-sm text-gray-500">
        <p>Canvas UI connected to Java Spring REST · Epok · StudentITS · Ladok</p>
      </footer>
    </div>
  );
}
