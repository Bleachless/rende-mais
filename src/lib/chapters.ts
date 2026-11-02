// Os capítulos do tutorial (/aprenda), na ordem. Só dados: serve à navegação (no navegador)
// e às páginas e metadados (no servidor).

export type ChapterMeta = { slug: string; title: string; short: string; icon: string; description: string };

export const CHAPTERS: ChapterMeta[] = [
  { slug: "inflacao", title: "Inflação: o carrinho que encolhe", short: "Inflação", icon: "🛒", description: "Por que dinheiro parado perde valor, com o IPCA real desde o Plano Real." },
  { slug: "juros-compostos", title: "Juros compostos: a bola de neve", short: "Juros compostos", icon: "⛄", description: "Juros sobre juros: como o tempo faz o dinheiro crescer, no CDI e na poupança." },
  {
    slug: "banco-central",
    title: "Quem manda nos juros: o Banco Central e o Copom",
    short: "Banco Central e Copom",
    icon: "🏦",
    description: "O que o Banco Central faz, como funciona uma reunião do Copom e o efeito dominó da Selic até o seu bolso.",
  },
  { slug: "selic-cdi", title: "Selic e CDI: o termostato da economia", short: "Selic e CDI", icon: "🌡️", description: "Mexa na Selic e veja o CDI, a poupança e o crédito mudarem." },
  { slug: "investir-e-emprestar", title: "Investir é emprestar", short: "Investir é emprestar", icon: "🤝", description: "Para quem vai o seu dinheiro (banco, governo ou empresa) e quem garante, com o limite do FGC." },
  { slug: "imposto-de-renda", title: "O leão do IR", short: "O leão do IR", icon: "🦁", description: "A tabela regressiva do imposto de renda, pra que ela serve e o IOF de quem tira antes de 30 dias." },
  { slug: "liquidez", title: "Liquidez × prazo", short: "Liquidez × prazo", icon: "⏳", description: "Quando dá pra sacar sem perder: o que é liquidez e por que prazo maior costuma pagar mais." },
  {
    slug: "marcacao-a-mercado",
    title: "Marcação a mercado: por que o Tesouro às vezes cai",
    short: "Marcação a mercado",
    icon: "⚖️",
    description: "Por que o preço de um título do Tesouro sobe e desce antes do vencimento, e o que acontece se você esperar.",
  },
  { slug: "reserva-de-emergencia", title: "Reserva de emergência", short: "Reserva de emergência", icon: "🛟", description: "Quanto juntar para os imprevistos, em quanto tempo e onde ela costuma ficar." },
  { slug: "acoes-e-fiis", title: "Ações e FIIs: virando sócio", short: "Ações e FIIs", icon: "📈", description: "Renda fixa × renda variável: como se ganha, o risco e o imposto de ações e fundos imobiliários." },
  { slug: "golpes", title: "Golpes: como não cair", short: "Golpes", icon: "🚩", description: "Pirâmide, falso gerente, Pix urgente: teste se você cairia e aprenda os sinais de alerta." },
];

export const chapter = (slug: string) => CHAPTERS.findIndex((c) => c.slug === slug);
