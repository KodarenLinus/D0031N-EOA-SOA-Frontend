import { jsonFetch, getApiBase } from "./fetch";
import {
  LadokRosterItemDto,
  LadokResultRequestDto,
  LadokResultResponseDto,
} from "./schema";

const API = () => {
  const base = getApiBase() || "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
};
const LADOK_BASE = `${API()}/ladok`;

async function getRoster(kurskod: string, modulkod: string) {
  const url = `${LADOK_BASE}/courses/${encodeURIComponent(kurskod)}/roster?modul=${encodeURIComponent(modulkod)}`;
  return jsonFetch<LadokRosterItemDto[]>(url);
}

async function postResult(body: LadokResultRequestDto) {
  return jsonFetch<LadokResultResponseDto>(`${LADOK_BASE}/results`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function postResultsBulk(items: LadokResultRequestDto[]) {
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
        errors.push({ item, error: new Error(`${res.status}: ${res.message}`) });
      }
    } catch (e: any) {
      errors.push({ item, error: e });
    }
  }
  return { ok, already, errors };
}

export const LadokApi = {
  getRoster,
  postResult,
  postResultsBulk,
};
