// studentits.tsx
import { jsonFetch, getApiBase } from "./fetch";
import type { studentitsResponse } from "./schema";

const API = () => getApiBase();
const STUDENTITS_BASE = `${API()}/its`;

export const StudentITSApi = {
  // Single call
  getPersonnummer: (anvandarnamn: string) =>
    jsonFetch<studentitsResponse>(
      `${STUDENTITS_BASE}/personnummer?anvandarnamn=${encodeURIComponent(anvandarnamn)}`
    ),

  // “Fake” batch that do multiple single-calls
  getPersonnummerBatch: async (anvandarnamnList: string[]): Promise<studentitsResponse[]> => {
    const results = await Promise.all(
      anvandarnamnList.map(async (anvandarnamn) => {
        try {
          const res = await StudentITSApi.getPersonnummer(anvandarnamn);
          return {
            studentId: anvandarnamn,
            personnummer: res.personnummer,
            fornamn: res.fornamn,
            efternamn: res.efternamn,
          } as studentitsResponse;
        } catch {
          // Fail safely by returning minimal info
          return {
            studentId: anvandarnamn,
            personnummer: "",
            fornamn: "",
            efternamn: "",
          } as studentitsResponse;
        }
      })
    );
    return results;
  },
};
