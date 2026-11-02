"use client";

import { useState } from "react";
import { periodLabel } from "@/lib/calc";
import { access, type Access } from "@/lib/lessons";
import { Bubble, Mascot, type Face } from "../mascot";
import { Replay, useSweep } from "./shared";

// Exemplos típicos: `lock` meses sem poder sacar e `market` meses em que só sai pelo preço do dia.
const ROWS = [
  { name: "Poupança", note: "saca quando quiser (perde o rendimento do mês incompleto)", lock: 0, market: 0 },
  { name: "Tesouro Selic", note: "vende em qualquer dia útil, quase sem oscilar", lock: 0, market: 0 },
  { name: "CDB com liquidez diária", note: "resgata em qualquer dia", lock: 0, market: 0 },
  { name: "LCI / LCA", note: "carência mínima de 6 meses (muitas têm mais)", lock: 6, market: 0 },
  { name: "CDB que vence em 2 anos", note: "sem liquidez diária: o dinheiro só volta no vencimento", lock: 24, market: 0 },
  { name: "Tesouro Prefixado de 3 anos", note: "dá pra vender antes, mas pelo preço do dia", lock: 0, market: 36 },
  { name: "Tesouro IPCA+ de 10 anos", note: "dá pra vender antes, mas pelo preço do dia", lock: 0, market: 120 },
];
const SPAN = 60; // meses mostrados na linha do tempo

const STATUS: Record<Access, { icon: string; label: string; tone: string }> = {
  livre: { icon: "✅", label: "saca sem perder", tone: "text-up" },
  preso: { icon: "🔒", label: "preso", tone: "text-down" },
  mercado: { icon: "⚠️", label: "só pelo preço do dia", tone: "text-amber" },
};

const w = (m: number) => `${((Math.min(m, SPAN) / SPAN) * 100).toFixed(2)}%`;

export function LiquidityScene() {
  const [month, setMonth] = useState(18);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setMonth, 0, 18, 110);

  const states = ROWS.map((r) => access(r.lock, r.market, month));
  const count = (a: Access) => states.filter((s) => s === a).length;
  const when = month === 0 ? "hoje" : `daqui a ${periodLabel(month)}`;
  const face: Face = count("livre") === ROWS.length ? "cheer" : count("livre") >= 4 ? "happy" : "worried";
  const say =
    month === 0
      ? `Se eu precisar do dinheiro hoje, só o que tem liquidez diária sai sem susto: ${count("livre")} de ${ROWS.length}. O resto está preso ou só sai pelo preço do dia.`
      : `Precisando ${when}: ${count("livre")} de ${ROWS.length} saem sem perder nada, ${count("preso")} ainda ${count("preso") === 1 ? "está preso" : "estão presos"} e ${count("mercado")} só ${count("mercado") === 1 ? "sai" : "saem"} pelo preço do dia, que pode ser menor.`;

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Mascot face={face} arms={face === "worried" ? "cheeks" : face === "cheer" ? "up" : "down"} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Vou precisar do dinheiro</p>
          <p className="num text-4xl font-semibold tracking-tight">{when}</p>
        </div>
        <Replay onClick={run} />
      </div>
      <input
        type="range"
        min={0}
        max={SPAN}
        value={month}
        onChange={(e) => {
          stop();
          setMonth(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Quando vai precisar do dinheiro, em meses"
        aria-valuetext={when}
      />

      <ul className="mt-5 space-y-3">
        {ROWS.map((r, k) => {
          const st = STATUS[states[k]];
          return (
            <li key={r.name}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="font-medium">{r.name}</span> <span className="text-xs text-dim">· {r.note}</span>
                </span>
                <span className={`shrink-0 whitespace-nowrap text-xs ${st.tone}`}>
                  <span aria-hidden>{st.icon}</span> {st.label}
                </span>
              </div>
              {/* Linha do tempo: vermelho preso, âmbar preço do dia, verde livre; o risco branco é o mês escolhido. */}
              <div className="relative mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-up/70" aria-hidden>
                <div className="h-full bg-down/80" style={{ width: w(r.lock) }} />
                <div className="h-full bg-amber/80" style={{ width: w(r.market) }} />
                <span className="absolute inset-y-0 w-0.5 bg-text transition-[left] duration-100 motion-reduce:transition-none" style={{ left: w(month) }} />
              </div>
            </li>
          );
        })}
      </ul>
      <div className="num relative mt-2 h-4 text-xs text-dim">
        <span className="absolute left-0">hoje</span>
        <span className="absolute -translate-x-1/2" style={{ left: w(24) }}>
          2 anos
        </span>
        <span className="absolute right-0">5 anos</span>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-down/80" /> preso
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber/80" /> sai pelo preço do dia (pode ganhar ou perder)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-up/70" /> saca sem perder
        </li>
      </ul>
    </div>
  );
}
