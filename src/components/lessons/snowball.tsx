"use client";

import { useState } from "react";
import { brl, pct } from "@/lib/calc";
import { compound, doublingYears, simple } from "@/lib/lessons";
import { Bubble, Mascot, type Face } from "../mascot";
import { Choice, Replay, Stat, useSweep } from "./shared";

// ——— Capítulo 2: a bola de neve ———

const PRINCIPAL = 10_000;

export function SnowballScene({ cdi, poupanca }: { cdi: number; poupanca: number }) {
  const options = [
    { id: "cdi" as const, label: "100% do CDI", rate: cdi },
    { id: "poup" as const, label: "Poupança", rate: poupanca },
  ];
  const [pick, setPick] = useState<"cdi" | "poup">("cdi");
  const [years, setYears] = useState(20);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setYears, 1, 20, 110);
  const rate = options.find((o) => o.id === pick)!.rate;

  const s = simple(PRINCIPAL, rate, years);
  const c = compound(PRINCIPAL, rate, years);
  // Arredondado para o HTML do servidor e o do navegador baterem.
  const share = (v: number) => `${((v / c) * 100).toFixed(3)}%`;
  // A bola de neve do Rendinho, na mesma escala para as duas taxas (o teto é a maior em 30 anos).
  const ball = Math.round(24 + 96 * Math.sqrt(c / compound(PRINCIPAL, Math.max(cdi, poupanca), 30)));
  const extra = brl(c - s, 0);
  const face: Face = years <= 3 ? "neutral" : years <= 12 ? "happy" : "cheer";
  const say =
    (face === "neutral"
      ? `Em ${years} ${years === 1 ? "ano" : "anos"}, juros simples e compostos quase empatam: os juros sobre juros são só ${extra}. Paciência, a bola de neve começa pequena.`
      : face === "happy"
        ? `Tá vendo o verde? São os juros sobre juros: já somam ${extra}. A bola tá pegando embalo!`
        : `Agora é avalanche! Em ${years} anos, só os juros sobre juros já somam ${extra}.`) +
    (pick === "poup" ? " Na poupança ela cresce mais devagar: troca pro CDI e compara." : "");
  const bars = Array.from({ length: years }, (_, k) => {
    const n = k + 1;
    const sn = simple(PRINCIPAL, rate, n);
    return { n, principal: PRINCIPAL, simple: sn - PRINCIPAL, extra: compound(PRINCIPAL, rate, n) - sn };
  });

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-end gap-x-4 gap-y-3">
        <div className="flex h-32 items-end">
          <Mascot face={face} arms="push" className="h-24 w-20 shrink-0 sm:h-28 sm:w-24" />
          <div
            className="mb-1 shrink-0 rounded-full shadow-[inset_-6px_-8px_0_rgba(0,0,0,0.12)] transition-all duration-300 motion-reduce:transition-none"
            style={{ width: ball, height: ball, background: "radial-gradient(circle at 35% 30%, #ffffff, #d5e0ee 55%, #8fa3bd)" }}
            aria-hidden
          />
        </div>
        <Bubble className="min-w-0 basis-full sm:mb-8 sm:basis-0 sm:flex-1" tail="hidden sm:block">
          {say}
        </Bubble>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Choice label="Taxa" value={pick} options={options.map((o) => ({ id: o.id, label: o.label, hint: pct(o.rate, 1) }))} onChange={setPick} />
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
