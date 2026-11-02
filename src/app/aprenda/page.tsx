import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { DEFAULTS, products } from "@/lib/calc";
import { SOURCES, type Source } from "@/lib/guide";
import { getIpcaHistory, getRates } from "@/lib/rates";
import { Sources } from "@/components/learn";
import { CopomScene } from "@/components/lessons/copom";
import { InflationScene } from "@/components/lessons/inflation";
import { LendingScene } from "@/components/lessons/lending";
import { LiquidityScene } from "@/components/lessons/liquidity";
import { SelicScene } from "@/components/lessons/selic";
import { SnowballScene } from "@/components/lessons/snowball";
import { TaxScene } from "@/components/lessons/tax";
import { Bubble, Mascot } from "@/components/mascot";
import { SiteHeader } from "@/components/site";

export const metadata: Metadata = {
  title: "Aprenda: inflação, juros, Banco Central, Copom, Selic e IR, animados · Rende Mais",
  description:
    "Um tutorial animado, com os números reais do IBGE e do Banco Central: inflação, juros compostos, o que fazem o Banco Central e o Copom, Selic e CDI, para quem você empresta quando investe, o imposto de renda e a liquidez.",
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
  { id: "banco-central", title: "Banco Central e Copom" },
  { id: "selic-cdi", title: "Selic e CDI" },
  { id: "investir-e-emprestar", title: "Investir é emprestar" },
  { id: "imposto-de-renda", title: "O leão do IR" },
  { id: "liquidez", title: "Liquidez × prazo" },
  { id: "quem-e-quem", title: "Quem é quem" },
];

// Quem é quem no seu dinheiro: uma linha para cada instituição que aparece no tutorial.
const WHO = [
  { icon: "🏦", name: "Banco Central (BC)", text: "Cuida da inflação, fiscaliza os bancos, emite o real e opera o Pix." },
  { icon: "🗳️", name: "Copom", text: "O comitê do BC (presidente e diretores) que decide a Selic a cada 45 dias." },
  { icon: "🏛️", name: "CMN", text: "O Conselho Monetário Nacional: define a meta de inflação e as grandes regras do sistema, como a carência da LCI e da LCA." },
  { icon: "📜", name: "Tesouro Nacional", text: "Pega dinheiro emprestado em nome do governo, vendendo títulos públicos (os do Tesouro Direto)." },
  { icon: "📊", name: "IBGE", text: "Mede a inflação oficial, o IPCA, todo mês." },
  { icon: "🛡️", name: "FGC", text: "Fundo mantido pelos próprios bancos que devolve até R$ 250 mil por CPF se um banco quebrar." },
  { icon: "📈", name: "B3", text: "A bolsa do Brasil: guarda os títulos do Tesouro Direto e calcula o CDI." },
  { icon: "🔎", name: "CVM", text: "Fiscaliza fundos de investimento, corretoras e o mercado de capitais." },
  { icon: "🦁", name: "Receita Federal", text: "Cobra o imposto de renda dos investimentos." },
];

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
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
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
              </nav>
          </div>
          <div className="flex items-center gap-4 lg:flex-col lg:items-start">
            <Mascot face="happy" arms="wave" className="h-28 w-24 shrink-0 lg:h-44 lg:w-36" />
            <Bubble className="min-w-0 flex-1" tail="lg:hidden">
              Oi! Eu sou o <b className="text-up">Rendinho</b>. Vou te mostrar, com números de verdade, o que acontece com o dinheiro parado e com o
              dinheiro investido. Mexe nas coisas aí embaixo comigo!
            </Bubble>
          </div>
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

        <Chapter
          n={3}
          id="banco-central"
          title="Quem manda nos juros: o Banco Central e o Copom"
          intro={
            <p>
              Todo mundo fala da Selic, mas quem decide? E por quê? Vá passo a passo com o Rendinho: o que é o <b className="text-text">Banco Central</b>, qual a
              missão dele, como funciona uma reunião do <b className="text-text">Copom</b> e o efeito dominó de cada decisão até chegar no seu bolso.
            </p>
          }
          take={[
            "O Banco Central é o banco dos bancos: cuida da inflação, fiscaliza os bancos, emite o real e opera o Pix.",
            "A meta de inflação é 3% ao ano, com 1,5 ponto de tolerância; quem a define é o Conselho Monetário Nacional.",
            "O Copom decide a Selic a cada 45 dias. Juros mais altos freiam a economia e a inflação; juros mais baixos aceleram.",
          ]}
          sources={[SOURCES.copom, SOURCES.autonomia, SOURCES.meta, SOURCES.metaBc]}
        >
          <CopomScene selic={rates.selic} />
        </Chapter>

        <Chapter
          n={4}
          id="selic-cdi"
          title="Selic e CDI: o termostato da economia"
          intro={
            <p>
              A Selic é a taxa básica de juros do país. O <b className="text-text">CDI</b> é a taxa que os bancos cobram para emprestar entre si, e anda colado
              nela. Por isso quase toda a renda fixa sobe e desce junto com a Selic. Mexa no termostato e veja o que muda.
            </p>
          }
          take={[
            "Selic alta: crédito caro e renda fixa rendendo mais. Selic baixa: crédito barato e renda fixa rendendo menos.",
            "O CDI fica colado na Selic; por isso \"100% do CDI\" é a régua para comparar a renda fixa.",
            "Com a Selic em 8,5% ou menos, a poupança deixa de render 0,5% ao mês e passa a render 70% da Selic.",
          ]}
          sources={[SOURCES.selic, SOURCES.cdi, SOURCES.poupanca]}
        >
          <SelicScene selic={rates.selic} cdi={rates.cdi} tr={rates.tr} />
        </Chapter>

        <Chapter
          n={5}
          id="investir-e-emprestar"
          title="Investir é emprestar"
          intro={
            <p>
              Na renda fixa, investir é emprestar dinheiro para alguém que devolve com juros. A pergunta que importa é: <b className="text-text">para quem</b>, e{" "}
              <b className="text-text">quem garante</b> se der errado?
            </p>
          }
          take={[
            "Banco (CDB, LCI, LCA, poupança): o FGC garante até R$ 250 mil por CPF em cada instituição.",
            "Governo (Tesouro Direto): quem garante é o Tesouro Nacional, o menor risco do país.",
            "Empresa (debêntures, CRI, CRA): não tem FGC. Paga mais porque o risco é maior.",
          ]}
          sources={[SOURCES.fgc, SOURCES.tesouro, SOURCES.investidor]}
        >
          <LendingScene />
        </Chapter>

        <Chapter
          n={6}
          id="imposto-de-renda"
          title="O leão do IR"
          intro={
            <>
              <p>
                Investir não é só colocar o dinheiro e pronto: na maior parte da renda fixa (CDB, Tesouro, fundos), o rendimento paga imposto de renda, e quanto
                ele morde depende de <b className="text-text">quanto tempo o dinheiro ficou aplicado</b>.
              </p>
              <p>
                Pra que serve essa tabela? É um incentivo do governo para quem deixa o dinheiro investido por mais tempo: de 22,5% em até 6 meses, a mordida cai
                até 15% depois de 2 anos. E se tirar antes de 30 dias, ainda tem o IOF.
              </p>
            </>
          }
          take={[
            "O IR é cobrado só sobre o rendimento, nunca sobre o que você colocou, e já sai descontado no resgate.",
            "Vai de 22,5% (até 6 meses) a 15% (mais de 2 anos): colocou hoje e tirou amanhã, paga a alíquota máxima.",
            "Antes de 30 dias ainda tem IOF, que no dia seguinte leva 96% do rendimento.",
            "Poupança, LCI e LCA são isentas de IR para pessoa física.",
          ]}
          sources={[SOURCES.ir, SOURCES.iof, SOURCES.fundos]}
        >
          <TaxScene cdi={rates.cdi} />
        </Chapter>

        <Chapter
          n={7}
          id="liquidez"
          title="Liquidez × prazo"
          intro={
            <p>
              <b className="text-text">Liquidez</b> é a facilidade de transformar o investimento em dinheiro sem perder nada. Uns saem no mesmo dia, outros ficam presos e
              outros só saem antes do prazo pelo preço do dia. Escolha quando vai precisar e veja.
            </p>
          }
          take={[
            "Quem aceita prender o dinheiro por mais tempo costuma ganhar uma taxa maior.",
            "Vender um título antes do vencimento sai pelo preço do dia, que pode ser maior ou menor que o combinado.",
            "Dinheiro para emergências pede saque rápido; objetivos de anos aceitam prazos longos.",
          ]}
          sources={[SOURCES.tesouro, SOURCES.lciPrazo, SOURCES.poupanca]}
        >
          <LiquidityScene />
        </Chapter>

        <section id="quem-e-quem" aria-labelledby="quem-e-quem-titulo" className="mx-auto mt-20 max-w-6xl scroll-mt-6 px-4 sm:px-6">
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

        <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 rounded-2xl border border-line bg-panel p-6 sm:flex-row sm:items-center sm:p-8">
            <Mascot face="cheer" arms="up" className="h-28 w-24 shrink-0 sm:order-last sm:ml-auto sm:h-36 sm:w-32" />
            <div className="min-w-0">
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
