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
// --- Base row used for merging data sources ---
export type BaseRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
};
// --- Roster table row ---
export type RosterRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
  datum: string;                 
  ladokBetygPreselect: string | null;
  selected: false | true;
  sent: boolean;
  ladokStatus: string | null;
  registeredAt: string | null;
};

// --- Roster table data ---
export type RosterTableData = RosterRow[];

/**
 * Ladok Schema types
 * 
 */
// --- Ladok grades response
export type LadokRosterItemDto = {
  kurskod: string;
  personnummer: string;
  registreringsStatus?: string;
  sent?: boolean;
  ladokStatus?: string;
  ladokBetyg?: string;
  datum?: string;
};

// --- Ladok result request
export type LadokResultRequestDto = {
  personnummer: string;
  kurskod: string;
  modulkod: string;
  datum: string;
  betyg: string;
};

// --- Ladok result response
export type LadokResultResponseDto = {
  id: number | null;
  status: string;  
  message: string; 
};

/**
 * Epok Schema types
 */
export type EpokModule = {
  modulkod: string;
  namn: string;
  aktiv: boolean;
};