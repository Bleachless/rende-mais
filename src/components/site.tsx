import Link from "next/link";
import type { ReactNode } from "react";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Rende Mais, início">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#10151c" stroke="#222b37" />
        <path d="M7 22l6-6 4 4 8-9" fill="none" stroke="#3ddc97" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 11h5v5" fill="none" stroke="#3ddc97" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        rende<span className="text-up">mais</span>
      </span>
    </Link>
  );
}

// Topo de todas as páginas: logo (volta ao simulador) e os links de cada uma.
export function SiteHeader({ children }: { children: ReactNode }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Logo />
      <nav className="flex items-center gap-4 text-sm">{children}</nav>
    </header>
  );
}
