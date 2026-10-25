import { cacheLife } from "next/cache";
import type { Rates } from "./calc";

// Séries do SGS (Sistema Gerenciador de Séries Temporais) do Banco Central.
const SERIES = { selic: 432, selicEfetiva: 1178, cdi: 4389, tr: 226, ipca12: 13522 } as const;

// Usados se a API do Banco Central não responder (ela oscila de vez em quando).
export const FALLBACK: Rates = { selic: 13.75, selicEfetiva: 13.65, cdi: 13.65, tr: 0.1261, ipca12: 4.58, updated: "22/10/2026", live: false };

async function last(serie: number): Promise<{ data: string; valor: number } | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie}/dados/ultimos/1?formato=json`, {
        headers: { Accept: "application/json", "User-Agent": "rende-mais" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const [row] = (await res.json()) as { data: string; valor: string }[];
      const valor = Number(row?.valor);
      if (Number.isFinite(valor)) return { data: row.data, valor };
    } catch {
      // tenta de novo
    }
  }
  return null;
}

// Fica em cache por hora: a página sai pronta e as taxas se atualizam sozinhas.
export async function getRates(): Promise<Rates> {
  "use cache";
  cacheLife("hours");

  const entries = await Promise.all(Object.entries(SERIES).map(async ([k, s]) => [k, await last(s)] as const));
  const got = Object.fromEntries(entries) as Record<keyof typeof SERIES, { data: string; valor: number } | null>;
  const live = Object.values(got).every(Boolean);
  return {
    selic: got.selic?.valor ?? FALLBACK.selic,
    selicEfetiva: got.selicEfetiva?.valor ?? FALLBACK.selicEfetiva,
    cdi: got.cdi?.valor ?? FALLBACK.cdi,
    tr: got.tr?.valor ?? FALLBACK.tr,
    ipca12: got.ipca12?.valor ?? FALLBACK.ipca12,
    updated: got.cdi?.data ?? FALLBACK.updated,
    live,
  };
}
