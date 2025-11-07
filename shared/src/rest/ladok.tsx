import { getApiBase } from "./fetch";
import { LadokRegisterBody } from "./schema";

const API = () => getApiBase();


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
