"use client";

import { useState } from "react";
import { brl } from "@/lib/calc";
import { FGC_LIMIT, fgcSplit } from "@/lib/lessons";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { Choice, Replay, useSweep } from "./shared";

type Who = "banco" | "governo" | "empresa";

const WHO: Record<Who, { label: string; icon: string; examples: string; does: string; guard: string; risk: 0 | 1 | 2 }> = {
  banco: {
    label: "Banco",
    icon: "🏦",
    examples: "CDB, LCI, LCA e poupança",
    does: "Empresta de novo, com juros maiores: financiamento, cartão, crédito para imóveis e para o agro.",
    guard: "FGC até R$ 250 mil por CPF em cada instituição.",
    risk: 1,
  },
  governo: {
    label: "Governo",
    icon: "🏛️",
    examples: "Tesouro Selic, Tesouro IPCA+ e Tesouro Prefixado",
    does: "Paga as contas públicas e rola a dívida do país.",
    guard: "O próprio Tesouro Nacional. Não tem FGC, nem precisa.",
    risk: 0,
  },
  empresa: {
    label: "Empresa",
    icon: "🏭",
    examples: "debêntures, CRI e CRA",
    does: "Financia obras, fábricas e expansão.",
    guard: "Nenhuma garantia do FGC: se a empresa não pagar, dá pra perder.",
    risk: 2,
  },
};
const RISK = ["Menor risco do país", "Baixo, dentro do limite do FGC", "Depende da empresa"];

export function LendingScene() {
  const [who, setWho] = useState<Who>("banco");
  const [k, setK] = useState(30); // em dezenas de milhar
  const { ref, stop, run } = useSweep<HTMLDivElement>(setK, 5, 30, 90);
  const amount = k * 10_000;
  const w = WHO[who];
  const { covered, uncovered } = fgcSplit(amount);

  // A barra muda de sentido conforme quem garante.
  const parts =
    who === "banco"
      ? [
          { v: covered, c: "bg-up", label: "garantido pelo FGC" },
          { v: uncovered, c: "bg-down", label: "sem garantia" },
        ]
      : who === "governo"
        ? [{ v: amount, c: "bg-violet", label: "garantido pelo Tesouro Nacional" }]
        : [{ v: amount, c: "bg-amber", label: "depende de a empresa pagar" }];

  const face: Face = who === "governo" || (who === "banco" && !uncovered) ? "happy" : who === "banco" ? "worried" : "neutral";
  const arms: Arms = face === "worried" ? "cheeks" : "down";
  const say =
    who === "banco"
      ? uncovered
        ? `Com ${brl(amount, 0)} num banco só, ${brl(uncovered, 0)} ficam fora do FGC. Se o banco quebrar, essa parte não tem quem devolva.`
        : `Com ${brl(amount, 0)} no banco, tudo fica dentro do FGC: se ele quebrar, o fundo devolve até ${brl(FGC_LIMIT, 0)}.`
      : who === "governo"
        ? `No Tesouro, quem me devolve com juros é o governo federal. Não tem limite de FGC: é o investimento de menor risco do país.`
        : `Emprestando para empresa não tem FGC: o risco é ela não pagar. Por isso costuma pagar juros maiores.`;

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Choice label="Para quem você empresta" value={who} options={(Object.keys(WHO) as Who[]).map((id) => ({ id, label: `${WHO[id].icon} ${WHO[id].label}` }))} onChange={setWho} />
        <Replay onClick={run} />
      </div>

      {/* O caminho do dinheiro: vai para quem pegou emprestado e volta com juros. */}
      <div className="mt-6 flex items-center gap-2 sm:gap-4" aria-hidden>
        <div className="flex shrink-0 flex-col items-center">
          <Mascot face={face} arms={arms} className="h-24 w-20 sm:h-28 sm:w-24" />
          <span className="text-xs text-dim">você</span>
        </div>
        <div className="relative h-16 min-w-0 flex-1">
          <div className="absolute inset-x-0 top-4 border-t-2 border-dashed border-line" />
          <div className="absolute inset-x-0 top-11 border-t-2 border-dashed border-line" />
          <span className="lend-go absolute top-[9px] grid h-4 w-4 place-items-center rounded-full bg-amber" />
          <span className="lend-back absolute top-[36px] grid h-5 w-5 place-items-center rounded-full bg-up text-[9px] font-bold text-bg">+</span>
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] text-dim">empresta →</span>
          <span className="absolute left-1/2 top-12 -translate-x-1/2 whitespace-nowrap text-[11px] text-up">← devolve com juros</span>
        </div>
        <div className="flex shrink-0 flex-col items-center">
          <span key={who} className="mascot-pop text-5xl sm:text-6xl">
            {w.icon}
          </span>
          <span className="mt-2 text-xs text-dim">{w.label.toLowerCase()}</span>
        </div>
      </div>

      <Bubble className="mt-4" tail="hidden">
        {say}
      </Bubble>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">Exemplos</dt>
          <dd className="text-text">{w.examples}</dd>
        </div>
        <div>
          <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">O que fazem com o dinheiro</dt>
          <dd className="text-muted">{w.does}</dd>
        </div>
        <div>
          <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">Quem garante</dt>
          <dd className="text-muted">{w.guard}</dd>
        </div>
        <div>
          <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">Risco</dt>
          <dd className="flex items-center gap-2 text-muted">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((n) => (
                <span key={n} className={`h-2 w-5 rounded-full ${n <= w.risk ? (w.risk === 2 ? "bg-amber" : "bg-up") : "bg-panel-2"}`} />
              ))}
            </span>
            {RISK[w.risk]}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm text-muted">Quanto você deixa com um mesmo {w.label.toLowerCase()}</p>
      <p className="num text-3xl font-semibold tracking-tight">{brl(amount, 0)}</p>
      <input
        type="range"
        min={1}
        max={50}
        value={k}
        onChange={(e) => {
          stop();
          setK(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Valor aplicado"
        aria-valuetext={brl(amount, 0)}
      />
      <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-panel-2" role="img" aria-label={parts.map((p) => `${brl(p.v, 0)} ${p.label}`).join(", ")}>
        {parts.map((p) => (
          <div key={p.label} className={`${p.c} transition-all duration-150 motion-reduce:transition-none`} style={{ width: `${((p.v / amount) * 100).toFixed(2)}%` }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {parts
          .filter((p) => p.v > 0)
          .map((p) => (
            <li key={p.label} className="flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${p.c}`} />
              <span className="num text-text">{brl(p.v, 0)}</span> {p.label}
            </li>
          ))}
      </ul>
    </div>
  );
}
