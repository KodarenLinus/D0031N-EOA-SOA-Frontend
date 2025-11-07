import { jsonFetch, getApiBase } from "./fetch";
import type { Assignment, RosterItem } from "./schema";

const API = () => getApiBase();

/**
 * Canvas REST-klient (matchar våra Spring controllers)
 */
export const StudentITSApi = {
    
    getPersonnummer: (anvandarnamn: string) =>
    jsonFetch<{ anvandarnamn: string; personnummer: string; fornamn: string; efternamn: string }>(
      `${API()}/its/personnummer?anvandarnamn=${encodeURIComponent(anvandarnamn)}`
    ),
}