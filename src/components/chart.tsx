"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { brl, periodLabel, type ProductId, type Result } from "@/lib/calc";

export const COLOR: Record<ProductId, string> = {
  poupanca: "#ffb547",
  cdb: "#5aa9ff",
  lci: "#3ddc97",
  selic: "#a78bfa",
  pre: "#ff6b9a",
};

const short = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi` : n >= 1000 ? `${Math.round(n / 1000).toLocaleString("pt-BR")} mil` : `${Math.round(n)}`;

type Row = { m: number } & Partial<Record<ProductId, number>>;

function Tip({ active, payload, label }: { active?: boolean; payload?: { dataKey: ProductId; value: number }[]; label?: number }) {
  if (!active || !payload?.length) return null;
  const rows = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-xl border border-line bg-panel-2/95 px-3.5 py-3 text-sm shadow-2xl backdrop-blur">
      <p className="mb-2 text-xs text-muted">{label ? `Rendeu até ${periodLabel(label)}` : "Hoje"}</p>
      {rows.map((r) => (
        <p key={r.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: COLOR[r.dataKey] }} />
            {r.dataKey === "lci" ? "LCI/LCA" : r.dataKey === "selic" ? "Tesouro Selic" : r.dataKey === "pre" ? "Prefixado" : r.dataKey === "cdb" ? "CDB" : "Poupança"}
          </span>
          <span className="num">+{brl(r.value)}</span>
        </p>
      ))}
    </div>
  );
}

// Quanto já rendeu, líquido de IR e custódia, se você resgatar em cada mês.
export function GrowthChart({ results, hidden }: { results: Result[]; hidden: Set<ProductId> }) {
  const months = results[0]?.series.length ?? 0;
  const data: Row[] = Array.from({ length: months }, (_, m) => {
    const row: Row = { m };
    for (const r of results) row[r.product.id] = Math.round(r.gains[m] * 100) / 100;
    return row;
  });
  const step = months > 60 ? 12 : months > 24 ? 6 : months > 12 ? 3 : 1;
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#222b37" strokeDasharray="3 6" vertical={false} />
        <XAxis
          dataKey="m"
          stroke="#5b6678"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          ticks={data.filter((d) => d.m % step === 0).map((d) => d.m)}
          tickFormatter={(m: number) => (m === 0 ? "hoje" : m % 12 === 0 ? `${m / 12}a` : `${m}m`)}
        />
        <YAxis stroke="#5b6678" tickLine={false} axisLine={false} fontSize={12} width={64} tickFormatter={short} />
        <Tooltip content={<Tip />} cursor={{ stroke: "#5b6678", strokeDasharray: "4 4" }} />
        {results
          .filter((r) => !hidden.has(r.product.id))
          .map((r) => (
            <Line
              key={r.product.id}
              type="monotone"
              dataKey={r.product.id}
              stroke={COLOR[r.product.id]}
              strokeWidth={r.product.id === "poupanca" ? 2 : 2.5}
              strokeDasharray={r.product.id === "poupanca" ? "6 5" : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
              animationDuration={600}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
