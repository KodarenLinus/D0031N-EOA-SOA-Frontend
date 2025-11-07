"use client";
import React from "react";
import type { Assignment } from "@shared/src/rest/schema";  
import type { EpokModule } from "@shared/src/rest/schema";       
import { Input } from "@shared/src/componets/UI/Input";
import { Button } from "@shared/src/componets/UI/Button";
import { Label } from "@shared/src/componets/UI/Label";

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

  epokModules: EpokModule[];          // ⬅️ NYTT
  epokLoading?: boolean;              // ⬅️ NYTT
};

export function Filters({
  apiLabel,
  kurskod,
  setKurskod,
  modulKod,
  setModulKod,
  assignments,
  assignmentId,
  setAssignmentId,
  onReload,
  error,
  epokModules,
  epokLoading,
}: Props) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl bg-white-100 shadow-sm">
        <div className="px-5 py-4 bg-cyan-100 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Filter</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Välj kurs, uppgift och modul innan import/export.
              </p>
            </div>
            <Button type="button" onClick={onReload}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:opacity-80">
              Ladda om
            </Button>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 sm:grid-cols-4">
          {/* Kurskod */}
          <div className="sm:col-span-1">
            <Label htmlFor="kurskod" className="mb-1 block text-xs font-medium text-gray-700">
              Kurskod
            </Label>
            <Input
              id="kurskod"
              className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
              value={kurskod}
              onChange={(e) => setKurskod(e.target.value)}
              placeholder="t.ex. D0031N"
              autoComplete="off"
            />
          </div>

          {/* Canvas-uppgift */}
          <div className="sm:col-span-2">
            <Label htmlFor="assignment" className="mb-1 block text-xs font-medium text-gray-700">
              Canvas-uppgift
            </Label>
            <div className="relative">
              <select
                id="assignment"
                className="w-full appearance-none rounded-xl border px-3 py-2 pr-6 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2"
                value={assignmentId ?? ""}
                onChange={(e) => setAssignmentId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">(välj)</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}{a.scaleHint ? ` (${a.scaleHint})` : ""}
                  </option>
                ))}
              </select>
              <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Tip: Skalan visas inom parentes om tillgänglig (t.ex. A–F, U/G).
            </p>
          </div>

          {/* Ladok-modul (från Epok) */}
          <div className="sm:col-span-1">
            <Label htmlFor="module" className="mb-1 block text-xs font-medium text-gray-700">
              Ladok-modul (Epok)
            </Label>
            <div className="relative">
              <select
                id="module"
                className="w-full appearance-none rounded-xl border px-3 py-2 pr-6 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-black/60 focus-visible:ring-offset-2 disabled:opacity-60"
                value={modulKod}
                onChange={(e) => setModulKod(e.target.value)}
                disabled={epokLoading}
              >
                <option value="">{epokLoading ? "Laddar…" : "(välj)"}</option>
                {epokModules.map((m) => (
                  <option key={m.modulkod} value={m.modulkod}>
                    {m.modulkod} — {m.namn}
                  </option>
                ))}
              </select>
              <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
              </svg>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Källan är Epok. Endast aktiva moduler listas.
            </p>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="mx-5 mb-5">
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-red-300" />
              <div>
                <div className="font-medium">Kunde inte hämta data</div>
                <div className="mt-0.5 text-xs leading-relaxed">{error}</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
