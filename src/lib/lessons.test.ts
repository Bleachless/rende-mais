import { describe, expect, it } from "vitest";
import { compound, doublingYears, inflationSince, lastMonth, priceIndex, simple, type IpcaHistory } from "./lessons";

const h: IpcaHistory = { start: 2020, monthly: [...Array(12).fill(1), ...Array(12).fill(0), 0.5, 0.5] };
const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(tol);

describe("inflação", () => {
  it("acha o último mês da série", () => {
    expect(lastMonth(h)).toEqual({ year: 2022, month: 2 });
  });
  it("acumula os meses desde janeiro do ano escolhido", () => {
    close(inflationSince(h, 2020), Math.pow(1.01, 12) * 1.005 * 1.005);
    close(inflationSince(h, 2021), 1.005 * 1.005);
    close(inflationSince(h, 2022), 1.005 * 1.005);
    close(inflationSince(h, 1990), inflationSince(h, 2020));
  });
  it("monta o índice mês a mês", () => {
    const idx = priceIndex(h);
    expect(idx).toHaveLength(h.monthly.length + 1);
    close(idx[idx.length - 1], inflationSince(h, 2020));
  });
});

describe("juros", () => {
  it("compostos ganham dos simples com o tempo", () => {
    close(simple(1000, 10, 2), 1200);
    close(compound(1000, 10, 2), 1210);
    expect(compound(1000, 10, 1)).toBeCloseTo(simple(1000, 10, 1), 9);
  });
  it("dobra em ln 2 / ln(1 + taxa) anos", () => {
    close(compound(1, 12, doublingYears(12)), 2);
    expect(doublingYears(10)).toBeCloseTo(7.27, 2);
  });
});
