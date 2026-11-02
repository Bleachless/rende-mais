import { CHAPTERS, chapter } from "@/lib/chapters";
import { lessonImage, OG_SIZE } from "@/lib/og";

export const alt = "Capítulo do tutorial do Rende Mais, com o Rendinho";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ capitulo: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ capitulo: string }> }) {
  const { capitulo } = await params;
  const at = Math.max(0, chapter(capitulo));
  return lessonImage({ kicker: `CAPÍTULO ${String(at + 1).padStart(2, "0")} DE ${CHAPTERS.length}`, title: CHAPTERS[at].title, face: "happy", arms: "up" });
}
