// Simulação mês a mês. Cada aporte é um "lote" com a própria idade, porque o IR regressivo
// depende de quanto tempo cada real ficou aplicado.

export type Rates = {
  selic: number; // meta, % a.a.
  selicEfetiva: number; // % a.a., base 252
  cdi: number; // % a.a., base 252
  tr: number; // % a.m.
  ipca12: number; // % nos últimos 12 meses
  updated: string; // data da última leitura do CDI, dd/mm/aaaa
  live: boolean; // false = valores de reserva
};

export type Inputs = {
  initial: number; // R$
  monthly: number; // R$
  months: number;
  cdbPct: number; // % do CDI
  lciPct: number; // % do CDI
  prefixado: number; // % a.a.
};

export type ProductId = "poupanca" | "cdb" | "lci" | "selic" | "pre";

export type Product = {
  id: ProductId;
  name: string;
  detail: string;
  annual: number; // % a.a. bruto
  ir: boolean;
  custody: boolean; // taxa da B3 do Tesouro
};

export type Result = {
  product: Product;
  invested: number;
  gross: number;
  ir: number;
  fees: number;
  net: number;
  gain: number; // líquido
  realGain: number; // acima da inflação
  series: number[]; // valor líquido se resgatar em cada mês (índice 0 = início)
  gains: number[]; // quanto já rendeu, líquido, em cada mês
};

export const IR_TABLE = [
  { upTo: 180, rate: 0.225 },
  { upTo: 360, rate: 0.2 },
  { upTo: 720, rate: 0.175 },
  { upTo: Infinity, rate: 0.15 },
];

export const irRate = (days: number) => IR_TABLE.find((t) => days <= t.upTo)!.rate;
const DAYS_PER_MONTH = 365.25 / 12;

// Poupança: 0,5% a.m. + TR com Selic acima de 8,5%; senão, 70% da Selic + TR.
export function poupancaMonthly(selic: number, tr: number) {
  const base = selic > 8.5 ? 0.005 : Math.pow(1 + (0.7 * selic) / 100, 1 / 12) - 1;
  return (1 + base) * (1 + tr / 100) - 1;
}

export function products(r: Rates, i: Inputs): Product[] {
  const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  const poup = (Math.pow(1 + poupancaMonthly(r.selic, r.tr), 12) - 1) * 100;
  return [
    { id: "poupanca", name: "Poupança", detail: r.selic > 8.5 ? "0,5% a.m. + TR, sem IR" : "70% da Selic + TR, sem IR", annual: poup, ir: false, custody: false },
    { id: "cdb", name: "CDB", detail: `${fmt(i.cdbPct)}% do CDI, com IR`, annual: (r.cdi * i.cdbPct) / 100, ir: true, custody: false },
    { id: "lci", name: "LCI / LCA", detail: `${fmt(i.lciPct)}% do CDI, sem IR`, annual: (r.cdi * i.lciPct) / 100, ir: false, custody: false },
    { id: "selic", name: "Tesouro Selic", detail: "Selic, com IR e custódia da B3", annual: r.selicEfetiva, ir: true, custody: true },
    { id: "pre", name: "Prefixado", detail: `${fmt(i.prefixado)}% a.a., com IR`, annual: i.prefixado, ir: true, custody: false },
  ];
}

// Taxa de custódia da B3 no Tesouro Selic: 0,20% a.a. sobre o que passar de R$ 10 mil.
const CUSTODY = 0.002;
const CUSTODY_FREE = 10_000;

export function simulate(p: Product, i: Inputs, ipca12: number): Result {
  const m = Math.max(1, Math.round(i.months));
  const f = Math.pow(1 + p.annual / 100, 1 / 12);
  const inflation = Math.pow(1 + ipca12 / 100, 1 / 12);
  type Lot = { principal: number; value: number; age: number };
  const lots: Lot[] = [];
  let fees = 0;
  let inflated = 0; // aportes corrigidos pela inflação
  const series: number[] = [];
  const gains: number[] = [];
  const principal = () => lots.reduce((s, l) => s + l.principal, 0);

  const netNow = () =>
    lots.reduce((s, l) => {
      const gain = l.value - l.principal;
      const tax = p.ir && gain > 0 ? gain * irRate(l.age * DAYS_PER_MONTH) : 0;
      return s + l.value - tax;
    }, 0);

  if (i.initial > 0) lots.push({ principal: i.initial, value: i.initial, age: 0 });
  inflated += Math.max(0, i.initial);
  series.push(netNow());
  gains.push(0);

  for (let k = 1; k <= m; k++) {
    for (const l of lots) {
      l.value *= f;
      l.age += 1;
    }
    inflated *= inflation;
    if (p.custody) {
      const total = lots.reduce((s, l) => s + l.value, 0);
      const fee = (Math.max(0, total - CUSTODY_FREE) * CUSTODY) / 12;
      if (fee > 0 && total > 0) for (const l of lots) l.value -= fee * (l.value / total);
      fees += fee;
    }
    series.push(netNow());
    gains.push(series[k] - principal());
    // Aporte no fim do mês (o último mês não recebe aporte: é o mês do resgate).
    if (i.monthly > 0 && k < m) {
      lots.push({ principal: i.monthly, value: i.monthly, age: 0 });
      inflated += i.monthly;
    }
  }

  const invested = lots.reduce((s, l) => s + l.principal, 0);
  const gross = lots.reduce((s, l) => s + l.value, 0);
  const net = netNow();
  return { product: p, invested, gross, ir: gross - net, fees, net, gain: net - invested, realGain: net - inflated, series, gains };
}

export function simulateAll(r: Rates, i: Inputs): Result[] {
  return products(r, i).map((p) => simulate(p, i, r.ipca12));
}

// Quanto um CDB precisa pagar (% do CDI) para empatar com a LCI/LCA, no prazo escolhido.
export function cdbEquivalent(lciPct: number, months: number) {
  return lciPct / (1 - irRate(months * DAYS_PER_MONTH));
}

export const brl = (n: number, digits = 2) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: digits, maximumFractionDigits: digits });

export const pct = (n: number, digits = 2) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

export function periodLabel(months: number) {
  const y = Math.floor(months / 12);
  const mo = months % 12;
  const ys = y ? `${y} ${y === 1 ? "ano" : "anos"}` : "";
  const ms = mo ? `${mo} ${mo === 1 ? "mês" : "meses"}` : "";
  return [ys, ms].filter(Boolean).join(" e ");
}
