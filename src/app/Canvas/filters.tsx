"use client";
import type { EpokModule } from "@shared/src/rest/schema";       
import { Input } from "@shared/src/componets/UI/Input";
import { Button } from "@shared/src/componets/UI/Button";
import { Label } from "@shared/src/componets/UI/Label";
import { Select } from "@shared/src/componets/UI/Select";
import { Option } from "@shared/src/componets/UI/Option";

type Props = {
  kurskod: string;
  setKurskod: (v: string) => void;
  modulKod: string;
  setModulKod: (v: string) => void;
  onReload: () => void;
  error?: string | null;
  epokModules: EpokModule[];     
  epokLoading?: boolean;              
};

export function Filters({
  kurskod,
  setKurskod,
  modulKod,
  setModulKod,
  onReload,
  error,
  epokModules,
  epokLoading,
}: Props) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl bg-white-100 shadow-sm">
        <div className="px-5 py-4 bg-cyan-100 rounded-t-2xl">
          <div>
            <div>
              <h1 className="text-sm text-center font-semibold">Filter</h1>
            </div>
          </div>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <Label htmlFor="kurskod" className="mb-1 block text-xs font-medium text-gray-700">
              Kurskod
            </Label>
            <Input
              id="kurskod"
              className="w-full rounded-xl border px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-gray-400"
              value={kurskod}
              onChange={(e) => setKurskod(e.target.value)}
              placeholder="t.ex. D0031N"
              autoComplete="off"
            />
          </div>
          <div className="sm:col-span-1">
            <Label htmlFor="module" className="mb-1 block text-xs font-medium text-gray-700">
              Ladok-modul (Epok)
            </Label>
            <div className="relative">
              <Select
                id="module"
                className="w-full appearance-none rounded-xl border px-3 py-2 pr-6 text-sm shadow-sm outline-none transition disabled:opacity-60"
                value={modulKod}
                onChange={(e) => setModulKod(e.target.value)}
                disabled={epokLoading}
              >
                {epokModules.map((m) => (
                  <Option key={m.modulkod} value={m.modulkod}>
                    {m.modulkod}
                  </Option>
                ))}
              </Select>
              <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
              </svg>
            </div>
          </div>
          <div>
            <Button type="button" onClick={onReload}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 active:opacity-80">
              Ladda om
            </Button>
          </div>
        </div>
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
