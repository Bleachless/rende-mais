// Contas do tutorial (/aprenda): inflação acumulada e juros simples × compostos.

// IPCA mensal (% no mês) a partir de janeiro de `start`, sem buracos.
export type IpcaHistory = { start: number; monthly: number[] };

export function lastMonth(h: IpcaHistory) {
  const k = h.monthly.length - 1;
  return { year: h.start + Math.floor(k / 12), month: (k % 12) + 1 };
}

// Quanto os preços subiram de janeiro de `year` até o último mês da série (1,5 = +50%).
export function inflationSince(h: IpcaHistory, year: number) {
  const from = Math.max(0, (year - h.start) * 12);
  return h.monthly.slice(from).reduce((f, v) => f * (1 + v / 100), 1);
}

// Índice de preços acumulado, mês a mês (1 = janeiro do primeiro ano).
export function priceIndex(h: IpcaHistory) {
  const out = [1];
  for (const v of h.monthly) out.push(out[out.length - 1] * (1 + v / 100));
  return out;
}

export const simple = (principal: number, ratePct: number, years: number) => principal * (1 + (ratePct / 100) * years);
export const compound = (principal: number, ratePct: number, years: number) => principal * Math.pow(1 + ratePct / 100, years);

// Em quantos anos o dinheiro dobra a juros compostos.
export const doublingYears = (ratePct: number) => Math.log(2) / Math.log(1 + ratePct / 100);
