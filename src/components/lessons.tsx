"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { brl, pct } from "@/lib/calc";
import { compound, doublingYears, inflationSince, lastMonth, priceIndex, simple, type IpcaHistory } from "@/lib/lessons";

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Quando a cena aparece na tela, passa o valor de `from` até `to`, um passo por vez, para a
// pessoa ver acontecer. Não roda com "reduzir movimento" ligado; mexer no controle interrompe.
function useSweep<T extends Element>(set: (n: number) => void, from: number, to: number, ms: number) {
  const ref = useRef<T>(null);
  const timer = useRef<number | undefined>(undefined);
  const stop = () => clearInterval(timer.current);
  const run = () => {
    stop();
    let n = from;
    set(n);
    timer.current = window.setInterval(() => {
      n += Math.sign(to - from);
      set(n);
      if (n === to) stop();
    }, ms);
  };
  const onSeen = useEffectEvent(run);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        onSeen();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer.current);
    };
  }, []);

  return { ref, stop, run };
}

function Replay({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 whitespace-nowrap rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition hover:border-up hover:text-text">
      ↺ ver de novo
    </button>
  );
}

function Stat({ label, value, tone = "text-text", className = "" }: { label: string; value: string; tone?: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-bg/60 px-3 py-2.5 ${className}`}>
      <p className="text-xs text-dim">{label}</p>
      <p className={`num mt-0.5 text-lg font-medium ${tone}`}>{value}</p>
    </div>
  );
}

// ——— Capítulo 1: o carrinho que encolhe ———

const CART = ["🍚", "🫘", "🥛", "🍞", "☕", "🥚", "🍌", "🍅", "🧀", "🥩", "🧈", "🧻"];

export function InflationScene({ ipca }: { ipca: IpcaHistory }) {
  const last = lastMonth(ipca);
  const start = Math.max(ipca.start, last.year - 10);
  const [year, setYear] = useState(start);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setYear, last.year, start, 140);

  const f = inflationSince(ipca, year);
  const keep = Math.round(CART.length / f);
  const until = `${MONTHS[last.month - 1]}/${last.year}`;

  // Linha dos preços (índice acumulado), com o trecho desde o ano escolhido em destaque.
  const idx = priceIndex(ipca);
  const top = idx[idx.length - 1];
  const x = (k: number) => (k / (idx.length - 1)) * 300;
  const y = (v: number) => 96 - ((v - 1) / (top - 1)) * 88;
  const line = idx.map((v, k) => `${k ? "L" : "M"}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const k0 = Math.min(idx.length - 1, (year - ipca.start) * 12);
  const since = idx.slice(k0).map((v, k) => `${x(k0 + k).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `M${x(k0).toFixed(1)},100L${since.join("L")}L300,100Z`;

  return (
    <div ref={ref} className="grid gap-6 rounded-2xl border border-line bg-panel p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="text-sm text-muted">O que R$ 100 compravam em janeiro de</p>
        <p className="num mt-1 text-5xl font-semibold tracking-tight text-amber">{year}</p>
        <p className="mt-2 text-lg leading-snug">
          hoje custam <span className="num font-semibold text-amber">{brl(100 * f)}</span>.
        </p>
        <input
          type="range"
          min={ipca.start}
          max={last.year}
          value={year}
          onChange={(e) => {
            stop();
            setYear(Number(e.target.value));
          }}
          className="mt-4 w-full"
          aria-label="Ano de partida"
          aria-valuetext={`janeiro de ${year}`}
        />
        <div className="num mt-1 flex justify-between text-xs text-dim">
          <span>{ipca.start} · Plano Real</span>
          <span>{last.year}</span>
        </div>

        <p className="mt-4 text-sm text-muted">
          Ou, do outro lado: com R$ 100 hoje você leva o que <span className="num text-text">{brl(100 / f)}</span> compravam em {year}.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label={`Inflação de jan/${year} a ${until}`} value={`+${pct((f - 1) * 100, 1)}`} tone="text-amber" />
          <Stat label="Poder de compra perdido" value={`−${pct((1 - 1 / f) * 100, 1)}`} tone="text-down" />
        </div>
      </div>

      <div className="min-w-0">
        {/* O carrinho: os itens que a mesma nota de R$ 100 ainda compra. */}
        <div className="relative rounded-2xl border-2 border-line bg-bg/60 p-3 pb-4" aria-hidden>
          <div className="grid grid-cols-6 gap-1.5">
            {CART.map((item, k) => {
              const on = k < keep;
              return (
                <div key={item} className={`grid aspect-square place-items-center rounded-lg border transition-colors duration-500 ${on ? "border-line bg-panel-2" : "border-dashed border-line bg-transparent"}`}>
                  <span
                    className={`text-3xl transition-all duration-500 motion-reduce:transition-none lg:text-4xl ${on ? "opacity-100" : "translate-y-4 rotate-12 scale-50 opacity-0"}`}
                    style={{ transitionDelay: `${(CART.length - k) * 15}ms` }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="absolute -bottom-3 left-8 h-5 w-5 rounded-full border-2 border-line bg-panel" />
          <span className="absolute -bottom-3 right-8 h-5 w-5 rounded-full border-2 border-line bg-panel" />
        </div>
        <p className="mt-6 text-sm text-muted">
          O carrinho que R$ 100 enchiam em {year} hoje sai com <b className="num text-text">{keep}</b> de {CART.length} itens.
        </p>

        <svg viewBox="0 0 300 100" className="mt-4 h-24 w-full" role="img" aria-label={`Preços desde ${ipca.start}: subiram ${pct((top - 1) * 100, 0)} até ${until}`}>
          <path d={area} fill="rgba(255,181,71,0.15)" />
          <path d={line} fill="none" stroke="#5b6678" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d={`M${since.join("L")}`} fill="none" stroke="#ffb547" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <line x1={x(k0)} x2={x(k0)} y1="0" y2="100" stroke="#ffb547" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-dim">Preços no Brasil desde {ipca.start} (IPCA acumulado)</p>
          <Replay onClick={run} />
        </div>
      </div>
    </div>
  );
}

// ——— Capítulo 2: a bola de neve ———

const PRINCIPAL = 10_000;

export function SnowballScene({ cdi, poupanca }: { cdi: number; poupanca: number }) {
  const options = [
    { id: "cdi", label: "100% do CDI", rate: cdi },
    { id: "poup", label: "Poupança", rate: poupanca },
  ];
  const [pick, setPick] = useState("cdi");
  const [years, setYears] = useState(20);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setYears, 1, 20, 110);
  const rate = options.find((o) => o.id === pick)!.rate;

  const s = simple(PRINCIPAL, rate, years);
  const c = compound(PRINCIPAL, rate, years);
  // Arredondado para o HTML do servidor e o do navegador baterem.
  const share = (v: number) => `${((v / c) * 100).toFixed(3)}%`;
  const bars = Array.from({ length: years }, (_, k) => {
    const n = k + 1;
    const sn = simple(PRINCIPAL, rate, n);
    return { n, principal: PRINCIPAL, simple: sn - PRINCIPAL, extra: compound(PRINCIPAL, rate, n) - sn };
  });

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-2 rounded-xl border border-line bg-bg p-1 text-sm" role="radiogroup" aria-label="Taxa">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={pick === o.id}
              onClick={() => setPick(o.id)}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${pick === o.id ? "bg-panel-2 text-text shadow" : "text-muted hover:text-text"}`}
            >
              {o.label} <span className="num text-xs text-dim">{pct(o.rate, 1)}</span>
            </button>
          ))}
        </div>
        <Replay onClick={run} />
      </div>

      <p className="mt-5 text-sm text-muted">
        {brl(PRINCIPAL, 0)} aplicados uma vez, sem colocar mais nada, por
      </p>
      <p className="num text-4xl font-semibold tracking-tight">
        {years} {years === 1 ? "ano" : "anos"}
      </p>
      <input
        type="range"
        min={1}
        max={30}
        value={years}
        onChange={(e) => {
          stop();
          setYears(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Anos aplicado"
        aria-valuetext={`${years} anos`}
      />

      {/* Uma barra por ano: o que você colocou, os juros simples e os juros sobre juros. */}
      <div
        className="mt-5 flex h-56 items-end gap-[3px] sm:h-64"
        role="img"
        aria-label={`Em ${years} anos: ${brl(PRINCIPAL, 0)} viram ${brl(s, 0)} com juros simples e ${brl(c, 0)} com juros compostos`}
      >
        {bars.map((b) => (
          <div key={b.n} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="rounded-t-[3px] bg-up transition-all duration-300 motion-reduce:transition-none" style={{ height: share(b.extra) }} />
            <div className="bg-blue transition-all duration-300 motion-reduce:transition-none" style={{ height: share(b.simple) }} />
            <div className="bg-line transition-all duration-300 motion-reduce:transition-none" style={{ height: share(b.principal) }} />
          </div>
        ))}
      </div>
      <div className="num mt-1 flex justify-between text-xs text-dim">
        <span>1º ano</span>
        <span>{years}º</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-line" /> o que você colocou
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-blue" /> juros simples
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-up" /> juros sobre juros
        </li>
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Com juros simples" value={brl(s, 0)} tone="text-blue" />
        <Stat label="Com juros compostos" value={brl(c, 0)} tone="text-up" />
        <Stat label="Só de juros sobre juros" value={`+${brl(c - s, 0)}`} tone="text-up" className="col-span-2 sm:col-span-1" />
      </div>
      <p className="mt-4 text-sm text-muted">
        A {pct(rate, 2)} ao ano, o dinheiro <b className="text-text">dobra a cada {doublingYears(rate).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} anos</b>.
        Valores antes do IR e da inflação, com a taxa de hoje parada o tempo todo.
      </p>
    </div>
  );
}
