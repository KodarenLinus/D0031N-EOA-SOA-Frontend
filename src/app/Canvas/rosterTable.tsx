"use client";
import type { RosterRow } from "@shared/src/rest/schema";
import { GRADE_OPTIONS } from "@shared/src/rest/hooks";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared/src/componets/UI/Table";
import { Input } from "@shared/src/componets/UI/Input";
import { Select } from "@shared/src/componets/UI/Select";
import { Option } from "@shared/src/componets/UI/Option";

type Props = {
  rows: RosterRow[] | null;
  loading?: boolean;
  onToggle: (studentId: string) => void;
  onSetGrade: (studentId: string, grade: string) => void;
  onSetDate: (studentId: string, date: string) => void;
};

// Hjälpfunktion för att avgöra om raden är skickad
function isSent(r: RosterRow): boolean {
  return (
    (r as any).sent === true ||
    (r as any).status === "REGISTERED" ||
    (r as any).ladokStatus?.toLowerCase?.() === "registrerad"
  );
}

export function RosterTable({ rows, loading, onToggle, onSetGrade, onSetDate }: Props) {
  return (
    <div className="rounded-2xl shadow overflow-auto">
      <Table className="min-w-full text-sm">
        <TableHeader className="bg-cyan-100">
          <TableRow>
            <TableHead className="px-3 py-2 text-left">Val</TableHead>
            <TableHead className="px-3 py-2 text-left">Student</TableHead>
            <TableHead className="px-3 py-2 text-left">Personnummer</TableHead>
            <TableHead className="px-3 py-2 text-left">Ladok betyg</TableHead>
            <TableHead className="px-3 py-2 text-left">Datum</TableHead>
            <TableHead className="px-3 py-2 text-left">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(!rows || rows.length === 0) && (
            <TableRow>
              <TableCell className="px-3 py-4 text-gray-500">
                {loading ? "Laddar…" : "Ingen data – välj kurs/uppgift och ladda."}
              </TableCell>
            </TableRow>
          )}

          {rows?.map((r) => {
            const sent = isSent(r);
            const disabled = sent || !r.personnummer;

            return (
              <TableRow
                key={r.studentId}
                className={`align-top transition ${
                  sent ? "bg-gray-50 opacity-70" : ""
                }`}
              >
                <TableCell className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={r.selected}
                    onChange={() => onToggle(r.studentId)}
                    disabled={disabled}
                  />
                </TableCell>

                <TableCell className="px-3 py-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.studentId}</div>
                </TableCell>

                <TableCell className="px-3 py-2 font-mono">
                  {r.personnummer ?? "—"}
                </TableCell>

                <TableCell className="px-3 py-2">
                  <Select
                    className="border rounded-xl px-2 py-1"
                    value={r.ladokBetygPreselect ?? ""}
                    onChange={(e) => onSetGrade(r.studentId, e.target.value)}
                    disabled={disabled}
                  >
                    <Option value="">(välj)</Option>
                    {GRADE_OPTIONS.map((g) => (
                      <Option key={g} value={g}>
                        {g}
                      </Option>
                    ))}
                  </Select>
                </TableCell>

                <TableCell className="px-3 py-2">
                  <Input
                    type="date"
                    className="border rounded-xl px-2 py-1"
                    value={r.datum}
                    onChange={(e) => onSetDate(r.studentId, e.target.value)}
                    disabled={disabled}
                  />
                </TableCell>

                {/* Status-kolumn */}
                <TableCell className="px-3 py-2">
                  {sent ? (
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-300">
                      Skickad
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs rounded-full bg-yellow-50 text-yellow-700 border border-yellow-300">
                      Ej skickad
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
