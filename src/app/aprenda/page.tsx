import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { DEFAULTS, products } from "@/lib/calc";
import { SOURCES, type Source } from "@/lib/guide";
import { getIpcaHistory, getRates } from "@/lib/rates";
import { Sources } from "@/components/learn";
import { InflationScene, SnowballScene } from "@/components/lessons";
import { SiteHeader } from "@/components/site";

export const metadata: Metadata = {
  title: "Aprenda: inflação e juros compostos, animados · Rende Mais",
  description:
    "Um tutorial animado, com os números reais do IBGE e do Banco Central: por que a inflação encolhe o seu dinheiro e como os juros compostos fazem ele crescer.",
  alternates: { canonical: "/aprenda" },
};

const CALC_DEPOSITOS: Source = {
  label: "Calculadora do Cidadão do BC (aplicação com depósitos)",
  href: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormAplicacaoDepositosRegulares.do?method=exibirFormAplicacaoDepositosRegulares",
};
const CALC_CORRECAO: Source = {
  label: "Calculadora do Cidadão do BC (correção pelo IPCA)",
  href: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores",
};

const CHAPTERS = [
  { id: "inflacao", title: "Inflação" },
  { id: "juros-compostos", title: "Juros compostos" },
];
const NEXT = ["Selic e CDI", "Investir é emprestar", "O leão do IR", "Liquidez × prazo"];

function Chapter({ n, id, title, intro, take, sources, children }: { n: number; id: string; title: string; intro: ReactNode; take: string[]; sources: Source[]; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="mx-auto mt-20 max-w-6xl scroll-mt-6 px-4 sm:px-6">
      <p className="num text-xs uppercase tracking-[0.25em] text-up">Capítulo {String(n).padStart(2, "0")}</p>
      <h2 id={`${id}-titulo`} className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <div className="mt-4 max-w-2xl space-y-3 text-lg leading-relaxed text-muted">{intro}</div>
      <div className="mt-8">{children}</div>
      <div className="mt-3 flex flex-col rounded-2xl border border-line bg-panel p-5">
        <p className="num text-xs uppercase tracking-[0.2em] text-dim">Pra levar daqui</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
          {take.map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-up">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <Sources items={sources} />
      </div>
    </section>
  );
}

export default async function Page() {
  const [rates, ipca] = await Promise.all([getRates(), getIpcaHistory()]);
  const poupanca = products(rates, DEFAULTS).find((p) => p.id === "poupanca")!.annual;

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
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <p className="num text-xs uppercase tracking-[0.25em] text-up">Aprenda em poucos minutos</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Dinheiro parado encolhe.{" "}
            <span className="bg-gradient-to-r from-up via-blue to-violet bg-clip-text text-transparent">Investido, cresce.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Um tutorial em capítulos curtos, com os números reais do IBGE e do Banco Central. Arraste, mexa e veja acontecer.
          </p>
          <nav aria-label="Capítulos" className="mt-8 flex flex-wrap items-center gap-2 text-sm">
            {CHAPTERS.map((c, k) => (
              <a key={c.id} href={`#${c.id}`} className="flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 transition hover:border-up">
                <span className="num text-xs text-up">{String(k + 1).padStart(2, "0")}</span>
                {c.title}
              </a>
            ))}
            <span className="px-1 text-xs text-dim">em breve: {NEXT.join(" · ")}</span>
          </nav>
        </section>

        <Chapter
          n={1}
          id="inflacao"
          title="Inflação: o carrinho que encolhe"
          intro={
            <p>
              Inflação é a alta geral dos preços. Ela não tira nenhuma nota da sua carteira: faz cada nota comprar menos. O IBGE mede isso todo mês com o{" "}
              <b className="text-text">IPCA</b>, a inflação oficial do Brasil. Escolha um ano e veja o que aconteceu com R$ 100.
            </p>
          }
          take={[
            "Dinheiro parado não fica igual: ele encolhe no ritmo da inflação, mesmo que o número na conta não mude.",
            "Por isso o que importa num investimento é o ganho real, o quanto ele rende acima do IPCA.",
            "Quer conferir as contas? A Calculadora do Cidadão, do Banco Central, corrige qualquer valor pelo IPCA.",
          ]}
          sources={[SOURCES.ipca, CALC_CORRECAO]}
        >
          <InflationScene ipca={ipca} />
        </Chapter>

        <Chapter
          n={2}
          id="juros-compostos"
          title="Juros compostos: a bola de neve"
          intro={
            <>
              <p>
                <b className="text-text">Juros simples</b> rendem sempre sobre o que você colocou. <b className="text-text">Juros compostos</b> rendem sobre o que você
                colocou e também sobre os juros que já ganhou, e é assim que funciona quase todo investimento.
              </p>
              <p>No começo a diferença é pequena. Com o tempo, os juros sobre juros viram a maior parte do dinheiro.</p>
            </>
          }
          take={[
            "Tempo é o ingrediente principal: a curva só dispara depois de alguns anos.",
            "Uma diferença pequena na taxa vira uma diferença enorme no fim: troque entre poupança e CDI e compare.",
            "Para crescer de verdade, os juros precisam ganhar da inflação do capítulo anterior.",
          ]}
          sources={[CALC_DEPOSITOS, SOURCES.selic, SOURCES.cdi]}
        >
          <SnowballScene cdi={rates.cdi} poupanca={poupanca} />
        </Chapter>

        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <div className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Agora é com você</h2>
            <p className="mt-3 max-w-2xl text-muted">
              Veja quanto o seu dinheiro rende de verdade em cada investimento, já com IR, inflação e as taxas de hoje.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/" className="rounded-xl bg-up px-4 py-2.5 text-sm font-semibold text-bg transition hover:brightness-110">
                Abrir o simulador →
              </Link>
              <Link href="/#entenda" className="rounded-xl border border-line px-4 py-2.5 text-sm font-medium transition hover:border-up">
                O que é cada investimento
              </Link>
            </div>
          </div>
        </section>
      </main>
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
