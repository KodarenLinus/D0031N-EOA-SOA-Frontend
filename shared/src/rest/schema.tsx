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
// --- Roster table row ---
export type RosterRow = {
  studentId: string;
  name: string;
  personnummer: string | null;
  datum: string;                 // YYYY-MM-DD
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
  kurstillfalleId: number;
  kurskod: string;
  instanskod: string;
  personnummer: string;
  fornamn: string;
  efternamn: string;
  registreringsStatus?: string;
  sent?: boolean;
  ladokStatus?: string;
  ladokBetyg?: string;
  registeredAt?: string; // ISO
};

export type LadokResultRequestDto = {
  personnummer: string;
  kurskod: string;
  modulkod: string;
  datum: string; // YYYY-MM-DD
  betyg: string;
};

export type LadokResultResponseDto = {
  id: number | null;
  status: string;  // "registrerad" | "hinder" | ...
  message: string; // "OK" | ...
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