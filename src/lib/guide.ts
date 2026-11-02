import type { ProductId } from "./calc";

// Explicações para quem nunca investiu: curtas, gerais e sem recomendar nada. Cada uma aponta a
// fonte oficial (lei, Banco Central, FGC, Tesouro, IBGE) para quem quiser conferir.

export type Source = { label: string; href: string };

export const SOURCES = {
  ir: { label: "Lei 11.033/2004 (IR e isenções)", href: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l11033.htm" },
  poupanca: { label: "Lei 12.703/2012 (regra da poupança)", href: "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12703.htm" },
  fgc: { label: "FGC: sobre a garantia", href: "https://www.fgc.org.br/sobre-garantia-fgc" },
  lciPrazo: {
    label: "Resolução CMN 5.215/2025 (prazo mínimo de LCI e LCA)",
    href: "https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20CMN&numero=5215",
  },
  tesouro: { label: "Tesouro Direto: dúvidas frequentes", href: "https://www.tesourodireto.com.br/como-investir/duvidas-frequentes" },
  fundos: { label: "Lei 14.754/2023 (IR dos fundos e come-cotas)", href: "https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/lei/l14754.htm" },
  selic: { label: "Banco Central: taxa Selic", href: "https://www.bcb.gov.br/controleinflacao/taxaselic" },
  cdi: {
    label: "B3: indicadores (CDI)",
    href: "https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/consultas/mercado-de-derivativos/indicadores/indicadores-financeiros/",
  },
  ipca: { label: "IBGE: inflação", href: "https://www.ibge.gov.br/explica/inflacao.php" },
} satisfies Record<string, Source>;

export type Guide = {
  full: string; // nome por extenso
  what: string; // o que é, em uma ou duas frases
  ir: string;
  safety: string; // quem garante
  liquidity: string; // quando dá pra sacar
  watch: string; // o que vale olhar antes
  sources: Source[];
};

const FGC = "FGC até R$ 250 mil por CPF em cada instituição.";
const TESOURO = "Tesouro Nacional (não tem FGC): é considerado o investimento de menor risco do país.";
const IR = "Tabela regressiva: de 22,5% a 15% sobre o rendimento, conforme o prazo.";

export const GUIDE: Record<ProductId, Guide> = {
  poupanca: {
    full: "Caderneta de poupança",
    what: "A aplicação mais conhecida do Brasil: o dinheiro fica no banco e rende uma vez por mês, na data de aniversário do depósito.",
    ir: "Isenta para pessoa física.",
    safety: FGC,
    liquidity: "Saca quando quiser, mas o que sair antes do aniversário perde o rendimento daquele mês.",
    watch: "Com a Selic acima de 8,5%, rende 0,5% ao mês + TR: costuma perder para um CDB de 100% do CDI.",
    sources: [SOURCES.poupanca, SOURCES.fgc],
  },
  cdb: {
    full: "Certificado de Depósito Bancário",
    what: "Você empresta dinheiro para um banco e ele devolve com juros, quase sempre um percentual do CDI (por exemplo, 100% do CDI).",
    ir: `${IR} Tem IOF se sacar em menos de 30 dias.`,
    safety: FGC,
    liquidity: "Depende do CDB: alguns deixam sacar a qualquer dia, outros só pagam no vencimento.",
    watch: "Banco menor costuma pagar mais porque o risco é maior; por isso vale ficar dentro do limite do FGC.",
    sources: [SOURCES.ir, SOURCES.fgc],
  },
  lci: {
    full: "Letra de Crédito Imobiliário e Letra de Crédito do Agronegócio",
    what: "Você empresta ao banco e ele usa o dinheiro para financiar imóveis (LCI) ou o agronegócio (LCA). Para incentivar esses setores, o rendimento não paga imposto.",
    ir: "Isenta para pessoa física: o rendimento vem inteiro.",
    safety: FGC,
    liquidity: "Tem carência: pela regra do Conselho Monetário Nacional, não dá pra resgatar antes de 6 meses (nas corrigidas pela inflação, o prazo mínimo é maior).",
    watch: "Paga um % do CDI menor que o CDB, mas sem IR. O quadro CDB × LCI do simulador mostra qual sai na frente no seu prazo.",
    sources: [SOURCES.ir, SOURCES.lciPrazo, SOURCES.fgc],
  },
  selic: {
    full: "Tesouro Selic (título público pós-fixado)",
    what: "Você empresta para o governo federal e recebe a taxa Selic. Quase não oscila, por isso é muito usado para a reserva de emergência.",
    ir: IR,
    safety: TESOURO,
    liquidity: "Pode vender em qualquer dia útil; o dinheiro cai no mesmo dia ou no seguinte.",
    watch: "Taxa de custódia da B3 de 0,20% ao ano, só sobre o que passar de R$ 10 mil.",
    sources: [SOURCES.tesouro, SOURCES.ir],
  },
  ipca: {
    full: "Tesouro IPCA+ (título público atrelado à inflação)",
    what: "Paga a inflação (IPCA) mais uma taxa fixa combinada na compra. Levando até o vencimento, o dinheiro cresce acima da inflação.",
    ir: IR,
    safety: TESOURO,
    liquidity: "Dá pra vender antes, mas pelo preço do dia (marcação a mercado): pode sair com mais ou com menos do que o combinado.",
    watch: "Pensado para objetivos longos, de vários anos. Taxa de custódia da B3 de 0,20% ao ano.",
    sources: [SOURCES.tesouro, SOURCES.ir],
  },
  fundo: {
    full: "Fundo de renda fixa referenciado DI",
    what: "Você compra cotas de um fundo, e um gestor aplica o dinheiro de todos os cotistas em títulos que acompanham o CDI.",
    ir: `${IR} Tem come-cotas: em maio e novembro, parte do IR é cobrada adiantado.`,
    safety: "Não tem FGC: o risco é o dos títulos da carteira, que num fundo DI costuma ser baixo.",
    liquidity: "O resgate costuma cair no mesmo dia ou no seguinte (veja o prazo de resgate do fundo).",
    watch: "A taxa de administração é cobrada todo ano e sai do rendimento: compare antes de entrar.",
    sources: [SOURCES.fundos],
  },
  pre: {
    full: "Prefixado (Tesouro Prefixado ou CDB prefixado)",
    what: "A taxa é fixa e conhecida no dia da aplicação (por exemplo, 14% ao ano): você já sabe quanto recebe no vencimento.",
    ir: IR,
    safety: "No Tesouro, o governo federal; no CDB, o FGC até R$ 250 mil por CPF em cada instituição.",
    liquidity: "Vender antes do vencimento sai pelo preço do dia e pode dar perda; a taxa combinada vale levando até o fim.",
    watch: "Sai ganhando se os juros do país caírem depois da compra; se subirem, você fica preso a uma taxa menor.",
    sources: [SOURCES.tesouro, SOURCES.fgc, SOURCES.ir],
  },
};
