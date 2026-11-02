"use client";

import { useState } from "react";
import { pct } from "@/lib/calc";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";
import { Choice, useSweep } from "./shared";

// Por dentro do Banco Central e do Copom, um passo de cada vez. Todos os passos vão no HTML
// (os escondidos com `hidden`), para quem não usa JavaScript e para o Google.
const STEPS: { icon: string; title: string; text: string; face: Face; arms: Arms }[] = [
  {
    icon: "🏦",
    title: "O Banco Central é o banco dos bancos",
    text: "Ele não atende você no balcão: cuida do sistema todo. Emite o real, fiscaliza os bancos, criou e opera o Pix e guarda as reservas em dólar do país. Desde 2021 ele tem autonomia por lei: o presidente tem mandato fixo e não pode ser trocado a qualquer hora pelo governo.",
    face: "happy",
    arms: "wave",
  },
  {
    icon: "🎯",
    title: "A missão número 1: segurar a inflação",
    text: "Pela lei, o objetivo fundamental do Banco Central é a estabilidade de preços. O alvo é definido pelo Conselho Monetário Nacional (os ministros da Fazenda e do Planejamento e o presidente do BC): hoje, 3% ao ano, com tolerância de 1,5 ponto para cima ou para baixo.",
    face: "neutral",
    arms: "down",
  },
  {
    icon: "🗓️",
    title: "O Copom se reúne a cada 45 dias",
    text: "O Copom (Comitê de Política Monetária) é o presidente do BC e os diretores. A reunião dura dois dias: primeiro, a equipe técnica mostra como estão a inflação, a economia do Brasil e a do mundo; depois, os membros discutem e votam.",
    face: "neutral",
    arms: "down",
  },
  {
    icon: "🗳️",
    title: "A decisão: a nova Selic",
    text: "Na quarta-feira à noite sai o comunicado com a Selic e o voto de cada membro. Na terça seguinte sai a ata, explicando o porquê da decisão.",
    face: "happy",
    arms: "up",
  },
  {
    icon: "⚙️",
    title: "Como o BC faz a Selic valer",
    text: "Todo dia, o Banco Central compra e vende títulos públicos com os bancos para manter os juros entre eles perto da meta. É por isso que o CDI anda colado na Selic.",
    face: "happy",
    arms: "push",
  },
  {
    icon: "✉️",
    title: "E se a inflação fugir da meta?",
    text: "Se ela ficar seis meses seguidos fora do intervalo, o presidente do BC tem que escrever uma carta aberta ao ministro da Fazenda explicando o que aconteceu e o que vai fazer.",
    face: "worried",
    arms: "cheeks",
  },
];

type Move = "sobe" | "baixa";
// O efeito dominó de uma decisão do Copom: ↑ ou ↓ em cada peça, para cada direção.
const CHAIN: { label: string; sobe: string; baixa: string }[] = [
  { label: "Selic", sobe: "↑ sobe", baixa: "↓ cai" },
  { label: "CDI e juros entre os bancos", sobe: "↑ sobem", baixa: "↓ caem" },
  { label: "Juros do crédito (financiamento, cartão, empréstimo)", sobe: "↑ ficam mais caros", baixa: "↓ ficam mais baratos" },
  { label: "Compras a prazo e investimentos das empresas", sobe: "↓ diminuem", baixa: "↑ aumentam" },
  { label: "Preços (inflação)", sobe: "↓ sobem mais devagar", baixa: "↑ podem subir mais rápido" },
];

export function CopomScene({ selic }: { selic: number }) {
  const [step, setStep] = useState(0);
  const [move, setMove] = useState<Move>("sobe");
  // Quantas peças do dominó já acenderam. Sem animação, todas aparecem de cara.
  const [lit, setLit] = useState(CHAIN.length + 1);
  const { ref, run } = useSweep<HTMLDivElement>(setLit, 0, CHAIN.length + 1, 350);
  const pick = (m: Move) => {
    setMove(m);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) run();
  };
  const show = (k: number) => `transition-all duration-300 motion-reduce:transition-none ${k < lit ? "opacity-100" : "translate-y-2 opacity-0"}`;
  const go = (n: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
  const cur = STEPS[step];
  const up = move === "sobe";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="num text-xs uppercase tracking-[0.2em] text-dim">
            Por dentro · {step + 1} de {STEPS.length}
          </p>
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((s, k) => (
              <span key={s.title} className={`h-1.5 rounded-full transition-all ${k === step ? "w-6 bg-up" : "w-1.5 bg-line"}`} />
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-start gap-4">
          <Mascot face={cur.face} arms={cur.arms} className="h-28 w-24 shrink-0" />
          <div className="min-w-0 flex-1" aria-live="polite">
            {STEPS.map((s, k) => (
              <div key={s.title} hidden={k !== step}>
                <Bubble className="anim-rise">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="text-2xl" aria-hidden>
                      {s.icon}
                    </span>
                    {s.title}
                  </p>
                  <p className="mt-1.5 text-muted">{s.text}</p>
                </Bubble>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            className="rounded-xl border border-line px-4 py-2 text-sm text-muted transition hover:border-up hover:text-text disabled:opacity-40 disabled:hover:border-line"
          >
            ← Voltar
          </button>
          <button
            type="button"
            onClick={() => go(step === STEPS.length - 1 ? 0 : step + 1)}
            className="rounded-xl bg-up px-4 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
          >
            {step === STEPS.length - 1 ? "↺ Do começo" : "Próximo →"}
          </button>
        </div>
      </div>

      {/* O efeito dominó: cada peça acende depois da anterior. */}
      <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">E aí, o que acontece com o seu dinheiro?</p>
          <Choice
            label="Decisão do Copom"
            value={move}
            options={[
              { id: "sobe", label: "Copom sobe a Selic" },
              { id: "baixa", label: "Copom baixa a Selic" },
            ]}
            onChange={pick}
          />
        </div>
        <ol className="mt-5 space-y-2">
          {CHAIN.map((c, k) => (
            <li key={c.label} className={`flex items-center gap-3 ${show(k)}`}>
              <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-panel-2 text-xs text-dim">{k + 1}</span>
              <span className="min-w-0 flex-1 rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm">
                {c.label}
                <span className="ml-2 whitespace-nowrap font-medium text-violet">{up ? c.sobe : c.baixa}</span>
              </span>
            </li>
          ))}
          <li className={`flex items-center gap-3 ${show(CHAIN.length)}`}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-up/15 text-xs text-up">★</span>
            <span className="min-w-0 flex-1 rounded-xl border border-up/40 bg-up/10 px-3 py-2 text-sm">
              E a sua renda fixa (CDB, Tesouro Selic, LCI…)
              <span className="ml-2 whitespace-nowrap font-medium text-up">{up ? "↑ passa a render mais" : "↓ passa a render menos"}</span>
            </span>
          </li>
        </ol>
        <div className="mt-5 flex items-start gap-3">
          <Mascot face={up ? "happy" : "neutral"} arms={up ? "up" : "down"} className="h-20 w-16 shrink-0" />
          <Bubble className="min-w-0 flex-1">
            {up
              ? "Juros mais altos esfriam a economia: fica caro comprar a prazo, as pessoas gastam menos e os preços sobem mais devagar. E eu, aplicado em renda fixa, rendo mais."
              : "Juros mais baixos aquecem a economia: crédito barato, mais compras e mais empregos. Mas a renda fixa rende menos e, se exagerar, a inflação volta a subir."}{" "}
            O efeito não é na hora: leva meses para chegar nos preços. Por isso o Copom decide olhando a inflação que vem pela frente. Hoje a Selic está em{" "}
            <span className="num text-violet">{pct(selic)}</span>.
          </Bubble>
        </div>
      </div>
    </div>
  );
}
