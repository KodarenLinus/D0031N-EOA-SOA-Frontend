import { jsonFetch, getApiBase } from "./fetch";
import type { EpokModule } from "./schema";
/**
 * Epok REST-klient
 */
const API = () => getApiBase();

export const EpokApi = {
  listModules: (kurskod: string, onlyActive: boolean = true) =>
    jsonFetch<EpokModule[]>(
      `${API()}/epok/courses/${encodeURIComponent(kurskod)}/modules?onlyActive=${onlyActive}`
    ),
};