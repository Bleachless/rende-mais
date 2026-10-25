import { describe, expect, it } from "vitest";
import { cdbEquivalent, irRate, periodLabel, poupancaMonthly, products, simulate, simulateAll, type Inputs, type Rates } from "./calc";

const rates: Rates = { selic: 13.75, selicEfetiva: 13.65, cdi: 13.65, tr: 0.1261, ipca12: 4.58, updated: "22/10/2026", live: true };
const base: Inputs = { initial: 10_000, monthly: 0, months: 12, cdbPct: 100, lciPct: 90, prefixado: 14 };
const close = (a: number, b: number, tol = 0.01) => expect(Math.abs(a - b)).toBeLessThan(tol);

describe("tabela do IR", () => {
  it("segue as faixas regressivas", () => {
    expect(irRate(30)).toBe(0.225);
    expect(irRate(180)).toBe(0.225);
    expect(irRate(181)).toBe(0.2);
    expect(irRate(365)).toBe(0.175);
    expect(irRate(721)).toBe(0.15);
  });
});

describe("poupança", () => {
  it("com Selic alta rende 0,5% + TR ao mês", () => {
    close(poupancaMonthly(13.75, 0.1261), (1.005 * 1.001261 - 1), 1e-12);
  });
  it("com Selic até 8,5% rende 70% da Selic", () => {
    close(poupancaMonthly(8, 0), Math.pow(1.056, 1 / 12) - 1, 1e-12);
  });
});

describe("simulação", () => {
  it("CDB 100% do CDI em 1 ano: rendimento menos 17,5% de IR", () => {
    const cdb = simulate(products(rates, base).find((p) => p.id === "cdb")!, base, rates.ipca12);
    const gross = 10_000 * 1.1365;
    close(cdb.gross, gross);
    close(cdb.net, 10_000 + (gross - 10_000) * (1 - 0.175));
    expect(cdb.series).toHaveLength(13);
    close(cdb.series[12], cdb.net, 1e-6);
  });

  it("LCI não paga IR e poupança também não", () => {
    const [poup, , lci] = simulateAll(rates, base);
    expect(lci.ir).toBe(0);
    expect(poup.ir).toBe(0);
    close(lci.net, 10_000 * (1 + 0.1365 * 0.9));
  });

  it("Tesouro Selic paga custódia só acima de R$ 10 mil", () => {
    const small = simulate(products(rates, { ...base, initial: 5_000 }).find((p) => p.id === "selic")!, { ...base, initial: 5_000 }, 4.58);
    expect(small.fees).toBe(0);
    const big = simulate(products(rates, { ...base, initial: 100_000 }).find((p) => p.id === "selic")!, { ...base, initial: 100_000 }, 4.58);
    expect(big.fees).toBeGreaterThan(150);
    expect(big.fees).toBeLessThan(220);
  });

  it("cada aporte paga o IR da própria idade", () => {
    const i: Inputs = { ...base, initial: 0, monthly: 1_000, months: 7 };
    const cdb = simulate(products(rates, i).find((p) => p.id === "cdb")!, i, 4.58);
    expect(cdb.invested).toBe(6_000); // 6 aportes; o 7º mês é o do resgate
    // O primeiro aporte fica 6 meses (~183 dias, já na faixa de 20%); os outros pagam 22,5%.
    const f = Math.pow(1.1365, 1 / 12);
    const net = [6, 5, 4, 3, 2, 1].map((age) => 1000 * (Math.pow(f, age) - 1) * (1 - (age === 6 ? 0.2 : 0.225)));
    close(cdb.net, 6_000 + net.reduce((s, g) => s + g, 0));
  });

  it("ganho real desconta a inflação do período", () => {
    const lci = simulateAll(rates, base)[2];
    close(lci.realGain, lci.net - 10_000 * 1.0458);
  });

  it("equivalência CDB × LCI", () => {
    close(cdbEquivalent(90, 12), 90 / 0.825);
    close(cdbEquivalent(90, 36), 90 / 0.85);
  });

  it("nomeia o prazo", () => {
    expect(periodLabel(12)).toBe("1 ano");
    expect(periodLabel(30)).toBe("2 anos e 6 meses");
    expect(periodLabel(1)).toBe("1 mês");
  });
});
