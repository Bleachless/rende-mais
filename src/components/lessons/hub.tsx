"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CHAPTERS } from "@/lib/chapters";
import { useVisited } from "@/lib/visited";

// Os cartões dos capítulos no índice do tutorial, com ✓ nos que a pessoa já viu.
export function ChapterGrid() {
  const visited = useVisited();
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CHAPTERS.map((c, k) => {
        const done = visited.has(c.slug);
        return (
          <li key={c.slug}>
            <Link
              href={`/aprenda/${c.slug}`}
              className={`flex h-full gap-3 rounded-2xl border bg-panel p-4 transition hover:border-up ${done ? "border-up/40" : "border-line"}`}
            >
              <span className="text-3xl" aria-hidden>
                {c.icon}
              </span>
              <span className="min-w-0">
                <span className="num flex items-center gap-2 text-xs text-dim">
                  Capítulo {String(k + 1).padStart(2, "0")}
                  {done && <span className="text-up">✓ visto</span>}
                </span>
                <span className="mt-0.5 block font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">{c.description}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

// "Começar" vira "Continuar" no primeiro capítulo que a pessoa ainda não viu.
export function StartButton() {
  const visited = useVisited();
  const next = CHAPTERS.find((c) => !visited.has(c.slug));
  const label = visited.size === 0 ? "Começar pelo capítulo 1 →" : next ? `Continuar: ${next.short} →` : "Fazer o quiz final →";
  return (
    <Link href={next ? `/aprenda/${next.slug}` : "/aprenda/quiz"} className="inline-block rounded-xl bg-up px-5 py-3 text-sm font-semibold text-bg transition hover:brightness-110">
      {label}
    </Link>
  );
}

// Os links antigos (/aprenda#inflacao) apontavam para âncoras da página única: leva ao capítulo.
export function LegacyHash() {
  const router = useRouter();
  useEffect(() => {
    const slug = location.hash.slice(1);
    if (CHAPTERS.some((c) => c.slug === slug)) router.replace(`/aprenda/${slug}`);
  }, [router]);
  return null;
}
