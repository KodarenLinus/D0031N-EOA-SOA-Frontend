/**
 * Canvas Schema types
 */
// --- Canvas assignment type ---
export type Assignment = {
  id: number;
  name: string;
  scaleHint?: string | null;
  type?: string | null;
};
// --- Canvas roster item type ---
export type RosterItem = {
  studentId: string;          
  name: string;
  email?: string | null;        
  canvasGrade?: string | null;  
  gradedAt?: string | null;    

};
// --- Canvas assignments response ---
export type CanvasAssignmentsResponse = {
  assignments: Assignment[];
};
// --- Canvas roster response ---
export type CanvasRosterResponse = {
  roster: RosterItem[];
};

/**
 * UI-ready roster row
 */
// --- Roster table row ---
export type RosterRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
  canvasOmdome: string | null;
  datum: string;                 // YYYY-MM-DD
  ladokBetygPreselect: string | null;
  selected: boolean;
};
// --- Roster table data ---
export type RosterTableData = RosterRow[];

/**
 * Ladok Schema types
 * 
 */
// --- Ladok grades response
export type LadokGradesResponse = {
  grades: { [studentId: string]: string | null };
};
// --- Ladok submit response ---
export type LadokSubmitResponse = {
  success: boolean;
  message: string;
  resultatId?: number | null;
};
// --- Ladok submit body ---
export type LadokRegisterBody = {
  personnummer: string;
  kurskod: string;
  modulkod: string;     
  datum: string;      
  betyg: string;      
};
/**
 * Epok Schema types
 */
// --- Epok domain types ---
export type EpokModule = {
  modulkod: string;
  namn: string;
  aktiv: boolean;
};