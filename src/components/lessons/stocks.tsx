"use client";

import { useState } from "react";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { Choice } from "./shared";

type Kind = "fixa" | "acoes" | "fii";

const KIND: Record<Kind, { label: string; color: string; you: string; earn: string; risk: string; tax: string; face: Face; arms: Arms; say: string }> = {
  fixa: {
    label: "Renda fixa",
    color: "#5aa9ff",
    you: "Credor: você empresta e recebe juros.",
    earn: "Os juros combinados na hora da aplicação (um % do CDI, a inflação mais uma taxa ou uma taxa fixa).",
    risk: "De quem pegou o dinheiro não pagar. Em banco tem FGC; no Tesouro, o governo garante.",
    tax: "Tabela regressiva de 22,5% a 15% sobre o rendimento (poupança, LCI e LCA são isentas).",
    face: "happy",
    arms: "down",
    say: "Na renda fixa eu empresto e a regra é combinada antes. Por isso a linha sobe certinha.",
  },
  acoes: {
    label: "Ações",
    color: "#ff6b9a",
    you: "Sócio: dono de um pedacinho de uma empresa.",
    earn: "Dividendos (parte do lucro que a empresa reparte) e a valorização da ação, se a empresa crescer.",
    risk: "O preço sobe e desce todo dia e pode cair bastante, por anos. Não tem FGC nem rendimento garantido.",
    tax: "Lucro na venda: 15%, isento se o total vendido no mês for até R$ 20 mil. Dividendos: isentos para a maioria; desde 2026, há retenção de 10% quando uma mesma empresa paga mais de R$ 50 mil no mês à mesma pessoa.",
    face: "worried",
    arms: "cheeks",
    say: "Na bolsa eu viro sócio. No longo prazo pode render mais, mas olha o sobe e desce: tem época em que cai bastante e é preciso estômago.",
  },
  fii: {
    label: "FIIs",
    color: "#ffb547",
    you: "Cotista de um fundo dono de imóveis: shoppings, galpões, escritórios.",
    earn: "Os aluguéis, repassados todo mês, e a valorização da cota.",
    risk: "A cota é negociada na bolsa e oscila; imóvel vazio diminui o aluguel. Não tem FGC.",
    tax: "Os rendimentos mensais costumam ser isentos para pessoa física (fundo negociado em bolsa, com muitos cotistas, entre outras condições). O lucro na venda das cotas paga IR.",
    face: "happy",
    arms: "wave",
    say: "Com FII eu viro dono de um pedacinho de imóveis e recebo aluguel todo mês. A cota também oscila, mas costuma balançar menos que uma ação.",
  },
};

// Caminhos ilustrativos (não são dados reais), só para mostrar o jeito de cada um.
const N = 60;
const PATHS: Record<Kind, (t: number) => number> = {
  fixa: (t) => Math.pow(1.008, t),
  acoes: (t) => 1 + 0.011 * t + 0.09 * Math.sin(t / 2.7) + 0.06 * Math.sin(t / 1.1 + 1) - (t > 18 && t < 34 ? 0.22 * Math.sin(((t - 18) / 16) * Math.PI) : 0),
  fii: (t) => 1 + 0.006 * t + 0.04 * Math.sin(t / 3.1) + 0.025 * Math.sin(t / 1.3),
};

function path(f: (t: number) => number) {
  return Array.from({ length: N + 1 }, (_, t) => `${t ? "L" : "M"}${((t / N) * 300).toFixed(1)},${(150 - (f(t) - 0.6) * 120).toFixed(1)}`).join("");
}

export function StocksScene() {
  const [kind, setKind] = useState<Kind>("acoes");
  const k = KIND[kind];

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <Choice label="Tipo de investimento" value={kind} options={(Object.keys(KIND) as Kind[]).map((id) => ({ id, label: KIND[id].label }))} onChange={setKind} />

      <div className="mt-5 flex items-center gap-4">
        <Mascot face={k.face} arms={k.arms} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{k.say}</Bubble>
      </div>

      <svg viewBox="0 0 300 160" className="mt-5 h-48 w-full" role="img" aria-label="Ilustração de como cada tipo de investimento costuma se comportar com o tempo">
        {(Object.keys(PATHS) as Kind[]).map((id) => (
          <path
            key={id === kind ? `${id}-on` : id}
            d={path(PATHS[id])}
            fill="none"
            stroke={KIND[id].color}
            strokeOpacity={id === kind ? 1 : 0.2}
            strokeWidth={id === kind ? 2.5 : 1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1000}
            className={id === kind ? "draw-line" : undefined}
          />
        ))}
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-dim">
        <span>Ilustração: não são dados reais nem previsão.</span>
        <span className="flex gap-3">
          {(Object.keys(KIND) as Kind[]).map((id) => (
            <span key={id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: KIND[id].color }} />
              {KIND[id].label}
            </span>
          ))}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        {(
          [
            ["Você vira", k.you],
            ["Como ganha", k.earn],
            ["Risco", k.risk],
            ["Imposto", k.tax],
          ] as const
        ).map(([label, text]) => (
          <div key={label} className="rounded-xl border border-line bg-bg/60 p-3">
            <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">{label}</dt>
            <dd className="mt-1 text-muted">{text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
