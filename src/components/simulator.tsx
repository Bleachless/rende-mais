"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { brl, cdbEquivalent, irRate, monthlyFor, pct, periodLabel, products, simulate, simulateAll, type Inputs, type ProductId, type Rates, type Result } from "@/lib/calc";
import { COLOR, GrowthChart } from "./chart";

type Mode = "simular" | "meta";
const DEFAULTS: Inputs = { initial: 10_000, monthly: 500, months: 24, cdbPct: 100, lciPct: 90, prefixado: 14, ipcaReal: 7, fundoPct: 100, fundoFee: 0.5 };
const DEFAULT_GOAL = 50_000;
const PERIODS = [6, 12, 24, 36, 60, 120];
const PARAMS: Record<keyof Inputs, string> = {
  initial: "v",
  monthly: "a",
  months: "p",
  cdbPct: "cdb",
  lciPct: "lci",
  prefixado: "pre",
  ipcaReal: "ipca",
  fundoPct: "fdi",
  fundoFee: "tx",
};
const LIMITS: Record<keyof Inputs, [number, number]> = {
  initial: [0, 100_000_000],
  monthly: [0, 10_000_000],
  months: [1, 360],
  cdbPct: [1, 300],
  lciPct: [1, 300],
  prefixado: [0, 100],
  ipcaReal: [0, 50],
  fundoPct: [1, 300],
  fundoFee: [0, 10],
};

type Start = { i: Inputs; mode: Mode; goal: number };
const START: Start = { i: DEFAULTS, mode: "simular", goal: DEFAULT_GOAL };

function fromSearch(search: string): Start {
  const q = new URLSearchParams(search);
  const out = { ...DEFAULTS };
  for (const k of Object.keys(PARAMS) as (keyof Inputs)[]) {
    const v = Number(q.get(PARAMS[k])?.replace(",", "."));
    if (q.has(PARAMS[k]) && Number.isFinite(v)) out[k] = Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], v));
  }
  const g = Number(q.get("meta"));
  return { i: out, mode: q.has("meta") ? "meta" : "simular", goal: Number.isFinite(g) && g > 0 ? Math.min(1_000_000_000, g) : DEFAULT_GOAL };
}

function toSearch(i: Inputs, mode: Mode, goal: number) {
  const q = new URLSearchParams();
  if (mode === "meta") q.set("meta", String(goal));
  for (const k of Object.keys(PARAMS) as (keyof Inputs)[]) {
    if (mode === "meta" && k === "monthly") continue;
    if (i[k] !== DEFAULTS[k]) q.set(PARAMS[k], String(i[k]));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

const noop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#10151c" stroke="#222b37" />
        <path d="M7 22l6-6 4 4 8-9" fill="none" stroke="#3ddc97" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 11h5v5" fill="none" stroke="#3ddc97" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        rende<span className="text-up">mais</span>
      </span>
    </span>
  );
}

function Ticker({ rates }: { rates: Rates }) {
  const items = [
    ["Selic", pct(rates.selic)],
    ["CDI", pct(rates.cdi)],
    ["IPCA 12m", pct(rates.ipca12)],
    ["TR", `${pct(rates.tr, 4)} a.m.`],
    ["Poupança", rates.selic > 8.5 ? "0,5% a.m. + TR" : "70% Selic + TR"],
    ["Fonte", `Banco Central · ${rates.updated}`],
  ];
  return (
    <div className="overflow-hidden border-y border-line bg-panel/70 py-2 backdrop-blur" aria-label="Taxas de hoje">
      <div className="anim-ticker flex w-max gap-10 whitespace-nowrap">
        {[...items, ...items, ...items, ...items].map(([k, v], i) => (
          <span key={i} className="num text-xs">
            <span className="text-dim">{k}</span> <span className="text-text">{v}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MoneyField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <span className="flex items-center rounded-xl border border-line bg-bg px-3 transition focus-within:border-up">
        <span className="text-sm text-dim">R$</span>
        <input
          inputMode="numeric"
          value={value ? value.toLocaleString("pt-BR") : ""}
          placeholder="0"
          onChange={(e) => onChange(Math.min(100_000_000, Number(e.target.value.replace(/\D/g, "")) || 0))}
          className="num w-full bg-transparent px-2 py-2.5 text-right text-lg outline-none"
        />
      </span>
    </label>
  );
}

function PctField({ label, value, onChange, suffix, step = 0.5 }: { label: string; value: number; onChange: (n: number) => void; suffix: string; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <span className="flex items-center rounded-xl border border-line bg-bg px-3 transition focus-within:border-up">
        <input
          type="number"
          step={step}
          min={0}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(300, Number(e.target.value) || 0)))}
          className="num w-full bg-transparent py-2.5 text-lg outline-none"
        />
        <span className="shrink-0 text-sm text-dim">{suffix}</span>
      </span>
    </label>
  );
}

type Plan = { need: number | null; result: Result };

// Modo meta: quanto guardar por mês em cada investimento para juntar o valor no prazo.
function Goal({ plans, goal, i }: { plans: Plan[]; goal: number; i: Inputs }) {
  const ok = plans.filter((x) => x.need !== null).sort((a, b) => a.need! - b.need!);
  const best = ok[0];
  const poup = plans.find((x) => x.result.product.id === "poupanca");
  if (!best) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-6">
        <p className="text-2xl font-semibold">Em 1 mês não dá tempo de aportar.</p>
        <p className="mt-2 text-muted">Aumente o prazo para ver quanto guardar por mês.</p>
      </div>
    );
  }
  const max = Math.max(...ok.map((x) => x.need!), 1);
  return (
    <>
      <div key={`${best.result.product.id}-${i.months}-${goal}`} className="anim-rise rounded-2xl border border-line bg-panel p-6">
        <p className="text-sm text-muted">
          Pra juntar {brl(goal, 0)} em {periodLabel(i.months)}
          {i.initial ? `, começando com ${brl(i.initial, 0)}` : ""}, o caminho mais leve é
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: COLOR[best.result.product.id] }}>
          {best.result.product.name}
        </p>
        {best.need === 0 ? (
          <p className="mt-3 text-2xl font-medium">Você já chega lá sem aportar nada. 🎉</p>
        ) : (
          <p className="num mt-3 text-4xl font-medium tracking-tight sm:text-5xl">
            {brl(best.need!)}
            <span className="text-xl text-muted"> /mês</span>
          </p>
        )}
        {poup?.need != null && poup.result.product.id !== best.result.product.id && poup.need > best.need! && (
          <p className="mt-2 text-muted">
            <span className="text-up">{brl(poup.need - best.need!)} a menos por mês</span> do que na poupança
          </p>
        )}
      </div>
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans
          .slice()
          .sort((a, b) => (a.need ?? Infinity) - (b.need ?? Infinity))
          .map(({ need, result: r }, k) => (
            <li key={r.product.id} className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4">
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: COLOR[r.product.id] }} />
              <p className="flex items-center gap-2 font-semibold">
                <span className="num text-xs text-dim">{k + 1}º</span>
                {r.product.name}
              </p>
              <p className="text-xs text-muted">{r.product.detail}</p>
              <p className="num mt-4 text-2xl font-medium">
                {need === null ? "—" : brl(need)}
                <span className="text-sm text-muted"> /mês</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${need === null ? 0 : Math.max(2, (need / max) * 100)}%`, background: COLOR[r.product.id] }} />
              </div>
              <dl className="num mt-3 grid grid-cols-2 gap-y-1 text-xs">
                <dt className="text-dim">Você guarda</dt>
                <dd className="text-right text-text">{brl(r.invested)}</dd>
                <dt className="text-dim">Rendimento</dt>
                <dd className="text-right text-up">+{brl(r.gain)}</dd>
                <dt className="text-dim">IR e taxas</dt>
                <dd className="text-right text-muted">{r.ir + r.fees > 0.005 ? `−${brl(r.ir + r.fees)}` : "isento"}</dd>
              </dl>
            </li>
          ))}
      </ol>
    </>
  );
}

function Calc({ rates, start, syncUrl }: { rates: Rates; start: Start; syncUrl: boolean }) {
  const [i, setI] = useState<Inputs>(start.i);
  const [mode, setMode] = useState<Mode>(start.mode);
  const [goal, setGoal] = useState(start.goal);
  const [hidden, setHidden] = useState<Set<ProductId>>(new Set());
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<Inputs>) => setI((x) => ({ ...x, ...patch }));

  // A simulação fica no endereço, para dar pra mandar o link. A primeira pintura (antes de ler o
  // endereço) não escreve nada, senão apagaria os parâmetros de quem abriu um link.
  useEffect(() => {
    if (syncUrl) history.replaceState(null, "", `${location.pathname}${toSearch(i, mode, goal)}`);
  }, [i, mode, goal, syncUrl]);

  // No modo meta, cada investimento é simulado com o aporte que ele precisa para chegar lá.
  const plans =
    mode === "meta"
      ? products(rates, i).map((p) => {
          const need = monthlyFor(p, i, goal, rates.ipca12);
          return { need, result: simulate(p, { ...i, monthly: need ?? 0 }, rates.ipca12) };
        })
      : [];
  const results = mode === "meta" ? plans.map((x) => x.result) : simulateAll(rates, i);
  const ranked = [...results].sort((a, b) => b.net - a.net);
  const best = ranked[0];
  const poup = results.find((r) => r.product.id === "poupanca")!;
  const maxGain = Math.max(...results.map((r) => r.gain), 1);
  const equiv = cdbEquivalent(i.lciPct, i.months);
  const invested = best.invested;
  const tier = irRate(i.months * (365.25 / 12));

  return (
    <>
      <section className="mx-auto mt-10 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        {/* Formulário */}
        <div className="h-fit rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-6">
          <div className="grid grid-cols-2 rounded-xl border border-line bg-bg p-1 text-sm" role="radiogroup" aria-label="Modo">
            {(
              [
                ["simular", "Simular"],
                ["meta", "Tenho uma meta"],
              ] as const
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-2 font-medium transition ${mode === m ? "bg-panel-2 text-text shadow" : "text-muted hover:text-text"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            {mode === "meta" && <MoneyField label="Quanto quer juntar" value={goal} onChange={(g) => setGoal(Math.max(1, g))} />}
            <MoneyField label="Quanto você tem hoje" value={i.initial} onChange={(initial) => set({ initial })} />
            {mode === "simular" && <MoneyField label="Quanto vai guardar por mês" value={i.monthly} onChange={(monthly) => set({ monthly })} />}
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-muted">{mode === "meta" ? "Em quanto tempo" : "Por quanto tempo"}</span>
                <span className="num text-sm text-text">{periodLabel(i.months)}</span>
              </div>
              <input type="range" min={1} max={120} value={Math.min(120, i.months)} onChange={(e) => set({ months: Number(e.target.value) })} className="w-full" aria-label="Prazo em meses" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PERIODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set({ months: m })}
                    className={`num rounded-lg border px-2.5 py-1 text-xs transition ${i.months === m ? "border-up bg-up/10 text-up" : "border-line text-muted hover:text-text"}`}
                  >
                    {m < 12 ? `${m}m` : `${m / 12}a`}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
              <PctField label="CDB paga" value={i.cdbPct} onChange={(cdbPct) => set({ cdbPct })} suffix="% CDI" />
              <PctField label="LCI/LCA paga" value={i.lciPct} onChange={(lciPct) => set({ lciPct })} suffix="% CDI" />
              <PctField label="Prefixado" value={i.prefixado} onChange={(prefixado) => set({ prefixado })} suffix="% a.a." />
              <PctField label="Tesouro IPCA+" value={i.ipcaReal} onChange={(ipcaReal) => set({ ipcaReal })} suffix="+ IPCA" />
              <PctField label="Fundo DI paga" value={i.fundoPct} onChange={(fundoPct) => set({ fundoPct })} suffix="% CDI" />
              <PctField label="Taxa do fundo" value={i.fundoFee} onChange={(fundoFee) => set({ fundoFee })} suffix="% a.a." step={0.1} />
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(location.href).catch(() => {});
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  }}
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm font-medium transition ${copied ? "border-up bg-up text-bg" : "border-line text-text hover:border-up"}`}
                >
                  {copied ? "Link copiado!" : "Copiar link"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          {mode === "meta" ? (
            <Goal plans={plans} goal={goal} i={i} />
          ) : (
          <>
          {/* Veredito */}
          <div key={`${best.product.id}-${i.months}`} className="anim-rise rounded-2xl border border-line bg-panel p-6">
            <p className="text-sm text-muted">
              Investindo {brl(invested, 0)} em {periodLabel(i.months)}, quem rende mais é
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: COLOR[best.product.id] }}>
              {best.product.name}
            </p>
            <p className="num mt-3 text-4xl font-medium tracking-tight sm:text-5xl">{brl(best.net)}</p>
            <p className="mt-2 text-muted">
              já sem IR e taxas ·{" "}
              {best.product.id === "poupanca" ? (
                "a poupança ganhou dessa vez"
              ) : (
                <>
                  <span className="text-up">{brl(best.net - poup.net)} a mais</span> que a poupança
                </>
              )}
            </p>
          </div>

          {/* Ranking */}
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ranked.map((r, k) => (
              <li key={r.product.id} className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4">
                <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: COLOR[r.product.id] }} />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-semibold">
                      <span className="num text-xs text-dim">{k + 1}º</span>
                      {r.product.name}
                    </p>
                    <p className="text-xs text-muted">{r.product.detail}</p>
                  </div>
                  <span className="num rounded-md bg-panel-2 px-1.5 py-0.5 text-[11px] text-muted">{pct(r.product.annual)} a.a.</span>
                </div>
                <p className="num mt-4 text-2xl font-medium">{brl(r.net)}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-2">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, (r.gain / maxGain) * 100)}%`, background: COLOR[r.product.id] }} />
                </div>
                <dl className="num mt-3 grid grid-cols-2 gap-y-1 text-xs">
                  <dt className="text-dim">Rendimento</dt>
                  <dd className="text-right text-up">+{brl(r.gain)}</dd>
                  <dt className="text-dim">IR</dt>
                  <dd className="text-right text-muted">{r.ir > 0.005 ? `−${brl(r.ir)}` : "isento"}</dd>
                  {r.product.custodyFree !== null && (
                    <>
                      <dt className="text-dim">Custódia B3</dt>
                      <dd className="text-right text-muted">{r.fees > 0.005 ? `−${brl(r.fees)}` : "isento"}</dd>
                    </>
                  )}
                  <dt className="text-dim">Acima da inflação</dt>
                  <dd className={`text-right ${r.realGain >= 0 ? "text-text" : "text-down"}`}>
                    {r.realGain >= 0 ? "+" : "−"}
                    {brl(Math.abs(r.realGain))}
                  </dd>
                </dl>
              </li>
            ))}
          </ol>
          </>
          )}

          {/* Gráfico */}
          <div className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-semibold">{mode === "meta" ? "O caminho até a meta" : "Quanto já rendeu, mês a mês"}</p>
                <p className="text-sm text-muted">
                  {mode === "meta" ? "Cada um com o aporte que precisa. Saldo líquido, se resgatar naquele mês." : "Se resgatar naquele mês, já sem IR e taxa de custódia."}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {results.map((r) => {
                  const off = hidden.has(r.product.id);
                  return (
                    <button
                      key={r.product.id}
                      type="button"
                      aria-pressed={!off}
                      onClick={() =>
                        setHidden((h) => {
                          const n = new Set(h);
                          if (n.has(r.product.id)) n.delete(r.product.id);
                          else n.add(r.product.id);
                          return n;
                        })
                      }
                      className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${off ? "border-line text-dim" : "border-line bg-panel-2 text-text"}`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: off ? "#5b6678" : COLOR[r.product.id] }} />
                      {r.product.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4">
              <GrowthChart results={results} hidden={hidden} goal={mode === "meta" ? goal : undefined} />
            </div>
          </div>

          {/* Dicas */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel p-5">
              <p className="num text-xs uppercase tracking-[0.2em] text-dim">CDB × LCI</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Em {periodLabel(i.months)}, o IR do CDB é de <b className="text-text">{pct(tier * 100, 1)}</b>. Pra empatar com uma LCI/LCA de{" "}
                <b className="text-text">{pct(i.lciPct, 0)} do CDI</b>, o CDB precisa pagar pelo menos <b className="text-up">{pct(equiv, 1)} do CDI</b>.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-panel p-5">
              <p className="num text-xs uppercase tracking-[0.2em] text-dim">Tabela do IR</p>
              <ul className="num mt-2 space-y-1 text-sm">
                {[
                  ["até 6 meses", 22.5],
                  ["6 a 12 meses", 20],
                  ["1 a 2 anos", 17.5],
                  ["mais de 2 anos", 15],
                ].map(([k, v]) => (
                  <li key={k as string} className={`flex justify-between ${Number(v) / 100 === tier ? "text-up" : "text-muted"}`}>
                    <span>{k}</span>
                    <span>{pct(Number(v), 1)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-dim">Cada aporte conta o próprio prazo: o dinheiro mais novo paga mais IR.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function Simulator({ rates }: { rates: Rates }) {
  const hydrated = useHydrated();
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <a href="https://github.com/Bleachless/rende-mais" target="_blank" rel="noreferrer" className="text-sm text-muted hover:text-text">
          código aberto ↗
        </a>
      </header>
      <Ticker rates={rates} />
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <p className="num text-xs uppercase tracking-[0.25em] text-up">CDI {pct(rates.cdi)} hoje · direto do Banco Central</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Quanto o seu dinheiro rende{" "}
            <span className="bg-gradient-to-r from-up via-blue to-violet bg-clip-text text-transparent">de verdade?</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Poupança, CDB, LCI/LCA, Tesouro Selic, Tesouro IPCA+, fundo DI e prefixado lado a lado, com as taxas de hoje e já descontando o que
            ninguém lembra: IR regressivo, come-cotas, custódia da B3 e inflação. Ou diga a sua meta e veja quanto guardar por mês.
          </p>
          {!rates.live && (
            <p className="mt-4 inline-block rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-sm text-amber">
              O Banco Central não respondeu agora: usando as últimas taxas conhecidas.
            </p>
          )}
        </section>
        <Calc key={hydrated ? "url" : "padrao"} rates={rates} start={hydrated ? fromSearch(location.search) : START} syncUrl={hydrated} />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-sm text-dim sm:px-6">
        <p>
          Simulação educativa com as taxas de hoje mantidas pelo período todo. Rentabilidade futura não é garantida e isto não é recomendação de
          investimento. Não considera IOF (resgates com menos de 30 dias) nem o limite do FGC.
        </p>
        <p className="mt-2">
          Feito por{" "}
          <a href="https://portifolio-joao-vaz.vercel.app" className="text-muted underline-offset-4 hover:text-text hover:underline">
            João Vaz
          </a>
          .
        </p>
      </footer>
    </>
  );
}
