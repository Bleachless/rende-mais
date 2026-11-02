import { lessonImage, OG_SIZE } from "@/lib/og";

export const alt = "Rende Mais: tutorial animado de dinheiro e investimentos, com o Rendinho";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return lessonImage({ kicker: "TUTORIAL ANIMADO", title: "Dinheiro parado encolhe. Investido, cresce." });
}
