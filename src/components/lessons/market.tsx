"use client";

import { useState } from "react";
import { brl, pct } from "@/lib/calc";
import { titlePrice } from "@/lib/lessons";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { Replay, Stat, useSweep } from "./shared";

// Um Tesouro Prefixado que paga R$ 1.000 em 5 anos, comprado há 1 ano a 12% ao ano.
const FACE = 1000;
const TOTAL = 5;
const LEFT = 4;
const BOUGHT = 12;

export function MarketScene() {
  const [q, setQ] = useState(60); // taxa do mercado em quartos de ponto (60 = 15%)
  const { ref, stop, run } = useSweep<HTMLDivElement>(setQ, BOUGHT * 4, 60, 90);

  const rate = q / 4;
  const paid = titlePrice(FACE, BOUGHT, TOTAL);
  const expected = titlePrice(FACE, BOUGHT, LEFT); // o que valeria seguindo a taxa da compra
  const now = titlePrice(FACE, rate, LEFT);
  const result = now - paid;
  const tilt = Math.max(-18, Math.min(18, (rate - BOUGHT) * 3)); // graus da gangorra

  const face: Face = rate > BOUGHT ? "worried" : rate < BOUGHT ? "cheer" : "neutral";
  const arms: Arms = face === "worried" ? "cheeks" : face === "cheer" ? "up" : "down";
  const say =
    rate > BOUGHT
      ? `O mercado agora pede ${pct(rate)} ao ano, e o meu título paga só ${pct(BOUGHT, 0)}. Ninguém paga caro nele: hoje vale ${brl(now)}, ${brl(expected - now)} abaixo do esperado. Mas se eu esperar o vencimento, recebo os ${brl(FACE, 0)} combinados.`
      : rate < BOUGHT
        ? `Os juros caíram para ${pct(rate)}. Meu título de ${pct(BOUGHT, 0)} virou disputado: hoje vale ${brl(now)}, ${brl(now - expected)} acima do esperado. Vender antes agora dá um lucro extra.`
        : `O mercado pede os mesmos ${pct(BOUGHT, 0)} da compra: o título vale exatamente o esperado, ${brl(now)}.`;

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Mascot face={face} arms={arms} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Taxa que o mercado pede hoje</p>
          <p className="num text-5xl font-semibold tracking-tight text-violet">{pct(rate)}</p>
        </div>
        <Replay onClick={run} />
      </div>
      <input
        type="range"
        min={24}
        max={72}
        value={q}
        onChange={(e) => {
          stop();
          setQ(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Taxa do mercado"
        aria-valuetext={pct(rate)}
      />
      <p className="mt-1 text-xs text-dim">Você comprou a {pct(BOUGHT, 0)} ao ano. Arraste para os juros do país subirem ou caírem.</p>

      {/* A gangorra: de um lado os juros, do outro o preço do título. */}
      <svg viewBox="0 0 320 120" className="mx-auto mt-4 h-32 w-full max-w-md" role="img" aria-label={`Juros a ${pct(rate)}, título valendo ${brl(now)}`}>
        <path d="M150 110 L160 82 L170 110 Z" fill="#222b37" />
        <g style={{ transform: `rotate(${-tilt}deg)`, transformOrigin: "160px 80px", transition: "transform 0.2s" }}>
          <rect x="30" y="76" width="260" height="8" rx="4" fill="#5b6678" />
          <rect x="34" y="40" width="88" height="36" rx="8" fill="#a78bfa" />
          <text x="78" y="63" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0a0d12">
            juros {rate > BOUGHT ? "↑" : rate < BOUGHT ? "↓" : "="}
          </text>
          <rect x="198" y="40" width="88" height="36" rx="8" fill={rate > BOUGHT ? "#ff6b6b" : "#3ddc97"} />
          <text x="242" y="63" textAnchor="middle" fontSize="14" fontWeight="600" fill="#0a0d12">
            preço {rate > BOUGHT ? "↓" : rate < BOUGHT ? "↑" : "="}
          </text>
        </g>
      </svg>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Você pagou, há 1 ano" value={brl(paid)} />
        <Stat label="Vale se vender hoje" value={brl(now)} tone={rate > BOUGHT ? "text-down" : "text-up"} />
        <Stat label={`Recebe no vencimento (em ${LEFT} anos)`} value={brl(FACE, 0)} tone="text-up" className="col-span-2 sm:col-span-1" />
      </div>
      <p className="mt-3 text-sm text-muted">
        Vendendo hoje, o resultado sobre o que você pagou é de{" "}
        <b className={result >= 0 ? "text-up" : "text-down"}>
          {result >= 0 ? "+" : "−"}
          {brl(Math.abs(result))} ({pct(Math.abs(result / paid) * 100, 1)} em 1 ano)
        </b>
        , antes do IR. Levando até o vencimento, você recebe os {pct(BOUGHT, 0)} ao ano combinados, aconteça o que acontecer no caminho.
      </p>
      <p className="mt-3 text-xs text-dim">
        Isso vale para o Tesouro Prefixado e o Tesouro IPCA+. O Tesouro Selic quase não oscila, porque a taxa dele acompanha a Selic todo dia.
      </p>
    </div>
  );
}
