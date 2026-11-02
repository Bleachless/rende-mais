import type { ReactNode } from "react";
import type { Rates } from "@/lib/calc";
import { SOURCES, type Source } from "@/lib/guide";
import type { IpcaHistory } from "@/lib/lessons";
import { CopomScene } from "@/components/lessons/copom";
import { InflationScene } from "@/components/lessons/inflation";
import { LendingScene } from "@/components/lessons/lending";
import { LiquidityScene } from "@/components/lessons/liquidity";
import { MarketScene } from "@/components/lessons/market";
import { ReserveScene } from "@/components/lessons/reserve";
import { ScamScene } from "@/components/lessons/scams";
import { SelicScene } from "@/components/lessons/selic";
import { SnowballScene } from "@/components/lessons/snowball";
import { StocksScene } from "@/components/lessons/stocks";
import { TaxScene } from "@/components/lessons/tax";

// O conteúdo de cada capítulo: o texto (que sai pronto do servidor), a cena interativa,
// o "pra levar daqui" e as fontes oficiais.

export type Data = { rates: Rates; ipca: IpcaHistory; poupanca: number };
type Content = { intro: ReactNode; take: string[]; sources: Source[]; scene: (d: Data) => ReactNode };

const CALC_DEPOSITOS: Source = {
  label: "Calculadora do Cidadão do BC (aplicação com depósitos)",
  href: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormAplicacaoDepositosRegulares.do?method=exibirFormAplicacaoDepositosRegulares",
};
const CALC_CORRECAO: Source = {
  label: "Calculadora do Cidadão do BC (correção pelo IPCA)",
  href: "https://www3.bcb.gov.br/CALCIDADAO/publico/exibirFormCorrecaoValores.do?method=exibirFormCorrecaoValores",
};

const b = (text: string) => <b className="text-text">{text}</b>;

export const CONTENT: Record<string, Content> = {
  inflacao: {
    intro: (
      <p>
        Inflação é a alta geral dos preços. Ela não tira nenhuma nota da sua carteira: faz cada nota comprar menos. O IBGE mede isso todo mês com o {b("IPCA")}, a
        inflação oficial do Brasil. Escolha um ano e veja o que aconteceu com R$ 100.
      </p>
    ),
    take: [
      "Dinheiro parado não fica igual: ele encolhe no ritmo da inflação, mesmo que o número na conta não mude.",
      "Por isso o que importa num investimento é o ganho real, o quanto ele rende acima do IPCA.",
      "Quer conferir as contas? A Calculadora do Cidadão, do Banco Central, corrige qualquer valor pelo IPCA.",
    ],
    sources: [SOURCES.ipca, CALC_CORRECAO],
    scene: (d) => <InflationScene ipca={d.ipca} />,
  },
  "juros-compostos": {
    intro: (
      <>
        <p>
          {b("Juros simples")} rendem sempre sobre o que você colocou. {b("Juros compostos")} rendem sobre o que você colocou e também sobre os juros que já ganhou,
          e é assim que funciona quase todo investimento.
        </p>
        <p>No começo a diferença é pequena. Com o tempo, os juros sobre juros viram a maior parte do dinheiro.</p>
      </>
    ),
    take: [
      "Tempo é o ingrediente principal: a curva só dispara depois de alguns anos.",
      "Uma diferença pequena na taxa vira uma diferença enorme no fim: troque entre poupança e CDI e compare.",
      "Para crescer de verdade, os juros precisam ganhar da inflação.",
    ],
    sources: [CALC_DEPOSITOS, SOURCES.selic, SOURCES.cdi],
    scene: (d) => <SnowballScene cdi={d.rates.cdi} poupanca={d.poupanca} />,
  },
  "banco-central": {
    intro: (
      <p>
        Todo mundo fala da Selic, mas quem decide? E por quê? Vá passo a passo com o Rendinho: o que é o {b("Banco Central")}, qual a missão dele, como funciona uma
        reunião do {b("Copom")} e o efeito dominó de cada decisão até chegar no seu bolso.
      </p>
    ),
    take: [
      "O Banco Central é o banco dos bancos: cuida da inflação, fiscaliza os bancos, emite o real e opera o Pix.",
      "A meta de inflação é 3% ao ano, com 1,5 ponto de tolerância; quem a define é o Conselho Monetário Nacional.",
      "O Copom decide a Selic a cada 45 dias. Juros mais altos freiam a economia e a inflação; juros mais baixos aceleram.",
    ],
    sources: [SOURCES.copom, SOURCES.autonomia, SOURCES.meta, SOURCES.metaBc],
    scene: (d) => <CopomScene selic={d.rates.selic} />,
  },
  "selic-cdi": {
    intro: (
      <p>
        A Selic é a taxa básica de juros do país. O {b("CDI")} é a taxa que os bancos cobram para emprestar entre si, e anda colado nela. Por isso quase toda a renda
        fixa sobe e desce junto com a Selic. Mexa no termostato e veja o que muda.
      </p>
    ),
    take: [
      "Selic alta: crédito caro e renda fixa rendendo mais. Selic baixa: crédito barato e renda fixa rendendo menos.",
      "O CDI fica colado na Selic; por isso \"100% do CDI\" é a régua para comparar a renda fixa.",
      "Com a Selic em 8,5% ou menos, a poupança deixa de render 0,5% ao mês e passa a render 70% da Selic.",
    ],
    sources: [SOURCES.selic, SOURCES.cdi, SOURCES.poupanca],
    scene: (d) => <SelicScene selic={d.rates.selic} cdi={d.rates.cdi} tr={d.rates.tr} />,
  },
  "investir-e-emprestar": {
    intro: (
      <p>
        Na renda fixa, investir é emprestar dinheiro para alguém que devolve com juros. A pergunta que importa é: {b("para quem")}, e {b("quem garante")} se der
        errado?
      </p>
    ),
    take: [
      "Banco (CDB, LCI, LCA, poupança): o FGC garante até R$ 250 mil por CPF em cada instituição.",
      "Governo (Tesouro Direto): quem garante é o Tesouro Nacional, o menor risco do país.",
      "Empresa (debêntures, CRI, CRA): não tem FGC. Paga mais porque o risco é maior.",
    ],
    sources: [SOURCES.fgc, SOURCES.tesouro, SOURCES.investidor],
    scene: () => <LendingScene />,
  },
  "imposto-de-renda": {
    intro: (
      <>
        <p>
          Investir não é só colocar o dinheiro e pronto: na maior parte da renda fixa (CDB, Tesouro, fundos), o rendimento paga imposto de renda, e quanto ele
          morde depende de {b("quanto tempo o dinheiro ficou aplicado")}.
        </p>
        <p>
          Pra que serve essa tabela? É um incentivo do governo para quem deixa o dinheiro investido por mais tempo: de 22,5% em até 6 meses, a mordida cai até 15%
          depois de 2 anos. E se tirar antes de 30 dias, ainda tem o IOF.
        </p>
      </>
    ),
    take: [
      "O IR é cobrado só sobre o rendimento, nunca sobre o que você colocou, e já sai descontado no resgate.",
      "Vai de 22,5% (até 6 meses) a 15% (mais de 2 anos): colocou hoje e tirou amanhã, paga a alíquota máxima.",
      "Antes de 30 dias ainda tem IOF, que no dia seguinte leva 96% do rendimento.",
      "Poupança, LCI e LCA são isentas de IR para pessoa física.",
    ],
    sources: [SOURCES.ir, SOURCES.iof, SOURCES.fundos],
    scene: (d) => <TaxScene cdi={d.rates.cdi} />,
  },
  liquidez: {
    intro: (
      <p>
        {b("Liquidez")} é a facilidade de transformar o investimento em dinheiro sem perder nada. Uns saem no mesmo dia, outros ficam presos e outros só saem antes do
        prazo pelo preço do dia. Escolha quando vai precisar e veja.
      </p>
    ),
    take: [
      "Quem aceita prender o dinheiro por mais tempo costuma ganhar uma taxa maior.",
      "Vender um título antes do vencimento sai pelo preço do dia, que pode ser maior ou menor que o combinado.",
      "Dinheiro para emergências pede saque rápido; objetivos de anos aceitam prazos longos.",
    ],
    sources: [SOURCES.tesouro, SOURCES.lciPrazo, SOURCES.poupanca],
    scene: () => <LiquidityScene />,
  },
  "marcacao-a-mercado": {
    intro: (
      <>
        <p>
          Já abriu o app e viu o Tesouro &quot;negativo&quot;? Não é perda certa: é a {b("marcação a mercado")}. Um título prefixado ou IPCA+ paga uma taxa
          combinada no vencimento, mas antes disso ele tem um preço, que muda todo dia conforme os juros do país.
        </p>
        <p>Funciona como uma gangorra: juros sobem, o preço do título que você já tem cai. Juros caem, ele sobe.</p>
      </>
    ),
    take: [
      "Levando até o vencimento, você recebe exatamente a taxa combinada, não importa o sobe e desce do caminho.",
      "Vendendo antes, vale o preço do dia: pode sair com lucro extra ou com prejuízo.",
      "O Tesouro Selic quase não oscila; o Prefixado e o IPCA+ oscilam mais, e mais ainda os de prazo longo.",
    ],
    sources: [SOURCES.tesouro],
    scene: () => <MarketScene />,
  },
  "reserva-de-emergencia": {
    intro: (
      <p>
        Antes de pensar em render mais, vem a {b("reserva de emergência")}: um dinheiro guardado para o imprevisto (perder o emprego, uma doença, o carro quebrar)
        sem precisar de empréstimo caro nem vender investimento na hora errada.
      </p>
    ),
    take: [
      "Costuma-se falar em 3 a 12 meses dos seus gastos, conforme a estabilidade da renda.",
      "Ela precisa sair no mesmo dia e não oscilar: liquidez e segurança vêm antes da rentabilidade.",
      "Dá pra montar aos poucos: guardar todo mês e deixar os juros ajudarem.",
    ],
    sources: [{ label: "Banco Central: Cidadania Financeira", href: "https://www.bcb.gov.br/cidadaniafinanceira" }, SOURCES.tesouro, SOURCES.fgc],
    scene: (d) => <ReserveScene cdi={d.rates.cdi} />,
  },
  "acoes-e-fiis": {
    intro: (
      <p>
        Até aqui foi renda fixa: você empresta e a regra é combinada antes. Na {b("renda variável")} você vira sócio: compra um pedacinho de uma empresa (ações) ou
        de imóveis (fundos imobiliários, os FIIs). Pode render mais, mas não tem nada garantido.
      </p>
    ),
    take: [
      "Ações: você ganha com dividendos e com a valorização, mas o preço sobe e desce todo dia.",
      "FIIs: você recebe aluguéis todo mês, em geral isentos de IR para pessoa física, e a cota também oscila.",
      "Renda variável não tem FGC nem rendimento garantido: costuma ser para dinheiro de longo prazo.",
    ],
    sources: [
      { label: "Lei 11.033/2004 (isenção de até R$ 20 mil e FIIs)", href: SOURCES.ir.href },
      { label: "Lei 15.270/2025 (dividendos acima de R$ 50 mil)", href: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15270.htm" },
      { label: "Portal do Investidor: mercado de capitais", href: "https://www.gov.br/investidor/pt-br/investir/como-investir/conheca-o-mercado-de-capitais" },
    ],
    scene: () => <StocksScene />,
  },
  golpes: {
    intro: (
      <p>
        Os golpes mudam de roupa, mas os sinais se repetem. Veja oito mensagens que chegam todo dia e decida: {b("é golpe ou é normal?")} O Rendinho explica cada
        uma.
      </p>
    ),
    take: [
      "Promessa de ganho alto e garantido: nada seguro rende muito mais que o CDI.",
      "Pressa (\"últimas vagas\", \"urgente\") e ganho por indicar pessoas são sinais de pirâmide.",
      "Banco e Banco Central não pedem senha, código nem transferência para \"conta segura\", e o BC não manda links.",
      "Antes de investir, confira se a empresa é autorizada pela CVM ou pelo Banco Central.",
      "Caiu num golpe de Pix? Peça o MED no app do seu banco o quanto antes (até 80 dias).",
    ],
    sources: [
      { label: "Banco Central: segurança no Pix (MED)", href: "https://www.bcb.gov.br/estabilidadefinanceira/pix-seguranca" },
      { label: "Banco Central: não caia em golpes", href: "https://www.bcb.gov.br/meubc/faqs/p/cuidado-com-os-golpes" },
      { label: "CVM", href: "https://www.gov.br/cvm/pt-br" },
      SOURCES.investidor,
    ],
    scene: (d) => <ScamScene cdi={d.rates.cdi} />,
  },
};

// Quem é quem no seu dinheiro: uma linha para cada instituição que aparece no tutorial.
export const WHO = [
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
