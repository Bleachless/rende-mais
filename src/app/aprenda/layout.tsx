import Link from "next/link";
import { getRates } from "@/lib/rates";
import { ChapterNav } from "@/components/lessons/nav";
import { SiteHeader } from "@/components/site";

// Moldura de todas as páginas do tutorial: topo, barra de capítulos e rodapé.
export default async function Layout({ children }: LayoutProps<"/aprenda">) {
  const rates = await getRates();
  return (
    <>
      <SiteHeader>
        <Link href="/" className="text-muted hover:text-text">
          ← simulador
        </Link>
        <a href="https://github.com/Bleachless/rende-mais" target="_blank" rel="noreferrer" className="hidden text-muted hover:text-text sm:inline">
          código aberto ↗
        </a>
      </SiteHeader>
      <ChapterNav />
      <main>{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-sm text-dim sm:px-6">
        <p>
          Conteúdo educativo e geral: não é recomendação de investimento. Inflação pela série 433 (IPCA mensal) do Banco Central, com dados do IBGE; taxas de hoje
          pelo Banco Central, leitura de {rates.updated}.
        </p>
        <p className="mt-2">
          Feito por{" "}
          <a href="https://joaovaz.dev" className="text-muted underline-offset-4 hover:text-text hover:underline">
            João Vaz
          </a>
          .
        </p>
      </footer>
    </>
  );
}
