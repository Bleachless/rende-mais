"use client";

import { useState } from "react";
import { brl, periodLabel } from "@/lib/calc";
import { monthsToSave } from "@/lib/lessons";
import { Bubble, Mascot, type Face } from "../mascot";
import { Choice, Stat } from "./shared";

type Income = "estavel" | "media" | "instavel";
const INCOME: Record<Income, { label: string; months: number; why: string }> = {
  estavel: { label: "Renda estável", months: 3, why: "salário fixo e emprego estável" },
  media: { label: "Mais ou menos", months: 6, why: "renda que varia um pouco" },
  instavel: { label: "Renda instável", months: 12, why: "autônomo, comissão ou bicos" },
};

// A reserva de emergência: quanto juntar e em quanto tempo, guardando um pouco por mês.
export function ReserveScene({ cdi }: { cdi: number }) {
  const [spend, setSpend] = useState(3000);
  const [income, setIncome] = useState<Income>("media");
  const [save, setSave] = useState(500);

  const months = INCOME[income].months;
  const target = spend * months;
  const time = monthsToSave(target, save, cdi);
  const face: Face = time <= 12 ? "cheer" : time <= 36 ? "happy" : "worried";
  const say =
    time === Infinity
      ? "Sem guardar nada por mês, a reserva não sai do lugar. Até um pouquinho já começa a bola de neve."
      : `Com gastos de ${brl(spend, 0)} por mês, a reserva fica em ${brl(target, 0)} (${months} meses de gastos). Guardando ${brl(save, 0)} por mês, rendendo como o CDI, eu chego lá em ${periodLabel(time)}.`;

  return (
    <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Mascot face={face} arms={face === "worried" ? "cheeks" : face === "cheer" ? "up" : "down"} className="h-28 w-24 shrink-0" />
        <Bubble className="min-w-0 flex-1">{say}</Bubble>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted">Quanto você gasta por mês</p>
          <p className="num text-3xl font-semibold tracking-tight">{brl(spend, 0)}</p>
          <input
            type="range"
            min={500}
            max={20000}
            step={250}
            value={spend}
            onChange={(e) => setSpend(Number(e.target.value))}
            className="mt-3 w-full"
            aria-label="Gastos por mês"
            aria-valuetext={brl(spend, 0)}
          />
        </div>
        <div>
          <p className="text-sm text-muted">Quanto consegue guardar por mês</p>
          <p className="num text-3xl font-semibold tracking-tight">{brl(save, 0)}</p>
          <input
            type="range"
            min={0}
            max={5000}
            step={50}
            value={save}
            onChange={(e) => setSave(Number(e.target.value))}
            className="mt-3 w-full"
            aria-label="Quanto guardar por mês"
            aria-valuetext={brl(save, 0)}
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">Como é a sua renda?</p>
      <div className="mt-2">
        <Choice label="Tipo de renda" value={income} options={(Object.keys(INCOME) as Income[]).map((id) => ({ id, label: INCOME[id].label }))} onChange={setIncome} />
      </div>
      <p className="mt-2 text-xs text-dim">
        Costuma-se falar em 3 a 12 meses de gastos: quanto mais instável a renda ({INCOME[income].why}), maior a reserva. Aqui: {months} meses.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Reserva" value={brl(target, 0)} tone="text-up" />
        <Stat label="Tempo para juntar" value={time === Infinity ? "—" : periodLabel(time)} />
        <Stat label="Meses de gastos cobertos" value={`${months} meses`} className="col-span-2 sm:col-span-1" />
      </div>

      <div className="mt-5 rounded-xl border border-line bg-bg/60 p-4 text-sm leading-relaxed text-muted">
        <p className="font-medium text-text">Onde ela costuma ficar</p>
        <p className="mt-1">
          Num lugar que dá pra sacar no mesmo dia e que não oscila: Tesouro Selic, CDB de liquidez diária coberto pelo FGC ou conta que rende. Rentabilidade aqui
          vem em segundo lugar; o importante é o dinheiro estar lá quando o imprevisto chegar.
        </p>
      </div>
    </div>
  );
}
