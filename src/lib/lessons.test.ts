import { describe, expect, it } from "vitest";
import { access, compound, iofRate, monthsToSave, titlePrice, doublingYears, fgcSplit, grossGain, inflationSince, lastMonth, priceIndex, simple, type IpcaHistory } from "./lessons";

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

describe("IR, FGC e liquidez", () => {
  it("rende a taxa anual em 365 dias e proporcional (composto) no meio do caminho", () => {
    close(grossGain(10_000, 10, 365), 1000);
    close(grossGain(10_000, 10, 730), 2100);
    expect(grossGain(10_000, 10, 0)).toBe(0);
  });
  it("o FGC cobre até R$ 250 mil", () => {
    expect(fgcSplit(100_000)).toEqual({ covered: 100_000, uncovered: 0 });
    expect(fgcSplit(300_000)).toEqual({ covered: 250_000, uncovered: 50_000 });
  });
  it("classifica o saque: preso, pelo preço do dia ou livre", () => {
    expect(access(6, 0, 3)).toBe("preso");
    expect(access(6, 0, 6)).toBe("livre");
    expect(access(0, 36, 12)).toBe("mercado");
    expect(access(0, 36, 36)).toBe("livre");
    expect(access(0, 0, 0)).toBe("livre");
  });
});

describe("IOF", () => {
  it("leva 96% do rendimento no 1º dia e zera no 30º", () => {
    expect(iofRate(1)).toBe(0.96);
    expect(iofRate(15)).toBe(0.5);
    expect(iofRate(29)).toBe(0.03);
    expect(iofRate(30)).toBe(0);
    expect(iofRate(400)).toBe(0);
  });
});

describe("marcação a mercado e reserva", () => {
  it("o preço do título cai quando os juros sobem", () => {
    close(titlePrice(1000, 10, 1), 1000 / 1.1);
    expect(titlePrice(1000, 14, 4)).toBeLessThan(titlePrice(1000, 12, 4));
    expect(titlePrice(1000, 12, 0)).toBe(1000);
  });
  it("conta os meses para juntar a reserva", () => {
    expect(monthsToSave(1000, 100, 0)).toBe(10);
    expect(monthsToSave(1000, 100, 12)).toBeLessThanOrEqual(10);
    expect(monthsToSave(1000, 0, 12)).toBe(Infinity);
    expect(monthsToSave(0, 100, 12)).toBe(0);
  });
});
