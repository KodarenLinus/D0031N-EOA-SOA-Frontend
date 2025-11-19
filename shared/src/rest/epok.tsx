import { jsonFetch, getApiBase } from "./fetch";
import type { EpokModule } from "./schema";
/**
 * Epok REST-klient
 */
const API = () => getApiBase();
const EPOK_BASE = `${API()}/epok`;

export const EpokApi = {
  listModules: (kurskod: string, onlyActive: boolean = true) =>
    jsonFetch<EpokModule[]>(
      `${EPOK_BASE}/courses/${encodeURIComponent(kurskod)}/modules?onlyActive=${onlyActive}`
    ),
};