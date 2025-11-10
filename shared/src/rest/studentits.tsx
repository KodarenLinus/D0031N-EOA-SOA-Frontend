import { jsonFetch, getApiBase } from "./fetch";
/**
 * StudentITS REST-klient
 */
const API = () => getApiBase();

export const StudentITSApi = {
    
    getPersonnummer: (anvandarnamn: string) =>
    jsonFetch<{ anvandarnamn: string; personnummer: string; fornamn: string; efternamn: string }>(
      `${API()}/its/personnummer?anvandarnamn=${encodeURIComponent(anvandarnamn)}`
    ),
}