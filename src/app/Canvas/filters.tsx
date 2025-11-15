"use client";
import * as React from "react";
import type { EpokModule } from "@shared/src/rest/schema";
import { Input } from "@shared/src/componets/UI/Input";
import { Label } from "@shared/src/componets/UI/Label";
import { Select } from "@shared/src/componets/UI/Select";
import { Option } from "@shared/src/componets/UI/Option";
import { H2} from "@shared/src/componets/typography/typography";

type Props = {
  kurskod: string;
  setKurskod: (v: string) => void;
  modulKod: string;
  setModulKod: (v: string) => void;           
  epokModules: EpokModule[];
  epokLoading?: boolean;
};

export function Filters({
  kurskod,
  setKurskod,
  modulKod,
  setModulKod,
  epokModules,
  epokLoading,
}: Props) {
  React.useEffect(() => {
    if (epokModules.length === 0) return;
    const exists = epokModules.some((module) => module.modulkod === modulKod);
    if (!modulKod || !exists) setModulKod(epokModules[0].modulkod);
  }, [epokModules, modulKod, setModulKod]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-2xl bg-white-100 shadow-sm">
        <div className="px-5 py-4 bg-[#12365a] rounded-t-2xl">
          <H2 className="text-xl text-center text-white font-semibold">Filter</H2>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <Label htmlFor="kurskod" className="mb-1 block text-xs font-medium text-gray-700">
              Kurskod
            </Label>
            <Input
              id="kurskod"
              className="w-full rounded-xl border px-3 py-2 mb-3 text-sm shadow-sm outline-none transition placeholder:text-gray-400"
              value={kurskod}
              onChange={(e) => {
                setKurskod(e.target.value);
                setModulKod("");
              }}
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
                className="w-full appearance-none rounded-xl border px-3 py-2 pr-6 mb-3 text-sm shadow-sm outline-none transition disabled:opacity-60"
                value={modulKod}
                onChange={(e) => setModulKod(e.target.value)}
                disabled={epokLoading || epokModules.length === 0}
              >
                {epokModules.map((module) => (
                  <Option key={module.modulkod} value={module.modulkod}>
                    {module.modulkod}
                  </Option>
                ))}
              </Select>
              <svg
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
