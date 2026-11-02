"use client";

import { useState } from "react";
import { brl, pct } from "@/lib/calc";
import { inflationSince, lastMonth, priceIndex, type IpcaHistory } from "@/lib/lessons";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { MONTHS, Replay, Stat, useSweep } from "./shared";

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

  // O Rendinho encolhe junto com o poder de compra, e a cara acompanha o tamanho do estrago.
  const lost = 1 - 1 / f;
  const rise = pct((f - 1) * 100, 1);
  const face: Face = lost < 0.1 ? "happy" : lost < 0.4 ? "worried" : "shocked";
  const arms: Arms = face === "shocked" ? "cheeks" : "down";
  const say =
    face === "happy"
      ? `Desde ${year}, os preços subiram ${rise}. Ainda dou conta de quase o carrinho todo!`
      : face === "worried"
        ? `Desde ${year}, os preços subiram ${rise}. Tá vendo? Eu encolhi: R$ 100 hoje compram só o que ${brl(100 / f)} compravam.`
        : `Socorro! Desde ${year}, os preços subiram ${rise}. Parado, eu só compro o que ${brl(100 / f)} compravam. É assim que dinheiro parado perde valor.`;

  return (
    <div ref={ref} className="grid gap-6 rounded-2xl border border-line bg-panel p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex items-center gap-4 lg:col-span-2">
        <div className="relative h-28 w-24 shrink-0 lg:h-40 lg:w-36">
          {/* Contorno do tamanho que ele tinha no ano escolhido. */}
          <svg viewBox="-4 0 132 140" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx={60} cy={64} r={42} fill="none" stroke="#5b6678" strokeWidth="2" strokeDasharray="5 5" />
          </svg>
          <div
            className="h-full w-full origin-[48%_46%] transition-transform duration-500 motion-reduce:transition-none"
            style={{ transform: `scale(${Math.max(0.5, 1 / f).toFixed(3)})` }}
          >
            <Mascot face={face} arms={arms} className="h-full w-full" />
          </div>
        </div>
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>
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
