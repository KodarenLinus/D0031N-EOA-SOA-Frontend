// --- Canvas & Ladok domain types ---
export type Assignment = {
  id: number;
  name: string;
  scaleHint?: string | null;
  type?: string | null;
};

export type RosterItem = {
  studentId: string;
  name: string;
  email?: string | null;
  canvasGrade?: string | null;
  gradedAt?: string | null;
};

// Row for table
export type RosterRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
  canvasOmdome: string | null;
  datum: string;
  ladokBetygPreselect: string | null;
  selected: boolean;
};


export type RosterTableData = RosterRow[];

// --- API response types ---
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
};  