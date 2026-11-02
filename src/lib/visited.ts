"use client";

import { useMemo, useSyncExternalStore } from "react";

// Capítulos que a pessoa já abriu, guardados no navegador dela (só para o ✓ e o "continuar").
// Se o navegador não deixar guardar, tudo funciona igual, só sem o ✓.
const KEY = "rende-mais:capitulos-vistos";
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function markVisited(slug: string) {
  const set = new Set(read().split(",").filter(Boolean));
  if (set.has(slug)) return;
  set.add(slug);
  try {
    localStorage.setItem(KEY, [...set].join(","));
  } catch {
    return;
  }
  listeners.forEach((l) => l());
}

export function useVisited() {
  const raw = useSyncExternalStore(subscribe, read, () => "");
  return useMemo(() => new Set(raw.split(",").filter(Boolean)), [raw]);
}
