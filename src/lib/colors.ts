import type { ProductId } from "./calc";

// Uma cor para cada investimento. Fica fora do gráfico para servir também aos componentes do servidor.
export const COLOR: Record<ProductId, string> = {
  poupanca: "#ffb547",
  cdb: "#5aa9ff",
  lci: "#3ddc97",
  selic: "#a78bfa",
  ipca: "#fb923c",
  fundo: "#22d3ee",
  pre: "#ff6b9a",
};
