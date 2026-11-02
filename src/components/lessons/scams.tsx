"use client";

import { useState } from "react";
import { pct } from "@/lib/calc";
import { Bubble, Mascot, type Arms, type Face } from "../mascot";

type Case = { from: string; text: string; scam: boolean; why: string };

const cases = (cdiMonth: string): Case[] => [
  {
    from: "Mensagem no WhatsApp",
    text: "Invista com a gente: rendimento garantido de 5% ao mês, sem risco nenhum!",
    scam: true,
    why: `Nada seguro rende isso. Com o CDI de hoje, a renda fixa mais segura rende uns ${cdiMonth} ao mês. Ganho alto e garantido é a marca das pirâmides.`,
  },
  {
    from: "Um amigo",
    text: "Entra nesse investimento: você ganha R$ 300 por cada pessoa que indicar, e elas também indicam outras.",
    scam: true,
    why: "Se o dinheiro vem de quem entra depois, e não de um negócio de verdade, é pirâmide. Quando param de entrar pessoas, ela quebra e quem entrou por último perde.",
  },
  {
    from: "Ligação",
    text: "Aqui é da central do seu banco. Detectamos uma fraude: transfira seu saldo para esta conta segura agora.",
    scam: true,
    why: "Banco nunca pede para transferir dinheiro para uma \"conta segura\", nem pede senha ou código. Desligue e ligue você mesmo no número que está no cartão.",
  },
  {
    from: "WhatsApp, número novo",
    text: "Oi, mãe! Troquei de número. Preciso pagar um boleto urgente, me faz um Pix?",
    scam: true,
    why: "Golpe clássico. Ligue para o número antigo da pessoa antes de mandar qualquer coisa. Caiu? Peça o MED no app do seu banco o quanto antes (até 80 dias depois do Pix).",
  },
  {
    from: "App do seu banco",
    text: "CDB de 102% do CDI, com liquidez diária e garantia do FGC.",
    scam: false,
    why: "Taxa dentro do normal, produto conhecido, no app oficial e com o FGC garantindo até R$ 250 mil. Nada de promessa mirabolante.",
  },
  {
    from: "Site do Tesouro Direto ou a sua corretora",
    text: "Tesouro Selic: rende a taxa Selic, com resgate em qualquer dia útil.",
    scam: false,
    why: "Título público, comprado pelo canal oficial ou por corretora autorizada. Rende o que promete: a Selic.",
  },
  {
    from: "Anúncio nas redes sociais",
    text: "Robô de trader com inteligência artificial que dobra o seu dinheiro em 30 dias. Últimas vagas!",
    scam: true,
    why: "Ganho enorme, prazo curto e pressa (\"últimas vagas\"): três sinais juntos. Antes de qualquer coisa, confira se a empresa é autorizada pela CVM.",
  },
  {
    from: "SMS",
    text: "Você tem valores a receber do Banco Central. Clique no link para resgatar.",
    scam: true,
    why: "O Banco Central não manda links nem entra em contato. O único site para consultar é valoresareceber.bcb.gov.br, e o serviço é gratuito.",
  },
];

// "É golpe?": um caso de cada vez, a pessoa responde e o Rendinho explica.
export function ScamScene({ cdi }: { cdi: number }) {
  const list = cases(pct((Math.pow(1 + cdi / 100, 1 / 12) - 1) * 100, 2));
  const [k, setK] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(() => list.map(() => null));
  const done = k >= list.length;
  const c = list[Math.min(k, list.length - 1)];
  const answer = answers[k] ?? null;
  const right = answer !== null && answer === c.scam;
  const score = answers.filter((a, i) => a !== null && a === list[i].scam).length;

  const face: Face = done ? (score >= 7 ? "cheer" : score >= 5 ? "happy" : "worried") : answer === null ? "neutral" : right ? "cheer" : "shocked";
  const arms: Arms = face === "cheer" ? "up" : face === "shocked" ? "cheeks" : "down";
  const pick = (scam: boolean) => setAnswers((a) => a.map((v, i) => (i === k ? scam : v)));

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="num text-xs uppercase tracking-[0.2em] text-dim">{done ? "Resultado" : `Caso ${k + 1} de ${list.length}`}</p>
        <p className="num text-xs text-dim">
          acertos: <span className="text-up">{score}</span>
        </p>
      </div>

      {done ? (
        <div className="mt-5 flex items-center gap-4">
          <Mascot face={face} arms={arms} className="h-28 w-24 shrink-0" />
          <Bubble className="min-w-0 flex-1">
            Você acertou <b className="text-up">{score} de {list.length}</b>.{" "}
            {score === list.length
              ? "Nenhum golpista passa por você!"
              : "Os golpes mudam de roupa, mas os sinais se repetem: guarde os cinco aí embaixo."}
            <button
              type="button"
              onClick={() => {
                setAnswers(list.map(() => null));
                setK(0);
              }}
              className="mt-3 block rounded-xl border border-line px-3 py-1.5 text-sm text-muted transition hover:border-up hover:text-text"
            >
              ↺ Jogar de novo
            </button>
          </Bubble>
        </div>
      ) : (
        <>
          {/* A mensagem, com cara de notificação de celular. */}
          <div className="mx-auto mt-5 max-w-md rounded-2xl border border-line bg-bg/70 p-4 shadow-lg">
            <p className="text-xs text-dim">{c.from}</p>
            <p className="mt-1.5 text-base leading-snug">{c.text}</p>
          </div>

          {answer === null ? (
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mx-auto sm:max-w-md">
              <button type="button" onClick={() => pick(true)} className="rounded-xl border border-down/50 bg-down/10 px-3 py-2.5 text-sm font-semibold text-down transition hover:bg-down/20">
                🚩 É golpe
              </button>
              <button type="button" onClick={() => pick(false)} className="rounded-xl border border-up/50 bg-up/10 px-3 py-2.5 text-sm font-semibold text-up transition hover:bg-up/20">
                👍 Parece normal
              </button>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-4" aria-live="polite">
              <Mascot face={face} arms={arms} className="h-24 w-20 shrink-0" />
              <Bubble className="anim-rise min-w-0 flex-1">
                <b className={right ? "text-up" : "text-down"}>{right ? "Acertou!" : "Ops!"}</b> {c.scam ? "É golpe." : "Esse é normal."} <span className="text-muted">{c.why}</span>
                <button
                  type="button"
                  onClick={() => setK(k + 1)}
                  className="mt-3 block rounded-xl bg-up px-3 py-1.5 text-sm font-semibold text-bg transition hover:brightness-110"
                >
                  {k === list.length - 1 ? "Ver resultado" : "Próximo caso →"}
                </button>
              </Bubble>
            </div>
          )}
          {answer === null && (
            <div className="mt-5 flex items-center gap-3">
              <Mascot face="neutral" arms="down" className="h-16 w-14 shrink-0" />
              <p className="text-sm text-muted">E aí, cairia nessa?</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
