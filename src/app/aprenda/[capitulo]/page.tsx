import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DEFAULTS, products } from "@/lib/calc";
import { CHAPTERS, chapter } from "@/lib/chapters";
import { getIpcaHistory, getRates } from "@/lib/rates";
import { Sources } from "@/components/learn";
import { CONTENT } from "../content";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ capitulo: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aprenda/[capitulo]">): Promise<Metadata> {
  const { capitulo } = await params;
  const c = CHAPTERS[chapter(capitulo)];
  if (!c) return {};
  return { title: `${c.title} · Aprenda · Rende Mais`, description: c.description, alternates: { canonical: `/aprenda/${c.slug}` } };
}

// A moldura (topo e barra de capítulos) vale para todo capítulo; o que depende do endereço
// fica dentro do Suspense, para a troca de capítulo ser instantânea.
export default function Page({ params }: PageProps<"/aprenda/[capitulo]">) {
  return (
    <Suspense fallback={<div className="mx-auto h-[80vh] max-w-6xl px-4 pt-10 sm:px-6" aria-busy="true" />}>
      <Chapter params={params} />
    </Suspense>
  );
}

async function Chapter({ params }: { params: PageProps<"/aprenda/[capitulo]">["params"] }) {
  const { capitulo } = await params;
  const at = chapter(capitulo);
  if (at < 0) notFound();
  const c = CHAPTERS[at];
  const body = CONTENT[c.slug];
  const prev = CHAPTERS[at - 1];
  const next = CHAPTERS[at + 1];

  const [rates, ipca] = await Promise.all([getRates(), getIpcaHistory()]);
  const poupanca = products(rates, DEFAULTS).find((p) => p.id === "poupanca")!.annual;

  return (
    <article className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <p className="num text-xs uppercase tracking-[0.25em] text-up">
        Capítulo {String(at + 1).padStart(2, "0")} de {CHAPTERS.length}
      </p>
      <h1 className="mt-3 flex items-start gap-3 text-3xl font-semibold tracking-tight sm:text-5xl">
        <span aria-hidden>{c.icon}</span>
        <span>{c.title}</span>
      </h1>
      <div className="mt-5 max-w-2xl space-y-3 text-lg leading-relaxed text-muted">{body.intro}</div>

      <div className="mt-8">{body.scene({ rates, ipca, poupanca })}</div>

      <div className="mt-3 flex flex-col rounded-2xl border border-line bg-panel p-5">
        <p className="num text-xs uppercase tracking-[0.2em] text-dim">Pra levar daqui</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {body.take.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-up">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <Sources items={body.sources} />
      </div>

      {/* Anterior e próximo: o caminho natural é seguir em frente. */}
      <nav aria-label="Navegação entre capítulos" className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/aprenda/${prev.slug}`} className="rounded-2xl border border-line bg-panel p-4 transition hover:border-up sm:order-first">
            <span className="text-xs text-dim">← Anterior</span>
            <span className="mt-0.5 block font-medium">
              {prev.icon} {prev.short}
            </span>
          </Link>
        ) : (
          <Link href="/aprenda" className="rounded-2xl border border-line bg-panel p-4 transition hover:border-up">
            <span className="text-xs text-dim">← Início</span>
            <span className="mt-0.5 block font-medium">Todos os capítulos</span>
          </Link>
        )}
        <Link
          href={next ? `/aprenda/${next.slug}` : "/aprenda/quiz"}
          className="order-first rounded-2xl border border-up/50 bg-up/10 p-4 text-right transition hover:border-up sm:order-none"
        >
          <span className="text-xs text-up">{next ? `Próximo: capítulo ${at + 2} →` : "Último capítulo! →"}</span>
          <span className="mt-0.5 block font-semibold">{next ? `${next.icon} ${next.short}` : "🎯 Fazer o quiz do Rendinho"}</span>
        </Link>
      </nav>
    </article>
  );
}
