"use client";

import { useState } from "react";
import { brl, IR_TABLE, irRate, pct, periodLabel } from "@/lib/calc";
import { grossGain, iofRate } from "@/lib/lessons";
import { Bubble, Mascot, type Face } from "../mascot";
import { Choice, Replay, Stat, useSweep } from "./shared";

const DAYS_PER_MONTH = 365.25 / 12;
const TIERS = [
  ["até 6 meses", "até 180 dias"],
  ["de 6 meses a 1 ano", "181 a 360 dias"],
  ["de 1 a 2 anos", "361 a 720 dias"],
  ["mais de 2 anos", "acima de 720 dias"],
];
const AFTER = ["6 meses", "1 ano", "2 anos"]; // quando cada faixa termina

export function TaxScene({ cdi }: { cdi: number }) {
  return (
    <div className="space-y-3">
      <Lion cdi={cdi} />
      <EarlyExit cdi={cdi} />
    </div>
  );
}

// O leão do IR: a mordida no rendimento cai com o tempo.
function Lion({ cdi }: { cdi: number }) {
  const [months, setMonths] = useState(25);
  const [kind, setKind] = useState<"ir" | "isento">("ir");
  const { ref, stop, run } = useSweep<HTMLDivElement>(setMonths, 1, 25, 130);

  const days = Math.round(months * DAYS_PER_MONTH);
  const gain = grossGain(10_000, cdi, days);
  const exempt = kind === "isento";
  const rate = exempt ? 0 : irRate(days);
  const tax = gain * rate;
  const tier = IR_TABLE.findIndex((t) => days <= t.upTo);
  const bite = (rate * 100).toFixed(2); // fatia da pizza que o leão leva

  const face: Face = exempt || rate === 0.15 ? "cheer" : rate === 0.175 ? "happy" : rate === 0.2 ? "neutral" : "worried";
  const say = exempt
    ? `Na LCI, na LCA e na poupança o leão não come nada: os ${brl(gain)} de rendimento ficam inteiros comigo.`
    : `Em ${periodLabel(months)}, o leão leva ${pct(rate * 100, 1)} do rendimento: ${brl(tax)} de ${brl(gain)}.` +
      (tier < 3 ? ` Se eu ficar mais de ${AFTER[tier]}, a mordida cai para ${pct(IR_TABLE[tier + 1].rate * 100, 1)}.` : " Passou de 2 anos: mordida mínima!");

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Choice
          label="Tipo de investimento"
          value={kind}
          options={[
            { id: "ir", label: "CDB, Tesouro, fundo" },
            { id: "isento", label: "LCI, LCA, poupança" },
          ]}
          onChange={setKind}
        />
        <Replay onClick={run} />
      </div>

      <div className="mt-5 flex items-center gap-4">
        <Mascot face={face} arms={face === "worried" ? "cheeks" : face === "cheer" ? "up" : "down"} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        {/* A pizza do rendimento e o leão do lado, do tamanho da mordida. */}
        <div className="flex items-center justify-center gap-3" aria-hidden>
          <div
            className="relative h-36 w-36 rounded-full border-4 border-panel-2"
            style={{ background: `conic-gradient(var(--color-down) 0 ${bite}%, var(--color-up) ${bite}% 100%)` }}
          >
            <span className="absolute inset-0 grid place-items-center">
              <span className="num rounded-lg bg-bg/80 px-2 py-1 text-xs text-text">{exempt ? "0%" : pct(rate * 100, 1)}</span>
            </span>
          </div>
          <span
            className={`inline-block text-6xl transition-transform duration-300 motion-reduce:transition-none ${exempt ? "opacity-60 grayscale" : ""}`}
            style={{ transform: `scale(${exempt ? 0.7 : (0.6 + (rate / 0.225) * 0.5).toFixed(2)})` }}
          >
            {exempt ? "😴" : "🦁"}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-sm text-muted">R$ 10.000 a 100% do CDI ({pct(cdi)} ao ano), resgatando depois de</p>
          <p className="num text-4xl font-semibold tracking-tight">{periodLabel(months)}</p>
          <input
            type="range"
            min={1}
            max={36}
            value={months}
            onChange={(e) => {
              stop();
              setMonths(Number(e.target.value));
            }}
            className="mt-3 w-full"
            aria-label="Meses aplicado"
            aria-valuetext={periodLabel(months)}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Rendimento" value={`+${brl(gain)}`} tone="text-up" />
        <Stat label="Mordida do leão (IR)" value={tax > 0.005 ? `−${brl(tax)}` : "isento"} tone="text-down" />
        <Stat label="Fica com você" value={`+${brl(gain - tax)}`} className="col-span-2 sm:col-span-1" />
      </div>

      {/* A tabela inteira, com a faixa da simulação acesa. */}
      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <caption className="bg-panel-2 px-3 py-2 text-left text-xs uppercase tracking-[0.15em] text-dim">Tabela regressiva do IR na renda fixa</caption>
          <thead className="text-xs text-dim">
            <tr className="border-b border-line">
              <th scope="col" className="px-3 py-2 font-normal">
                Tempo aplicado
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                IR sobre o rendimento
              </th>
              <th scope="col" className="hidden px-3 py-2 font-normal sm:table-cell">
                De cada R$ 1.000 de rendimento, fica
              </th>
            </tr>
          </thead>
          <tbody className="num">
            {IR_TABLE.map((t, k) => {
              const on = !exempt && k === tier;
              return (
                <tr key={t.upTo} className={`border-b border-line/60 transition last:border-0 ${on ? "bg-down/15 text-text" : "text-muted"}`}>
                  <td className="px-3 py-2">
                    {TIERS[k][0]} <span className="block text-xs text-dim sm:inline">({TIERS[k][1]})</span>
                  </td>
                  <td className="px-3 py-2">{pct(t.rate * 100, 1)}</td>
                  <td className="hidden px-3 py-2 sm:table-cell">{brl(1000 * (1 - t.rate), 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-dim">
        O prazo conta do dia em que você aplicou até o dia do resgate, e cada aporte conta o seu: o dinheiro mais novo paga mais. O IR sai na hora do resgate, já
        descontado. No fundo DI, parte dele é adiantada em maio e novembro (come-cotas).
      </p>
    </div>
  );
}

// Antes de 30 dias, o IOF morde primeiro: 96% do rendimento no 1º dia, zero no 30º.
function EarlyExit({ cdi }: { cdi: number }) {
  const [day, setDay] = useState(1);
  const { ref, stop, run } = useSweep<HTMLDivElement>(setDay, 30, 1, 120); // termina no "amanhã"

  const gain = grossGain(10_000, cdi, day);
  const iof = gain * iofRate(day);
  const ir = (gain - iof) * irRate(day);
  const keep = gain - iof - ir;
  const share = (v: number) => `${(gain > 0 ? (v / gain) * 100 : 0).toFixed(2)}%`;

  const face: Face = day <= 10 ? "shocked" : day < 30 ? "worried" : "happy";
  const say =
    day < 30
      ? `Tirou no ${day}º dia? O IOF leva ${pct(iofRate(day) * 100, 0)} do rendimento e o IR leva 22,5% do que sobrar. De ${brl(gain)} de rendimento, ficam só ${brl(keep)}.`
      : `No 30º dia o IOF zera. Daqui pra frente, só o IR da tabela: 22,5% até 6 meses.`;

  return (
    <div ref={ref} className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">E se eu colocar hoje e tirar amanhã?</p>
        <Replay onClick={run} />
      </div>
      <div className="mt-5 flex items-center gap-4">
        <Mascot face={face} arms={face === "happy" ? "up" : "cheeks"} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <p className="mt-6 text-sm text-muted">R$ 10.000 num CDB de 100% do CDI, resgatando no</p>
      <p className="num text-4xl font-semibold tracking-tight">
        {day}º {day === 1 ? "dia (amanhã)" : "dia"}
      </p>
      <input
        type="range"
        min={1}
        max={30}
        value={day}
        onChange={(e) => {
          stop();
          setDay(Number(e.target.value));
        }}
        className="mt-3 w-full"
        aria-label="Dias até o resgate"
        aria-valuetext={`${day} dias`}
      />

      <p className="mt-5 text-xs text-dim">Para onde vai o rendimento de {brl(gain)}</p>
      <div className="mt-1.5 flex h-4 overflow-hidden rounded-full bg-panel-2" role="img" aria-label={`IOF ${brl(iof)}, IR ${brl(ir)}, fica com você ${brl(keep)}`}>
        <div className="bg-violet transition-all duration-100 motion-reduce:transition-none" style={{ width: share(iof) }} />
        <div className="bg-down transition-all duration-100 motion-reduce:transition-none" style={{ width: share(ir) }} />
        <div className="bg-up transition-all duration-100 motion-reduce:transition-none" style={{ width: share(keep) }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Rendimento" value={`+${brl(gain)}`} />
        <Stat label="IOF" value={iof > 0.005 ? `−${brl(iof)}` : "zero"} tone="text-violet" />
        <Stat label="IR (22,5%)" value={`−${brl(ir)}`} tone="text-down" />
        <Stat label="Fica com você" value={`+${brl(keep)}`} tone="text-up" />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-dim">
        O IOF vale para CDB, Tesouro e fundos resgatados antes de 30 dias e cai a cada dia: 96% do rendimento no 1º, 50% no 15º, 3% no 29º e zero a partir do
        30º. Poupança não tem IOF; LCI e LCA já têm carência maior que isso.
      </p>
    </div>
  );
}
