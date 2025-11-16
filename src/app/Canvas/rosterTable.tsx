'use client';
import type { RosterRow } from "@shared/src/rest/schema";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@shared/src/componets/UI/Table";
import { Input, InputCheckbox } from "@shared/src/componets/UI/Input";
import { Select } from "@shared/src/componets/UI/Select";
import { Option } from "@shared/src/componets/UI/Option";
import { Button } from "@shared/src/componets/UI/Button";
import { Span } from "@shared/src/componets/typography/typography";


type Props = {
  rows: RosterRow[] | null;
  loading?: boolean;
  onToggle: (studentId: string) => void;
  onSetGrade: (studentId: string, grade: string) => void;
  onSetDate: (studentId: string, date: string) => void;
};

const GRADE_OPTIONS = ["U", "G", "VG"] as const;

function isSent(row: RosterRow): boolean {
  return row.sent === true;
}

export function RosterTable({ rows, loading, onToggle, onSetGrade, onSetDate }: Props) {
  return (
    <div>
      <Button
          className="mb-4 mr-2"
          onClick={() => {
          rows?.forEach((row) => {
            if (!isSent(row) && row.selected === false) {
              onToggle(row.studentId);
            }
          });
        }}
        disabled={!rows || rows.length === 0}
      >
        Markera alla
      </Button>
      <Button
          className="mb-4 mr-2"
          onClick={() => {
          rows?.forEach((row) => {
            if (!isSent(row) && row.selected === true) {
              onToggle(row.studentId);
            }
          });
        }}
        disabled={!rows || rows.length === 0}
      >
        Avmarkera alla
      </Button>
      <div className="rounded-2xl shadow overflow-auto">
        <Table className="min-w-full text-sm">
          <TableHeader className="bg-primary-soft text-white">
            <TableRow>  
              <TableHead className="px-2 py-4 text-left w-10%">Val</TableHead>
              <TableHead className="px-0 py-4 text-center w-30%">Student</TableHead>
              <TableHead className="px-0 py-4 text-center w-20%">Ladok betyg</TableHead>
              <TableHead className="px-0 py-4 text-center w-20%">Datum</TableHead>
              <TableHead className="px-0 py-4 text-center w-20%">Status</TableHead>
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

            {rows?.map((row) => {
              const sent = isSent(row);
              const disabled = sent || !row.personnummer;

              return (
                <TableRow
                  key={row.studentId}
                  className={`align-top transition ${sent ? "bg-gray-50 opacity-70" : ""}`}
                >
                  <TableCell className="px-2 py-2">
                    <InputCheckbox
                      checked={!!row.selected}
                      onChange={() => onToggle(row.studentId)}
                      disabled={disabled}
                    />
                  </TableCell>
                  <TableCell className="text-center align-middle px-0 py-2">
                    <div className="font-medium">{row.name}</div>
                    <div className="text-xs text-gray-500">{row.studentId}</div>
                  </TableCell>
                  <TableCell className="text-center align-middle px-0 py-2">
                    <Select
                      className="border rounded-xl px-2 py-1"
                      value={row.ladokBetygPreselect ?? ""}
                      onChange={(e) => onSetGrade(row.studentId, e.target.value)}
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
                  <TableCell className="px-0 py-2">
                    <div className="flex items-center justify-center">
                      <Input
                        date
                        className="h-8 w-35 rounded-xl border px-2 text-sm"
                        value={row.datum}
                        onChangeDate={(date) => onSetDate(row.studentId, date)}
                        disabled={disabled}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="align-middle text-center px-0 py-2">
                    {sent ? (
                      <Span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 border border-green-300">
                        Klarmarkerad
                      </Span>
                    ) : (
                      <Span className="inline-block px-3 py-1 text-xs rounded-full bg-red-50 text-red-700 border border-red-300">
                        Ej klarmarkerad
                      </Span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
