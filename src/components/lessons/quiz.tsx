"use client";

import Link from "next/link";
import { useState } from "react";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";

type Q = { q: string; options: string[]; right: number; why: string; chapter: string };

const QUESTIONS: Q[] = [
  {
    q: "Você colocou R$ 1.000 num CDB hoje e tirou amanhã. O que acontece com o rendimento?",
    options: ["Fica todo com você", "Paga só 15% de IR", "O IOF leva 96% e o IR leva 22,5% do que sobrar"],
    right: 2,
    why: "Antes de 30 dias tem IOF, que no dia seguinte leva 96% do rendimento. E até 6 meses o IR é de 22,5%.",
    chapter: "imposto-de-renda",
  },
  {
    q: "Quem decide a taxa Selic?",
    options: ["O presidente da República", "O Copom, do Banco Central", "Os bancos, todo mês"],
    right: 1,
    why: "O Copom (presidente e diretores do Banco Central) se reúne a cada 45 dias e decide a Selic.",
    chapter: "banco-central",
  },
  {
    q: "A inflação do ano foi 5% e o seu dinheiro rendeu 4%. Você…",
    options: ["ganhou 4%", "perdeu poder de compra", "empatou"],
    right: 1,
    why: "O que importa é o ganho acima da inflação. Rendendo menos que ela, o seu dinheiro compra menos do que antes.",
    chapter: "inflacao",
  },
  {
    q: "Se um banco quebrar, até quanto o FGC devolve?",
    options: ["Tudo o que você tinha lá", "R$ 250 mil por CPF em cada instituição", "Nada, você perde tudo"],
    right: 1,
    why: "O FGC garante até R$ 250 mil por CPF em cada instituição (com teto de R$ 1 milhão a cada 4 anos).",
    chapter: "investir-e-emprestar",
  },
  {
    q: "Qual destes é isento de imposto de renda para pessoa física?",
    options: ["CDB", "Tesouro Selic", "LCI"],
    right: 2,
    why: "LCI, LCA e poupança são isentas para pessoa física. CDB e Tesouro pagam IR pela tabela regressiva.",
    chapter: "imposto-de-renda",
  },
  {
    q: "Uma empresa promete 5% ao mês, garantido e sem risco. Isso é…",
    options: ["uma ótima oportunidade", "um sinal clássico de golpe", "normal na renda fixa"],
    right: 1,
    why: "Nada seguro rende isso. Ganho alto e garantido é a marca das pirâmides financeiras.",
    chapter: "golpes",
  },
  {
    q: "Você vai precisar do dinheiro em 3 meses e ele está num CDB sem liquidez diária que vence em 2 anos. Ele…",
    options: ["sai quando você pedir", "fica preso até o vencimento", "sai, mas sem os juros"],
    right: 1,
    why: "Sem liquidez diária, o dinheiro só volta no vencimento. Por isso o prazo importa tanto quanto a taxa.",
    chapter: "liquidez",
  },
  {
    q: "Por que os juros compostos fazem tanta diferença com o tempo?",
    options: ["Porque os juros também passam a render juros", "Porque o banco dá um bônus todo ano", "Porque a taxa sobe sozinha"],
    right: 0,
    why: "É juro sobre juro: o rendimento entra na conta e passa a render também. A bola de neve cresce cada vez mais rápido.",
    chapter: "juros-compostos",
  },
  {
    q: "Você vendeu um Tesouro Prefixado antes do vencimento. Você recebe…",
    options: ["sempre a taxa combinada", "o preço do dia, que pode ser maior ou menor", "só o que investiu, sem juros"],
    right: 1,
    why: "Antes do vencimento vale o preço de mercado (marcação a mercado). A taxa combinada só é garantida levando até o fim.",
    chapter: "marcacao-a-mercado",
  },
  {
    q: "O que mais importa numa reserva de emergência?",
    options: ["Render o máximo, mesmo que fique presa", "Dar pra sacar rápido sem perder valor", "Estar em ações"],
    right: 1,
    why: "Reserva é para imprevisto: precisa estar disponível no mesmo dia e sem oscilar. Rentabilidade vem depois.",
    chapter: "reserva-de-emergencia",
  },
];

const SITE_QUIZ = "https://rende-mais.joaovaz.dev/aprenda/quiz";

export function Quiz() {
  const [k, setK] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>(() => QUESTIONS.map(() => null));
  const [shared, setShared] = useState(false);
  const done = k >= QUESTIONS.length;
  const q = QUESTIONS[Math.min(k, QUESTIONS.length - 1)];
  const answer = picked[k] ?? null;
  const score = picked.filter((p, i) => p === QUESTIONS[i].right).length;

  const face: Face = done ? (score >= 8 ? "cheer" : score >= 5 ? "happy" : "worried") : answer === null ? "neutral" : answer === q.right ? "cheer" : "shocked";
  const arms: Arms = face === "cheer" ? "up" : face === "shocked" ? "cheeks" : "down";
  const text = `Acertei ${score} de ${QUESTIONS.length} no quiz do Rendinho sobre dinheiro e investimentos. E você?`;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Quiz do Rendinho", text, url: SITE_QUIZ }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(`${text} ${SITE_QUIZ}`).catch(() => {});
    setShared(true);
    setTimeout(() => setShared(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="num text-xs uppercase tracking-[0.2em] text-dim">{done ? "Resultado" : `Pergunta ${k + 1} de ${QUESTIONS.length}`}</p>
        <div className="flex gap-1" aria-hidden>
          {QUESTIONS.map((x, i) => (
            <span
              key={x.q}
              className={`h-1.5 w-3 rounded-full ${picked[i] === null ? (i === k ? "bg-text" : "bg-line") : picked[i] === x.right ? "bg-up" : "bg-down"}`}
            />
          ))}
        </div>
      </div>

      {done ? (
        <div className="mt-6 flex flex-col items-center text-center">
          <Mascot face={face} arms={arms} className="h-40 w-36" />
          <p className="num mt-2 text-5xl font-semibold">
            {score}
            <span className="text-2xl text-muted">/{QUESTIONS.length}</span>
          </p>
          <p className="mt-2 max-w-md text-muted">
            {score === QUESTIONS.length
              ? "Gabaritou! Você já sabe mais de dinheiro do que muita gente por aí."
              : score >= 7
                ? "Mandou bem! Revise só as que errou e você vira referência na família."
                : score >= 5
                  ? "Bom começo! Dá uma passada nos capítulos das que errou."
                  : "Tudo bem, é pra isso que o tutorial existe. Bora rever os capítulos?"}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={share} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${shared ? "bg-up/80 text-bg" : "bg-up text-bg hover:brightness-110"}`}>
              {shared ? "Copiado!" : "Compartilhar resultado"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text} ${SITE_QUIZ}`)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium transition hover:border-up"
            >
              Mandar no WhatsApp
            </a>
            <button
              type="button"
              onClick={() => {
                setPicked(QUESTIONS.map(() => null));
                setK(0);
              }}
              className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted transition hover:border-up hover:text-text"
            >
              ↺ Refazer
            </button>
          </div>
          {score < QUESTIONS.length && (
            <ul className="mt-6 w-full max-w-md space-y-1.5 text-left text-sm">
              {QUESTIONS.map((x, i) =>
                picked[i] === x.right ? null : (
                  <li key={x.q} className="flex gap-2 text-muted">
                    <span className="text-down">✗</span>
                    <Link href={`/aprenda/${x.chapter}`} className="underline decoration-line underline-offset-4 hover:text-text hover:decoration-up">
                      {x.q}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-start gap-4">
            <Mascot face={face} arms={arms} className="h-24 w-20 shrink-0 sm:h-28 sm:w-24" />
            <Bubble className="min-w-0 flex-1">
              <p className="text-base font-medium">{q.q}</p>
            </Bubble>
          </div>
          <div className="mt-5 grid gap-2" role="group" aria-label="Respostas">
            {q.options.map((o, i) => {
              const state = answer === null ? "idle" : i === q.right ? "right" : i === answer ? "wrong" : "off";
              return (
                <button
                  key={o}
                  type="button"
                  disabled={answer !== null}
                  onClick={() => setPicked((p) => p.map((v, j) => (j === k ? i : v)))}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    state === "idle"
                      ? "border-line hover:border-up hover:bg-panel-2"
                      : state === "right"
                        ? "border-up bg-up/10 text-up"
                        : state === "wrong"
                          ? "border-down bg-down/10 text-down"
                          : "border-line text-dim"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
          {answer !== null && (
            <div className="anim-rise mt-4 rounded-xl border border-line bg-bg/60 p-4 text-sm" aria-live="polite">
              <b className={answer === q.right ? "text-up" : "text-down"}>{answer === q.right ? "Isso aí!" : "Quase!"}</b> <span className="text-muted">{q.why}</span>{" "}
              <Link href={`/aprenda/${q.chapter}`} className="text-up underline-offset-4 hover:underline">
                Ver o capítulo →
              </Link>
              <button type="button" onClick={() => setK(k + 1)} className="mt-3 block rounded-xl bg-up px-4 py-2 text-sm font-semibold text-bg transition hover:brightness-110">
                {k === QUESTIONS.length - 1 ? "Ver resultado" : "Próxima →"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
