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

// Rendimento bruto de `principal` a `ratePct` ao ano em `days` dias corridos.
export const grossGain = (principal: number, ratePct: number, days: number) => principal * (Math.pow(1 + ratePct / 100, days / 365) - 1);

// FGC: até R$ 250 mil por CPF em cada instituição. O que passar disso fica sem garantia.
export const FGC_LIMIT = 250_000;
export const fgcSplit = (amount: number) => ({ covered: Math.min(amount, FGC_LIMIT), uncovered: Math.max(0, amount - FGC_LIMIT) });

// Liquidez: `lock` meses sem poder sacar, depois `market` meses em que só sai pelo preço do dia.
export type Access = "livre" | "preso" | "mercado";
export const access = (lock: number, market: number, month: number): Access => (month < lock ? "preso" : month < lock + market ? "mercado" : "livre");

// IOF regressivo nos resgates antes de 30 dias (Decreto 6.306/2007, anexo): % do rendimento, do 1º ao 29º dia.
export const IOF_TABLE = [96, 93, 90, 86, 83, 80, 76, 73, 70, 66, 63, 60, 56, 53, 50, 46, 43, 40, 36, 33, 30, 26, 23, 20, 16, 13, 10, 6, 3];
export const iofRate = (days: number) => (days >= 1 && days < 30 ? IOF_TABLE[days - 1] / 100 : 0);

// Marcação a mercado: quanto vale hoje um título que paga `face` daqui a `years` anos, se o
// mercado está pedindo `ratePct` ao ano. Juros sobem, preço cai; juros caem, preço sobe.
export const titlePrice = (face: number, ratePct: number, years: number) => face / Math.pow(1 + ratePct / 100, years);

// Reserva de emergência: em quantos meses guardando `monthly` por mês (rendendo `ratePct` ao ano)
// se chega a `target`. Infinity se não guardar nada.
export function monthsToSave(target: number, monthly: number, ratePct: number) {
  if (target <= 0) return 0;
  if (monthly <= 0) return Infinity;
  const r = Math.pow(1 + ratePct / 100, 1 / 12) - 1;
  let total = 0;
  for (let m = 1; m <= 1200; m++) {
    total = total * (1 + r) + monthly;
    if (total >= target) return m;
  }
  return Infinity;
}
