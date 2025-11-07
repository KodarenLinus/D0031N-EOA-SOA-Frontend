// --- Canvas & Ladok domain types ---
export type Assignment = {
  id: number;
  name: string;
  scaleHint?: string | null;
  type?: string | null;
};

export type RosterItem = {
  studentId: string;            // backend aliasar CAST(id AS varchar)
  name: string;
  email?: string | null;        // ej använd i prototypen
  canvasGrade?: string | null;  // betyg i Canvas om satt
  gradedAt?: string | null;     // ISO
};

// Rad för tabellen i UI
export type RosterRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
  canvasOmdome: string | null;
  datum: string;                 // YYYY-MM-DD
  ladokBetygPreselect: string | null;
  selected: boolean;
};

export type RosterTableData = RosterRow[];

// --- API response wrappers (om du vill ha v2/wrapped endpoints) ---
export type CanvasAssignmentsResponse = {
  assignments: Assignment[];
};

export type CanvasRosterResponse = {
  roster: RosterItem[];
};

export type LadokGradesResponse = {
  grades: { [studentId: string]: string | null };
};

export type LadokSubmitResponse = {
  success: boolean;
  message: string;
  resultatId?: number | null;
};

// --- Ladok submit body ---
export type LadokRegisterBody = {
  personnummer: string;
  kurskod: string;
  modul: string;      // UI kallar den 'modul'
  datum: string;      // YYYY-MM-DD
  betyg: string;      // "G" | "VG" | ...
};

// --- Epok domain types ---
export type EpokModule = {
  modulkod: string;
  namn: string;
  aktiv: boolean;
};