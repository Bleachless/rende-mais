"use client";

import { useState } from "react";
import { brl, pct, poupancaMonthly } from "@/lib/calc";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { Replay, Stat, useSweep } from "./shared";

// A Selic anda de 0,25 em 0,25 ponto: o controle trabalha em quartos de ponto.
const MIN = 8; // 2%
const POUP_RULE = 8.5;

export function SelicScene({ selic, cdi, tr }: { selic: number; cdi: number; tr: number }) {
  const today = Math.round(selic * 4);
  const max = Math.max(60, today);
  const [q, setQ] = useState(today);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setQ, MIN, today, 60);

  const s = q / 4;
  const c = Math.max(0, s + (cdi - selic)); // o CDI fica colado na Selic, com a diferença de hoje
  const poup = (Math.pow(1 + poupancaMonthly(s, tr), 12) - 1) * 100;
  const top = max / 4 + (cdi - selic); // o CDI no topo da régua, para as barras
  const at = (v: number) => `${(((v * 4 - MIN) / (max - MIN)) * 100).toFixed(2)}%`;

  const high = s >= 10.5;
  const low = s <= 6;
  const face: Face = high ? "happy" : low ? "worried" : "neutral";
  const arms: Arms = high ? "up" : "down";
  const per10k = brl(100 * c);
  const say = high
    ? `Selic de ${pct(s)}: o Banco Central está freando a economia. O crédito fica caro, a inflação tende a cair, e a renda fixa paga bem: ${per10k} por ano a cada R$ 10 mil no CDI.`
    : low
      ? `Selic de ${pct(s)}: o Banco Central está acelerando a economia. O crédito fica barato, mas a renda fixa rende pouco: ${per10k} por ano a cada R$ 10 mil. E a poupança muda de regra: vira 70% da Selic.`
      : `Selic de ${pct(s)}: nem muito freada, nem muito acelerada. A cada R$ 10 mil, o CDI rende ${per10k} por ano.`;

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Mascot face={face} arms={arms} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Selic decidida pelo Copom</p>
          <p className="num text-5xl font-semibold tracking-tight text-violet">{pct(s)}</p>
        </div>
        <Replay onClick={run} />
      </div>

      {/* O termostato: juros baixos esquentam a economia, juros altos esfriam. */}
      <div className="relative mt-5">
        <div className="h-3 rounded-full bg-gradient-to-r from-down via-amber to-blue" />
        <span
          className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-bg bg-text shadow transition-[left] duration-150 motion-reduce:transition-none"
          style={{ left: at(s) }}
          aria-hidden
        />
        <span className="absolute -top-1 h-5 w-px bg-text/60" style={{ left: at(POUP_RULE) }} aria-hidden />
      </div>
      <input
        type="range"
        min={MIN}
        max={max}
        value={q}
        onChange={(e) => {
          stop();
          setQ(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Selic"
        aria-valuetext={pct(s)}
      />
      <div className="mt-1 flex justify-between gap-3 text-xs text-dim">
        <span>
          <span className="text-down">Juros baixos:</span> acelera, crédito barato
        </span>
        <span className="text-right">
          <span className="text-blue">Juros altos:</span> freia, segura a inflação
        </span>
      </div>
      <p className="mt-2 text-xs text-dim">
        O risquinho marca 8,5%: abaixo disso, a poupança passa a render 70% da Selic. Hoje a Selic está em {pct(selic)}.
      </p>

      <p className="mt-6 text-sm text-muted">Quanto R$ 10 mil rendem em 1 ano, antes do IR</p>
      <div className="mt-3 space-y-3">
        {[
          { name: "100% do CDI", rate: c, color: "bg-up", text: "text-up" },
          { name: "Poupança", rate: poup, color: "bg-amber", text: "text-amber" },
        ].map((b) => (
          <div key={b.name}>
            <div className="flex justify-between text-sm">
              <span>
                {b.name} <span className="num text-xs text-dim">{pct(b.rate)} ao ano</span>
              </span>
              <span className={`num ${b.text}`}>+{brl(100 * b.rate)}</span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-panel-2">
              <div className={`h-full rounded-full ${b.color} transition-all duration-150 motion-reduce:transition-none`} style={{ width: `${((b.rate / top) * 100).toFixed(2)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="CDI (colado na Selic)" value={pct(c)} tone="text-up" />
        <Stat label="Poupança ao ano" value={pct(poup)} tone="text-amber" />
        <Stat label="Regra da poupança" value={s > POUP_RULE ? "0,5% a.m. + TR" : "70% Selic + TR"} className="col-span-2 sm:col-span-1" />
      </div>
    </div>
  );
}
