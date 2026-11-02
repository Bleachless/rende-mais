"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { CHAPTERS, chapter } from "@/lib/chapters";
import { markVisited, useVisited } from "@/lib/visited";

// Quanto da página já foi lido (0 a 1000), para a barrinha de progresso.
function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  window.addEventListener("resize", cb);
  return () => {
    window.removeEventListener("scroll", cb);
    window.removeEventListener("resize", cb);
  };
}
function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.round((window.scrollY / max) * 1000) : 0;
}

// Barra fixa no topo do tutorial: em que capítulo a pessoa está, quais já viu (✓) e quanto
// da página já leu.
export function ChapterNav() {
  const path = usePathname();
  const slug = path.split("/")[2] ?? "";
  const at = chapter(slug);
  const visited = useVisited();
  const read = useSyncExternalStore(subscribeScroll, readScroll, () => 0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (at < 0) return;
    markVisited(slug);
    // Deixa o capítulo atual à vista na lista (no celular ela rola de lado).
    list.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [at, slug]);

  const seen = CHAPTERS.filter((c) => visited.has(c.slug)).length;

  return (
    <nav aria-label="Capítulos do tutorial" className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <Link href="/aprenda" className="num shrink-0 text-xs text-muted hover:text-text">
          {at >= 0 ? (
            <>
              <span className="text-up">{at + 1}</span>/{CHAPTERS.length}
            </>
          ) : (
            <>
              <span className="text-up">{seen}</span>/{CHAPTERS.length} vistos
            </>
          )}
        </Link>
        <ol ref={list} className="relative flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
          {CHAPTERS.map((c, k) => {
            const here = k === at;
            const done = visited.has(c.slug);
            return (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={`/aprenda/${c.slug}`}
                  aria-current={here ? "page" : undefined}
                  title={c.title}
                  className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${
                    here ? "border-up bg-up/10 text-up" : done ? "border-line text-text hover:border-up" : "border-line text-dim hover:text-text"
                  }`}
                >
                  <span className="num">{done && !here ? "✓" : k + 1}</span>
                  <span className={here ? "" : "sr-only"}>{c.short}</span>
                </Link>
              </li>
            );
          })}
          <li className="shrink-0">
            <Link
              href="/aprenda/quiz"
              aria-current={slug === "quiz" ? "page" : undefined}
              className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs transition ${slug === "quiz" ? "border-up bg-up/10 text-up" : "border-line text-muted hover:border-up hover:text-text"}`}
            >
              🎯 <span>Quiz</span>
            </Link>
          </li>
        </ol>
      </div>
      <div className="h-0.5 bg-up transition-[width] duration-100 motion-reduce:transition-none" style={{ width: `${read / 10}%` }} />
    </nav>
  );
}
