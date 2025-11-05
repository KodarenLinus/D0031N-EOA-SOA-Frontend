import { getApiBase } from "./fetch";

const API = () => getApiBase();

export type LadokRegisterBody = {
  personnummer: string;
  kurskod: string;
  modul: string;
  datum: string;
  betyg: string;
};

export const LadokApi = {
  registerResult: async (payload: LadokRegisterBody) => {
    const res = await fetch(`${API()}/ladok/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || res.statusText);
    return data;
  },
};
