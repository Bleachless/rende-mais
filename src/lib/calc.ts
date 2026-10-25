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
  ipcaReal: number; // Tesouro IPCA+: juro real, % a.a.
  fundoPct: number; // fundo DI, % do CDI antes da taxa
  fundoFee: number; // taxa de administração, % a.a.
};

export type ProductId = "poupanca" | "cdb" | "lci" | "selic" | "ipca" | "fundo" | "pre";

export type Product = {
  id: ProductId;
  name: string;
  detail: string;
  annual: number; // % a.a. bruto
  ir: boolean;
  custodyFree: number | null; // taxa da B3 no Tesouro: isenção até esse saldo (null = não tem)
  fee: number; // taxa de administração, % a.a.
  comeCotas: boolean; // fundo: adianta 15% de IR a cada 6 meses
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
  const base = { ir: true, custodyFree: null, fee: 0, comeCotas: false };
  return [
    { ...base, id: "poupanca", name: "Poupança", detail: r.selic > 8.5 ? "0,5% a.m. + TR, sem IR" : "70% da Selic + TR, sem IR", annual: poup, ir: false },
    { ...base, id: "cdb", name: "CDB", detail: `${fmt(i.cdbPct)}% do CDI, com IR`, annual: (r.cdi * i.cdbPct) / 100 },
    { ...base, id: "lci", name: "LCI / LCA", detail: `${fmt(i.lciPct)}% do CDI, sem IR`, annual: (r.cdi * i.lciPct) / 100, ir: false },
    { ...base, id: "selic", name: "Tesouro Selic", detail: "Selic, com IR e custódia da B3", annual: r.selicEfetiva, custodyFree: SELIC_CUSTODY_FREE },
    {
      ...base,
      id: "ipca",
      name: "Tesouro IPCA+",
      detail: `IPCA + ${fmt(i.ipcaReal)}%, com IR e custódia`,
      annual: ((1 + r.ipca12 / 100) * (1 + i.ipcaReal / 100) - 1) * 100,
      custodyFree: 0,
    },
    {
      ...base,
      id: "fundo",
      name: "Fundo DI",
      detail: `${fmt(i.fundoPct)}% do CDI, ${fmt(i.fundoFee)}% de taxa e come-cotas`,
      annual: (r.cdi * i.fundoPct) / 100,
      fee: i.fundoFee,
      comeCotas: true,
    },
    { ...base, id: "pre", name: "Prefixado", detail: `${fmt(i.prefixado)}% a.a., com IR`, annual: i.prefixado },
  ];
}

// Taxa de custódia da B3 no Tesouro: 0,20% a.a. No Tesouro Selic, só sobre o que passar de R$ 10 mil.
const CUSTODY = 0.002;
const SELIC_CUSTODY_FREE = 10_000;
const COME_COTAS = 0.15;

export function simulate(p: Product, i: Inputs, ipca12: number): Result {
  const m = Math.max(1, Math.round(i.months));
  // A taxa de administração sai do rendimento todo dia; aqui, do fator do mês.
  const f = Math.pow(1 + p.annual / 100, 1 / 12) * Math.pow(1 - p.fee / 100, 1 / 12);
  const inflation = Math.pow(1 + ipca12 / 100, 1 / 12);
  // base = valor na última mordida do come-cotas; prepaid = IR já adiantado por ele.
  type Lot = { principal: number; value: number; age: number; base: number; prepaid: number };
  const lots: Lot[] = [];
  let fees = 0;
  let inflated = 0; // aportes corrigidos pela inflação
  const series: number[] = [];
  const gains: number[] = [];
  const principal = () => lots.reduce((s, l) => s + l.principal, 0);

  // IR que ainda falta no resgate: alíquota do prazo sobre o ganho todo, menos o que o come-cotas já levou.
  const taxDue = (l: Lot) => {
    const gain = l.value + l.prepaid - l.principal;
    return p.ir && gain > 0 ? Math.max(0, gain * irRate(l.age * DAYS_PER_MONTH) - l.prepaid) : 0;
  };
  const netNow = () => lots.reduce((s, l) => s + l.value - taxDue(l), 0);
  const lot = (amount: number): Lot => ({ principal: amount, value: amount, age: 0, base: amount, prepaid: 0 });

  if (i.initial > 0) lots.push(lot(i.initial));
  inflated += Math.max(0, i.initial);
  series.push(netNow());
  gains.push(0);

  for (let k = 1; k <= m; k++) {
    for (const l of lots) {
      l.value *= f;
      l.age += 1;
    }
    inflated *= inflation;
    if (p.comeCotas && k % 6 === 0) {
      for (const l of lots) {
        const bite = Math.max(0, l.value - l.base) * COME_COTAS;
        l.value -= bite;
        l.prepaid += bite;
        l.base = l.value;
      }
    }
    if (p.custodyFree !== null) {
      const total = lots.reduce((s, l) => s + l.value, 0);
      const fee = (Math.max(0, total - p.custodyFree) * CUSTODY) / 12;
      if (fee > 0 && total > 0) for (const l of lots) l.value -= fee * (l.value / total);
      fees += fee;
    }
    series.push(netNow());
    gains.push(series[k] - principal());
    // Aporte no fim do mês (o último mês não recebe aporte: é o mês do resgate).
    if (i.monthly > 0 && k < m) {
      lots.push(lot(i.monthly));
      inflated += i.monthly;
    }
  }

  const invested = lots.reduce((s, l) => s + l.principal, 0);
  const net = netNow();
  const ir = lots.reduce((s, l) => s + l.prepaid + taxDue(l), 0);
  return { product: p, invested, gross: net + ir, ir, fees, net, gain: net - invested, realGain: net - inflated, series, gains };
}

export function simulateAll(r: Rates, i: Inputs): Result[] {
  return products(r, i).map((p) => simulate(p, i, r.ipca12));
}

// Meta: quanto guardar por mês, em cada investimento, para ter `goal` líquido no fim do prazo.
// Busca binária no aporte (o resultado cresce junto com o aporte). null = impossível no prazo.
export function monthlyFor(p: Product, i: Inputs, goal: number, ipca12: number): number | null {
  const net = (monthly: number) => simulate(p, { ...i, monthly }, ipca12).net;
  if (net(0) >= goal) return 0;
  if (i.months < 2) return null;
  let lo = 0;
  let hi = goal;
  for (let k = 0; k < 40 && hi - lo > 0.005; k++) {
    const mid = (lo + hi) / 2;
    if (net(mid) >= goal) hi = mid;
    else lo = mid;
  }
  return Math.ceil(hi * 100) / 100;
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
