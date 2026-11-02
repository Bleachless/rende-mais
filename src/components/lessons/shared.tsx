"use client";

// Peças comuns das cenas do tutorial.

import { useEffect, useEffectEvent, useRef } from "react";

export const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// Quando a cena aparece na tela, passa o valor de `from` até `to`, um passo por vez, para a
// pessoa ver acontecer. Não roda com "reduzir movimento" ligado; mexer no controle interrompe.
export function useSweep<T extends Element>(set: (n: number) => void, from: number, to: number, ms: number) {
  const ref = useRef<T>(null);
  const timer = useRef<number | undefined>(undefined);
  const stop = () => clearInterval(timer.current);
  const run = () => {
    stop();
    let n = from;
    set(n);
    timer.current = window.setInterval(() => {
      n += Math.sign(to - from);
      set(n);
      if (n === to) stop();
    }, ms);
  };
  const onSeen = useEffectEvent(run);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        onSeen();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearInterval(timer.current);
    };
  }, []);

  return { ref, stop, run };
}

export function Replay({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="shrink-0 whitespace-nowrap rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition hover:border-up hover:text-text">
      ↺ ver de novo
    </button>
  );
}

export function Stat({ label, value, tone = "text-text", className = "" }: { label: string; value: string; tone?: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-bg/60 px-3 py-2.5 ${className}`}>
      <p className="text-xs text-dim">{label}</p>
      <p className={`num mt-0.5 text-lg font-medium ${tone}`}>{value}</p>
    </div>
  );
}

// Botões de escolha (um de cada vez), no mesmo estilo do "Simular / Tenho uma meta".
export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string; hint?: string }[]; onChange: (id: T) => void }) {
  return (
    <div className="inline-flex max-w-full flex-wrap rounded-xl border border-line bg-bg p-1 text-sm" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg px-3 py-1.5 font-medium transition ${value === o.id ? "bg-panel-2 text-text shadow" : "text-muted hover:text-text"}`}
        >
          {o.label} {o.hint && <span className="num text-xs text-dim">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}
