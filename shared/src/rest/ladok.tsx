import { jsonFetch, getApiBase } from "./fetch";
import {
  LadokRosterItemDto,
  LadokResultRequestDto,
  LadokResultResponseDto,
} from "./schema";

const API = () => getApiBase();
const LADOK_BASE = `${API()}/ladok`;

export const LadokApi = {
  getRoster: (kurskod: string, modulkod: string) =>
    jsonFetch<LadokRosterItemDto[]>(
      `${LADOK_BASE}/courses/${encodeURIComponent(kurskod)}/roster?modul=${encodeURIComponent(modulkod)}`
    ),
  

  postResult: (body: LadokResultRequestDto) => 
    jsonFetch<LadokResultResponseDto>(`${LADOK_BASE}/results`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  

  postResultsBulk: async (items: LadokResultRequestDto[]) => {
    const postResult = LadokApi.postResult;
    const ok: LadokResultRequestDto[] = [];
    const already: LadokResultRequestDto[] = [];
    const errors: Array<{ item: LadokResultRequestDto; error: Error }> = [];

    for (const item of items) {
      try {
        const res = await postResult(item);
        const s = res.status.toLowerCase();
        if (s === "registrerad") {
          ok.push(item);
        } else if (s === "hinder" && /redan/i.test(res.message)) {
          already.push(item);
        } else {
          errors.push({ 
            item, 
            error: new Error(`${res.status}: ${res.message}`) 
          });
        }
      } catch (e: any) {
        errors.push({ 
          item, 
          error: e 
        });
      }
    }
    return { ok, already, errors };
  }
}
