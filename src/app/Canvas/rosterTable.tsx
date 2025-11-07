"use client";
import type { RosterRow } from "@shared/src/rest/schema";
import { GRADE_OPTIONS } from "@shared/src/rest/hooks";
import { 
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableRow,
    TableHead,
    TableCell,
    TableCaption,
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

export function RosterTable({ rows, loading, onToggle, onSetGrade, onSetDate }: Props) {
  return (
    <div className="rounded-2xl shadow overflow-auto">
      <Table className="min-w-full text-sm">
        <TableHeader className="bg-cyan-100">
          <TableRow>
            <TableHead className="px-3 py-2 text-left">Val</TableHead>
            <TableHead className="px-3 py-2 text-left">Student</TableHead>
            <TableHead className="px-3 py-2 text-left">Personnummer</TableHead>
            <TableHead className="px-3 py-2 text-left">Canvas</TableHead>
            <TableHead className="px-3 py-2 text-left">Ladok betyg</TableHead>
            <TableHead className="px-3 py-2 text-left">Datum</TableHead>
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
          {rows?.map(r => (
            <TableRow key={r.studentId} className="align-top">
              <TableCell className="px-3 py-2">
                <input type="checkbox" checked={r.selected} onChange={()=>onToggle(r.studentId)} disabled={!r.personnummer}/>
              </TableCell>
              <TableCell className="px-3 py-2">
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.studentId}</div>
              </TableCell>
              <TableCell className="px-3 py-2 font-mono">{r.personnummer ?? "—"}</TableCell>
              <TableCell className="px-3 py-2">{r.canvasOmdome ?? "-"}</TableCell>
              <TableCell className="px-3 py-2">
                <Select className="border rounded-xl px-2 py-1"
                        value={r.ladokBetygPreselect ?? ""}
                        onChange={e=>onSetGrade(r.studentId, e.target.value)}>
                  <Option value="">(välj)</Option>
                  {GRADE_OPTIONS.map(g => <Option key={g} value={g}>{g}</Option>)}
                </Select>
              </TableCell>
              <TableCell className="px-3 py-2">
                <Input type="date" className="border rounded-xl px-2 py-1"
                       value={r.datum}
                       onChange={e=>onSetDate(r.studentId, e.target.value)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
