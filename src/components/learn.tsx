import Link from "next/link";
import type { ReactNode } from "react";
import { brl, DEFAULTS, irRate, pct, periodLabel, products, simulate, type ProductId, type Rates } from "@/lib/calc";
import { COLOR } from "@/lib/colors";
import { GUIDE, SOURCES, type Source } from "@/lib/guide";

// "Entenda os investimentos": o básico para quem nunca investiu, com o exemplo nas taxas de hoje.
// Sai pronto do servidor (sem JavaScript no navegador) e fica indexável.

const ORDER: ProductId[] = ["poupanca", "cdb", "lci", "selic", "ipca", "fundo", "pre"];

// Links para a fonte oficial: quem lê pode conferir na lei, no Banco Central, no FGC...
export function Sources({ items }: { items: Source[] }) {
  return (
    <p className="mt-auto pt-4 text-xs leading-relaxed text-dim">
      Fonte{items.length > 1 ? "s" : ""}:{" "}
      {items.map((x, k) => (
        <span key={x.href}>
          {k > 0 && " · "}
          <a href={x.href} target="_blank" rel="noreferrer" className="text-muted underline decoration-line underline-offset-4 hover:text-text hover:decoration-up">
            {x.label}
          </a>
        </span>
      ))}
    </p>
  );
}

function Concept({ title, sources, children }: { title: string; sources?: Source[]; children: ReactNode }) {
  return (
    <div className="flex flex-col rounded-2xl border border-line bg-panel p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
      {sources && <Sources items={sources} />}
    </div>
  );
}

// O mesmo valor inicial e prazo com que o simulador abre, sem aportes, para as contas ficarem fáceis de seguir.
function Example({ rates }: { rates: Rates }) {
  const i = { ...DEFAULTS, monthly: 0 };
  const all = products(rates, i);
  const run = (id: ProductId) => simulate(all.find((p) => p.id === id)!, i, rates.ipca12);
  const cdb = run("cdb");
  const year1 = i.initial * (cdb.product.annual / 100);
  const year2 = cdb.gross - i.initial - year1;
  const tier = irRate(i.months * (365.25 / 12));
  const keep = i.initial * Math.pow(1 + rates.ipca12 / 100, i.months / 12);
  const rows: [string, string, string?][] = [
    ["Rendimento no 1º ano", `+${brl(year1)}`, "text-up"],
    ["Rendimento no 2º ano", `+${brl(year2)}`, "text-up"],
    [`IR de ${pct(tier * 100, tier * 100 % 1 ? 1 : 0)} sobre o rendimento`, `−${brl(cdb.ir)}`, "text-muted"],
    ["Fica com", brl(cdb.net), "text-text font-medium"],
  ];
  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <p className="num text-xs uppercase tracking-[0.2em] text-dim">Na prática, com as taxas de hoje</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        <b className="text-text">{brl(i.initial, 0)}</b> num CDB que paga <b className="text-text">{pct(i.cdbPct, 0)} do CDI</b> ({pct(cdb.product.annual)} ao ano),
        sem colocar mais nada, por {periodLabel(i.months)}:
      </p>
      <dl className="num mt-4 space-y-1.5 text-sm">
        {rows.map(([k, v, c]) => (
          <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line/60 pb-1.5 last:border-0">
            <dt className="text-muted">{k}</dt>
            <dd className={`shrink-0 text-right ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
        <li>
          <b className="text-text">Juros compostos:</b> o 2º ano rende <span className="text-up">{brl(year2 - year1)} a mais</span> que o 1º com a mesma taxa, porque
          os juros do 1º ano também passam a render.
        </li>
        <li>
          <b className="text-text">Inflação:</b> com o IPCA de {pct(rates.ipca12)} em 12 meses, daqui a {periodLabel(i.months)} seriam precisos {brl(keep)} só para comprar o mesmo que{" "}
          {brl(i.initial, 0)} compram hoje. O ganho de verdade, acima da inflação, é de{" "}
          <span className={cdb.realGain >= 0 ? "text-up" : "text-down"}>{brl(cdb.realGain)}</span>.
        </li>
        <li>
          <b className="text-text">Comparando:</b> no mesmo prazo, a poupança terminaria com {brl(run("poupanca").net)} e uma LCI de {pct(i.lciPct, 0)} do CDI, sem IR,
          com {brl(run("lci").net)}.
        </li>
      </ul>
      <a href="#simulador" className="mt-4 inline-block text-sm text-up underline-offset-4 hover:underline">
        Simular com os seus números ↑
      </a>
      <p className="mt-3 text-xs text-dim">
        CDI, Selic e IPCA do Banco Central (SGS), leitura de {rates.updated}. As taxas ficam paradas pelo período todo, como no simulador.
      </p>
    </div>
  );
}

export function Learn({ rates }: { rates: Rates }) {
  const name = Object.fromEntries(products(rates, DEFAULTS).map((p) => [p.id, p.name])) as Record<ProductId, string>;
  return (
    <section id="entenda" aria-labelledby="entenda-titulo" className="mx-auto mt-20 max-w-6xl scroll-mt-6 px-4 sm:px-6">
      <p className="num text-xs uppercase tracking-[0.25em] text-up">Entenda os investimentos</p>
      <h2 id="entenda-titulo" className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
        Investir, sem economês
      </h2>
      <p className="mt-4 max-w-2xl text-muted">
        O básico para entender o que o simulador está comparando, em poucas linhas cada. Cada explicação traz o link da fonte oficial (lei, Banco Central, FGC,
        Tesouro Direto, IBGE) para você conferir.
      </p>
      <Link href="/aprenda" className="mt-3 inline-block text-sm text-up underline-offset-4 hover:underline">
        Prefere ver acontecer? Tutorial animado de inflação e juros compostos →
      </Link>
      <p className="mt-4 max-w-3xl rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm leading-relaxed text-amber">
        Conteúdo educativo e geral: não é recomendação de investimento. Cada pessoa tem objetivos, prazos e riscos diferentes. Antes de aplicar, leia as condições do
        produto e, se precisar, procure um profissional certificado.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Concept title="O que é investir">
          <p>
            É emprestar o seu dinheiro para alguém (um banco, o governo, uma empresa) que paga juros por isso. Na renda fixa, que é o que este simulador compara, a
            regra do pagamento é combinada antes: um percentual do CDI, a inflação mais uma taxa ou uma taxa fixa.
          </p>
        </Concept>
        <Concept title="Juros compostos">
          <p>
            É juro sobre juro: o rendimento de cada mês entra na conta e passa a render também. Por isso o tempo pesa tanto: quanto mais tempo aplicado, mais rápido
            a bola de neve cresce.
          </p>
        </Concept>
        <Concept title="Selic, CDI e IPCA" sources={[SOURCES.selic, SOURCES.cdi, SOURCES.ipca]}>
          <dl className="space-y-2">
            <div>
              <dt className="inline font-medium text-text">Selic ({pct(rates.selic)}):</dt>{" "}
              <dd className="inline">a taxa básica de juros do país, definida pelo Copom, do Banco Central, a cada 45 dias.</dd>
            </div>
            <div>
              <dt className="inline font-medium text-text">CDI ({pct(rates.cdi)}):</dt>{" "}
              <dd className="inline">
                a taxa com que os bancos emprestam entre si. Anda colada na Selic e é a régua da renda fixa: &quot;100% do CDI&quot; é render exatamente ela.
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-text">IPCA ({pct(rates.ipca12)} em 12 meses):</dt>{" "}
              <dd className="inline">a inflação oficial, medida pelo IBGE. Diz quanto os preços subiram.</dd>
            </div>
          </dl>
        </Concept>
        <Concept title="Imposto de renda" sources={[SOURCES.ir]}>
          <p>
            Na maior parte da renda fixa, o IR é cobrado no resgate e só sobre o rendimento, nunca sobre o que você colocou. E ele cai com o tempo:{" "}
            <span className="num text-text">22,5%</span> até 6 meses, <span className="num text-text">20%</span> até 1 ano,{" "}
            <span className="num text-text">17,5%</span> até 2 anos e <span className="num text-text">15%</span> depois.
          </p>
          <p>Poupança e LCI/LCA são isentas para pessoa física.</p>
        </Concept>
        <Concept title="Liquidez × prazo">
          <p>
            Liquidez é a facilidade de transformar o investimento em dinheiro sem perder nada. Quem aceita deixar o dinheiro preso por mais tempo costuma ganhar uma
            taxa maior. Dinheiro para emergências pede saque rápido; objetivos de anos aceitam prazos longos.
          </p>
        </Concept>
        <Concept title="Risco e FGC" sources={[SOURCES.fgc]}>
          <p>
            Todo investimento tem risco: de quem pegou o dinheiro não pagar, de o preço oscilar se você vender antes do vencimento e de não conseguir sacar na hora.
          </p>
          <p>
            Se um banco quebra, o <b className="text-text">FGC</b> (Fundo Garantidor de Créditos) devolve até <span className="num text-text">R$ 250 mil</span> por CPF
            em cada instituição, com teto de <span className="num text-text">R$ 1 milhão</span> a cada 4 anos. Cobre poupança, CDB e LCI/LCA; o Tesouro é garantido pelo
            governo e fundos não têm FGC.
          </p>
        </Concept>
      </div>

      <div className="mt-3">
        <Example rates={rates} />
      </div>

      <h2 className="mt-16 text-2xl font-semibold tracking-tight sm:text-3xl">Cada investimento, em poucas linhas</h2>
      <p className="mt-2 max-w-2xl text-muted">Os sete que o simulador compara: o que são, quanto de imposto pagam, quem garante e quando dá pra sacar.</p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ORDER.map((id) => {
          const g = GUIDE[id];
          return (
            <article
              key={id}
              id={`entenda-${id}`}
              className="relative flex scroll-mt-6 flex-col overflow-hidden rounded-2xl border border-line bg-panel p-5 transition target:border-up"
            >
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: COLOR[id] }} />
              <h3 className="font-semibold" style={{ color: COLOR[id] }}>
                {name[id]}
              </h3>
              <p className="text-xs text-dim">{g.full}</p>
              <p className="mt-3 text-sm leading-relaxed text-text">{g.what}</p>
              <dl className="mt-4 space-y-2 text-sm leading-relaxed">
                {(
                  [
                    ["Imposto", g.ir],
                    ["Garantia", g.safety],
                    ["Resgate", g.liquidity],
                    ["De olho", g.watch],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="num text-[11px] uppercase tracking-[0.15em] text-dim">{k}</dt>
                    <dd className="text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
              <Sources items={g.sources} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
