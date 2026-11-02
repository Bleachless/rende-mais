import type { Metadata } from "next";
import Link from "next/link";
import { CHAPTERS } from "@/lib/chapters";
import { ChapterGrid, LegacyHash, StartButton } from "@/components/lessons/hub";
import { Bubble, Mascot } from "@/components/mascot";
import { WHO } from "./content";

export const metadata: Metadata = {
  title: "Aprenda: inflação, juros, Banco Central, IR, golpes e mais, animados · Rende Mais",
  description:
    "Um tutorial animado em capítulos curtos, com os números reais do IBGE e do Banco Central: inflação, juros compostos, Banco Central e Copom, Selic, IR, liquidez, marcação a mercado, reserva de emergência, ações, FIIs e golpes. E um quiz no fim.",
  alternates: { canonical: "/aprenda" },
};

export default function Page() {
  return (
    <>
      <LegacyHash />
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <p className="num text-xs uppercase tracking-[0.25em] text-up">Aprenda em poucos minutos</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Dinheiro parado encolhe.{" "}
            <span className="bg-gradient-to-r from-up via-blue to-violet bg-clip-text text-transparent">Investido, cresce.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            {CHAPTERS.length} capítulos curtos, com os números reais do IBGE e do Banco Central. Arraste, mexa e veja acontecer. No fim, um quiz para ver o quanto
            você aprendeu.
          </p>
          <div className="mt-8">
            <StartButton />
          </div>
        </div>
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <Mascot face="happy" arms="wave" className="h-28 w-24 shrink-0 lg:h-44 lg:w-36" />
          <Bubble className="min-w-0 flex-1" tail="lg:hidden">
            Oi! Eu sou o <b className="text-up">Rendinho</b>. Vou te mostrar, com números de verdade, o que acontece com o dinheiro parado e com o dinheiro
            investido. Escolhe um capítulo e vem comigo!
          </Bubble>
        </div>
      </section>

      <section aria-labelledby="capitulos-titulo" className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <h2 id="capitulos-titulo" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Os capítulos
        </h2>
        <div className="mt-6">
          <ChapterGrid />
        </div>
        <Link
          href="/aprenda/quiz"
          className="mt-3 flex items-center gap-4 rounded-2xl border border-up/40 bg-up/10 p-4 transition hover:border-up sm:p-5"
        >
          <Mascot face="cheer" arms="up" className="h-20 w-16 shrink-0" />
          <span className="min-w-0">
            <span className="block font-semibold">🎯 Quiz do Rendinho</span>
            <span className="mt-0.5 block text-sm text-muted">10 perguntas rápidas para ver o quanto você aprendeu. Dá pra compartilhar o resultado.</span>
          </span>
        </Link>
      </section>

      <section id="quem-e-quem" aria-labelledby="quem-e-quem-titulo" className="mx-auto mt-20 max-w-6xl scroll-mt-16 px-4 sm:px-6">
        <p className="num text-xs uppercase tracking-[0.25em] text-up">Pra consultar</p>
        <h2 id="quem-e-quem-titulo" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Quem é quem no seu dinheiro
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {WHO.map((w) => (
            <li key={w.name} className="flex gap-3 rounded-2xl border border-line bg-panel p-4">
              <span className="text-2xl" aria-hidden>
                {w.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{w.name}</span>
                <span className="mt-0.5 block text-sm leading-relaxed text-muted">{w.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
