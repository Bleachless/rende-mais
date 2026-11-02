import type { Metadata } from "next";
import { Quiz } from "@/components/lessons/quiz";

export const metadata: Metadata = {
  title: "Quiz do Rendinho: quanto você sabe de dinheiro? · Rende Mais",
  description: "10 perguntas rápidas sobre inflação, juros, Selic, IR, FGC, liquidez e golpes. Veja quanto você acerta e compartilhe o resultado.",
  alternates: { canonical: "/aprenda/quiz" },
};

export default function Page() {
  return (
    <section className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <p className="num text-xs uppercase tracking-[0.25em] text-up">Quiz final</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">🎯 Quanto você sabe de dinheiro?</h1>
      <p className="mt-4 text-lg text-muted">10 perguntas rápidas sobre o que aparece no tutorial. Errou alguma? O Rendinho mostra o capítulo para revisar.</p>
      <div className="mt-8">
        <Quiz />
      </div>
    </section>
  );
}
