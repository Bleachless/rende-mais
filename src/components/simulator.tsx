"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { brl, cdbEquivalent, irRate, pct, periodLabel, simulateAll, type Inputs, type ProductId, type Rates } from "@/lib/calc";
import { COLOR, GrowthChart } from "./chart";

const DEFAULTS: Inputs = { initial: 10_000, monthly: 500, months: 24, cdbPct: 100, lciPct: 90, prefixado: 14 };
const PERIODS = [6, 12, 24, 36, 60, 120];
const PARAMS: Record<keyof Inputs, string> = { initial: "v", monthly: "a", months: "p", cdbPct: "cdb", lciPct: "lci", prefixado: "pre" };
const LIMITS: Record<keyof Inputs, [number, number]> = {
  initial: [0, 100_000_000],
  monthly: [0, 10_000_000],
  months: [1, 360],
  cdbPct: [1, 300],
  lciPct: [1, 300],
  prefixado: [0, 100],
};

function fromSearch(search: string): Inputs {
  const q = new URLSearchParams(search);
  const out = { ...DEFAULTS };
  for (const k of Object.keys(PARAMS) as (keyof Inputs)[]) {
    const v = Number(q.get(PARAMS[k])?.replace(",", "."));
    if (q.has(PARAMS[k]) && Number.isFinite(v)) out[k] = Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], v));
  }
  return out;
}

function toSearch(i: Inputs) {
  const q = new URLSearchParams();
  for (const k of Object.keys(PARAMS) as (keyof Inputs)[]) if (i[k] !== DEFAULTS[k]) q.set(PARAMS[k], String(i[k]));
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

function PctField({ label, value, onChange, suffix }: { label: string; value: number; onChange: (n: number) => void; suffix: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <span className="flex items-center rounded-xl border border-line bg-bg px-3 transition focus-within:border-up">
        <input
          type="number"
          step="0.5"
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

function Calc({ rates, initial, syncUrl }: { rates: Rates; initial: Inputs; syncUrl: boolean }) {
  const [i, setI] = useState<Inputs>(initial);
  const [hidden, setHidden] = useState<Set<ProductId>>(new Set());
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<Inputs>) => setI((x) => ({ ...x, ...patch }));

  // A simulação fica no endereço, para dar pra mandar o link. A primeira pintura (antes de ler o
  // endereço) não escreve nada, senão apagaria os parâmetros de quem abriu um link.
  useEffect(() => {
    if (syncUrl) history.replaceState(null, "", `${location.pathname}${toSearch(i)}`);
  }, [i, syncUrl]);

  const results = simulateAll(rates, i);
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
          <p className="num text-xs uppercase tracking-[0.2em] text-dim">Sua simulação</p>
          <div className="mt-4 space-y-4">
            <MoneyField label="Quanto você tem hoje" value={i.initial} onChange={(initial) => set({ initial })} />
            <MoneyField label="Quanto vai guardar por mês" value={i.monthly} onChange={(monthly) => set({ monthly })} />
            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-muted">Por quanto tempo</span>
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
              <div className="flex items-end">
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
                  {r.product.custody && (
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

          {/* Gráfico */}
          <div className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="font-semibold">Quanto já rendeu, mês a mês</p>
                <p className="text-sm text-muted">Se resgatar naquele mês, já sem IR e taxa de custódia.</p>
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
              <GrowthChart results={results} hidden={hidden} />
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
            Poupança, CDB, LCI/LCA, Tesouro Selic e prefixado lado a lado, com as taxas de hoje e já descontando o que ninguém lembra: IR regressivo,
            custódia da B3 e inflação.
          </p>
          {!rates.live && (
            <p className="mt-4 inline-block rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-sm text-amber">
              O Banco Central não respondeu agora: usando as últimas taxas conhecidas.
            </p>
          )}
        </section>
        <Calc key={hydrated ? "url" : "padrao"} rates={rates} initial={hydrated ? fromSearch(location.search) : DEFAULTS} syncUrl={hydrated} />
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
